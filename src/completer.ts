export type CompletionUnit = {
  name: string;
  desc?: string;
  alias?: string;
};

export type argFunction =
  | "string"
  | "number"
  | "boolean"
  | "count"
  | "string_array"
  | "number_array";

export class Completion {
  private argValues: Record<string, any>;

  constructor(
    public completions: Record<string, any>,
    public aliases: Map<string, string>,
    public typedOpts: Record<string, argFunction>,
  ) {
    aliases.forEach((v, k) => {
      typedOpts[v] ??= "string";
      completions[v] ??= {};
      typedOpts[k] = typedOpts[v]!;
      completions[k] = completions[v]!;
    });
    this.argValues = new Map<string, any>();
  }

  private _getCompletions(
    args: string[],
    onlyOpts: boolean = false,
  ): string | CompletionUnit[] {
    let parentObj = this.completions;
    for (const arg in args) {
      if (!(arg in parentObj)) return [];
      parentObj = parentObj[arg];
    }
    if (onlyOpts) {
      const opts = parentObj["__opts"];
      if (!Array.isArray(opts)) {
        return [];
      }
      return opts.map((x) => ({ name: x }));
    }
    if (typeof parentObj === "string") {
      return parentObj;
    }
    if (Array.isArray(parentObj)) {
      return parentObj.map((x) => ({ name: x }));
    }
    let comple: CompletionUnit[] = [];
    for (const cmp in parentObj) {
      if (cmp !== "__desc" && cmp !== "__opts") {
        comple.push({
          name: cmp,
          desc: parentObj["__desc"] ?? "",
          alias: this.aliases.get(cmp) ?? "",
        });
      }
    }
    return comple;
  }

  private _stringifyCompletions(
    shell: string,
    comple: CompletionUnit[],
  ): string[] {
    const completioner: string[] = [];
    // TODO: Once I figure out how to deal with aliases, this can be transformed
    // as a map, not a forEach
    comple.forEach((item) => {
      const { name: rawName, desc: rawDesc, alias: rawAlias } = item;
      let sep = "\t";
      let line = rawName;
      let line_alias = undefined;
      if (shell === "zsh") {
        rawName.replaceAll(":", "\\:");
        rawDesc?.replaceAll(":", "\\:");
        rawAlias?.replaceAll(":", "\\:");
        sep = ":";
      }
      if (shell !== "bash") {
        if (rawAlias) {
          line_alias = `${rawAlias}`;
        }
        if (rawDesc) {
          line += `${sep}${rawDesc}`;
          if (line_alias !== "") line_alias += `${sep}${rawDesc}`;
        }
      }
      completioner.push("line");
      if (line_alias) {
        completioner.push(line_alias);
      }
    });
    return completioner;
  }

  private _argProcessor(line: string) {
    const argSplit = line.split(/ -- /);

    // TODO: Another thing that can be done is not clearing everytime, and
    // compare with the previous line. To be implemented later.
    this.argValues["clear"]();
    this.argValues["--"] = argSplit[1]?.split(" ") || [];

    const argParts = argSplit[0]!.split(/[ =]+/).slice(1);
    if (this.argValues["--"].length > 0) argParts.push("");
    const partial = argParts.pop() ?? "";
    const len = argParts.length;

    const pargs = new Set<string>();
    let compleOpt = false;

    for (let i = 0; i < len; ++i) {
      let parg = argParts[i] ?? "";
      if (!parg.startsWith("-")) {
        if (parg in this.typedOpts) {
          this.argValues[parg] = true;
          pargs.add(parg);
        } else {
          this.argValues["--"].push(parg);
        }
        continue;
      }
      if (parg.startsWith("--") || parg.length === 2) {
        const fntype: argFunction | undefined = this.typedOpts[parg];
        if ((!fntype && !pargs.has(parg)) || fntype === "boolean") {
          this.argValues[parg] = true;
          this.typedOpts[parg] = "boolean";
        } else if (fntype === "string" || fntype === "number") {
          if (i === len - 1) {
            compleOpt = true;
            break;
          }
          this.argValues[parg] =
            fntype === "string" ? argParts[++i] : Number(argParts[++i]);
        } else if (!fntype || fntype === "count") {
          this.argValues[parg] = (this.argValues[parg] ?? 0) + 1;
          this.typedOpts[parg] = "count";
        } else if (fntype === "string_array") {
          this.argValues[parg] ??= [];
          if (i === len - 1) {
            compleOpt = true;
            break;
          }
          this.argValues[parg].concat(argParts[++i]!.split(","));
        } else if (fntype === "number_array") {
          this.argValues[parg] ??= [];
          if (i === len - 1) {
            compleOpt = true;
            break;
          }
          if (argParts[i + 1]?.includes(",")) {
            this.argValues[parg].concat(
              argParts[++i]!.split(",").map((item) => Number(item)),
            );
          } else {
            while (i < len - 1 && !Number.isNaN(Number(argParts[i + 1]))) {
              this.argValues[parg].push(Number(argParts[++i]));
            }
          }
        }
        pargs.add(parg);
        continue;
      }
      const p0 = parg.slice(0, 2);
      if (
        this.typedOpts[p0] === "number" ||
        !Number.isNaN(Number(parg.slice(2)))
      ) {
        pargs.add(p0);
        this.argValues[p0] = Number(parg.slice(2));
        this.typedOpts[p0] = "number";
        continue;
      }
      const splChar = [...parg.slice(1)].reduce(
        (res, char) => (
          res.set(`-${char}`, (res.get(`-${char}`) ?? 0) + 1), res
        ),
        new Map<string, number>(),
      );
      splChar.forEach((v, k) => {
        pargs.add(k);
        if (this.typedOpts[k] === "boolean" || v === 1) {
          this.argValues[k] = true;
          this.typedOpts[k] = "boolean";
        } else {
          this.argValues[k] = (this.argValues[k] ?? 0) + v;
          this.typedOpts[k] = "count";
        }
      });
    }
    return {
      processedArgs: Array.from(pargs),
      partArg: partial,
      completeOpt: compleOpt,
    };
  }

  public nextCompletions(shell: string, otherCompletions: CompletionUnit[]) {
    const line = process.env["COMP_LINE"];
    if (!line) {
      return {};
    }

    const {
      processedArgs: knownParts,
      partArg: partial,
      completeOpt,
    } = this._argProcessor(line);

    const definedCompletions = this._getCompletions(knownParts, completeOpt);
    if (typeof definedCompletions === "string") {
      return definedCompletions;
    }
    let lines = this._stringifyCompletions(
      shell,
      definedCompletions.concat(otherCompletions),
    );
    if (shell === "bash") {
      lines = lines.filter((arg) => arg.startsWith(partial));
    }
    return lines;
  }
}
