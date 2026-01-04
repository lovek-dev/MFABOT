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
    .setName("respond")
    .setDescription("Set up an auto-response for a trigger word")
    .addStringOption(option =>
      option
        .setName("trigger")
        .setDescription("The word or phrase that triggers the response")
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName("reply")
        .setDescription("The response message to send")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async run(client, interaction) {
    const trigger = interaction.options.getString("trigger").toLowerCase();
    const reply = interaction.options.getString("reply");

    const data = loadResponses();
    data.autoResponses[trigger] = {
      reply: reply,
      addedBy: interaction.user.id,
      addedAt: new Date().toISOString()
    };
    saveResponses(data);

    await interaction.reply({
      content: `Auto-response set! When someone says "**${trigger}**", I'll reply with:\n${reply}`,
      ephemeral: true
    });
  }
};
