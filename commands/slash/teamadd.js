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
    .setName("teamadd")
    .setDescription("Add a player's IGN to the team list")
    .addStringOption(o => o.setName("ign").setDescription("The player's In-Game Name").setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async run(client, interaction) {
    const ign = interaction.options.getString("ign");
    let team = loadData(teamPath, []);
    
    if (team.includes(ign)) {
      return interaction.reply({ content: `❌ **${ign}** is already in the list.`, ephemeral: true });
    }

    team.push(ign);
    saveData(teamPath, team);
    
    await interaction.reply({ content: `✅ Added **${ign}** to the team.`, ephemeral: true });
    
    const configPath = path.join(process.cwd(), "data", "team_config.json");
    const config = fs.existsSync(configPath) ? JSON.parse(fs.readFileSync(configPath, "utf8")) : {};
    const guildConfig = config[interaction.guildId] || {};
    
    if (guildConfig.channelId) {
      try {
        const channel = await client.channels.fetch(guildConfig.channelId);
        if (channel) {
          const mainConfigPath = path.join(process.cwd(), "config.json");
          const mainConfig = JSON.parse(fs.readFileSync(mainConfigPath, "utf8"));
          const guildMainConfig = mainConfig[interaction.guildId] || {};
          
          const customMessage = guildMainConfig.teamAddMessage || "🎉 **New Team Member!**\n{ign} joined TheElites - New Member";
          const finalMessage = customMessage.replace("{ign}", ign);
          await channel.send(finalMessage);
        }
      } catch (e) {
        console.error("Failed to send team add message:", e.message);
      }
    }
  }
};
