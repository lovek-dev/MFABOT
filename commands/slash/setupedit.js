import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import fs from "node:fs";
import path from "node:path";

export default {
  data: new SlashCommandBuilder()
    .setName("setupedit")
    .setDescription("Edit the welcome message or image for the setup panel")
    .addStringOption(o => o.setName("message").setDescription("New welcome message").setRequired(false))
    .addStringOption(o => o.setName("image").setDescription("New welcome image or GIF URL").setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async run(client, interaction) {
    const message = interaction.options.getString("message");
    const image = interaction.options.getString("image");

    const configPath = path.join(process.cwd(), "config.json");
    const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

    if (message) config.welcomeMessage = message.replace(/\\n/g, "\n");
    if (image) config.welcomeImage = image;

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    return interaction.reply({
      content: "✅ Setup configuration updated! Use `/setup` to see the changes.",
      ephemeral: true
    });
  }
};
