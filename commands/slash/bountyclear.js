import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import fs from "fs";
import path from "path";

export default {
  data: new SlashCommandBuilder()
    .setName("bountyclear")
    .setDescription("Clear all active bounties (Admin only)")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async run(client, interaction) {
    const bountiesPath = path.join(process.cwd(), "data", "bounties.json");
    
    try {
      const emptyData = { bounties: [] };
      fs.writeFileSync(bountiesPath, JSON.stringify(emptyData, null, 2));
      
      return interaction.reply({
        content: "✅ All active bounties have been cleared!",
        ephemeral: true
      });
    } catch (e) {
      console.error("Error clearing bounties:", e);
      return interaction.reply({
        content: "❌ Failed to clear bounties.",
        ephemeral: true
      });
    }
  }
};