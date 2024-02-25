# Tabman

Tabman is a library for JavaScript and TypeScript command line interface (CLI) programs that provides functionality for tab completion and argument parsing.

## Usage

To use `Tabman`, first import `Completions` and `argFunction`, and then define your desired completions as an object. For example:

```typescript
const myCompletions = {
  // Add a --help option
  "--help": { description: "Some kinda help" },
  // Define an "add" command with several options
  add: {
    description: "Some kinda add",
    "-d, --dev": { description: "Some kinda dev" },
    "-p, --prod": { description: "Some kinda prod" },
    "--opt": { description: "Some kinda optional" },
  },
  // Define a "cache" command with subcommands
  cache: ["ls", "dir", "clean"],
  // Create a "global" namespace with its own properties
  global: {
    add: {},
    cache: {},
  },
};
// Make sure the "global" namespace has the same values as the top-level keys
myCompletions.global.add = myCompletions.add;
myCompletions.global.cache = myCompletions.cache;
```

Next, specify the type of each argument or option. While there are some automated methods for detecting certain types, it is generally better to explicitly declare them for clarity and consistency.

```typescript
const typer: Record<string, argFunction> = {
  global: "boolean",
  add: "boolean",
  cache: "boolean",
};
```

Then, create an instance of the `Completion` class, passing it the completions object, the type definitions, and an optional map of aliases. If you don't have any aliases, you can simply pass an empty `Map()`.

```typescript
const someCompletions = new Completion(myCompletions, typer, new Map());
```

Finally, call the `nextCompletions` method on the `Completion` instance whenever you want to generate a list of possible completions. You must provide the name of the current shell and any additional completions you want to include. In this case, we only provided the default completions, so we pass an empty array.

```typescript
const compgen = someCompletions.nextCompletions("zsh", []);
```

The `nextCompletions` method reads the value of the `COMP_LINE` environment variable and generates a set of possible completions based on the current state of the command line input. These completions can then be used to display suggestions to the user. You can use any logging function you want, even `console.log`.

## To-dos:

- [] Completions for `bash` and `pwsh`, maybe `nushell` too.
- [] An inbuilt logging function.
- [] A better algorithm to automatically detect argument type.

## Why "Tabman"?

No deep meaning here - just some letter-swapping fun: tab → bat → Batman = **Tabman**.

## Contribution Guidelines:

Thank you for considering contributing to **Tabman**! I welcome contributions from anyone who wants to improve the project. You are also welcome to contribute by writing new features and reporting any issues you may find.

If you discover a security vulnerability, please do not disclose it publicly. Instead, please email the details to me privately at `<aretsonen AT proton DOT me>`. Your help in keeping `Tabman` secure is greatly appreciated!
