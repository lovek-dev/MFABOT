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
    .setName("clearabsent")
    .setDescription("Clear an absence (Admin only)")
    .addStringOption(o =>
      o.setName("ign")
        .setDescription("In-game name to clear absence for")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async run(client, interaction) {
    const ign = interaction.options.getString("ign");
    const absences = loadAbsences();
    const guildId = interaction.guild.id;

    // Find the absence to remove
    const absenceIndex = absences.absences.findIndex(
      a => a.ign.toLowerCase() === ign.toLowerCase() && a.guildId === guildId && new Date(a.expiresAt) > new Date()
    );

    if (absenceIndex === -1) {
      return interaction.reply({
        content: `❌ No active absence found for **${ign}**!`,
        ephemeral: true
      });
    }

    absences.absences.splice(absenceIndex, 1);
    saveAbsences(absences);

    interaction.reply({
      content: `✅ Cleared absence for **${ign}**!`,
      ephemeral: true
    });
  }
};
