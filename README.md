# FTI Project - Webpack Bundling Sandbox
This sandbox is used to test and analyze the working of next build process and find solutions to the issues faced regarding tree shaking employed by bundlers like webpack.

The project is implemented using Pages router in order to keep the sandbox closer to the actual projects the developers work on.

The current sandbox contains modules with both direct exports as well as an internal barrel-package to test barrel exports. The configuration has been modified to include bundle-analyzer.

A nodeJS script `side-effects-analyzer.mjs` is used to evaluate package modules for side effects and add them to the sideEffects array in package.json. The script utilize `typescript-eslint/parser` library for parsing the modules and traversing their AST for finding side effects in the module scope. The current side effects detected are;
- Call expressions like function calls
- Expressions like console.logs()
- Assignment operations to document, window objects
- Variable declarations with Call expressions
- If, for/while loop further analysis

TODO: Currently the script marks all the Call expressions as side effects. We would like to let the developers specify some Call expressions as pure with the annotation `/*#__PURE__*/` that is used to tell the minifier that the particular Call expression is free of side effects. Refer https://webpack.js.org/guides/tree-shaking/#mark-a-function-call-as-side-effect-free