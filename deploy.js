import { REST, Routes } from "discord.js";
import fs from "fs";

const token = process.env.DISCORD_BOT_TOKEN;
const appId = process.env.DISCORD_APPLICATION_ID;
const guildIds = [
  process.env.DISCORD_GUILD_ID_1,
  process.env.DISCORD_GUILD_ID_2
].filter(id => id);

if (!token) {
  console.error("❌ DISCORD_BOT_TOKEN environment variable is not set!");
  process.exit(1);
}

if (!appId) {
  console.error("❌ DISCORD_APPLICATION_ID environment variable is not set!");
  process.exit(1);
}

const commands = [];
for (const file of fs.readdirSync("./commands/slash").filter(f => f.endsWith(".js"))) {
  const cmd = (await import(`./commands/slash/${file}`)).default;
  commands.push(cmd.data.toJSON());
}

const rest = new REST({ version: "10" }).setToken(token);

try {
  console.log(`Found ${commands.length} slash commands to register...`);
  
    const guildIds = ["1402337777252827247", "1438611777482133576"];
    console.log(`Registering commands for guilds: ${guildIds.join(", ")}`);

    for (const guildId of guildIds) {
      try {
        console.log(`Updating commands for guild ${guildId}...`);
        await rest.put(Routes.applicationGuildCommands(appId, guildId), { body: commands });
        console.log(`✅ Guild commands registered for ${guildId}.`);
      } catch (err) {
        console.error(`❌ Failed to register guild ${guildId}:`, err.message);
      }
    }
    
    // Also register globally
    console.log("Registering global commands...");
    await rest.put(Routes.applicationCommands(appId), { body: commands });
    console.log("✅ Global slash commands registered.");
  
  console.log("\nRegistered commands:");
  commands.forEach(cmd => console.log(`  - /${cmd.name}: ${cmd.description}`));
} catch (e) {
  console.error("Error registering commands:", e);
}
