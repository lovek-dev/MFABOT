import { Client, GatewayIntentBits, Partials, ActivityType } from "discord.js";

const token = process.env.DISCORD_BOT_TOKEN;

if (!token) {
  console.error("❌ DISCORD_BOT_TOKEN is missing!");
  process.exit(1);
}

console.log("TOKEN EXISTS:", true);

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ],
  partials: [Partials.Channel]
});

client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

  client.user.setActivity("One of the strongest clan 🏯", {
    type: ActivityType.Playing
  });
});

client.login(token)
  .then(() => console.log("🔑 Discord login successful"))
  .catch(err => {
    console.error("❌ Discord login failed:", err);
    process.exit(1);
  });
