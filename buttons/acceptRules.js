import config from "../config.json" with { type: "json" };

export default {
  customId: "accept_rules",

  run: async (client, interaction) => {
    const role = interaction.guild.roles.cache.get(config.verifyRoleId);
    if (!role) {
      return interaction.reply({
        content: "❌ Verification role not configured. Please contact an admin.",
        ephemeral: true
      });
    }
    
    await interaction.member.roles.add(role).catch(() => {});
    interaction.reply({
      content: `✅ You have accepted the rules and received the **${role.name}** role!`,
      ephemeral: true
    });
  }
};
