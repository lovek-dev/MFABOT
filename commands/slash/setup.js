import {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionsBitField
} from "discord.js";
import fs from "node:fs";
import path from "node:path";

export default {
  data: new SlashCommandBuilder()
    .setName("setup")
    .setDescription("Create welcome panel with rules and role buttons"),

  run: async (client, interaction) => {
    const configPath = path.join(process.cwd(), "config.json");
    const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

    const isOwner = interaction.user.id === config.ownerId;
    // member.permissions can be a PermissionsBitField or a string, let's use the field directly
    const isAdmin = interaction.memberPermissions && interaction.memberPermissions.has(PermissionsBitField.Flags.Administrator);
    const hasAllowedRole = config.allowedRoleId && 
                           config.allowedRoleId !== "ROLE_ALLOWED" && 
                           interaction.member.roles.cache.has(config.allowedRoleId);

    if (!isOwner && !isAdmin && !hasAllowedRole) {
      return interaction.reply({ content: "❌ You need Administrator permissions to use this command.", ephemeral: true });
    }

    const welcomeEmbed = new EmbedBuilder()
      .setTitle("🎉 Welcome to THE MFA 🎉")
      .setDescription(config.welcomeMessage || "Welcome to the server!")
      .setImage(config.welcomeImage || null)
      .setColor("#ff0000");

    const rulesButton = new ButtonBuilder()
      .setCustomId("show_rules")
      .setLabel("📘 View Rules")
      .setStyle(ButtonStyle.Primary);

    const ignButton = new ButtonBuilder()
      .setCustomId("set_ign")
      .setLabel("🎮 Set IGN")
      .setStyle(ButtonStyle.Success);

    const row = new ActionRowBuilder().addComponents(
      rulesButton,
      ignButton
    );

    await interaction.reply({
      content: "Setup complete. Welcome panel created!",
      ephemeral: true
    });

    await interaction.channel.send({
      embeds: [welcomeEmbed],
      components: [row]
    });
  }
};
