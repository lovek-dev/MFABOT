// ==========================
// Imports
// ==========================
import express from "express";
import { Client, GatewayIntentBits, Partials, Collection, ActivityType } from "discord.js";
import fs from "fs";
import config from "./config.json" with { type: "json" };
import { handleButton } from "./interactions/buttonHandler.js";

// ==========================
// Express App (Status Server)
// ==========================
const app = express();

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Bot Status</title>
        <style>
          body { background:#0f172a; color:#f8fafc; font-family:Segoe UI; display:flex; justify-content:center; align-items:center; height:100vh; }
          .card { background:#1e293b; padding:2rem; border-radius:1rem; text-align:center; border:1px solid #334155; }
          .status { color:#22c55e; font-size:1.4rem; font-weight:bold; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="status">🟢 Bot is Alive</div>
          <p>MFA Discord Bot is running</p>
        </div>
      </body>
    </html>
  `);
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
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildMessageReactions
  ],
  partials: [Partials.Channel, Partials.Message, Partials.Reaction]
});

client.commands = new Collection();
client.prefixCommands = new Collection();

// ==========================
// Load Prefix Commands
// ==========================
for (const file of fs.readdirSync("./commands/prefix").filter(f => f.endsWith(".js"))) {
  const cmd = (await import(`./commands/prefix/${file}`)).default;
  client.prefixCommands.set(cmd.name, cmd);
}

// ==========================
// Load Slash Commands
// ==========================
client.slash = [];
for (const file of fs.readdirSync("./commands/slash").filter(f => f.endsWith(".js"))) {
  const cmd = (await import(`./commands/slash/${file}`)).default;
  client.commands.set(cmd.data.name, cmd);
  client.slash.push(cmd.data.toJSON());
}

// ==========================
// Load Events
// ==========================
for (const file of fs.readdirSync("./events").filter(f => f.endsWith(".js"))) {
  const event = (await import(`./events/${file}`)).default;
  if (event.once) {
    client.once(event.name, (...args) => event.run(client, ...args));
  } else {
    client.on(event.name, (...args) => event.run(client, ...args));
  }
}

// ==========================
// Ready Event (FIXED)
// ==========================
client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);

  client.user.setActivity("One of the strongest clan 🏯", {
    type: ActivityType.Playing
  });
});

// ==========================
// Login
// ==========================
client.login(token)
  .then(() => console.log("🔑 Discord login successful"))
  .catch(err => {
    console.error("❌ Discord login failed:", err);
    process.exit(1);
  });

// ==========================
// Start Express AFTER login
// ==========================
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🌐 Status server running on port ${PORT}`);
});
