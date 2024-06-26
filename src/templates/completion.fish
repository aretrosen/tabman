function _{pkgname}_completion
  set cmd (commandline -o)
  set cursor (commandline -C)
  set words (count $cmd)

  set completions (eval env DEBUG=\"" \"" COMP_LINE=\""$cmd \"" SHELL=fish {pkgname} {completer} -- $cmd)

  if [ "$completions" = "__tabman_complete_files__" ]
    set -l matches (commandline -ct)*
    if [ -n "$matches" ]
      __fish_complete_path (commandline -ct)
    end
  else
    for completion in $completions
      echo -e $completion
    end
  end
end

complete -f -d '{pkgname}' -c {pkgname} -a "(_{pkgname}_completion)"
