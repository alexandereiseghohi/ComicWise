#!/usr/bin/env bash
# ComicWise Bash/Zsh Tab Completion
# Add to ~/.bashrc or ~/.zshrc: source ./scripts/completions/cw-completion.sh

_cw_completions() {
    local cur prev commands subcommands

    cur="${COMP_WORDS[COMP_CWORD]}"
    prev="${COMP_WORDS[COMP_CWORD-1]}"

    commands="db cache health queue upload priority dev build test lint format help"

    case "${prev}" in
        db)
            subcommands="push seed studio reset generate migrate backup restore"
            COMPREPLY=( $(compgen -W "${subcommands}" -- ${cur}) )
            return 0
            ;;
        cache)
            subcommands="clear stats flush"
            COMPREPLY=( $(compgen -W "${subcommands}" -- ${cur}) )
            return 0
            ;;
        health)
            subcommands="check db redis all"
            COMPREPLY=( $(compgen -W "${subcommands}" -- ${cur}) )
            return 0
            ;;
        queue)
            subcommands="worker stats clean dashboard"
            COMPREPLY=( $(compgen -W "${subcommands}" -- ${cur}) )
            return 0
            ;;
        upload)
            subcommands="bulk test"
            COMPREPLY=( $(compgen -W "${subcommands}" -- ${cur}) )
            return 0
            ;;
        priority)
            subcommands="list run status complete"
            COMPREPLY=( $(compgen -W "${subcommands}" -- ${cur}) )
            return 0
            ;;
        *)
            COMPREPLY=( $(compgen -W "${commands}" -- ${cur}) )
            return 0
            ;;
    esac
}

complete -F _cw_completions cw
complete -F _cw_completions cw.sh

echo "✓ ComicWise tab completion loaded"
echo "  Try: cw <tab>"
