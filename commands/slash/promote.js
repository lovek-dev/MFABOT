import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from "discord.js";
import fs from "fs";
import path from "path";

export default {
  data: new SlashCommandBuilder()
    .setName("promote")
    .setDescription("Promote a user (Admin only)")
    .addUserOption(o => o.setName("user").setDescription("The user to promote").setRequired(true))
    .addStringOption(o => o.setName("from").setDescription("Current rank").setRequired(true))
    .addStringOption(o => o.setName("to").setDescription("New rank").setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async run(client, interaction) {
    const user = interaction.options.getUser("user");
    const fromRank = interaction.options.getString("from");
    const toRank = interaction.options.getString("to");
    const staff = interaction.user;

    const embed = new EmbedBuilder()
      .setTitle("📈 Promotion")
      .addFields(
        { name: "User", value: `<@${user.id}>\nID: \`${user.id}\``, inline: false },
        { name: "From", value: fromRank, inline: true },
        { name: "To", value: toRank, inline: true },
        { name: "Staff", value: `<@${staff.id}>\nID: \`${staff.id}\``, inline: false }
      )
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .setColor("Green")
      .setFooter({ text: `${staff.tag}`, iconURL: staff.displayAvatarURL() })
      .setTimestamp();

    // Log the promotion
    const promoPath = path.join(process.cwd(), "data", "promotions.json");
    let allPromos = {};
    if (fs.existsSync(promoPath)) {
      try {
        allPromos = JSON.parse(fs.readFileSync(promoPath, "utf8"));
      } catch (e) {}
    }
    const guildId = interaction.guildId;
    if (!allPromos[guildId]) allPromos[guildId] = [];
    allPromos[guildId].push({
      userId: user.id,
      from: fromRank,
      to: toRank,
      staffId: staff.id,
      timestamp: new Date().toISOString()
    });
    fs.writeFileSync(promoPath, JSON.stringify(allPromos, null, 2));

    await interaction.reply({ embeds: [embed] });
  }
};
