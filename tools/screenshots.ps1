# Renders the link preview image, the home-screen icon and the README screenshots
# with headless Microsoft Edge (Windows). Phone-sized shots use Playwright in Docker.
#
# Start the site and both servers first, for example:
#   docker compose up --build
# then run:
#   .\tools\screenshots.ps1
param(
    [string] $Site = 'http://127.0.0.1:8080/',
    [string] $Node = 'http://127.0.0.1:3000/',
    [string] $Python = 'http://127.0.0.1:8000/'
)

$root = Split-Path $PSScriptRoot -Parent
$edge = @("${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe",
          "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe") | Where-Object { Test-Path $_ } | Select-Object -First 1
$profileDir = Join-Path $env:TEMP 'hocuspocus-screenshots'

function Save-Shot([string] $Url, [string] $Out, [int] $Width, [int] $Height, [int] $Scale = 1) {
    $path = Join-Path $root $Out
    Start-Process -Wait -FilePath $edge -ArgumentList @(
        '--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-prefers-reduced-motion', "--user-data-dir=$profileDir",
        "--force-device-scale-factor=$Scale", "--window-size=$Width,$Height",
        '--virtual-time-budget=5000', "--screenshot=$path", $Url)
    Write-Host "$Out  ($((Get-Item $path).Length / 1KB -as [int]) KB)"
}

# The first round of a server game, reached by following its "I've got my card" link.
function Get-RoundOne([string] $Base) {
    $html = (Invoke-WebRequest -UseBasicParsing $Base).Content
    $Base.TrimEnd('/') + ([regex]::Match($html, 'hp-primary" href="([^"]+)"').Groups[1].Value -replace '&amp;', '&')
}

$file = { param($rel) ([uri] (Join-Path $root $rel)).AbsoluteUri }

# A phone-sized (390x844) view of a page, at twice the pixel density. Headless Edge
# won't size its window that narrow, and the pages refuse to be framed, so this
# uses Playwright's iPhone emulation in Docker.
$playwright = 'mcr.microsoft.com/playwright:v1.65.1-noble'
function Save-Phone([string] $Url, [string] $Out) {
    $inner = $Url -replace '//(127\.0\.0\.1|localhost)', '//host.docker.internal'
    docker run --rm -v "${root}:/repo" -w /tmp $playwright sh -c (
        'npm i -s --no-audit --no-fund playwright@1.65.1 >/dev/null 2>&1 && ' +
        "cp /repo/tools/phone-shot.mjs . && node phone-shot.mjs '$inner' '/repo/$Out'")
    Write-Host "$Out  ($((Get-Item (Join-Path $root $Out)).Length / 1KB -as [int]) KB)"
}

Save-Shot (& $file 'tools/social-card.html') 'site/social.png' 1200 630
Save-Shot (& $file 'tools/icon.html') 'site/apple-touch-icon.png' 180 180
Save-Shot (Get-RoundOne $Node) 'site/previews/node.png' 900 820
Save-Shot (Get-RoundOne $Python) 'site/previews/python.png' 900 820

Save-Shot $Site 'media/desktop.png' 1280 1000
Save-Phone $Site 'media/phone-play.png'
Save-Phone "${Node}?reveal=37" 'media/phone-reveal.png'
Save-Phone "${Site}#run" 'media/phone-run.png'
