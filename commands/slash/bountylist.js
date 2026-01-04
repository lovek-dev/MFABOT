import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const bountiesPath = path.join(__dirname, "../../data/bounties.json");

function loadBounties() {
  const data = fs.readFileSync(bountiesPath, "utf8");
  return JSON.parse(data);
}

export default {
  data: new SlashCommandBuilder()
    .setName("bountylist")
    .setDescription("Show all active bounties"),

  async run(client, interaction) {
    const bounties = loadBounties();

    if (bounties.bounties.length === 0) {
      return interaction.reply({
        content: "❌ No active bounties!",
        ephemeral: true
      });
    }

    const embed = new EmbedBuilder()
      .setTitle("🎯 Active Bounties")
      .setColor("Gold")
      .setTimestamp();

    bounties.bounties.forEach((bounty, index) => {
      const contributorsList = bounty.contributors
        .map(c => `<@${c.userId}> ($${c.amount})`)
        .join("\n");

      embed.addFields({
        name: `${index + 1}. ${bounty.ign} - $${bounty.totalAmount}`,
        value: `**Contributors:**\n${contributorsList}`,
        inline: false
      });
    });

    interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
