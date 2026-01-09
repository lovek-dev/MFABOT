import { SlashCommandBuilder, PermissionFlagsBits, RoleSelectMenuBuilder, ActionRowBuilder } from "discord.js";
import fs from "fs";
import path from "path";

export default {
  data: new SlashCommandBuilder()
    .setName("bountyrole")
    .setDescription("Set the role to be pinged when a bounty is posted")
    .addRoleOption(option => 
      option.setName("role")
        .setDescription("The role to ping")
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async run(client, interaction) {
    const role = interaction.options.getRole("role");
    const configPath = path.join(process.cwd(), "config.json");
    
    try {
      const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
      config.bountyPingRoleId = role.id;
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      
      return interaction.reply({
        content: `✅ Bounty ping role has been set to ${role}!`,
        ephemeral: true
      });
    } catch (e) {
      console.error("Error saving bounty role:", e);
      return interaction.reply({
        content: "❌ Failed to save the bounty role configuration.",
        ephemeral: true
      });
    }
  }
};