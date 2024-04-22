# Tabman Usage

## Installation:

- Run `pnpm i`
- Run `pnpm run installer`
- Generate completion, and add it to appropriate path. For example,
  - for `zsh`, do `SHELL=zsh tabman-usage generate-completion >| $ZDOTDIR/_tabman`
  - for `bash`, do `SHELL=bash tabman-usage generate-completion >| $XDG_DATA_HOME/bash-completion/completions/tabman-usage`
  - for `fish`, do `SHELL=fish tabman-usage generate-completion >| $XDG_CONFIG_HOME/fish/completions/tabman-usage.fish`
- Close and reopen shell. Now press `Tab` to get completion for `tabman-usage`.
