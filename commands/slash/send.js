import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import { hasBotAccess } from "../../utils/permissions.js";

export default {
  data: new SlashCommandBuilder()
    .setName("send")
    .setDescription("Send text or embed")
    .addStringOption(o => o.setName("title").setDescription("Embed title"))
    .addStringOption(o => o.setName("description").setDescription("Embed description"))
    .addStringOption(o => o.setName("color").setDescription("Embed hex color (e.g. #FF5733)"))
    .addStringOption(o => o.setName("text").setDescription("Normal text")),

  async run(client, interaction) {
    if (!hasBotAccess(interaction.member))
      return interaction.reply({ content: "❌ Not allowed.", ephemeral: true });

    const title = interaction.options.getString("title");
    const desc = interaction.options.getString("description");
    const color = interaction.options.getString("color") || "#3498DB";
    const text = interaction.options.getString("text");

    if (text) return interaction.reply(text);

    const embed = new EmbedBuilder().setColor(color.startsWith("#") ? color : `#${color}`);
    if (title) embed.setTitle(title);
    if (desc) embed.setDescription(desc);

    interaction.reply({ embeds: [embed] });
  }
};
