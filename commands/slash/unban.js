import { SlashCommandBuilder, PermissionsBitField } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("unban")
    .setDescription("Unban user ID")
    .addStringOption(o => o.setName("id").setDescription("User ID").setRequired(true)),

  async run(client, interaction) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      return interaction.reply({ content: "❌ You lack permissions to unban members.", ephemeral: true });
    }

    try {
      await interaction.guild.members.unban(interaction.options.getString("id"));
      interaction.reply("✅ User unbanned.");
    } catch (e) {
      interaction.reply({ content: "❌ Could not unban that user. Make sure the ID is correct.", ephemeral: true });
    }
  }
};
