import { PermissionsBitField } from "discord.js";
import config from "../../config.json" with { type: "json" };

export default {
  name: "kick",
  async run(client, message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers))
      return message.reply("❌ You lack permissions.");

    const member = message.mentions.members.first();
    if (!member) return message.reply("Mention someone to kick!");

    if (member.id === config.ownerId) {
      return message.reply("❌ You cannot kick the bot owner.");
    }

    await member.kick();
    message.reply(`✅ Kicked ${member.user.tag}`);
  }
};
