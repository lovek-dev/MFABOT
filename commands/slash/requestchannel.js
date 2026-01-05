import { SlashCommandBuilder, PermissionFlagsBits, ChannelType } from "discord.js";
import fs from "fs";
import path from "path";

export default {
  data: new SlashCommandBuilder()
    .setName("requestchannel")
    .setDescription("Set the channel for bounty requests (Admins only)")
    .addChannelOption(o => 
      o.setName("channel")
        .setDescription("The channel to send bounty requests to")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async run(client, interaction) {
    const channel = interaction.options.getChannel("channel");
    const configPath = path.join(process.cwd(), "config.json");
    
    try {
      const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
      config.requestChannelId = channel.id;
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      
      return interaction.reply({
        content: `✅ Bounty request channel has been set to ${channel}!`,
        ephemeral: true
      });
    } catch (e) {
      console.error("Error saving request channel:", e);
      return interaction.reply({
        content: "❌ Failed to save the request channel configuration.",
        ephemeral: true
      });
    }
  }
};