import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from "discord.js";
import fs from "fs";
import path from "path";

const configPath = path.join(process.cwd(), "data", "embed_templates.json");

export default {
  data: new SlashCommandBuilder()
    .setName("embed")
    .setDescription("Post a saved 3-column embed template")
    .addStringOption(o => o.setName("template").setDescription("The name of the template to post").setRequired(true).setAutocomplete(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async run(client, interaction) {
    if (!fs.existsSync(configPath)) {
      return interaction.reply({ content: "❌ No templates found. Create one with `/embededit` first!", ephemeral: true });
    }

    const templates = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    const templateName = interaction.options.getString("template");
    const config = templates[templateName];

    if (!config) {
      return interaction.reply({ content: `❌ Template "**${templateName}**" not found.`, ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setTitle(config.title)
      .setColor(0x5865F2)
      .addFields(
        { name: config.col1_title, value: config.col1_value, inline: true },
        { name: config.col2_title, value: config.col2_value, inline: true },
        { name: config.col3_title, value: config.col3_value, inline: true }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },

  async autocomplete(interaction) {
    if (!fs.existsSync(configPath)) return interaction.respond([]);
    const templates = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    const choices = Object.keys(templates);
    const focusedValue = interaction.options.getFocused();
    const filtered = choices.filter(choice => choice.toLowerCase().includes(focusedValue.toLowerCase())).slice(0, 25);
    await interaction.respond(filtered.map(choice => ({ name: choice, value: choice })));
  }
};
