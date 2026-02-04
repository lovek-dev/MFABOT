import express from "express";

const app = express();

app.get("/", (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Bot Status</title>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    background-color: #0f172a;
                    color: #f8fafc;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    margin: 0;
                }
                .card {
                    background-color: #1e293b;
                    padding: 2rem;
                    border-radius: 1rem;
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                    text-align: center;
                    border: 1px solid #334155;
                }
                .status {
                    font-size: 1.5rem;
                    font-weight: bold;
                    color: #22c55e;
                    margin-bottom: 1rem;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 0.5rem;
                }
                .dot {
                    height: 12px;
                    width: 12px;
                    background-color: #22c55e;
                    border-radius: 50%;
                    display: inline-block;
                    animation: pulse 2s infinite;
                }
                @keyframes pulse {
                    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
                    70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(34, 197, 94, 0); }
                    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
                }
                h1 { margin: 0; font-size: 1.25rem; color: #94a3b8; }
            </style>
        </head>
        <body>
            <div class="card">
                <div class="status">
                    <span class="dot"></span>
                    Bot is Alive
                </div>
                <h1>MFA Discord Bot is running smoothly</h1>
            </div>
        </body>
        </html>
    `);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Alive Server running on port ${PORT}`);
});

import { Client, GatewayIntentBits, Partials, Collection, EmbedBuilder, ActivityType } from "discord.js";
import fs from "fs";
import { logAction } from "./utils/logger.js";
import config from "./config.json" with { type: "json" };
import { handleButton } from "./interactions/buttonHandler.js";

function loadResponses() {
  try {
    const data = fs.readFileSync("./data/responses.json", "utf8");
    return JSON.parse(data);
  } catch {
    return { autoResponses: {} };
  }
}

function loadSchedules() {
  try {
    const data = fs.readFileSync("./data/schedules.json", "utf8");
    return JSON.parse(data);
  } catch {
    return { scheduledMessages: [] };
  }
}

function saveSchedules(data) {
  fs.writeFileSync("./data/schedules.json", JSON.stringify(data, null, 2));
}

const token = process.env.DISCORD_BOT_TOKEN;

if (!token) {
  console.error("❌ DISCORD_BOT_TOKEN environment variable is not set!");
  process.exit(1);
}

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

// Load prefix commands
for (const file of fs.readdirSync("./commands/prefix").filter(f => f.endsWith(".js"))) {
  const cmd = (await import(`./commands/prefix/${file}`)).default;
  client.prefixCommands.set(cmd.name, cmd);
}

// Load slash commands
client.slash = [];
for (const file of fs.readdirSync("./commands/slash").filter(f => f.endsWith(".js"))) {
  const cmd = (await import(`./commands/slash/${file}`)).default;
  client.commands.set(cmd.data.name, cmd);
  client.slash.push(cmd.data.toJSON());
}

// Ready event
client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  
  client.user.setActivity("One of the strongest clan  🏯", { type: ActivityType.Custom });
  
  setInterval(async () => {
    const data = loadSchedules();
    const now = new Date();
    const toSend = [];
    const remaining = [];

    // schedules.json is already per-guild in structure if it matches /schedule
    // Let's ensure loop handles it correctly
    for (const schedule of data.scheduledMessages) {
      const scheduledTime = new Date(schedule.scheduledTime);
      if (scheduledTime <= now) {
        toSend.push(schedule);
      } else {
        remaining.push(schedule);
      }
    }

    for (const schedule of toSend) {
      try {
        const guild = await client.guilds.fetch(schedule.guildId).catch((err) => {
          console.error(`Error fetching guild ${schedule.guildId}:`, err.message);
          return null;
        });
        if (!guild) {
          console.log(`Guild ${schedule.guildId} not found, skipping schedule ${schedule.id}`);
          continue;
        }
        const channel = await guild.channels.fetch(schedule.channelId).catch((err) => {
          console.error(`Error fetching channel ${schedule.channelId} in guild ${schedule.guildId}:`, err.message);
          return null;
        });
        if (channel) {
          const embed = new EmbedBuilder()
            .setTitle(schedule.embed.title)
            .setDescription(schedule.embed.description)
            .setColor(schedule.embed.color)
            .setTimestamp();
          await channel.send({ embeds: [embed] });
          console.log(`📨 Sent scheduled message: ${schedule.embed.title} for guild ${schedule.guildId}`);
        }
      } catch (e) {
        console.error(`Failed to send scheduled message ${schedule.id}:`, e.message);
      }
    }

    if (toSend.length > 0) {
      data.scheduledMessages = remaining;
      saveSchedules(data);
    }
  }, 30000);
});

// Prefix message handler & Auto-responder
// (Handler moved to events/messageCreate.js)

// Slash commands & Button handler
// (Handler moved to events/interactionCreate.js)

// Load events
for (const file of fs.readdirSync("./events").filter(f => f.endsWith(".js"))) {
  const event = (await import(`./events/${file}`)).default;
  if (event.once) {
    client.once(event.name, (...args) => event.run(client, ...args));
  } else {
    client.on(event.name, (...args) => event.run(client, ...args));
  }
}


// Login
client.login(token);
