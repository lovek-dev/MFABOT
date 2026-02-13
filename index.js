import 'dotenv/config';
import express from "express";
import { Client, GatewayIntentBits, Partials, Collection, EmbedBuilder, ActivityType } from "discord.js";
import fs from "fs";

// =========================
// Render Alive Server
// =========================
const app = express();

app.get("/", (req, res) => {
  res.send("Bot is alive");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Alive Server running on port ${PORT}`);
});

// =========================
// Token Debug
// =========================
const token = process.env.DISCORD_TOKEN || process.env.DISCORD_BOT_TOKEN;

console.log("\n--- Login Debug Info ---");
console.log("Token exists:", !!token);
if (token) console.log("Token length:", token.length);
console.log("Attempting to login...\n");

if (!token) {
  throw new Error("DISCORD_TOKEN is not defined");
}

// =========================
// Discord Client
// =========================
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildMessageReactions
  ],
  partials: [Partials.Channel, Partials.Message, Partials.Reaction]
});

// =========================
// 🔍 Gateway Debug Logs
// =========================
client.on("debug", msg => console.log("[DEBUG]", msg));
client.on("warn", msg => console.log("[WARN]", msg));

client.on("shardConnecting", id => console.log(`Shard ${id} connecting...`));
client.on("shardReady", id => console.log(`Shard ${id} ready`));
client.on("shardDisconnect", (event, id) =>
  console.log(`Shard ${id} disconnected`, event?.reason)
);
client.on("shardReconnecting", id =>
  console.log(`Shard ${id} reconnecting...`)
);

// =========================
// Error Handling
// =========================
client.on("error", console.error);

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});

// =========================
// Bot Ready Event
// =========================
client.once("ready", () => {
  console.log(`\n✅ Logged in as ${client.user.tag}\n`);

  client.user.setActivity("One of the strongest clan 🏯", {
    type: ActivityType.Custom
  });
});

// =========================
// Collections
// =========================
client.commands = new Collection();
client.prefixCommands = new Collection();

// =========================
// Load Commands
// =========================
async function loadCommands() {
  const prefixFiles = fs.readdirSync("./commands/prefix").filter(f => f.endsWith(".js"));
  for (const file of prefixFiles) {
    const cmd = (await import(`./commands/prefix/${file}`)).default;
    client.prefixCommands.set(cmd.name, cmd);
  }

  const slashFiles = fs.readdirSync("./commands/slash").filter(f => f.endsWith(".js"));
  client.slash = [];

  for (const file of slashFiles) {
    const cmd = (await import(`./commands/slash/${file}`)).default;
    client.commands.set(cmd.data.name, cmd);
    client.slash.push(cmd.data.toJSON());
  }
}

// =========================
// Load Events
// =========================
async function loadEvents() {
  const eventFiles = fs.readdirSync("./events").filter(f => f.endsWith(".js"));

  for (const file of eventFiles) {
    const event = (await import(`./events/${file}`)).default;
    if (event.once) {
      client.once(event.name, (...args) => event.run(client, ...args));
    } else {
      client.on(event.name, (...args) => event.run(client, ...args));
    }
  }
}

// =========================
// Initialize Bot
// =========================
async function startBot() {
  await loadCommands();
  await loadEvents();

  await client.login(token);
}

startBot();

