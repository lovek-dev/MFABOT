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
    .setName("bountyadd")
    .setDescription("Add to an existing bounty")
    .addStringOption(o =>
      o.setName("ign")
        .setDescription("In-game name of the target")
        .setRequired(true)
    )
    .addNumberOption(o =>
      o.setName("amount")
        .setDescription("Amount to add")
        .setRequired(true)
        .setMinValue(1)
    ),

  async run(client, interaction) {
    const ign = interaction.options.getString("ign");
    const amount = interaction.options.getNumber("amount");

    const bounties = loadBounties();
    
    // Find the bounty
    const bounty = bounties.bounties.find(b => b.ign.toLowerCase() === ign.toLowerCase());
    
    if (!bounty) {
      return interaction.reply({
        content: `❌ No bounty found for **${ign}**! Use \`/bounty\` to create one.`,
        ephemeral: true
      });
    }

    // Check if user already contributed
    const existingContributor = bounty.contributors.find(c => c.userId === interaction.user.id);
    
    if (existingContributor) {
      existingContributor.amount += amount;
    } else {
      bounty.contributors.push({
        userId: interaction.user.id,
        username: interaction.user.username,
        amount: amount
      });
    }

    bounty.totalAmount += amount;
    saveBounties(bounties);

    const configPath = path.join(process.cwd(), "config.json");
    const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    
    if (config.bountyChannelId) {
      try {
        const channel = await client.channels.fetch(config.bountyChannelId);
        if (channel) {
          // Delete old message if exists
          if (bounty.messageId) {
            try {
              const oldMsg = await channel.messages.fetch(bounty.messageId);
              if (oldMsg) await oldMsg.delete();
            } catch (e) {
              console.error("Failed to delete old bounty message:", e.message);
            }
          }

          const contributorsList = bounty.contributors
            .map(c => `<@${c.userId}> ($${c.amount})`)
            .join("\n");

          const sentMsg = await channel.send({
            embeds: [{
              title: "🚨 **BOUNTY** 🚨",
              description: `**IGN :** ${bounty.ign}\n**Price :** $${bounty.totalAmount}\n**Contributors :**\n${contributorsList}\n\n**Contributors have to pay the hunter after he shows the proof individually**`,
              color: 0xFF0000,
              timestamp: new Date().toISOString()
            }]
          });
          bounty.messageId = sentMsg.id;
          saveBounties(bounties);
        }
      } catch (e) {
        console.error("Failed to update bounty post:", e.message);
      }
    }

    interaction.reply({
      content: `✅ Added **$${amount}** to **${ign}**'s bounty! Total is now **$${bounty.totalAmount}**`,
      ephemeral: true
    });
  }
};
