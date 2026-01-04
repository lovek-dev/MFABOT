import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const absencesPath = path.join(__dirname, "../../data/absences.json");

function loadAbsences() {
  const data = fs.readFileSync(absencesPath, "utf8");
  return JSON.parse(data);
}

function saveAbsences(data) {
  fs.writeFileSync(absencesPath, JSON.stringify(data, null, 2));
}

export default {
  data: new SlashCommandBuilder()
    .setName("absentchannel")
    .setDescription("Set the channel for absence reports (Admin only)")
    .addChannelOption(o =>
      o.setName("channel")
        .setDescription("The channel for absence reports")
        .setRequired(true)
    )
    .addStringOption(o =>
      o.setName("guild_id_2")
        .setDescription("Optional: Second guild ID to set the same channel")
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async run(client, interaction) {
    const channel = interaction.options.getChannel("channel");
    const guildId2 = interaction.options.getString("guild_id_2");
    const absences = loadAbsences();
    const guildId1 = interaction.guild.id;

    // Set for first guild
    absences.channels[guildId1] = channel.id;

    // Set for second guild if provided
    if (guildId2) {
      absences.channels[guildId2] = channel.id;
      saveAbsences(absences);
      return interaction.reply({
        content: `✅ Absence channel set to <#${channel.id}> for both guilds!`,
        ephemeral: true
      });
    }

    saveAbsences(absences);
    interaction.reply({
      content: `✅ Absence channel set to <#${channel.id}>!`,
      ephemeral: true
    });
  }
};
