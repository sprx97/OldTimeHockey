## Detailed Explanation of `vite.config.ts` Settings

We're using Vite for building and serving, and its configuration is defined in this file. For more info see: [Vite Config Documentation](https://vitejs.dev/config/).

### Import Statements

- **`import { defineConfig } from 'vite';`**  
  This line imports the `defineConfig` function from Vite. The `defineConfig` function is a helper that provides better typing support and IntelliSense when defining the Vite configuration.

- **`import react from '@vitejs/plugin-react';`**  
  This imports the official React plugin for Vite. The plugin optimizes React projects by including features such as fast refreshing and efficient handling of JSX transformations.

### defineConfig Function

- **`defineConfig({ ... })`**  
  The `defineConfig` call is a helper function used to wrap the configuration object. Its primary purpose is to provide better editor support (IntelliSense), and to ensure type correctness in the config.

### Plugins Configuration

- **`plugins: [react()]`**  
  The `plugins` array specifies the plugins that Vite should use. We're using the `react()` plugin from `@vitejs/plugin-react`. This plugin configures Vite to enhance the development experience with React. It takes care of necessary Babel transformations, enables features like fast refresh (hot module replacement), and optimizes the project for production builds.

## NPM Commands

This is a list of commands you can use for various purposes, you can also find (and define more) in the `package.json`:

### Starting the Development Server

- **`npm run dev`**  
  Starts the development server with hot module replacement. It allows you to see changes in real-time as you develop.

### Building for Production

- **`npm run build`**  
  Compiles and bundles the application for production deployment. It optimizes the build for the best performance by minifying the code, optimizing images, and more.

### Previewing the Production Build

- **`npm run preview`**  
  Serves the production build on a local server, allowing you to preview the built application before deploying it.

### Linting

- **`npm run lint`**  
  If configured, this command runs the linter (like ESLint) to check for code consistency and potential issues.

### Running Tests (lol like I'm gonna write tests)

- **`npm test`** (only if testing is set up)  
  Executes the test suite associated with the project. This might be configured to use a testing framework like Jest or Mocha.

## package.json and package-lock.json

These files manage project dependencies and ensure consistent builds

### package.json

`package.json` has several purposes:

- **Project Metadata:** It includes the project's name, version, description, author, and license.
- **Script Shortcuts:** Defines scripts for tasks like starting the server, running tests, or custom build processes.
- **Dependency Management:** Lists all the dependencies and devDependencies necessary for the project.
- **Version Restrictions:** You can specify versions or version ranges for your dependencies to ensure compatibility.

`package-lock.json` is an auto-generated file based on package.json. While we edit package.json manually sometimes, you never touch package-lock.json. If you ever run into issues with `node_modules`, or some packages within, you can delete `node_modules` and `package-lock.json`, then run `npm install` and it will regenerate the `node_modules` dir and the `package-lock.json`.

ESLint is a JavaScript linting tool. It works in concert with TS. Here's a breakdown of the settings:

### Configuration Settings

- **`root`: true**  
  Marks the configuration as the root, indicating ESLint should not look for other configurations in parent directories.

- **`env`**  
  Specifies the environments our code is expected to run in:
  - `browser`: true - Indicates that global variables for browsers are available.
  - `es2020`: true - Enables features from the ECMAScript 2020 specification.

- **`extends`**  
  A list of configurations ESLint extends from:
  - `eslint:recommended` - Applies a set of core rules recommended by ESLint.
  - `plugin:@typescript-eslint/recommended` - Adds rules recommended for TypeScript from the `@typescript-eslint` plugin.
  - `plugin:react-hooks/recommended` - Includes recommended rules for React Hooks.
  - `plugin:prettier/recommended` - Integrates Prettier, enforcing its formatting rules.

- **`ignorePatterns`**  
  Files and folders to be ignored by ESLint:
  - `dist` - The build output directory.
  - `.eslintrc.cjs` - The ESLint configuration file itself.
  - `postcss.config.cjs` - The PostCSS configuration file.

- **`parser`: '@typescript-eslint/parser'**  
  Sets the parser to `@typescript-eslint/parser` to allow ESLint to understand TypeScript syntax.

- **`plugins`**  
  Plugins that ESLint will use:
  - `react-refresh` - A plugin for React Fast Refresh, useful in development.
  - `prettier` - Integrates Prettier to enforce a consistent code style.

- **`rules`**  
  Custom rules specified for the project:
  - `react-refresh/only-export-components`: Issues a warning for files using React Refresh that do not strictly export React components or constants, but allows constant exports.
  - `prettier/prettier`: Treats formatting issues identified by Prettier as ESLint errors.

## TSConfig.json Explanation

The `tsconfig.json` file is used to configure the TypeScript compiler. It ensures a strict and modern development env and offers robust linting, which is central to the value of TS. Here's a breakdown of the settings:

### Compiler Options

- **`target`: "ES2020"**  
  Specifies the ECMAScript target version. The code will be compiled to conform to the ES2020 standard.

- **`useDefineForClassFields`: true**  
  Enables the `useDefineForClassFields` semantic in TypeScript, which affects how class fields are emitted in the generated JavaScript.

- **`lib`: ["ES2020", "DOM", "DOM.Iterable"]**  
  This setting specifies a list of library files to be included in the compilation. It includes ES2020 standard library features along with DOM and DOM.Iterable types.

- **`module`: "ESNext"**  
  Sets the module code generation method. "ESNext" refers to the highest ECMAScript module format that TypeScript supports.

- **`skipLibCheck`: true**  
  This option skips type checking of default library declaration files.

#### Bundler Mode

- **`moduleResolution`: "bundler"**  
  Specifies the module resolution strategy. "bundler" is used for bundler-specific resolution logic.

- **`allowImportingTsExtensions`: true**  
  Allows importing TypeScript files with extensions in module specifiers.

- **`resolveJsonModule`: true**  
  Enables importing of `.json` files.

- **`isolatedModules`: true**  
  Ensures that each file can be safely transpiled without relying on other imports.

- **`noEmit`: true**  
  Instructs the TypeScript compiler not to emit output (like JavaScript files).

- **`jsx`: "react-jsx"**  
  Specifies the JSX code generation style, here set to "react-jsx" for React.

#### Linting

- **`strict`: true**  
  Enables all strict type-checking options.

- **`noUnusedLocals`: true**  
  Reports errors on unused local variables.

- **`noUnusedParameters`: true**  
  Raises errors on unused function parameters.

- **`noFallthroughCasesInSwitch`: true**  
  Reports errors for fallthrough cases in switch statements.

### Include/Exclude Patterns

- **`include`: ["src"]**  
  This specifies a list of files to be included in the compilation. Here, it includes files in the "src" directory.

- **`exclude`: [".prettierrc"]**  
  Specifies files to be excluded from the compilation, such as the Prettier configuration file.

### Project References

- **`references`: [{ "path": "./tsconfig.node.json" }]**  
  This option is used to reference other TypeScript projects. It references `tsconfig.node.json`, indicating this project depends on another TypeScript project.

## Prettier Configuration (.prettierrc) Explanation

The `.prettierrc` file configures the Prettier code formatter. It ensures a consistent coding style across the project, focusing on readability, but we can iron out the final style we'd like to enforce. Below is an overview of the settings used, for more info see [Prettier Docs](https://prettier.io/docs/en/):

- **`semi`: false**  
  This setting disables the automatic insertion of semicolons at the ends of statements.

- **`singleQuote`: true**  
  Enforces the use of single quotes instead of double quotes, wherever possible.

- **`jsxSingleQuote`: true**  
  Similar to `singleQuote`, but specific to JSX. It enforces the use of single quotes in JSX attributes.

- **`trailingComma`: "es5"**  
  This option adds trailing commas to multi-line object literals, array literals, and function parameters lists compatible with ES5 syntax.

- **`bracketSpacing`: true**  
  Ensures that there is space between the brackets in object literals. For example, `{ foo: bar }` instead of `{foo: bar}`.

- **`jsxBracketSameLine`: false**  
  Configures JSX tags to have the closing bracket on a new line for multi-line elements, enhancing readability.

- **`arrowParens`: "always"**  
  Requires parentheses around the arguments of arrow functions, regardless of their arity. For example, `(x) => x`.

- **`printWidth`: 80**  
  Sets the desired line width at which Prettier will wrap lines. Here, it's set to 80 characters.

- **`tabWidth`: 2**  
  Specifies the number of spaces per indentation-level.

- **`useTabs`: false**  
  Indicates that spaces are used for indentation instead of tabs.

## PostCSS Configuration Explanation

PostCSS transforms CSS with JavaScript plugins. The plugins can perform a variety of tasks such as linting CSS, supporting variables and mixins, transpiling future CSS syntax, inline images, etc. Pretty powerful. Mantine requires it.
