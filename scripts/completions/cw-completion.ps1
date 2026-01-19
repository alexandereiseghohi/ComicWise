# ComicWise PowerShell Tab Completion
# Add this to your PowerShell profile: . .\scripts\completions\cw-completion.ps1

$scriptblock = {
    param($commandName, $parameterName, $wordToComplete, $commandAst, $fakeBoundParameters)

    $commands = @{
        'db' = @('push', 'seed', 'studio', 'reset', 'generate', 'migrate', 'backup', 'restore')
        'cache' = @('clear', 'stats', 'flush')
        'health' = @('check', 'db', 'redis', 'all')
        'queue' = @('worker', 'stats', 'clean', 'dashboard')
        'upload' = @('bulk', 'test')
        'priority' = @('list', 'run', 'status', 'complete')
    }

    $topLevel = @('db', 'cache', 'health', 'queue', 'upload', 'priority', 'dev', 'build', 'test', 'lint', 'format', 'help')

    if ($fakeBoundParameters.Count -eq 0) {
        $topLevel | Where-Object { $_ -like "$wordToComplete*" } | ForEach-Object {
            [System.Management.Automation.CompletionResult]::new($_, $_, 'ParameterValue', $_)
        }
    }
    elseif ($fakeBoundParameters.ContainsKey('Command')) {
        $cmd = $fakeBoundParameters['Command']
        if ($commands.ContainsKey($cmd)) {
            $commands[$cmd] | Where-Object { $_ -like "$wordToComplete*" } | ForEach-Object {
                [System.Management.Automation.CompletionResult]::new($_, $_, 'ParameterValue', $_)
            }
        }
    }
}

Register-ArgumentCompleter -CommandName 'cw','cw.ps1' -ScriptBlock $scriptblock

Write-Host "✓ ComicWise tab completion loaded" -ForegroundColor Green
Write-Host "  Try: cw <tab>" -ForegroundColor Gray
