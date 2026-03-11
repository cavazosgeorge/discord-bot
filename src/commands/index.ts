import { helloCommand } from "./hello.js";
import { pingCommand } from "./ping.js";
import { serverInfoCommand } from "./serverinfo.js";
import { userInfoCommand } from "./userinfo.js";

export const commands = [
  pingCommand,
  helloCommand,
  userInfoCommand,
  serverInfoCommand,
];

export const commandMap = new Map(
  commands.map((command) => [command.data.toJSON().name, command]),
);
