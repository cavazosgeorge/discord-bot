import { pingCommand } from "./ping.js";

export const commands = [pingCommand];

export const commandMap = new Map(
  commands.map((command) => [command.data.toJSON().name, command]),
);
