import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from "discord.js";
import fs from "fs";

const dataPath = "./data/schedules.json";

function loadSchedules() {
  try {
    const data = fs.readFileSync(dataPath, "utf8");
    return JSON.parse(data);
  } catch {
    return { scheduledMessages: [] };
  }
}

export default {
  data: new SlashCommandBuilder()
    .setName("listschedules")
    .setDescription("List all scheduled messages")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async run(client, interaction) {
    const data = loadSchedules();
    const schedules = data.scheduledMessages.filter(s => s.guildId === interaction.guild.id);

    if (schedules.length === 0) {
      return interaction.reply({
        content: "No scheduled messages. Use `/schedule` to create one!",
        ephemeral: true
      });
    }

    const embed = new EmbedBuilder()
      .setTitle("Scheduled Messages")
      .setColor(0x5865F2)
      .setDescription(
        schedules
          .map((s, index) => {
            const date = new Date(s.scheduledTime);
            return `**${index + 1}.** ID: \`${s.id}\`\n   📍 <#${s.channelId}> | 📅 ${date.toLocaleDateString()} ${date.toLocaleTimeString()}\n   📝 ${s.embed.title}`;
          })
          .join("\n\n")
      )
      .setFooter({ text: `Total: ${schedules.length} scheduled message(s)` });

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
