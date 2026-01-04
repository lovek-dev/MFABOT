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
    .setName("bounty")
    .setDescription("Create a bounty on someone")
    .addStringOption(o => 
      o.setName("ign")
        .setDescription("In-game name of the target")
        .setRequired(true)
    )
    .addNumberOption(o =>
      o.setName("amount")
        .setDescription("Bounty amount")
        .setRequired(true)
        .setMinValue(1)
    ),

  async run(client, interaction) {
    const ign = interaction.options.getString("ign");
    const amount = interaction.options.getNumber("amount");

    const bounties = loadBounties();
    
    // Check if bounty already exists
    const existingBounty = bounties.bounties.find(b => b.ign.toLowerCase() === ign.toLowerCase());
    
    if (existingBounty) {
      return interaction.reply({
        content: `❌ Bounty for **${ign}** already exists! Use \`/bountyadd\` to add to it.`,
        ephemeral: true
      });
    }

    // Create new bounty
    const newBounty = {
      id: Date.now().toString(),
      ign: ign,
      totalAmount: amount,
      contributors: [
        {
          userId: interaction.user.id,
          username: interaction.user.username,
          amount: amount
        }
      ],
      creatorId: interaction.user.id,
      createdAt: new Date().toISOString()
    };

    bounties.bounties.push(newBounty);
    saveBounties(bounties);

    const configPath = path.join(process.cwd(), "config.json");
    const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    
    if (config.bountyChannelId) {
      try {
        const channel = await client.channels.fetch(config.bountyChannelId);
        if (channel) {
          const contributorsList = newBounty.contributors
            .map(c => `<@${c.userId}> ($${c.amount})`)
            .join("\n");

          const sentMsg = await channel.send({
            embeds: [{
              title: "🚨 **BOUNTY** 🚨",
              description: `**IGN :** ${ign}\n**Price :** $${amount}\n**Contributors :**\n${contributorsList}\n\n**Contributors have to pay the hunter after he shows the proof individually**`,
              color: 0xFF0000,
              timestamp: new Date().toISOString()
            }]
          });
          newBounty.messageId = sentMsg.id;
          saveBounties(bounties);
        }
      } catch (e) {
        console.error("Failed to post bounty to channel:", e.message);
      }
    }

    interaction.reply({
      content: `✅ Bounty created for **${ign}** with **$${amount}**!`,
      ephemeral: true
    });
  }
};
