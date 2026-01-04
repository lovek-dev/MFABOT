import config from "../config.json" with { type: "json" };
import { handleButton } from "../interactions/buttonHandler.js";

export default {
  name: "interactionCreate",
  async run(client, interaction) {
    try {
      if (interaction.isChatInputCommand()) {
        const cmd = client.commands.get(interaction.commandName);
        if (cmd) {
          return await cmd.run(client, interaction);
        }
      }

      if (interaction.isButton() || interaction.isModalSubmit()) {
        return await handleButton(interaction);
      }
    } catch (e) {
      console.error(e);
      if (interaction.isRepliable()) {
        interaction.reply({ content: "❌ Command error.", ephemeral: true });
      }
    }
  }
};
