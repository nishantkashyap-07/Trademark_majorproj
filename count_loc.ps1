$extensions = @('.ts','.tsx','.js','.jsx','.sol','.css')
$excludeDirs = @('node_modules','.next','cache','artifacts','.git','test')

$allFiles = Get-ChildItem -Recurse -File | Where-Object {
    $ext = $_.Extension
    if ($extensions -notcontains $ext) { return $false }
    $parts = $_.FullName -split '\\'
    foreach ($dir in $excludeDirs) {
        if ($parts -contains $dir) { return $false }
    }
    return $true
}

$totalLOC    = 0
$blankLines  = 0
$commentLines= 0
$fileCount   = 0
$breakdown   = @{}

foreach ($file in $allFiles) {
    $ext   = $file.Extension
    $lines = Get-Content $file.FullName -ErrorAction SilentlyContinue
    if ($null -eq $lines) { continue }
    $fileCount++
    $fileLOC = 0
    $inBlock = $false

    foreach ($line in $lines) {
        $t = $line.Trim()
        if ($t -eq '') { $blankLines++; continue }

        if ($inBlock) {
            $commentLines++
            if ($t -match '\*/') { $inBlock = $false }
            continue
        }
        if ($t -match '^/\*' -and $t -notmatch '\*/') {
            $commentLines++
            $inBlock = $true
            continue
        }
        if ($t -match '^//' -or $t -match '^/\*.*\*/$' -or $t -match '^\*') {
            $commentLines++
            continue
        }
        $totalLOC++
        $fileLOC++
    }

    if (-not $breakdown.ContainsKey($ext)) {
        $breakdown[$ext] = @{ files = 0; loc = 0 }
    }
    $breakdown[$ext].files += 1
    $breakdown[$ext].loc   += $fileLOC
}

Write-Host "=== LOC BREAKDOWN BY FILE TYPE ==="
foreach ($k in ($breakdown.Keys | Sort-Object)) {
    $f = $breakdown[$k].files
    $l = $breakdown[$k].loc
    Write-Host ("{0,-8} | {1,4} files | {2,6} LOC" -f $k, $f, $l)
}
Write-Host ""
Write-Host ("Total files scanned : {0}"  -f $fileCount)
Write-Host ("Blank lines         : {0}"  -f $blankLines)
Write-Host ("Comment lines       : {0}"  -f $commentLines)
Write-Host ("================================")
Write-Host ("ACTUAL CODE LOC     : {0}"  -f $totalLOC)
Write-Host ("================================")
