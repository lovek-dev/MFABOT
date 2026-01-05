import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import fs from "fs";
import path from "path";

export default {
  data: new SlashCommandBuilder()
    .setName("bountyclear")
    .setDescription("Clear a specific bounty or all active bounties (Admin only)")
    .addStringOption(o => 
      o.setName("ign")
        .setDescription("The IGN of the bounty to clear (leave empty to clear ALL)")
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async run(client, interaction) {
    const ign = interaction.options.getString("ign");
    const bountiesPath = path.join(process.cwd(), "data", "bounties.json");
    
    try {
      if (!ign) {
        const emptyData = { bounties: [] };
        fs.writeFileSync(bountiesPath, JSON.stringify(emptyData, null, 2));
        return interaction.reply({
          content: "✅ All active bounties have been cleared!",
          ephemeral: true
        });
      }

      const data = JSON.parse(fs.readFileSync(bountiesPath, "utf8"));
      const initialCount = data.bounties.length;
      data.bounties = data.bounties.filter(b => b.ign.toLowerCase() !== ign.toLowerCase());

      if (data.bounties.length === initialCount) {
        return interaction.reply({
          content: `❌ No bounty found for **${ign}**.`,
          ephemeral: true
        });
      }

      fs.writeFileSync(bountiesPath, JSON.stringify(data, null, 2));
      return interaction.reply({
        content: `✅ Bounty for **${ign}** has been cleared!`,
        ephemeral: true
      });
    } catch (e) {
      console.error("Error clearing bounties:", e);
      return interaction.reply({
        content: "❌ Failed to clear bounty.",
        ephemeral: true
      });
    }
  }
};