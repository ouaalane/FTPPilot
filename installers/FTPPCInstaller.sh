#!/bin/bash

set -e


echo "Installing FTP Pilot Client"

# -------- CONFIG --------
APP_NAME="ftppc"
INSTALL_DIR="$HOME/.ftppc"
REPO_URL="https://github.com/ouaalane/FTPPilot.git"



# -------- FUNCTIONS --------

command_exists () {
  command -v "$1" >/dev/null 2>&1
}

install_node() {
  echo "Installing Node.js..."
  curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
  sudo apt-get install -y nodejs
}

install_git() {
  echo "Installing Git..."
  sudo apt-get update
  sudo apt-get install -y git
}

# -------- CHECK DEPENDENCIES --------

if ! command_exists git; then
  install_git
else
  echo "Git already installed"
fi


if ! command_exists node; then
  install_node
else
  echo "Node.js already installed"
fi

# -------- CLONE PROJECT --------

echo "Cloning project..."
rm -rf "$INSTALL_DIR"
mkdir "$HOME/.ftppc"

git clone "$REPO_URL" "$INSTALL_DIR"

cd "$INSTALL_DIR"



# -------- INSTALL DEPENDENCIES --------

echo "Installing npm dependencies..."
npm install

# -------- MAKE CLI EXECUTABLE --------

echo "setting up CLI..."

chmod +x "$INSTALL_DIR/src/cli.js"

# Create symlink
sudo ln -sf "$INSTALL_DIR/src/cli.js" "/usr/local/bin/$APP_NAME"

# -------- DONE --------

echo ""
echo "Installation complete!"
echo "You can now run: $APP_NAME"
