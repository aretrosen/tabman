# Tabman

**Tabman** is a library for JavaScript and TypeScript command line interface (CLI) programs that provides functionality for tab completion and argument parsing.

## Usage

To use `Tabman`, first import `Completions` and `argFunction`, and then define your desired completions as an object. For example:

```typescript
const myCompletions = {
  "--help": { __desc: "Some kinda help" },
  add: {
    __desc: "Some kinda add",
    "--dev": {
      __desc: "Some kinda dev",
    },
    "--prod": {
      __desc: "Some kinda prod",
    },
    "--opt": {
      __desc: "Some kinda optional",
    },
  },
  cache: ["ls", "dir", "clean"],
  global: {
    add: {},
    cache: {},
  },
};

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

Finally, call the `nextCompletions` method on the `Completion` instance whenever you want to generate a list of possible completions. You must provide the name of the current shell and any additional completions you want to include.

```typescript
const compgen = someCompletions.nextCompletions("zsh");
```

The `nextCompletions` method reads the value of the `COMP_LINE` environment variable and generates completions based on the current state of the command line input. You can now use any logging function you want, for simplicity use `console.log`.

## Example Usage:

See a simple example [here](/example/tabman-usage/).

## To-dos:

- [ ] Completions for `bash` and `pwsh`, maybe `nushell` too.
- [ ] An inbuilt logging function.
- [ ] A better algorithm to automatically detect argument type.

## Why "Tabman"?

No deep meaning here - just some letter-swapping fun: tab → bat → Batman = **Tabman**.

## Contribution Guidelines:

Thank you for considering contributing to **Tabman**! I welcome contributions from anyone who wants to improve the project. You are also welcome to contribute by writing new features and reporting any issues you may find.

If you discover a security vulnerability, please do not disclose it publicly. Instead, please email the details to me privately at `<aretrosen AT proton DOT me>`. Your help in keeping `Tabman` secure is greatly appreciated!
