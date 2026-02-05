// ==========================
// Imports
// ==========================
import express from "express";
import { Client, GatewayIntentBits, Partials, Collection, ActivityType } from "discord.js";
import fs from "fs";

// ==========================
// Express App (Status Server)
// ==========================
const app = express();

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

app.get("/", (req, res) => {
  res.send("🟢 Bot is Alive");
});

// ==========================
// Discord Client
// ==========================
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

client.commands = new Collection();

// ==========================
// Ready Event
// ==========================
client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

  client.user.setActivity("One of the strongest clan 🏯", {
    type: ActivityType.Playing
  });
});

// ==========================
// Login → THEN start Express
// ==========================
client.login(token)
  .then(() => {
    console.log("🔑 Discord login successful");

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🌐 Status server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error("❌ Discord login failed:", err);
    process.exit(1);
  });
