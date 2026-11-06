import { type Client, type ClientEvents } from "discord.js";

import { readdir } from "node:fs/promises";
import { pathToFileURL } from "node:url";

type EventModule = {
  name: keyof ClientEvents;
  once?: boolean;
  execute: (...args: any[]) => void | Promise<void>;
};

export async function loadEvents(client: Client) {
  const extension = import.meta.url.endsWith(".ts") ? ".ts" : ".js";
  const eventsPath = new URL("../../events/", import.meta.url);

  const files = await readdir(eventsPath, {
    recursive: true,
    withFileTypes: true,
  });

  for (const file of files) {
    if (!file.isFile() || !file.name.endsWith(extension)) {
      continue;
    }

    const filePath = pathToFileURL(`${file.parentPath}/${file.name}`).href;

    const module = await import(filePath);
    const event = module.default as EventModule;

    const handler = (...args: any[]) => {
      void event.execute(...args);
    };

    if (event.once) {
      client.once(event.name, handler);
    } else {
      client.on(event.name, handler);
    }

    console.log(`Evento carregado: ${String(event.name)}`);
  }
}
