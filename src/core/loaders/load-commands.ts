import { Collection, type Client } from "discord.js";

import { readdir } from "node:fs/promises";
import { pathToFileURL } from "node:url";

import type { NyxCommand } from "../../shared/types/command.js";

export async function loadCommands(client: Client) {
  const extension = import.meta.url.endsWith(".ts") ? ".ts" : ".js";
  const commandsPath = new URL("../../commands/", import.meta.url);

  const files = await readdir(commandsPath, {
    recursive: true,
    withFileTypes: true,
  });

  client.commands = new Collection();

  for (const file of files) {
    if (!file.isFile() || !file.name.endsWith(extension)) {
      continue;
    }

    const filePath = pathToFileURL(`${file.parentPath}/${file.name}`).href;

    const module = await import(filePath);
    const command = module.default as NyxCommand;

    if (!command.data || !command.execute) {
      console.warn(`Comando inválido ignorado: ${file.name}`);
      continue;
    }

    const commandName = command.data.name;

    if (client.commands.has(commandName)) {
      throw new Error(`Comando duplicado: ${commandName}`);
    }

    client.commands.set(commandName, command);

    console.log(`Comando carregado: /${commandName}`);
  }

  console.log(`Total de comandos carregados: ${client.commands.size}`);
}
