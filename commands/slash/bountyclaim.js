import { SlashCommandBuilder } from "discord.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const bountiesPath = path.join(__dirname, "../../data/bounties.json");

function loadBounties() {
  const data = fs.readFileSync(bountiesPath, "utf8");
  return JSON.parse(data);
}

function saveBounties(data) {
  fs.writeFileSync(bountiesPath, JSON.stringify(data, null, 2));
}

export default {
  data: new SlashCommandBuilder()
    .setName("bountyclaim")
    .setDescription("Claim a bounty (creator only)")
    .addStringOption(o =>
      o.setName("ign")
        .setDescription("In-game name of the person who completed the bounty")
        .setRequired(true)
    )
    .addStringOption(o =>
      o.setName("claimer")
        .setDescription("Discord username or ID of who claimed it")
        .setRequired(true)
    ),

  async run(client, interaction) {
    const ign = interaction.options.getString("ign");
    const claimer = interaction.options.getString("claimer");

    const bounties = loadBounties();
    
    // Find the bounty
    const bounty = bounties.bounties.find(b => b.ign.toLowerCase() === ign.toLowerCase());
    
    if (!bounty) {
      return interaction.reply({
        content: `❌ No bounty found for **${ign}**!`,
        ephemeral: true
      });
    }

    // Check if user is the creator
    if (bounty.creatorId !== interaction.user.id) {
      return interaction.reply({
        content: `❌ Only <@${bounty.creatorId}> (the bounty creator) can claim this bounty!`,
        ephemeral: true
      });
    }

    const amount = bounty.totalAmount;

    // Remove the bounty
    bounties.bounties = bounties.bounties.filter(b => b.id !== bounty.id);
    saveBounties(bounties);

    interaction.reply({
      content: `✅ Bounty claimed! **${claimer}** receives **$${amount}** for completing the bounty on **${ign}**!`
    });
  }
};
