import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import fs from "fs";
import path from "path";

const configPath = path.join(process.cwd(), "data", "guide_config.json");

export default {
  data: new SlashCommandBuilder()
    .setName("guide")
    .setDescription("View the server guide"),

  async run(client, interaction) {
    if (!fs.existsSync(configPath)) {
      return interaction.reply({ content: "The guide hasn't been set up yet by an administrator.", ephemeral: true });
    }

    const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));

    const embed = new EmbedBuilder()
      .setTitle(config.title)
      .setDescription(config.message)
      .setColor(config.color || "#3498DB")
      .setTimestamp();

    return interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
