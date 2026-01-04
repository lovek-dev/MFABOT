import { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from "discord.js";
import fs from "fs";
import path from "path";

const ignPath = path.join(process.cwd(), "data", "user_igns.json");

export default {
  customId: "set_ign",
  async run(client, interaction) {
    const modal = new ModalBuilder()
      .setCustomId("ign_modal")
      .setTitle("Set Your In-Game Name");

    const ignInput = new TextInputBuilder()
      .setCustomId("ign_input")
      .setLabel("What is your IGN?")
      .setStyle(TextInputStyle.Short)
      .setPlaceholder("Enter your name here...")
      .setRequired(true);

    const firstActionRow = new ActionRowBuilder().addComponents(ignInput);
    modal.addComponents(firstActionRow);

    await interaction.showModal(modal);
  }
};
