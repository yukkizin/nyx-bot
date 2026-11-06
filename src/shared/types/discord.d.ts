import type { Collection } from "discord.js";
import type { NyxCommand } from "./command.js";

declare module "discord.js" {
  interface Client {
    commands: Collection<string, NyxCommand>;
  }
}
