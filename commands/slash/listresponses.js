import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from "discord.js";
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

export default {
  data: new SlashCommandBuilder()
    .setName("listresponses")
    .setDescription("List all auto-responses")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async run(client, interaction) {
    const data = loadResponses();
    const responses = Object.entries(data.autoResponses);

    if (responses.length === 0) {
      return interaction.reply({
        content: "No auto-responses have been set up yet. Use `/respond` to add one!",
        ephemeral: true
      });
    }

    const embed = new EmbedBuilder()
      .setTitle("Auto-Responses")
      .setColor(0x5865F2)
      .setDescription(
        responses
          .map(([trigger, info], index) => 
            `**${index + 1}.** \`${trigger}\` → ${info.reply.substring(0, 100)}${info.reply.length > 100 ? '...' : ''}`
          )
          .join("\n")
      )
      .setFooter({ text: `Total: ${responses.length} auto-response(s)` });

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
