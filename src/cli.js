#!/usr/bin/env node
import { FTPilotClient } from "./FTPilotClient.js";
import { input, select, confirm, checkbox } from "@inquirer/prompts";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { exit } from "node:process";

class FTPCLI {
  #IsConnected = false;

  #configPath = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    "..",
    "config",
    "config.json",
  );
  constructor() {
    this.client = null;
    this.connected = false;
  }

  #getConfigFromJson() {
    return fs.readFile(this.#configPath, "utf-8").then((data) => {
      try {
        return JSON.parse(data);
      } catch (err) {
        console.error("Error parsing config.json:", err.message);
        return {
          host: "",
          port: "",
          user: "",
          password: "",
          secure: false,
          verbose: false,
        };
      }
    });
  }

  #isValidConfig(config) {
    return (
      config.host.length > 0 &&
      config.port > 0 &&
      config.user.length > 0 &&
      config.password.length > 0
    );
  }

  #saveConfigToJson(config) {
    return fs.writeFile("config.json", JSON.stringify(config, null, 2));
  }

  #clearsavedConfig() {
    return fs.writeFile(
      "config.json",
      JSON.stringify(
        {
          host: "",
          port: "",
          user: "",
          password: "",
          secure: false,
          verbose: false,
        },
        null,
        2,
      ),
    );
  }

  async #connectwithsavedConfig(config) {
    console.log("connecting with saved configuration...");

    this.client = new FTPilotClient(
      config.host,
      config.port,
      config.user,
      config.password,
      config.secure,
      false,
    );

    this.#IsConnected = await this.client.connect();
    if (!this.#IsConnected) {
      console.log("Failed to connect with saved configuration.");
      await this.#clearsavedConfig();
    } else {
      console.log("Connected successfully!");
      await this.#saveConfigToJson(config);
    }
  }

  async #connectwithnewConfig() {
    console.log(
      "No valid saved configuration found. Please enter connection details.",
    );
    const host = await input({ message: "FTP Host:" });
    const port = parseInt(await input({ message: "FTP Port:", default: "21" }));
    const user = await input({ message: "Username:" });
    const password = await input({ message: "Password:", type: "password" });
    const secure = await confirm({
      message: "Use secure connection (FTPS)?",
      default: false,
    });
    this.client = new FTPilotClient(host, port, user, password, secure, false);

    this.#IsConnected = await this.client.connect();
    if (!this.#IsConnected) {
      console.log("Failed to connect with entered configuration.");
      await this.clearsavedConfig();
    } else {
      console.log("Connected successfully!");
      saveConfigToJson({
        host: host,
        port: port,
        user: user,
        password: password,
        secure: secure,
        verbose: false,
      });
    }
  }

  async #connectScreen() {
    console.clear();
    const config = await this.#getConfigFromJson();

    if (this.#isValidConfig(config)) {
      await this.#connectwithsavedConfig(config);
    } else {
      await this.#connectwithnewConfig();
    }
  }

  async #listDirectoryScreen() {
    console.clear();
    if (!this.#IsConnected) {
      console.log("Not connected.");
      return;
    }
    const dir = await input({ message: "Directory path:", default: "/" });
    try {
      const list = await this.client.client.list(dir);
      console.log(`Contents of ${dir}:`);
      list.forEach((item) => {
        const type = item.type === 1 ? "[FILE]" : "[DIR]";
        console.log(`${type} ${item.name} (${item.size || "N/A"})`);
      });
    } catch (err) {
      if (err.code === 550) {
        console.error("Directory not found or access denied.");
        return;
      }
      console.error("Error listing directory:", err.message);
    }
  }

  async #downloadFileScreen() {
    console.clear();
    if (!this.#IsConnected) {
      console.log("Not connected.");
      return;
    }
    const remotePath = await input({ message: "Remote file path:" });
    let localPath = await input({ message: "Local destination path:" });
    try {
      const success = await this.client.DownloadFile(remotePath, localPath);
      if (success) {
        console.log("File downloaded successfully.");
      } else {
        console.log("Failed to download file.");
      }
    } catch (err) {
      console.error("Error downloading file:", err.message);
    }
  }

  async #downloadDirectoryScreen() {
    console.clear();
    if (!this.connected) {
      console.log("Not connected.");
      return;
    }
    const remotePath = await input({ message: "Remote directory path:" });
    const localPath = await input({ message: "Local destination path:" });
    try {
      const success = await this.client.DownloadDirectory(
        remotePath,
        localPath,
      );
      if (success) {
        console.log("Directory downloaded successfully.");
      } else {
        console.log("Failed to download directory.");
      }
    } catch (err) {
      console.error("Error downloading directory:", err.message);
    }
  }

  async #uploadFileScreen() {
    console.clear();
    if (!this.connected) {
      console.log("Not connected.");
      return;
    }
    let localPath = await input({ message: "Local file path:" });
    let remotePath = await input({ message: "Remote destination path:" });

    const filename = localPath.split("\\").pop();

    console.log("Filename extracted:", filename);
    if (!remotePath.endsWith(filename)) {
      remotePath += "/" + filename;
    }

    try {
      await this.client.client.uploadFrom(localPath, remotePath);
      console.log("File uploaded successfully.");
    } catch (err) {
      console.error("Error uploading file:", err.message);
    }
  }

  async #uploadDirectoryScreen() {
    console.clear();
    if (!this.connected) {
      console.log("Not connected.");
      return;
    }
    const localPath = await input({ message: "Local directory path:" });
    const remotePath = await input({ message: "Remote destination path:" });
    try {
      await this.client.client.uploadFromDir(localPath, remotePath);
      console.log("Directory uploaded successfully.");
    } catch (err) {
      console.error("Error uploading directory:", err.message);
    }
  }

  async #deleteFileScreen() {
    console.clear();
    if (!this.connected) {
      console.log("Not connected.");
      return;
    }
    const remotePath = await input({ message: "Remote file path to delete:" });
    try {
      await this.client.client.remove(remotePath);
      console.log("File deleted successfully.");
    } catch (err) {
      console.error("Error deleting file:", err.message);
    }
  }

  async #deleteDirectoryScreen() {
    console.clear();
    if (!this.connected) {
      console.log("Not connected.");
      return;
    }
    const remotePath = await input({
      message: "Remote directory path to delete:",
    });
    try {
      await this.client.client.removeDir(remotePath);
      console.log("Directory deleted successfully.");
    } catch (err) {
      console.error("Error deleting directory:", err.message);
    }
  }

  #DrawHeader() {
    const width = process.stdout.columns || 80;
    const asciiArt = `________________________________  __________ .___ .____     ________   ___________
\\_   _____/\\__    ___/\\______   \\ \\______   \\|   ||    |    \\_____  \\  \\__    ___/
 |    __)    |    |    |     ___/  |     ___/|   ||    |     /   |   \\   |    |   
 |     \\     |    |    |    |      |    |    |   ||    |___ /    |    \\  |    |   
 \\___  /     |____|    |____|      |____|    |___||_______ \\\\_______  /  |____|   
     \\/                                                   \\/        \\/            
     
     `;
    const lines = [
      "===============================================================================",
      ...asciiArt.split("\n"),
      "Copyright (c) 2026 by Mohamed ouaalane",
      `version: 1.0.0 - ${new Date().toLocaleDateString()}`,
      `status: ${this.#IsConnected ? "Connected" : "Not Connected"}`,
      "===============================================================================",
    ];
    for (const line of lines) {
      const padding = Math.max(0, Math.floor((width - line.length) / 2));
      console.log(" ".repeat(padding) + line);
    }
  }

  async #ShowMainScreen() {
    console.clear();
    this.#DrawHeader();
    const action = await select({
      message: "Choose an action:",
      loop: false,
      choices: [
        { name: "Connect to FTP server", value: "connect" },
        { name: "List directory", value: "list" },
        { name: "Download file", value: "downloadFile" },
        { name: "Download directory", value: "downloadDir" },
        { name: "Upload file", value: "uploadFile" },
        { name: "Upload directory", value: "uploadDir" },
        { name: "Delete file", value: "deleteFile" },
        { name: "Delete directory", value: "deleteDir" },
        { name: "Clear saved configuration", value: "clearConfig" },
        { name: "Exit", value: "exit" },
      ],
    });

    return action;
  }

  async #ClearConfigurationScreen() {
    console.clear();
    await fs.writeFile(
      "config.json",
      JSON.stringify(
        {
          host: "",
          port: "",
          user: "",
          password: "",
          secure: false,
          verbose: false,
        },
        null,
        2,
      ),
    );
    console.log("Configuration cleared.");
  }
  async run() {
    while (true) {
      const action = await this.#ShowMainScreen();

      switch (action) {
        case "connect":
          await this.#connectScreen();
          await input({ message: "Press Enter to continue..." });
          break;
        case "list":
          await this.#listDirectoryScreen();
          await input({ message: "Press Enter to continue..." });
          break;
        case "downloadFile":
          console.clear();
          await this.#downloadFileScreen();
          await input({ message: "Press Enter to continue..." });
          break;
        case "downloadDir":
          console.clear();
          await this.#downloadDirectoryScreen();
          await input({ message: "Press Enter to continue..." });
          break;
        case "uploadFile":
          await this.#uploadFileScreen();
          await input({ message: "Press Enter to continue..." });
          break;
        case "uploadDir":
          await this.#uploadDirectoryScreen();
          await input({ message: "Press Enter to continue..." });
          break;
        case "deleteFile":
          await this.#deleteFileScreen();
          await input({ message: "Press Enter to continue..." });
          break;
        case "deleteDir":
          await this.#deleteDirectoryScreen();
          await input({ message: "Press Enter to continue..." });
          break;
        case "clearConfig":
          await this.#ClearConfigurationScreen();
          await input({ message: "Press Enter to continue..." });
          break;

        case "exit":
          console.clear();
          console.log("Goodbye!");
          await input({ message: "Press Enter to exit..." });
          exit(0);
      }
    }
  }
}

const cli = new FTPCLI();
cli.run().catch(console.error);
