import {
  Completion,
  argFunction,
  getShell,
  generateShellCompletion,
} from "@kyvernetes/tabman";

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

const someCompletions = new Completion(myCompletions, typer, new Map());

async function init() {
  const cmd = process.argv[2];

  const shell = getShell();

  if (cmd === "generate-completion") {
    const completion = await generateShellCompletion(
      "tabman-usage",
      "completion",
      shell,
    );
    console.log(completion);
    return;
  }

  if (cmd === "completion") {
    const comp = someCompletions.nextCompletions(shell, []);
    if (typeof comp === "string") {
      console.log(comp);
    } else {
      comp.forEach((item) => {
        console.log(item);
      });
    }
  }
}

init();
