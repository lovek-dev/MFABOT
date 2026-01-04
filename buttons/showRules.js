import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import config from "../config.json" with { type: "json" };

export default {
  customId: "show_rules",

  run: async (client, interaction) => {
    const rulesEmbed = new EmbedBuilder()
      .setTitle("📘 Clan Rules")
      .setDescription(config.rulesMessage)
      .setImage("https://media.discordapp.net/attachments/1438611778433974313/1445456826597380116/image.png?ex=69306a12&is=692f1892&hm=2ce9df402e3f0e134216d5ecff21143128522107b982693bf85dc2273ba47ebd&=&format=webp&quality=lossless&width=848&height=163")
      .setColor("#0099ff");

    const acceptButton = new ButtonBuilder()
      .setCustomId("accept_rules")
      .setLabel("✅ Accept Rules")
      .setStyle(ButtonStyle.Success);

    const row = new ActionRowBuilder().addComponents(acceptButton);

    interaction.reply({
      embeds: [rulesEmbed],
      components: [row],
      ephemeral: true
    });
  }
};
