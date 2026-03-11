import { SlashCommandBuilder } from "discord.js";

import type { Command } from "../types/command.js";

export const helloCommand: Command = {
  data: new SlashCommandBuilder()
    .setName("hello")
    .setDescription("Get a quick greeting from the bot."),
  async execute(interaction) {
    await interaction.reply(`Hello, ${interaction.user.username}!`);
  },
};
