import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from "discord.js";
import fs from "fs";
import path from "path";

export default {
  data: new SlashCommandBuilder()
    .setName("promote")
    .setDescription("Promote a user to a new role")
    .addUserOption(o => 
      o.setName("user")
        .setDescription("The user to promote")
        .setRequired(true)
    )
    .addRoleOption(o => 
      o.setName("role")
        .setDescription("The new role to give")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async run(client, interaction) {
    const targetUser = interaction.options.getUser("user");
    const targetRole = interaction.options.getRole("role");
    const member = await interaction.guild.members.fetch(targetUser.id);

    try {
      await member.roles.add(targetRole);
      
      const embed = new EmbedBuilder()
        .setColor(0x00FF00)
        .setDescription(`${targetUser} has been promoted to ${targetRole}\nCongratulations 🎊 and Keep this going`)
        .setTimestamp();

      // Save Log
      const promoData = {
        timestamp: new Date().toISOString(),
        targetUserId: targetUser.id,
        roleId: targetRole.id,
        promotedBy: interaction.user.id
      };
      
      const promoPath = path.join(process.cwd(), "data", "promotions.json");
      let promos = [];
      try {
        if (fs.existsSync(promoPath)) {
          promos = JSON.parse(fs.readFileSync(promoPath, "utf-8"));
        }
      } catch (e) {}
      promos.push(promoData);
      fs.writeFileSync(promoPath, JSON.stringify(promos, null, 2));

      return interaction.reply({ content: `${targetUser} ${targetRole}`, embeds: [embed] });
    } catch (error) {
      console.error(error);
      return interaction.reply({ content: "Failed to promote user. Make sure my role is higher than the role you're trying to give.", ephemeral: true });
    }
  }
};
