import config from "../config.json" with { type: "json" };

export default {
  customId: "claim_roles",
  async run(client, interaction) {
    if (!config.claimRoles || config.claimRoles.length === 0) {
      return interaction.reply({ content: "🧩 No roles configured to claim yet!", ephemeral: true });
    }
    
    for (const role of config.claimRoles) {
      await interaction.member.roles.add(role.id).catch(() => {});
    }

    interaction.reply({ content: "🎉 Roles claimed!", ephemeral: true });
  }
};
