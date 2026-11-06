import type {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";

export interface NyxCommand {
  data: SlashCommandBuilder;

  permission?: string;

  execute(interaction: ChatInputCommandInteraction): Promise<void>;
}
