import { PermissionsBitField, EmbedBuilder } from "discord.js";
import { hasBotAccess } from "../../utils/permissions.js";
import { logAction } from "../../utils/logger.js";
import config from "../../config.json" with { type: "json" };

export default {
  name: "mod",
  async run(client, message, args) {
    if (!hasBotAccess(message.member))
      return message.reply("❌ You cannot use this bot.");
    if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers))
      return message.reply("❌ No kick permission.");

    const user = message.mentions.members.first();
    if (!user) return message.reply("Mention a user.");

    if (user.id === config.ownerId) {
      return message.reply("❌ You cannot moderate the bot owner.");
    }

    await user.kick();
    const embed = new EmbedBuilder().setTitle("User Kicked").setDescription(`${user} was kicked by ${message.author}`).setColor("Red");
    await logAction(message.guild, embed);
    message.reply("✅ User kicked.");
  }
};
