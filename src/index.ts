import { Client, GatewayIntentBits } from "discord.js";

import { env } from "./core/config/env.js";
import { loadEvents } from "./core/loaders/load-events.js";
import { loadCommands } from "./core/loaders/load-commands.js";

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

async function startBot() {
  await loadCommands(client);
  await loadEvents(client);

  await client.login(env.DISCORD_TOKEN);
}

startBot().catch((error) => {
  console.error("Erro ao iniciar o Nyx:", error);
  process.exitCode = 1;
});
