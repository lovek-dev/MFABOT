import { PermissionsBitField } from "discord.js";

export default {
  name: "unban",
  async run(client, message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers))
      return message.reply("❌ You lack permissions.");

    const id = args[0];
    if (!id) return message.reply("Provide user ID.");

    try {
      await message.guild.members.unban(id);
      message.reply(`✅ Unbanned ${id}`);
    } catch (e) {
      message.reply("❌ Could not unban that user. Make sure the ID is correct.");
    }
  }
};
