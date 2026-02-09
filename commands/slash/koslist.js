import { SlashCommandBuilder, EmbedBuilder } from "discord.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const kosPath = path.join(__dirname, "../../data/kos.json");

function loadKOS() {
  const data = fs.readFileSync(kosPath, "utf8");
  return JSON.parse(data);
}

export default {
  data: new SlashCommandBuilder()
    .setName("koslist")
    .setDescription("View all IGNs on the KOS list"),

  async run(client, interaction) {
    const kos = loadKOS();

    if (kos.kos.length === 0) {
      return interaction.reply({
        content: "✅ No one on the KOS list!",
        ephemeral: true
      });
    }

    const embed = new EmbedBuilder()
      .setTitle("⚠️ KOS List (Kill On Sight)")
      .setColor("DarkRed")
      .setTimestamp();

    kos.kos.forEach((entry, index) => {
      embed.addFields({
        name: `${index + 1}. ${entry.ign}`,
        value: `Added: <t:${Math.floor(new Date(entry.addedAt).getTime() / 1000)}:R>`,
        inline: false
      });
    });

    interaction.reply({ embeds: [embed] });
  }
};
