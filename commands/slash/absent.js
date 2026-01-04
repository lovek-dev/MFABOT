import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
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
    .setName("absent")
    .setDescription("Report your absence")
    .addStringOption(o =>
      o.setName("ign")
        .setDescription("Your in-game name")
        .setRequired(true)
    )
    .addStringOption(o =>
      o.setName("duration")
        .setDescription("Duration (e.g., 1d, 30m)")
        .setRequired(true)
    )
    .addStringOption(o =>
      o.setName("reason")
        .setDescription("Reason for absence")
        .setRequired(true)
    ),

  async run(client, interaction) {
    const ign = interaction.options.getString("ign");
    const duration = interaction.options.getString("duration");
    const reason = interaction.options.getString("reason");

    const absences = loadAbsences();
    const guildId = interaction.guild.id;
    const channelId = absences.channels[guildId];
    const userId = interaction.user.id;

    if (!channelId) {
      return interaction.reply({
        content: "❌ Absence channel not set! An admin needs to set it with `/absentchannel`",
        ephemeral: true
      });
    }

    // Check if user has an active absence
    const activeAbsence = absences.absences.find(a => a.userId === userId && a.guildId === guildId && new Date(a.expiresAt) > new Date());
    
    if (activeAbsence) {
      const expiresAt = new Date(activeAbsence.expiresAt);
      return interaction.reply({
        content: `❌ You already have an active absence until <t:${Math.floor(expiresAt.getTime() / 1000)}:F>! Use it again after that.`,
        ephemeral: true
      });
    }

    // Parse duration
    const durationMatch = duration.match(/^(\d+)([dm])$/);
    if (!durationMatch) {
      return interaction.reply({
        content: "❌ Invalid duration format! Use format like `1d` (days) or `30m` (minutes)",
        ephemeral: true
      });
    }

    const amount = parseInt(durationMatch[1]);
    const unit = durationMatch[2];
    const now = new Date();
    const expiresAt = new Date(now.getTime() + (unit === 'd' ? amount * 24 * 60 * 60 * 1000 : amount * 60 * 1000));

    try {
      const channel = await interaction.client.channels.fetch(channelId);
      
      const embed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("🛑 Absence Update 🛑")
        .addFields(
          { name: "👤 IGN", value: ign, inline: false },
          { name: "⛔ Reason", value: reason, inline: false },
          { name: "🗓️ Duration", value: duration, inline: false }
        )
        .setTimestamp();

      await channel.send({ embeds: [embed] });

      // Store absence record
      absences.absences.push({
        id: Date.now().toString(),
        guildId: guildId,
        ign: ign,
        duration: duration,
        reason: reason,
        reportedBy: userId,
        reportedAt: new Date().toISOString(),
        userId: userId,
        expiresAt: expiresAt.toISOString()
      });
      saveAbsences(absences);

      interaction.reply({
        content: `✅ Absence reported! Message sent to <#${channelId}>`,
        ephemeral: true
      });
    } catch (e) {
      console.error("Absence error:", e.message);
      interaction.reply({
        content: "❌ Error sending absence message. Check if the channel still exists.",
        ephemeral: true
      });
    }
  }
};
