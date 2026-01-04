import { SlashCommandBuilder } from "discord.js";
import { updateAllowedRole } from "../../utils/permissions.js";
import config from "../../config.json" with { type: "json" };

export default {
  data: new SlashCommandBuilder()
    .setName("setrole")
    .setDescription("Set the role that can use this bot")
    .addRoleOption(o => o.setName("role").setDescription("Role").setRequired(true)),

  async run(client, interaction) {
    if (interaction.user.id !== config.ownerId)
      return interaction.reply({ content: "❌ Only owner can use this.", ephemeral: true });

    const role = interaction.options.getRole("role");
    updateAllowedRole(role.id);
    interaction.reply(`✅ Allowed role updated to: **${role.name}**`);
  }
};
