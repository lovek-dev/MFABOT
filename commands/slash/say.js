import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("say")
    .setDescription("Send an embed message as the bot")
    .addStringOption(o => 
      o.setName("message")
        .setDescription("The message to send in the embed")
        .setRequired(true)
    )
    .addStringOption(o => 
      o.setName("title")
        .setDescription("The title of the embed")
        .setRequired(false)
    )
    .addStringOption(o => 
      o.setName("color")
        .setDescription("The hex color of the embed (e.g. #00FF00)")
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async run(client, interaction) {
    const messageContent = interaction.options.getString("message").replace(/\\n/g, "\n");
    const title = interaction.options.getString("title");
    const colorInput = interaction.options.getString("color") || "#3498DB";

    const embed = new EmbedBuilder()
      .setDescription(messageContent)
      .setColor(colorInput.startsWith("#") ? colorInput : `#${colorInput}`)
      .setTimestamp();

    if (title) embed.setTitle(title);

    await interaction.channel.send({ embeds: [embed] });
    return interaction.reply({ content: "✅ Embed sent!", ephemeral: true });
  }
};
