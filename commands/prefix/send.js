import { EmbedBuilder } from "discord.js";
import { hasBotAccess } from "../../utils/permissions.js";

export default {
  name: "send",
  async run(client, message, args) {
    if (!hasBotAccess(message.member))
      return message.reply("❌ You cannot use this bot.");

    const type = args.shift();
    if (type === "embed") {
      const title = args.shift();
      const desc = args.join(" ");
      const embed = new EmbedBuilder().setTitle(title || "No Title").setDescription(desc || "No Description").setColor("Blue");
      message.channel.send({ embeds: [embed] });
    } else {
      message.channel.send(args.join(" "));
    }
  }
};
