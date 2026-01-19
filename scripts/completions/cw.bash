#!/usr/bin/env bash
# Bash completion for cw CLI

_cw_completions() {
    local cur prev opts
    COMPREPLY=()
    cur="${COMP_WORDS[COMP_CWORD]}"
    prev="${COMP_WORDS[COMP_CWORD-1]}"

    # Main commands
    local commands="scaffold health cache queue upload db ci"
    
    # Subcommands
    local scaffold_templates="component page action api"
    local cache_actions="clear stats flush"
    local queue_actions="start stop status"
    local upload_providers="cloudinary s3 imagekit local"
    local db_actions="migrate seed reset studio"
    local ci_actions="test build check deploy"

    # Complete main commands
    if [ $COMP_CWORD -eq 1 ]; then
        COMPREPLY=( $(compgen -W "${commands}" -- ${cur}) )
        return 0
    fi

    # Complete subcommands based on main command
    case "${COMP_WORDS[1]}" in
        scaffold)
            if [ $COMP_CWORD -eq 2 ]; then
                COMPREPLY=( $(compgen -W "${scaffold_templates}" -- ${cur}) )
            fi
            ;;
        cache)
            if [ $COMP_CWORD -eq 2 ]; then
                COMPREPLY=( $(compgen -W "${cache_actions}" -- ${cur}) )
            fi
            ;;
        queue)
            if [ $COMP_CWORD -eq 2 ]; then
                COMPREPLY=( $(compgen -W "${queue_actions}" -- ${cur}) )
            fi
            ;;
        upload)
            if [ $COMP_CWORD -eq 2 ]; then
                COMPREPLY=( $(compgen -W "${upload_providers}" -- ${cur}) )
            fi
            ;;
        db)
            if [ $COMP_CWORD -eq 2 ]; then
                COMPREPLY=( $(compgen -W "${db_actions}" -- ${cur}) )
            fi
            ;;
        ci)
            if [ $COMP_CWORD -eq 2 ]; then
                COMPREPLY=( $(compgen -W "${ci_actions}" -- ${cur}) )
            fi
            ;;
    esac
}

complete -F _cw_completions cw
