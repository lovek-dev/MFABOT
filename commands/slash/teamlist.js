import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import fs from "fs";
import path from "path";

const teamPath = path.join(process.cwd(), "data", "team_list.json");

export default {
  data: new SlashCommandBuilder()
    .setName("teamlist")
    .setDescription("View the current team members"),
  async run(client, interaction) {
    if (!fs.existsSync(teamPath)) {
      return interaction.reply({ content: "The team list is currently empty.", ephemeral: true });
    }

    const team = JSON.parse(fs.readFileSync(teamPath, "utf-8"));
    
    if (team.length === 0) {
      return interaction.reply({ content: "The team list is currently empty.", ephemeral: true });
    }

    const sortedTeam = team.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));

    const embed = new EmbedBuilder()
      .setTitle("🛡️ Team Member List")
      .setDescription(sortedTeam.map((name, i) => `${i + 1}. **${name}**`).join("\n"))
      .setColor(0x00AE86)
      .setTimestamp();

    return interaction.reply({ embeds: [embed] });
  }
};
