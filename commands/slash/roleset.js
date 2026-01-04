import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const configPath = path.join(__dirname, "../../config.json");

function loadConfig() {
  const data = fs.readFileSync(configPath, "utf8");
  return JSON.parse(data);
}

function saveConfig(data) {
  fs.writeFileSync(configPath, JSON.stringify(data, null, 2));
}

export default {
  data: new SlashCommandBuilder()
    .setName("roleset")
    .setDescription("Configure roles given by bot actions (Admin only)")
    .addRoleOption(o =>
      o.setName("role")
        .setDescription("The role to assign")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async run(client, interaction) {
    const role = interaction.options.getRole("role");

    const embed = new EmbedBuilder()
      .setTitle("🎯 Which action gives this role?")
      .setColor("Blue")
      .setDescription(`Role: ${role}`);

    const ignButton = new ButtonBuilder()
      .setCustomId(`set_role_ign_${role.id}`)
      .setLabel("🎮 Set IGN Button")
      .setStyle(ButtonStyle.Primary);

    const rulesButton = new ButtonBuilder()
      .setCustomId(`set_role_rules_${role.id}`)
      .setLabel("✅ Accept Rules Button")
      .setStyle(ButtonStyle.Success);

    const row = new ActionRowBuilder().addComponents(ignButton, rulesButton);

    interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
  }
};
