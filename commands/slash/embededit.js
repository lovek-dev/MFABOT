import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from "discord.js";
import fs from "fs";
import path from "path";

const configPath = path.join(process.cwd(), "data", "embed_templates.json");

export default {
  data: new SlashCommandBuilder()
    .setName("embededit")
    .setDescription("Save a new 3-column embed template")
    .addStringOption(o => o.setName("name").setDescription("Unique name for this template").setRequired(true))
    .addStringOption(o => o.setName("title").setDescription("Title for the embed").setRequired(true))
    .addStringOption(o => o.setName("col1_title").setDescription("Title for Column 1").setRequired(true))
    .addStringOption(o => o.setName("col1_value").setDescription("Value for Column 1 (use \\n for new lines)").setRequired(true))
    .addStringOption(o => o.setName("col2_title").setDescription("Title for Column 2").setRequired(true))
    .addStringOption(o => o.setName("col2_value").setDescription("Value for Column 2 (use \\n for new lines)").setRequired(true))
    .addStringOption(o => o.setName("col3_title").setDescription("Title for Column 3").setRequired(true))
    .addStringOption(o => o.setName("col3_value").setDescription("Value for Column 3 (use \\n for new lines)").setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async run(client, interaction) {
    if (!fs.existsSync(path.dirname(configPath))) {
      fs.mkdirSync(path.dirname(configPath), { recursive: true });
    }

    let templates = {};
    if (fs.existsSync(configPath)) {
      templates = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    }

    const name = interaction.options.getString("name");
    const title = interaction.options.getString("title");
    const c1t = interaction.options.getString("col1_title");
    const c1v = interaction.options.getString("col1_value");
    const c2t = interaction.options.getString("col2_title");
    const c2v = interaction.options.getString("col2_value");
    const c3t = interaction.options.getString("col3_title");
    const c3v = interaction.options.getString("col3_value");

    templates[name] = {
      title,
      col1_title: c1t,
      col1_value: c1v.replace(/\\n/g, "\n"),
      col2_title: c2t,
      col2_value: c2v.replace(/\\n/g, "\n"),
      col3_title: c3t,
      col3_value: c3v.replace(/\\n/g, "\n")
    };

    fs.writeFileSync(configPath, JSON.stringify(templates, null, 2));

    await interaction.reply({ content: `✅ Saved embed template: **${name}**. Use \`/embed\` to post it!`, ephemeral: true });
  }
};
