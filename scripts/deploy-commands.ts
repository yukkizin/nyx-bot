import "dotenv/config";

import { REST, Routes, SlashCommandBuilder } from "discord.js";

import { readdir } from "node:fs/promises";
import { pathToFileURL } from "node:url";

import type { NyxCommand } from "../src/shared/types/command.js";

function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`A variável ${name} não foi definida no .env`);
  }

  return value;
}

async function deployCommands() {
  const token = getRequiredEnv("DISCORD_TOKEN");
  const clientId = getRequiredEnv("DISCORD_CLIENT_ID");
  const guildId = getRequiredEnv("DISCORD_GUILD_ID");

  const commands: ReturnType<SlashCommandBuilder["toJSON"]>[] = [];

  const commandsPath = new URL("../src/commands/", import.meta.url);

  const files = await readdir(commandsPath, {
    recursive: true,
    withFileTypes: true,
  });

  for (const file of files) {
    if (!file.isFile() || !file.name.endsWith(".ts")) {
      continue;
    }

    const filePath = pathToFileURL(`${file.parentPath}/${file.name}`).href;

    const module = await import(filePath);
    const command = module.default as NyxCommand;

    if (!command.data || !command.execute) {
      console.warn(`Comando inválido: ${file.name}`);
      continue;
    }

    commands.push(command.data.toJSON());
  }

  const rest = new REST({ version: "10" }).setToken(token);

  await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
    body: commands,
  });

  console.log(`${commands.length} comando(s) registrado(s) com sucesso!`);
}

deployCommands().catch((error) => {
  console.error("Erro ao registrar comandos:", error);
  process.exitCode = 1;
});
