import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import fs from "fs";
import path from "path";
import teamchannel from "./teamchannel.js";

const teamPath = path.join(process.cwd(), "data", "team_list.json");

const loadData = (filePath, defaultVal = []) => {
  if (!fs.existsSync(filePath)) return defaultVal;
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
};

const saveData = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

export default {
  data: new SlashCommandBuilder()
    .setName("teamadd")
    .setDescription("Add a player's IGN to the team list")
    .addStringOption(o => o.setName("ign").setDescription("The player's In-Game Name").setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async run(client, interaction) {
    const ign = interaction.options.getString("ign");
    let team = loadData(teamPath, []);
    
    if (team.includes(ign)) {
      return interaction.reply({ content: `❌ **${ign}** is already in the list.`, ephemeral: true });
    }

    team.push(ign);
    saveData(teamPath, team);
    
    await interaction.reply({ content: `✅ Added **${ign}** to the team.`, ephemeral: true });
    await teamchannel.updateTeamMessage(client, interaction.guild, `➕ Added: ${ign}`);
  }
};
