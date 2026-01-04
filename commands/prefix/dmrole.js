import { hasBotAccess } from "../../utils/permissions.js";

export default {
  name: "dmrole",
  async run(client, message, args) {
    if (!hasBotAccess(message.member))
      return message.reply("❌ You cannot use this bot.");

    const role = message.mentions.roles.first();
    if (!role) return message.reply("Mention a role.");

    let sent = 0;
    for (const member of role.members.values()) {
      try {
        await member.send(args.slice(1).join(" ") || "Hello!");
        sent++;
        await new Promise(r => setTimeout(r, 1000));
      } catch {}
    }
    message.reply(`✅ Sent ${sent} DMs.`);
  }
};
