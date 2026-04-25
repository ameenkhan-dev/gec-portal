# GEC Event Portal - Setup Script
# Run this script first to create the directory structure, then run the create-files script

$baseDir = "C:\Users\Ameen Khan\Documents\gec-portal\frontend"

# Create directories
$directories = @(
    "src",
    "src\components",
    "src\components\common",
    "src\components\layout",
    "src\pages",
    "src\pages\auth",
    "src\pages\student",
    "src\pages\club",
    "src\pages\admin",
    "src\pages\events",
    "src\context",
    "src\utils",
    "src\assets",
    "src\assets\images",
    "public"
)

foreach ($dir in $directories) {
    $fullPath = Join-Path $baseDir $dir
    if (-not (Test-Path $fullPath)) {
        New-Item -ItemType Directory -Path $fullPath -Force | Out-Null
        Write-Host "Created: $fullPath"
    }
}

Write-Host "`nDirectory structure created successfully!"
Write-Host "Now run: npm install"
