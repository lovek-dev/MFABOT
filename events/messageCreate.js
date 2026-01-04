import config from "../config.json" with { type: "json" };

export default {
  name: "messageCreate",
  async run(client, message) {
    if (message.author.bot) return;
    if (!message.content.startsWith(config.prefix)) return;

    const args = message.content.slice(config.prefix.length).trim().split(/ +/);
    const cmdName = args.shift().toLowerCase();

    const cmd = client.prefixCommands.get(cmdName);
    if (!cmd) return;

    if (!message.member.roles.cache.has(config.allowedRole))
      return message.reply("❌ You don't have permission to use this bot.");

    try {
      await cmd.run(client, message, args);
    } catch (e) {
      console.error(e);
      message.reply("❌ Error executing command.");
    }
  }
};
