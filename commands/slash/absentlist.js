import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from "discord.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const absencesPath = path.join(__dirname, "../../data/absences.json");

function loadAbsences() {
  const data = fs.readFileSync(absencesPath, "utf8");
  return JSON.parse(data);
}

export default {
  data: new SlashCommandBuilder()
    .setName("absentlist")
    .setDescription("Show all active absences (Admin only)")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async run(client, interaction) {
    const absences = loadAbsences();
    const guildId = interaction.guild.id;

    // Filter active absences for this guild
    const activeAbsences = absences.absences.filter(
      a => a.guildId === guildId && new Date(a.expiresAt) > new Date()
    );

    if (activeAbsences.length === 0) {
      return interaction.reply({
        content: "✅ No active absences!",
        ephemeral: true
      });
    }

    const embed = new EmbedBuilder()
      .setTitle("📋 Active Absences")
      .setColor("Blue")
      .setTimestamp();

    activeAbsences.forEach((absence, index) => {
      const expiresAt = new Date(absence.expiresAt);
      embed.addFields({
        name: `${index + 1}. ${absence.ign}`,
        value: `⏱️ Duration: ${absence.duration}\n⏰ Expires: <t:${Math.floor(expiresAt.getTime() / 1000)}:R>`,
        inline: false
      });
    });

    interaction.reply({ embeds: [embed] });
  }
};
