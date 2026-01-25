import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from "discord.js";
import fs from "fs";
import path from "path";

export default {
  data: new SlashCommandBuilder()
    .setName("warlog")
    .setDescription("Log a war result")
    .addStringOption(o => 
      o.setName("type")
        .setDescription("Type of event")
        .setRequired(true)
        .addChoices(
          { name: "RTP", value: "RTP" },
          { name: "Envoy", value: "Envoy" }
        )
    )
    .addIntegerOption(o => 
      o.setName("team_numbers")
        .setDescription("Number of people with us")
        .setRequired(true)
    )
    .addIntegerOption(o => 
      o.setName("enemy_numbers")
        .setDescription("Number of people on opposite side")
        .setRequired(true)
    )
    .addStringOption(o => 
      o.setName("result")
        .setDescription("Result of the war")
        .setRequired(true)
        .addChoices(
          { name: "Victory", value: "Victory" },
          { name: "Defeat", value: "Defeat" }
        )
    )
    .addUserOption(o => 
      o.setName("leader")
        .setDescription("War Leader")
        .setRequired(true)
    )
    .addUserOption(o => 
      o.setName("carry")
        .setDescription("The MVP/Carry of the war")
        .setRequired(true)
    )
    .addIntegerOption(o => 
      o.setName("kills")
        .setDescription("Total kills")
        .setRequired(true)
    )
    .addIntegerOption(o => 
      o.setName("deaths")
        .setDescription("Total deaths")
        .setRequired(true)
    )
    .addStringOption(o =>
      o.setName("notes")
        .setDescription("Additional notes about the war")
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async run(client, interaction) {
    const type = interaction.options.getString("type");
    const teamNums = interaction.options.getInteger("team_numbers");
    const enemyNums = interaction.options.getInteger("enemy_numbers");
    const result = interaction.options.getString("result");
    const leader = interaction.options.getUser("leader");
    const carry = interaction.options.getUser("carry");
    const kills = interaction.options.getInteger("kills");
    const deaths = interaction.options.getInteger("deaths");
    const notes = interaction.options.getString("notes") || "No additional notes";

    // Try to get saved IGNs
    const ignPath = path.join(process.cwd(), "data", "user_igns.json");
    let ignData = {};
    if (fs.existsSync(ignPath)) {
      ignData = JSON.parse(fs.readFileSync(ignPath, "utf8"));
    }

    const leaderIGN = ignData[leader.id] || leader.username;
    const carryIGN = ignData[carry.id] || carry.username;

    const kd = deaths === 0 ? kills.toFixed(2) : (kills / deaths).toFixed(2);
    const title = result === "Victory" ? "Major War Victory" : "Major War Defeat";
    const color = result === "Victory" ? 0x00FF00 : 0xFF0000;

    const embed = new EmbedBuilder()
      .setTitle("⚔️ War Result ⚔️")
      .setDescription(`## ${title}`)
      .setColor(color)
      .addFields(
        { name: "Gamemode", value: "Lifesteal", inline: true },
        { name: "Event Type", value: type, inline: true },
        { name: "War Leader", value: `${leader} (${leaderIGN})`, inline: false },
        { name: "Carry", value: `${carry} (${carryIGN})`, inline: false },
        { name: "Team Numbers", value: teamNums.toString(), inline: true },
        { name: "Enemy Numbers", value: enemyNums.toString(), inline: true },
        { name: "Kills", value: kills.toString(), inline: true },
        { name: "Deaths", value: deaths.toString(), inline: true },
        { name: "K/D Ratio", value: kd.toString(), inline: true },
        { name: "Notes", value: notes, inline: false }
      )
      .setTimestamp();

    // Save Log
    const guildId = interaction.guildId;
    const logData = {
      timestamp: new Date().toISOString(),
      type,
      teamNums,
      enemyNums,
      result,
      leaderId: leader.id,
      carryId: carry.id,
      kills,
      deaths,
      kd,
      notes
    };
    
    const logPath = path.join(process.cwd(), "data", "warlogs.json");
    let allLogs = {};
    try {
      if (fs.existsSync(logPath)) {
        allLogs = JSON.parse(fs.readFileSync(logPath, "utf-8"));
      }
    } catch (e) {}
    
    if (!allLogs[guildId]) allLogs[guildId] = [];
    allLogs[guildId].push(logData);
    fs.writeFileSync(logPath, JSON.stringify(allLogs, null, 2));

    return interaction.reply({ embeds: [embed] });
  }
};
