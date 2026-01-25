import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from "discord.js";
import fs from "fs";
import path from "path";

const configPath = path.join(process.cwd(), "data", "guide_config.json");

export default {
  data: new SlashCommandBuilder()
    .setName("guidemsg")
    .setDescription("Set the guide message (Admin only)")
    .addStringOption(o => o.setName("title").setDescription("Guide title").setRequired(true))
    .addStringOption(o => o.setName("message").setDescription("Guide content").setRequired(true))
    .addStringOption(o => o.setName("color").setDescription("Hex color (e.g. #3498DB)").setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async run(client, interaction) {
    const title = interaction.options.getString("title");
    const message = interaction.options.getString("message").replace(/\\n/g, "\n");
    const color = interaction.options.getString("color") || "#3498DB";
    const guildId = interaction.guildId;

    let allConfigs = {};
    if (fs.existsSync(configPath)) {
      try {
        allConfigs = JSON.parse(fs.readFileSync(configPath, "utf8"));
      } catch (e) {}
    }

    allConfigs[guildId] = { title, message, color };
    
    if (!fs.existsSync(path.dirname(configPath))) {
      fs.mkdirSync(path.dirname(configPath), { recursive: true });
    }
    
    fs.writeFileSync(configPath, JSON.stringify(allConfigs, null, 2));

    return interaction.reply({ content: "Guide message has been set successfully for this server!", ephemeral: true });
  }
};
