# FTI Project - Webpack Bundling Sandbox
This sandbox is used to test and analyze the working of next build process and find solutions to the issues faced regarding tree shaking employed by bundlers like webpack.

The project is implemented using Pages router in order to keep the sandbox closer to the actual projects the developers work on.

The current sandbox contains modules with both direct exports as well as an internal barrel-package to test barrel exports. The configuration has been modified to include bundle-analyzer.

A nodeJS script `side-effects-analyzer.mjs` is used to evaluate package modules for side effects and add them to the sideEffects array in package.json. The script utilize `@babel/parser` library for parsing the modules and traversing their AST for finding side effects in the module scope.
Side effects to currently look for in the modules( only in the module Scope ):

- Call expressions like function calls that are not marked with `/*#__PURE__*/`
- Expressions like console.logs()
- Assignment operations to document, window objects
- If, for/while loop further analysis
- Polyfills specially with `typeof` operator
- Export statements which further use Call expressions
- try…catch blocks

I have adopted the `/*#__PURE__*/` convention in reference to webpack’s configuration  https://webpack.js.org/guides/tree-shaking/#mark-a-function-call-as-side-effect-free. It tells that if we mark a Call expression with this annotation, the minifier can skip this call. Thus in order to find side effects in the module ourselves, the script skips such annotated calls.

The function scope are not evaluated because unused functions will anyways be removed by the minimizer and wont affect the outside scope and if they are used they will anyways be included along with the side effects they induce.

The script is tested on the testing sandbox as well as on Modules like spaceweb by introducing side effects. The issues arising from these tests are mentioned in [https://www.notion.so/Side-Effects-Script-416f4678a945420da9c0c6ecb7ee63ba?pvs=4](https://www.notion.so/416f4678a945420da9c0c6ecb7ee63ba?pvs=21).