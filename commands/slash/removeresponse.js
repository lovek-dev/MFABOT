import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import fs from "fs";

const dataPath = "./data/responses.json";

function loadResponses() {
  try {
    const data = fs.readFileSync(dataPath, "utf8");
    return JSON.parse(data);
  } catch {
    return { autoResponses: {} };
  }
}

function saveResponses(data) {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

export default {
  data: new SlashCommandBuilder()
    .setName("removeresponse")
    .setDescription("Remove an auto-response")
    .addStringOption(option =>
      option
        .setName("trigger")
        .setDescription("The trigger word to remove")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async run(client, interaction) {
    const trigger = interaction.options.getString("trigger").toLowerCase();

    const data = loadResponses();
    
    if (!data.autoResponses[trigger]) {
      return interaction.reply({
        content: `No auto-response found for "**${trigger}**". Use \`/listresponses\` to see all triggers.`,
        ephemeral: true
      });
    }

    delete data.autoResponses[trigger];
    saveResponses(data);

    await interaction.reply({
      content: `Auto-response for "**${trigger}**" has been removed!`,
      ephemeral: true
    });
  }
};
