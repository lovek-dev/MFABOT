import { PermissionsBitField } from "discord.js";
import config from "../../config.json" with { type: "json" };

export default {
  name: "ban",
  async run(client, message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers))
      return message.reply("❌ You lack permissions.");

    const member = message.mentions.members.first();
    if (!member) return message.reply("Mention someone to ban.");

    if (member.id === config.ownerId) {
      return message.reply("❌ You cannot ban the bot owner.");
    }

    await member.ban({ reason: args.slice(1).join(" ") || "No reason" });
    message.reply(`✅ Banned ${member.user.tag}`);
  }
};
