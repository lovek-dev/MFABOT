import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const kosPath = path.join(__dirname, "../../data/kos.json");

function loadKOS() {
  const data = fs.readFileSync(kosPath, "utf8");
  return JSON.parse(data);
}

function saveKOS(data) {
  fs.writeFileSync(kosPath, JSON.stringify(data, null, 2));
}

export default {
  data: new SlashCommandBuilder()
    .setName("kos")
    .setDescription("Add an IGN to the KOS list (Admin only)")
    .addStringOption(o =>
      o.setName("ign")
        .setDescription("In-game name to add to KOS list")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async run(client, interaction) {
    const ign = interaction.options.getString("ign");
    const kos = loadKOS();

    // Check if already exists
    const exists = kos.kos.find(k => k.ign.toLowerCase() === ign.toLowerCase());
    
    if (exists) {
      return interaction.reply({
        content: `❌ **${ign}** is already on the KOS list!`,
        ephemeral: true
      });
    }

    // Add to KOS list
    kos.kos.push({
      id: Date.now().toString(),
      ign: ign,
      addedBy: interaction.user.id,
      addedAt: new Date().toISOString()
    });

    saveKOS(kos);

    interaction.reply({
      content: `✅ **${ign}** added to the KOS list!`,
      ephemeral: true
    });
  }
};
