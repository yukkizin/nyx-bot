import { Events, type Client } from "discord.js";

export default {
  name: Events.ClientReady,
  once: true,

  execute(client: Client<true>) {
    console.log(`Nyx conectado como ${client.user.tag}`);
  },
};
