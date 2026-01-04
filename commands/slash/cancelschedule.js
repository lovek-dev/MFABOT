import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
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

function saveSchedules(data) {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

export default {
  data: new SlashCommandBuilder()
    .setName("cancelschedule")
    .setDescription("Cancel a scheduled message")
    .addStringOption(option =>
      option
        .setName("id")
        .setDescription("The ID of the scheduled message to cancel (use /listschedules to find IDs)")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async run(client, interaction) {
    const id = interaction.options.getString("id");

    const data = loadSchedules();
    const index = data.scheduledMessages.findIndex(s => s.id === id && s.guildId === interaction.guild.id);

    if (index === -1) {
      return interaction.reply({
        content: `No scheduled message found with ID \`${id}\`. Use \`/listschedules\` to see all scheduled messages.`,
        ephemeral: true
      });
    }

    const removed = data.scheduledMessages.splice(index, 1)[0];
    saveSchedules(data);

    await interaction.reply({
      content: `Scheduled message "${removed.embed.title}" has been cancelled!`,
      ephemeral: true
    });
  }
};
