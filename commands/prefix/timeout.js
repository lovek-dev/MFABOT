import { PermissionsBitField } from "discord.js";
import config from "../../config.json" with { type: "json" };

export default {
  name: "timeout",
  async run(client, message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers))
      return message.reply("❌ You lack permissions.");

    const user = message.mentions.members.first();
    const ms = parseInt(args[1]);

    if (!user) return message.reply("Mention someone.");
    if (!ms) return message.reply("Provide duration in ms.");

    if (user.id === config.ownerId) {
      return message.reply("❌ You cannot timeout the bot owner.");
    }

    await user.timeout(ms);
    message.reply(`⏳ Timed out ${user.user.tag}`);
  }
};
