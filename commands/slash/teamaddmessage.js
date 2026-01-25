import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import fs from "fs";
import path from "path";

export default {
  data: new SlashCommandBuilder()
    .setName("teamaddmessage")
    .setDescription("Set the custom message when a team member is added")
    .addStringOption(o => 
      o.setName("message")
        .setDescription("The message (use {ign} for the player name)")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async run(client, interaction) {
    const message = interaction.options.getString("message");
    const configPath = path.join(process.cwd(), "config.json");
    
    try {
      const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
      if (!config[interaction.guildId]) config[interaction.guildId] = {};
      config[interaction.guildId].teamAddMessage = message;
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      
      return interaction.reply({
        content: `✅ Team add message updated to:\n${message.replace("{ign}", "Player")}`,
        ephemeral: true
      });
    } catch (e) {
      console.error("Error saving team add message:", e);
      return interaction.reply({
        content: "❌ Failed to save the message configuration.",
        ephemeral: true
      });
    }
  }
};