import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle
} from "discord.js";
import config from "../config.json" with { type: "json" };

export async function handleButton(interaction) {
  const id = interaction.customId;

  if (id === "show_rules") {
    const embed = new EmbedBuilder()
      .setTitle("📜 Rules")
      .setDescription(config.rulesMessage || "No rules configured.")
      .setImage("https://media.discordapp.net/attachments/1438611778433974313/1445456826597380116/image.png?ex=69306a12&is=692f1892&hm=2ce9df402e3f0e134216d5ecff21143128522107b982693bf85dc2273ba47ebd&=&format=webp&quality=lossless&width=848&height=163")
      .setColor("Yellow");

    const acceptButton = new ButtonBuilder()
      .setCustomId("accept_rules")
      .setLabel("✅ Accept Rules")
      .setStyle(ButtonStyle.Success);

    const row = new ActionRowBuilder().addComponents(acceptButton);

    return interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
  }

  if (id === "accept_rules") {
    if (!config.rulesRoleId || config.rulesRoleId === "ROLE_TO_GIVE_ON_ACCEPT") {
      return interaction.reply({ 
        content: "❌ Rules role not configured. An admin needs to use `/roleset` to configure it.", 
        ephemeral: true 
      });
    }

    const role = interaction.guild.roles.cache.get(config.rulesRoleId);
    if (!role) {
      return interaction.reply({ 
        content: "❌ Could not find the rules role. Please contact an admin.", 
        ephemeral: true 
      });
    }

    try {
      await interaction.member.roles.add(role);
      return interaction.reply({ content: `✅ You now have **${role.name}**!`, ephemeral: true });
    } catch (e) {
      return interaction.reply({ 
        content: "❌ Could not assign the role. The bot may lack permissions.", 
        ephemeral: true 
      });
    }
  }

  if (id === "set_ign") {
    const modal = new ModalBuilder()
      .setCustomId("ign_modal")
      .setTitle("Set Your IGN");

    const ignInput = new TextInputBuilder()
      .setCustomId("ign_input")
      .setLabel("Enter your in-game name")
      .setStyle(TextInputStyle.Short)
      .setRequired(true)
      .setMinLength(1)
      .setMaxLength(32);

    const row = new ActionRowBuilder().addComponents(ignInput);
    modal.addComponents(row);

    return interaction.showModal(modal);
  }

  if (id === "ign_modal") {
    const ign = interaction.fields.getTextInputValue("ign_input");

    // Save IGN to data file
    const fs = await import("node:fs");
    const path = await import("node:path");
    const ignPath = path.join(process.cwd(), "data", "user_igns.json");
    
    let ignData = {};
    if (fs.existsSync(ignPath)) {
      ignData = JSON.parse(fs.readFileSync(ignPath, "utf8"));
    }
    
    ignData[interaction.user.id] = ign;
    
    if (!fs.existsSync(path.dirname(ignPath))) {
      fs.mkdirSync(path.dirname(ignPath), { recursive: true });
    }
    
    fs.writeFileSync(ignPath, JSON.stringify(ignData, null, 2));

    // Read fresh config
    const configPath = path.join(process.cwd(), "config.json");
    const cfg = JSON.parse(fs.readFileSync(configPath, "utf8"));

    if (!cfg.ignRoleId || cfg.ignRoleId === "ROLE_TO_GIVE_ON_ACCEPT") {
      return interaction.reply({ 
        content: "❌ IGN role not configured. An admin needs to use `/roleset` to configure it.", 
        ephemeral: true 
      });
    }

    const role = interaction.guild.roles.cache.get(cfg.ignRoleId);
    if (!role) {
      return interaction.reply({ 
        content: "❌ Could not find the IGN role. Please contact an admin.", 
        ephemeral: true 
      });
    }

    try {
      await interaction.member.setNickname(ign);
      await interaction.member.roles.add(role);
      return interaction.reply({ 
        content: `✅ Your nickname has been set to **${ign}** and you've been given the **${role.name}** role!`, 
        ephemeral: true 
      });
    } catch (e) {
      console.error("IGN error:", e.message);
      return interaction.reply({ 
        content: `❌ Error: ${e.message}. The bot likely lacks "Manage Nicknames" or "Manage Roles" permissions, or your role is higher than the bot's.`, 
        ephemeral: true 
      });
    }
  }

  if (id.startsWith("set_role_ign_")) {
    const roleId = id.replace("set_role_ign_", "");
    const fs = await import("node:fs");
    const path = await import("node:path");
    const configPath = path.join(process.cwd(), "config.json");
    const cfg = JSON.parse(fs.readFileSync(configPath, "utf8"));
    cfg.ignRoleId = roleId;
    fs.writeFileSync(configPath, JSON.stringify(cfg, null, 2));
    
    return interaction.reply({
      content: `✅ Role <@&${roleId}> will now be given when users set their IGN!`,
      ephemeral: true
    });
  }

  if (id.startsWith("approve_bounty_")) {
    if (!interaction.member.permissions.has(EmbedBuilder.PermissionFlagsBits?.Administrator || "Administrator")) {
      return interaction.reply({ content: "❌ Only admins can approve bounties.", ephemeral: true });
    }

    const parts = id.split("_");
    const ign = parts[2];
    const amount = parts[3];
    const requesterId = parts[4];
    const items = parts[5] || "None";

    const fs = await import("node:fs");
    const path = await import("node:path");
    const bountiesPath = path.join(process.cwd(), "data", "bounties.json");
    const configPath = path.join(process.cwd(), "config.json");

    let bounties = { bounties: [] };
    if (fs.existsSync(bountiesPath)) {
      bounties = JSON.parse(fs.readFileSync(bountiesPath, "utf8"));
    }

    const newBounty = {
      id: Date.now().toString(),
      ign: ign,
      totalAmount: parseFloat(amount),
      items: items,
      contributors: [{ userId: requesterId, amount: parseFloat(amount) }],
      creatorId: requesterId,
      createdAt: new Date().toISOString()
    };

    bounties.bounties.push(newBounty);
    fs.writeFileSync(bountiesPath, JSON.stringify(bounties, null, 2));

    const cfg = JSON.parse(fs.readFileSync(configPath, "utf8"));
    if (cfg.bountyChannelId) {
      try {
        const channel = await interaction.client.channels.fetch(cfg.bountyChannelId);
        if (channel) {
          const pingContent = cfg.bountyPingRoleId ? `<@&${cfg.bountyPingRoleId}>` : `<@${requesterId}>`;
          await channel.send({
            content: pingContent,
            embeds: [{
              title: "🚨 **BOUNTY** 🚨",
              description: `**IGN :** ${ign}\n**Price :** $${amount}\n**Items :** ${items}\n**Contributors :**\n<@${requesterId}> ($${amount})\n\n**Contributors have to pay the hunter after he shows the proof individually**`,
              color: 0xFF0000,
              timestamp: new Date().toISOString()
            }]
          });
        }
      } catch (e) { console.error(e); }
    }

    await interaction.message.delete();
    return interaction.reply({ content: `✅ Bounty for **${ign}** approved and posted!`, ephemeral: true });
  }

  if (id.startsWith("deny_bounty_")) {
    if (!interaction.member.permissions.has(EmbedBuilder.PermissionFlagsBits?.Administrator || "Administrator")) {
      return interaction.reply({ content: "❌ Only admins can deny bounties.", ephemeral: true });
    }

    const parts = id.split("_");
    const requesterId = parts[2];

    try {
      const requester = await interaction.client.users.fetch(requesterId);
      if (requester) {
        await requester.send("Dont Use Bounty System For Fun , Also It Might lead to MUTE");
      }
    } catch (e) {
      console.error("Failed to DM requester:", e.message);
    }

    await interaction.message.delete();
    return interaction.reply({ content: "❌ Bounty request denied and user notified.", ephemeral: true });
  }
}
