import { updateAllowedRole } from "../../utils/permissions.js";
import { hasBotAccess } from "../../utils/permissions.js";

export default {
  name: "setrole",
  async run(client, message, args) {
    if (!hasBotAccess(message.member))
      return message.reply("❌ You cannot use this bot.");

    const role = message.mentions.roles.first();
    if (!role) return message.reply("Mention a role.");

    updateAllowedRole(role.id);
    message.reply(`✅ Allowed role set to: ${role.name}`);
  }
};

