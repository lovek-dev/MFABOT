import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import fs from "fs";
import path from "path";
import teamchannel from "./teamchannel.js";

const teamPath = path.join(process.cwd(), "data", "team_list.json");

const loadData = (filePath, defaultVal = []) => {
  if (!fs.existsSync(filePath)) return defaultVal;
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
};

const saveData = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

export default {
  data: new SlashCommandBuilder()
    .setName("teamremove")
    .setDescription("Remove a player's IGN from the team list")
    .addStringOption(o => o.setName("ign").setDescription("The player's In-Game Name").setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async run(client, interaction) {
    const ign = interaction.options.getString("ign");
    const guildId = interaction.guildId;

    let allTeams = {};
    if (fs.existsSync(teamPath)) {
      allTeams = JSON.parse(fs.readFileSync(teamPath, "utf-8"));
    }
    
    if (!allTeams[guildId] || !allTeams[guildId].includes(ign)) {
      return interaction.reply({ content: `❌ **${ign}** is not in the list for this server.`, ephemeral: true });
    }

    allTeams[guildId] = allTeams[guildId].filter(name => name !== ign);
    saveData(teamPath, allTeams);
    
    await interaction.reply({ content: `✅ Removed **${ign}** from the team.`, ephemeral: true });
    
    const configPath = path.join(process.cwd(), "data", "team_config.json");
    const config = fs.existsSync(configPath) ? JSON.parse(fs.readFileSync(configPath, "utf8")) : {};
    const guildConfig = config[interaction.guildId] || {};
    
    if (guildConfig.channelId) {
      try {
        const channel = await client.channels.fetch(guildConfig.channelId);
        if (channel) {
          await channel.send(`➖ **Team Member Left**\n**${ign}** has been removed from the team.`);
        }
      } catch (e) {
        console.error("Failed to send team remove message:", e.message);
      }
    }
  }
};
