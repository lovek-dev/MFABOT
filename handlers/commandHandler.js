const fs = require("fs");
const path = require("path");
const config = require("../config.json");

module.exports = (client) => {
  const commandFiles = fs.readdirSync("./commands/prefix").filter(f => f.endsWith(".js"));

  for (const file of commandFiles) {
    const command = require(`../commands/prefix/${file}`);
    client.commands.set(command.name, command);
  }

  console.log("Prefix commands loaded.");
};
