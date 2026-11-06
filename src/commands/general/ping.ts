import { SlashCommandBuilder } from "discord.js";
import type { NyxCommand } from "../../shared/types/command.js";

const command: NyxCommand = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Verifica a latência do Nyx."),

  async execute(interaction) {
    const latency = interaction.client.ws.ping;

    await interaction.reply({
      content: `Pong! 🏓 Latência: ${latency}ms`,
      ephemeral: true,
    });
  },
};

export default command;
