import { SlashCommandBuilder, EmbedBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("discordstamp")
    .setDescription("Create a dynamic Discord timestamp")
    .addStringOption(o => o.setName("date").setDescription("Date (YYYY-MM-DD)").setRequired(true))
    .addStringOption(o => o.setName("time").setDescription("Time (HH:MM in 24h format)").setRequired(true))
    .addStringOption(o => o.setName("timezone").setDescription("Timezone offset (e.g., +05:30, -08:00)").setRequired(true))
    .addStringOption(o => o.setName("format").setDescription("Stamp format").addChoices(
        { name: "Relative Time (X minutes ago / in X minutes)", value: "R" },
        { name: "Long Date/Time", value: "F" },
        { name: "Short Date/Time", value: "f" },
        { name: "Long Date", value: "D" },
        { name: "Short Date", value: "d" },
        { name: "Long Time", value: "T" },
        { name: "Short Time", value: "t" }
    ).setRequired(false)),

  async run(client, interaction) {
    const dateStr = interaction.options.getString("date");
    const timeStr = interaction.options.getString("time");
    const tzStr = interaction.options.getString("timezone");
    const format = interaction.options.getString("format") || "R";

    // Validate date/time format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr) || !/^\d{2}:\d{2}$/.test(timeStr)) {
        return interaction.reply({ content: "❌ Invalid date or time format. Use `YYYY-MM-DD` and `HH:MM`.", ephemeral: true });
    }

    // Parse timezone offset
    const tzMatch = tzStr.match(/^([+-])(\d{2}):(\d{2})$/);
    if (!tzMatch) {
        return interaction.reply({ content: "❌ Invalid timezone format. Use `+HH:MM` or `-HH:MM` (e.g., `+05:30`).", ephemeral: true });
    }

    const sign = tzMatch[1] === "+" ? 1 : -1;
    const hours = parseInt(tzMatch[2]);
    const minutes = parseInt(tzMatch[3]);
    const offsetMs = sign * (hours * 60 + minutes) * 60000;

    // Create UTC date object
    // new Date("YYYY-MM-DDTHH:MMZ") creates a UTC date
    // We then adjust it by the inverse of the provided offset to get the real UTC time
    const localDateTimeStr = `${dateStr}T${timeStr}:00Z`;
    const date = new Date(localDateTimeStr);
    
    if (isNaN(date.getTime())) {
        return interaction.reply({ content: "❌ Invalid date or time provided.", ephemeral: true });
    }

    // Adjust for provided timezone offset to get Unix timestamp
    const unixTimestamp = Math.floor((date.getTime() - offsetMs) / 1000);
    const stamp = `<t:${unixTimestamp}:${format}>`;

    const embed = new EmbedBuilder()
        .setTitle("🕒 Discord Timestamp")
        .setDescription(`Copy and paste this code:\n\`${stamp}\`\n\n**Preview:**\n${stamp}`)
        .setColor("Blue")
        .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};