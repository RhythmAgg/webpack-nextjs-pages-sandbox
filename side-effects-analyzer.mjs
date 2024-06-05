import {Parser} from 'acorn'
import jsx from 'acorn-jsx'
import {promises as fs} from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse } from '@typescript-eslint/typescript-estree';
const script_filename = fileURLToPath(import.meta.url); 
const PROJECT_DIRECTORY = path.dirname(script_filename);
const PAGES = path.resolve(PROJECT_DIRECTORY, 'pages')
// const PAGES = path.resolve(PROJECT_DIRECTORY, 'test')

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
            const ast = parse(code, {
                comment: true,
                jsx: true
            });
    
            function traverse(node, left = false) {
                switch(node.type) {
                    case 'CallExpression':
                        // TODO: Decide if the Call expression is to be marked with /*#__PURE__*/ if pure
                        return true;
                    case 'AssignmentExpression':
                        // Check for global assignments
                        if (node.left.type === 'MemberExpression' && (node.left.object.name === 'window' || node.left.object.name === 'document')) {
                            return true;
                        }

                        return traverse(node.left, left=true) || traverse(node.right, left = false);
                    case 'MemberExpression':
                        console.log(node)
                        if(left && (node.object.name === 'window' || node.object.name === 'document')) {
                            return true
                        }else if(left) {
                            return traverse(node.object, left = true)
                        }else {
                            return false
                        }
                    case 'ExpressionStatement':
                        // Expressions depend on the type of expressions
                        return traverse(node.expression, left);

                    case 'BlockStatement':
                    case 'Program':
                        // Analyse each node
                        for (const childNode of node.body) {
                            if (traverse(childNode, left)) {
                                return true;
                            }
                        }
                        return false
                    case 'VariableDeclaration':
                        // For each declaration if the init is a Call expression or a side effect
                        for (const declaration of node.declarations) {
                            if (traverse(declaration.init, left)) {
                                return true;
                            }
                        }
                        return false
                    case 'IfStatement':
                        return traverse(node.test, left) || traverse(node.consequent, left) || traverse(node.alternate, left);

                    case 'WhileStatement':
                    case 'ForStatement':
                        return traverse(node.test, left) || traverse(node.body, left);

                    case 'ReturnStatement':
                        return traverse(node.argument, left);

                    case 'TryStatement':
                        return traverse(node.block, left) || traverse(node.handler, left) || traverse(node.finalizer, left);

                    case 'CatchClause':
                        return traverse(node.param, left) || traverse(node.body, left);

                    case 'ObjectExpression':
                    case 'ArrayExpression':
                    case 'Literal':
                        return false;
                    default:
                        return false
                }
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

