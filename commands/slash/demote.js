import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("demote")
    .setDescription("Demote a user (Admin only)")
    .addUserOption(o => o.setName("user").setDescription("The user to demote").setRequired(true))
    .addStringOption(o => o.setName("from").setDescription("Current rank").setRequired(true))
    .addStringOption(o => o.setName("to").setDescription("New rank").setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async run(client, interaction) {
    const user = interaction.options.getUser("user");
    const fromRank = interaction.options.getString("from");
    const toRank = interaction.options.getString("to");
    const staff = interaction.user;

    const embed = new EmbedBuilder()
      .setTitle("📉 Demotion")
      .addFields(
        { name: "User", value: `<@${user.id}>\nID: \`${user.id}\``, inline: false },
        { name: "From", value: fromRank, inline: true },
        { name: "To", value: toRank, inline: true },
        { name: "Staff", value: `<@${staff.id}>\nID: \`${staff.id}\``, inline: false }
      )
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .setColor("Red")
      .setFooter({ text: `${staff.tag}`, iconURL: staff.displayAvatarURL() })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};