import { SlashCommandBuilder, PermissionFlagsBits, ChannelType } from "discord.js";
import fs from "node:fs";
import path from "node:path";

export default {
  data: new SlashCommandBuilder()
    .setName("bountychannel")
    .setDescription("Set the channel for bounty posts (Admin only)")
    .addChannelOption(o => 
      o.setName("channel")
        .setDescription("Channel to post bounties in")
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildText)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async run(client, interaction) {
    const channel = interaction.options.getChannel("channel");
    const configPath = path.join(process.cwd(), "config.json");
    const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

    config.bountyChannelId = channel.id;
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    return interaction.reply({
      content: `✅ Bounty channel set to ${channel}!`,
      ephemeral: true
    });
  }
};
