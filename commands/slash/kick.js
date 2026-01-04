import { SlashCommandBuilder, PermissionsBitField } from "discord.js";
import config from "../../config.json" with { type: "json" };

export default {
  data: new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Kick a user")
    .addUserOption(o => o.setName("user").setDescription("User").setRequired(true)),

  async run(client, interaction) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
      return interaction.reply({ content: "❌ You lack permissions to kick members.", ephemeral: true });
    }

    const user = interaction.options.getMember("user");
    if (!user) {
      return interaction.reply({ content: "❌ Could not find that member.", ephemeral: true });
    }

    if (user.id === config.ownerId) {
      return interaction.reply({ content: "❌ You cannot kick the bot owner.", ephemeral: true });
    }

    try {
      await user.kick();
      interaction.reply(`✅ Kicked ${user.user.tag}`);
    } catch (e) {
      interaction.reply({ content: "❌ Could not kick that user. They may have higher permissions.", ephemeral: true });
    }
  }
};
