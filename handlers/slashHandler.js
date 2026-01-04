const fs = require("fs");
const { REST, Routes } = require("discord.js");
const config = require("../config.json");

module.exports = async (client) => {
  const slashCommands = [];

  const files = fs.readdirSync("./commands/slash").filter(f => f.endsWith(".js"));
  for (const file of files) {
    const cmd = require(`../commands/slash/${file}`);
    client.slashCommands.set(cmd.data.name, cmd);
    slashCommands.push(cmd.data.toJSON());
  }

  const rest = new REST({ version: "10" }).setToken(config.token);

  try {
    await rest.put(
      Routes.applicationCommands(client.user?.id),
      { body: slashCommands }
    );
    console.log("Slash commands registered.");
  } catch (err) {
    console.error(err);
  }
};
