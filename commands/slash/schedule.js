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

function saveSchedules(data) {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

export default {
  data: new SlashCommandBuilder()
    .setName("schedule")
    .setDescription("Schedule an embed message to be sent at a specific date and time")
    .addChannelOption(option =>
      option
        .setName("channel")
        .setDescription("The channel to send the message in")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("date")
        .setDescription("Date in format: YYYY-MM-DD (e.g., 2024-12-25)")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("time")
        .setDescription("Time in 24h format: HH:MM (e.g., 14:30)")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("title")
        .setDescription("Embed title")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("description")
        .setDescription("Embed description/message")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("color")
        .setDescription("Embed color (hex code like #FF5733 or name like red, blue, green)")
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async run(client, interaction) {
    const channel = interaction.options.getChannel("channel");
    const dateStr = interaction.options.getString("date");
    const timeStr = interaction.options.getString("time");
    const title = interaction.options.getString("title");
    const description = interaction.options.getString("description");
    const colorInput = interaction.options.getString("color") || "#5865F2";

    const dateTimeStr = `${dateStr}T${timeStr}:00`;
    const scheduledDate = new Date(dateTimeStr);

    if (isNaN(scheduledDate.getTime())) {
      return interaction.reply({
        content: "Invalid date or time format! Use YYYY-MM-DD for date and HH:MM for time.",
        ephemeral: true
      });
    }

    if (scheduledDate <= new Date()) {
      return interaction.reply({
        content: "The scheduled time must be in the future!",
        ephemeral: true
      });
    }

    let color = 0x5865F2;
    const colorMap = {
      red: 0xFF0000,
      green: 0x00FF00,
      blue: 0x0000FF,
      yellow: 0xFFFF00,
      purple: 0x800080,
      orange: 0xFFA500,
      pink: 0xFFC0CB,
      cyan: 0x00FFFF,
      white: 0xFFFFFF,
      black: 0x000000
    };

    if (colorInput.startsWith("#")) {
      color = parseInt(colorInput.replace("#", ""), 16);
    } else if (colorMap[colorInput.toLowerCase()]) {
      color = colorMap[colorInput.toLowerCase()];
    }

    const scheduleData = {
      id: Date.now().toString(),
      channelId: channel.id,
      guildId: interaction.guild.id,
      scheduledTime: scheduledDate.toISOString(),
      embed: {
        title,
        description,
        color
      },
      createdBy: interaction.user.id,
      createdAt: new Date().toISOString()
    };

    const data = loadSchedules();
    data.scheduledMessages.push(scheduleData);
    saveSchedules(data);

    const previewEmbed = new EmbedBuilder()
      .setTitle(title)
      .setDescription(description)
      .setColor(color)
      .setFooter({ text: "Preview of scheduled message" });

    const confirmEmbed = new EmbedBuilder()
      .setTitle("Message Scheduled!")
      .setColor(0x00FF00)
      .addFields(
        { name: "Channel", value: `<#${channel.id}>`, inline: true },
        { name: "Date", value: dateStr, inline: true },
        { name: "Time", value: timeStr, inline: true }
      )
      .setFooter({ text: `ID: ${scheduleData.id}` });

    await interaction.reply({
      content: "Your message has been scheduled!",
      embeds: [confirmEmbed, previewEmbed],
      ephemeral: true
    });
  }
};
