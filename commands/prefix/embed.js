import { EmbedBuilder } from "discord.js";

export default {
  name: "embed",
  run(client, message, args) {
    const embed = new EmbedBuilder()
      .setTitle(args[0] || "No Title")
      .setDescription(args.slice(1).join(" ") || "No Description")
      .setColor("Random");

    message.channel.send({ embeds: [embed] });
  }
};
