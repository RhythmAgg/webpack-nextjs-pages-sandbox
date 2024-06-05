# FTI Project - Webpack Bundling Sandbox
This sandbox is used to test and analyze the working of next build process and find solutions to the issues faced regarding tree shaking employed by bundlers like webpack.

The project is implemented using Pages router in order to keep the sandbox closer to the actual projects the developers work on.

The current sandbox contains modules with both direct exports as well as an internal barrel-package to test barrel exports. The configuration has been modified to include bundle-analyzer.

A nodeJS script `side-effects-analyzer.mjs` is used to evaluate package modules for side effects and add them to the sideEffects array in package.json. The script utilize `typescript-eslint/parser` library for parsing the modules and traversing their AST for finding side effects in the module scope. The current side effects detected are;
- Function calls
- Expressions like console.logs()
- Variable declarations like objects, literals and (Arrow)functions
- Assignment operations

The script currently considers JS modules only and side effects in TS modules have to be considered further.