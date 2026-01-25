import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from "discord.js";
import fs from "fs";
import path from "path";

export default {
  data: new SlashCommandBuilder()
    .setName("warhistory")
    .setDescription("View war statistics and carry history")
    .addUserOption(o => 
      o.setName("carry")
        .setDescription("View how many times this user was the carry")
        .setRequired(false)
    ),

  async run(client, interaction) {
    const carryUser = interaction.options.getUser("carry");
    const guildId = interaction.guildId;
    const logPath = path.join(process.cwd(), "data", "warlogs.json");

    if (!fs.existsSync(logPath)) {
      return interaction.reply({ content: "No war history found yet.", ephemeral: true });
    }

    let allLogs = {};
    try {
      allLogs = JSON.parse(fs.readFileSync(logPath, "utf-8"));
    } catch (e) {
      return interaction.reply({ content: "Error reading war history.", ephemeral: true });
    }

    const logs = allLogs[guildId] || [];
    
    if (logs.length === 0) {
      return interaction.reply({ content: "No war history found for this server.", ephemeral: true });
    }

    const totalWars = logs.length;
    const wins = logs.filter(l => l.result === "Victory").length;
    const losses = totalWars - wins;

    // Calculate carry leaderboard
    const carryCounts = {};
    logs.forEach(log => {
      if (log.carryId) {
        carryCounts[log.carryId] = (carryCounts[log.carryId] || 0) + 1;
      }
    });

    const sortedMvps = Object.entries(carryCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5); // Get top 5

    let leadMvpText = "None yet";
    if (sortedMvps.length > 0) {
      leadMvpText = sortedMvps.map(([id, count]) => `<@${id}> (${count} carries)`).join("\n");
    }

    const embed = new EmbedBuilder()
      .setTitle("📊 War History Summary")
      .setColor(0x3498DB)
      .addFields(
        { name: "Total Wars", value: totalWars.toString(), inline: true },
        { name: "Wins ✅", value: wins.toString(), inline: true },
        { name: "Losses ❌", value: losses.toString(), inline: true },
        { name: "Lead MVP Leaderboard", value: leadMvpText, inline: false }
      )
      .setTimestamp();

    if (carryUser) {
      const carryCount = logs.filter(l => l.carryId === carryUser.id).length;
      embed.addFields({ name: "MVP/Carry Stats", value: `${carryUser} was the carry **${carryCount}** times.`, inline: false });
    }

    return interaction.reply({ embeds: [embed] });
  }
};
