# AutoAlias

Automatic module alias generation for [Webpack]("https://github.com/webpack/webpack") and [TypeScript]("https://github.com/microsoft/TypeScript").

Turn
``import * as [name] from "../../../module.ts"`` into ``import * as [name] from "@module"``




## Usage with Webpack

Add AutoAlias to your Webpack configuration.

```javascript
const path = require("path");
const {AutoAlias, AutoAliasConfiguration, AutoAliasTarget} = require("auto-alias");

module.exports = {
  target: 'node',
  ...
  ...
  ...

  resolve: {
    alias : new AutoAlias(new AutoAliasConfiguration([new AutoAliasTarget(path.resolve(__dirname, './src'))],
     [".ts", ".tsx", ".js"])),
  },

  ...
};
```

Run webpack in a way accustomed to you.

```npx webpack```



## Usage with Webpack + TypeScript

Add an absolute path to your chosen tsconfig.json inside the AutoAlias configuration.

```javascript
const path = require("path");
const {AutoAlias, AutoAliasConfiguration, AutoAliasTarget} = require("auto-alias");

module.exports = {
  target: 'node',
  ...
  ...
  ...

  resolve: {
    alias : new AutoAlias(new AutoAliasConfiguration([new AutoAliasTarget(path.resolve(__dirname, './src'))],
     [".ts", ".tsx", ".js"],
     path.resolve(__dirname, "./tsconfig.json"))),
  },

  ...
};
```
Make sure you have a baseUrl defined inside your chosen tsconfig.json. You may find more information about baseURL [here]("https://www.typescriptlang.org/tsconfig#baseUrl").

```json 
{
 "compilerOptions": {
  ...
  
  "baseUrl": "./src",
}

```


Run webpack in a way accustomed to you.

```npx webpack```


Paths for every module should be now included inside your chosen tsconfig.json
```json 
{
 "compilerOptions": {
  ...

  "baseUrl": "./src",
  "paths": {
   "@hello": [
    "module1/nested/hello.ts"
   ],
   "@world": [
    "module2/world.ts"
   ]
  }
 },
}

```
## In Module Commands

In-module commands must be defined at the first line of the file!

#### Ignore file.

```javascript
//@auto-alias-ignore
```


#### Use custom import name

```javascript
//@auto-alias-name [ModuleName]
```

#### Example.

automated-greeting-generation-service.js
```javascript
//@auto-alias-name GreetingGenerator

...
export function SayHelloWorld() {
    console.log("Hello, World!");
}

export function SayHello(name) {
    console.log(`Hello ${name}`);
} 

```

main.js

```javascript
//@auto-alias-ignore

import * as greetingGenerator from "@GreetingGenerator"

```
