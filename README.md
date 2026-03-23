# TFP

TFP is a lightweight FTP pilot project providing a client and server implementation, CLI tools, and test coverage. It helps demonstrate FTP interactions and provides a starting point for experimentation.

**Contents**

- `src/FTPilotClient.js` — FTP client implementation
- `src/FTPilotServer.js` — FTP server implementation
- `src/cli.js`, `src/serverCli.js` — CLI entrypoints
- `src/config.json` and `config/` — configuration files
- `tests/` — automated tests for client and server

## Prerequisites

- Node.js 14+ installed
- npm (comes with Node.js)

## Install

Clone the repo and install dependencies:

```bash
git clone <repo-url> tfp
cd tfp
npm install
```

## Configuration

Project configuration lives in `config/config.json` and `src/config.json`. Copy or edit these files to set server address, ports, and other options.

## Usage

Run the client or server via the included CLI scripts. Examples:

Start the server:

```bash
node src/serverCli.js --config config/serverConfig.json
```

Run the client:

```bash
node src/cli.js --config src/config.json
```

For quick testing you can run the main modules directly:

```bash
node src/FTPilotServer.js
node src/FTPilotClient.js
```

## Running Tests

Run the test suite with:

```bash
npm test
```

Unit tests are located in `tests/` (for example `tests/ftpClient.test.js` and `tests/ftpServer.test.js`).

## Contributing

- Open an issue to discuss features or bugs
- Fork the repo, create a branch, and submit a pull request

## License

Specify your license here (e.g., MIT). If you don't have a license, add one to the repo.

---

If you'd like, I can also:

- add example `config` files
- add a minimal `package.json` scripts section for `start` and `test`
- run tests locally and report results

# TFP - FTP Pilot

A Node.js FTP client and server with an interactive CLI.

## Structure

- `src/FTPilotClient.js` — FTP client class
- `src/FTPilotServer.js` — FTP server class
- `src/cli.js` — Client CLI
- `src/serverCli.js` — Server CLI
- `config/` — Connection configs (git-ignored)
- `tests/` — Tests

## Usage

```bash
npm install
node src/cli.js         # start client CLI
node src/serverCli.js   # start server CLI
```
