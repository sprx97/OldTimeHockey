# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default {
  // other rules...
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json'],
    tsconfigRootDir: __dirname,
  },
}
```

- Replace `plugin:@typescript-eslint/recommended` to `plugin:@typescript-eslint/recommended-type-checked` or `plugin:@typescript-eslint/strict-type-checked`
- Optionally add `plugin:@typescript-eslint/stylistic-type-checked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and add `plugin:react/recommended` & `plugin:react/jsx-runtime` to the `extends` list

## TSConfig.json Explanation

The `tsconfig.json` file in our project is used to configure various aspects of the TypeScript compiler. Here's a breakdown of the settings:

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

This configuration ensures a strict and modern development environment, leveraging the latest JavaScript features and providing a robust linting setup.

