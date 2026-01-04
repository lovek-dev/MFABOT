import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from "discord.js";
import fs from "fs";
import path from "path";

const configPath = path.join(process.cwd(), "data", "team_config.json");
const teamPath = path.join(process.cwd(), "data", "team_list.json");

const loadData = (filePath, defaultVal = []) => {
  if (!fs.existsSync(filePath)) return defaultVal;
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
};

const saveData = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

async function updateTeamMessage(client, guild, changeMsg) {
  const config = loadData(configPath, {});
  const team = loadData(teamPath, []);
  
  if (!config.channelId) return;

  const channel = guild.channels.cache.get(config.channelId);
  if (!channel) return;

  // Clean up old message
  if (config.lastMessageId) {
    try {
      const oldMsg = await channel.messages.fetch(config.lastMessageId);
      if (oldMsg) await oldMsg.delete();
    } catch (e) { /* ignore */ }
  }

  const embed = new EmbedBuilder()
    .setTitle("🛡️ Official Team List")
    .setDescription(team.length > 0 ? team.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' })).map((name, i) => `${i + 1}. **${name}**`).join("\n") : "The team list is currently empty.")
    .setColor(0x00AE86)
    .setFooter({ text: changeMsg || "Team list updated" })
    .setTimestamp();

  const newMsg = await channel.send({ embeds: [embed] });
  config.lastMessageId = newMsg.id;
  saveData(configPath, config);
}

export default {
  data: new SlashCommandBuilder()
    .setName("teamchannel")
    .setDescription("Set the channel for the live team list")
    .addChannelOption(o => o.setName("channel").setDescription("The channel to post the list in").setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async run(client, interaction) {
    const channel = interaction.options.getChannel("channel");
    const config = loadData(configPath, {});
    config.channelId = channel.id;
    saveData(configPath, config);
    
    await interaction.reply({ content: `✅ Team list channel set to ${channel}`, ephemeral: true });
    await updateTeamMessage(client, interaction.guild, "Team list initialized");
  },
  // Exporting helper for other commands
  updateTeamMessage
};
