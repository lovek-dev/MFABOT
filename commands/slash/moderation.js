import { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } from "discord.js";
import { hasBotAccess } from "../../utils/permissions.js";
import { logAction } from "../../utils/logger.js";
import config from "../../config.json" with { type: "json" };

export default {
  data: new SlashCommandBuilder()
    .setName("mod")
    .setDescription("Moderation kick command")
    .addUserOption(o => o.setName("user").setDescription("User").setRequired(true)),

  async run(client, interaction) {
    if (!hasBotAccess(interaction.member))
      return interaction.reply({ content: "❌ Not allowed.", ephemeral: true });

    if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers))
      return interaction.reply({ content: "❌ No permission.", ephemeral: true });

    const user = interaction.options.getMember("user");
    
    if (user.id === config.ownerId) {
      return interaction.reply({ content: "❌ You cannot moderate the bot owner.", ephemeral: true });
    }

    await user.kick();
    const embed = new EmbedBuilder().setTitle("User Kicked").setDescription(`${user} kicked by ${interaction.user}`).setColor("Red");
    await logAction(interaction.guild, embed);
    interaction.reply("✅ User kicked.");
  }
};
