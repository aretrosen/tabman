#compdef {pkgname}
###-begin-{pkgname}-completion-###
_{pkgname}_completion() {
  local reply
  local si=$IFS

  IFS=$'\n' reply=($(COMP_LINE="$BUFFER" SHELL=zsh {pkgname} {completer} -- "${words[@]}"))
  IFS=$si

  if [ "$reply" = "__tabman_complete_files__" ]; then
    _files
  else
    _describe 'values' reply
  fi
}
compdef _{pkgname}_completion {pkgname}
###-end-{pkgname}-completion-###
