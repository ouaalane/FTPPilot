#Requires -Version 5.1
$ErrorActionPreference = "Stop"

Write-Host "Installing FTP Pilot Client"

# -------- CONFIG --------
$APP_NAME  = "ftppc"
$INSTALL_DIR = "$env:USERPROFILE\.ftppc"
$REPO_URL  = "https://github.com/ouaalane/FTPPilot.git"

# -------- FUNCTIONS --------
function Command-Exists {
    param([string]$cmd)
    return $null -ne (Get-Command $cmd -ErrorAction SilentlyContinue)
}

function Install-Node {
    Write-Host "Installing Node.js..."
    $installer = "$env:TEMP\node_installer.msi"
    Invoke-WebRequest -Uri "https://nodejs.org/dist/v18.20.4/node-v18.20.4-x64.msi" -OutFile $installer
    Start-Process msiexec.exe -ArgumentList "/i `"$installer`" /quiet /norestart" -Wait -Verb RunAs
    Remove-Item $installer -Force
    # Refresh PATH so node is available in the current session
    $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH", "Machine") + ";" +
                [System.Environment]::GetEnvironmentVariable("PATH", "User")
}

function Install-Git {
    Write-Host "Installing Git..."
    $installer = "$env:TEMP\git_installer.exe"
    Invoke-WebRequest -Uri "https://github.com/git-for-windows/git/releases/download/v2.44.0.windows.1/Git-2.44.0-64-bit.exe" -OutFile $installer
    Start-Process $installer -ArgumentList "/VERYSILENT /NORESTART" -Wait -Verb RunAs
    Remove-Item $installer -Force
    # Refresh PATH so git is available in the current session
    $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH", "Machine") + ";" +
                [System.Environment]::GetEnvironmentVariable("PATH", "User")
}

# -------- CHECK DEPENDENCIES --------
if (-not (Command-Exists "git")) {
    Install-Git
} else {
    Write-Host "Git already installed"
}

if (-not (Command-Exists "node")) {
    Install-Node
} else {
    Write-Host "Node.js already installed"
}

# -------- CLONE PROJECT --------
Write-Host "Cloning project..."
if (Test-Path $INSTALL_DIR) {
    Remove-Item -Recurse -Force $INSTALL_DIR
}
New-Item -ItemType Directory -Path $INSTALL_DIR | Out-Null
git clone $REPO_URL $INSTALL_DIR
Set-Location -Path $INSTALL_DIR

# -------- INSTALL DEPENDENCIES --------
Write-Host "Installing npm dependencies..."
npm install

# -------- MAKE CLI EXECUTABLE --------
Write-Host "Setting up CLI..."

# Unblock the file (removes Windows security flag on downloaded files)
Unblock-File -Path "$INSTALL_DIR\src\cli.js"

# Create a .cmd shim so the CLI can be called by name from anywhere
$shimDir = "$env:APPDATA\npm"
if (-not (Test-Path $shimDir)) {
    New-Item -ItemType Directory -Path $shimDir | Out-Null
}
$shimPath = "$shimDir\$APP_NAME.cmd"
$shimContent = "@echo off`r`nnode `"$INSTALL_DIR\src\cli.js`" %*"
Set-Content -Path $shimPath -Value $shimContent -Encoding ASCII

# Add shim directory to user PATH if not already present
$userPath = [System.Environment]::GetEnvironmentVariable("PATH", "User")
if ($userPath -notlike "*$shimDir*") {
    [System.Environment]::SetEnvironmentVariable("PATH", "$userPath;$shimDir", "User")
    $env:PATH += ";$shimDir"
    Write-Host "Added $shimDir to PATH"
}

# -------- DONE --------
Write-Host ""
Write-Host "Installation complete!"
Write-Host "You can now run: $APP_NAME"
Write-Host "Note: If the command is not found, restart your terminal to reload PATH."