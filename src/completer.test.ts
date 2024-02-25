import { expect, it } from "vitest";
import { Completion, argFunction } from ".";

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

const typer: Record<string, argFunction> = {
  global: "boolean",
  add: "boolean",
  cache: "boolean",
};

it("zsh completion for no partial word", () => {
  process.env["COMP_LINE"] = "some global ";
  const someCompletions = new Completion(myCompletions, typer, new Map());
  const compgen = someCompletions.nextCompletions("zsh", []);
  expect(compgen).toEqual(["add:Some kinda add", "cache"]);
  process.env["COMP_LINE"] = undefined;
});

it("zsh completion for partial word", () => {
  process.env["COMP_LINE"] = "some global a";
  const someCompletions = new Completion(myCompletions, typer, new Map());
  const compgen = someCompletions.nextCompletions("zsh", []);
  expect(compgen).toEqual(["add:Some kinda add", "cache"]);
  process.env["COMP_LINE"] = undefined;
});

it("bash completion for partial word", () => {
  process.env["COMP_LINE"] = "some global a";
  const someCompletions = new Completion(myCompletions, typer, new Map());
  const compgen = someCompletions.nextCompletions("bash", []);
  expect(compgen).toEqual(["add"]);
  process.env["COMP_LINE"] = undefined;
});
