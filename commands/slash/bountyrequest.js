import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import fs from "fs";
import path from "path";

export default {
  data: new SlashCommandBuilder()
    .setName("bountyrequest")
    .setDescription("Request a bounty on someone")
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
    )
    .addStringOption(o =>
      o.setName("items")
        .setDescription("Optional items to include in the bounty")
        .setRequired(false)
    ),

  async run(client, interaction) {
    const ign = interaction.options.getString("ign");
    const amount = interaction.options.getNumber("amount");
    const items = interaction.options.getString("items") || "None";

    const configPath = path.join(process.cwd(), "config.json");
    const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    
    if (!config.requestChannelId) {
      return interaction.reply({
        content: "❌ Request channel is not set up. Please ask an admin to use `/requestchannel`.",
        ephemeral: true
      });
    }

    try {
      const channel = await client.channels.fetch(config.requestChannelId);
      if (channel) {
        const row = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId(`approve_bounty_${ign}_${amount}_${interaction.user.id}_${items.replace(/_/g, " ")}`)
              .setLabel("Accept")
              .setEmoji("✅")
              .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
              .setCustomId(`deny_bounty_${interaction.user.id}`)
              .setLabel("Deny")
              .setEmoji("❌")
              .setStyle(ButtonStyle.Danger)
          );

        await channel.send({
          content: `🔔 **New Bounty Request**\nFrom: <@${interaction.user.id}>`,
          embeds: [{
            title: "Bounty Request",
            description: `**Target IGN:** ${ign}\n**Amount:** $${amount}\n**Items:** ${items}`,
            color: 0xFFAA00,
            timestamp: new Date().toISOString()
          }],
          components: [row]
        });
      }
    } catch (e) {
      console.error("Failed to send bounty request:", e.message);
      return interaction.reply({
        content: "❌ Failed to send request to the admin channel.",
        ephemeral: true
      });
    }

    interaction.reply({
      content: `✅ Bounty request for **${ign}** sent for approval!`,
      ephemeral: true
    });
  }
};
