import {Parser} from 'acorn'
import jsx from 'acorn-jsx'
import {promises as fs} from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const script_filename = fileURLToPath(import.meta.url); 
const PROJECT_DIRECTORY = path.dirname(script_filename);
const PAGES = path.resolve(PROJECT_DIRECTORY, 'pages')

const MyParser = Parser.extend(jsx())


async function getFiles(dir) {
    const subdirs = await fs.readdir(dir)
    const files = await Promise.all(subdirs.map(async (subdir) => {
      const res = path.resolve(dir, subdir);
      return (await fs.stat(res)).isDirectory() ? getFiles(res) : res;
    }));
    return files.reduce((a, f) => a.concat(f), []);
}

async function hasSideEffects(code, filePath) {
    return new Promise((resolve, reject) => {
        try {
            if(filePath.includes('.json')) { // Include JSON files since they always introduce Side Effects when imported
                resolve(true)
            }
            if(filePath.includes('.ts') || filePath.includes('.tsx')) { // Ignore Typescript files as of now
                resolve(false)
            }
            const ast = MyParser.parse(code, { sourceType: 'module' , ecmaVersion: "latest"});
    
            function traverse(node) {
                if (node.type === 'CallExpression' || node.type === 'AssignmentExpression') {
                    return true; 
                }
                else if (node.type === 'ExpressionStatement') {
                    return traverse(node.expression);
                }
                else if (node.type === 'BlockStatement' || node.type === 'Program') {
                    for (const childNode of node.body) {
                        if (traverse(childNode)) {
                            return true;
                        }
                    }
                }
                else if(node.type === 'VariableDeclaration') {
                    for (const declaration of node.declarations) {
                        // console.log(declaration.init)
                        if (traverse(declaration.init)) {
                            return true;
                        }
                    }
                }
                if(['FunctionExpression', 'ArrowFunctionExpression', 'Literal', 'ObjectExpression'].includes(node.type)) { // Currenly mark even Function expressions as side Effects if not exported
                    return true;
                }
                return false;
            }
            resolve(traverse(ast));
        } catch (error) {
            console.error(`Error parsing file ${filePath}:`, error.message);
            resolve(false); 
        }
    })
}

const files = await getFiles(PAGES)
                .then(files => {
                    return files;
                })
                .catch(e => console.error(e));

async function getSideEffect() {
    return Promise.all(files.map(async (filePath) => {
        try{
            const moduleCode = await fs.readFile(filePath);
            const hasEffects = await hasSideEffects(moduleCode, filePath)
            if(hasEffects) {
                return path.relative(PROJECT_DIRECTORY, filePath)
                // return filePath
            } else{
                return null
            }
        }catch(err) {
            return null
        }
    }))
}

const sideEffects = await getSideEffect()
                        .then(sideEffects => sideEffects.filter(file => file != null))


async function updatePackage() {
    try {
        const packagePath = path.resolve(PROJECT_DIRECTORY, 'package.json');
        const packageJson = await fs.readFile(packagePath);
        const parsedPackage = JSON.parse(packageJson);

        parsedPackage.sideEffects = sideEffects;

        await fs.writeFile(packagePath, JSON.stringify(parsedPackage, null, 2));
        console.log('Updated package.json with sideEffects array.');
    } catch (error) {
        console.error('Error updating package.json:', error.message);
    }
}

await updatePackage()

