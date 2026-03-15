import { MessageFlags, SlashCommandBuilder } from "discord.js";

import { reminderService } from "../reminders/service.js";
import type { Command } from "../types/command.js";

const MAX_REMINDER_MINUTES = 60 * 24 * 7;

export const remindCommand: Command = {
  data: new SlashCommandBuilder()
    .setName("remind")
    .setDescription("Set a reminder in this server.")
    .addIntegerOption((option) =>
      option
        .setName("minutes")
        .setDescription("How many minutes from now to remind you.")
        .setMinValue(1)
        .setMaxValue(MAX_REMINDER_MINUTES)
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("message")
        .setDescription("What should the bot remind you about?")
        .setMinLength(1)
        .setMaxLength(250)
        .setRequired(true),
    ),
  async execute(interaction) {
    if (!interaction.guildId) {
      await interaction.reply({
        content: "Reminders can only be created inside a server.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const minutes = interaction.options.getInteger("minutes", true);
    const message = interaction.options.getString("message", true).trim();

    if (!message) {
      await interaction.reply({
        content: "Reminder text cannot be empty.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const reminder = reminderService.createReminder({
      guildId: interaction.guildId,
      channelId: interaction.channelId,
      userId: interaction.user.id,
      message,
      minutes,
    });

    await interaction.reply({
      content: [
        "Reminder saved.",
        `I will remind you <t:${Math.floor(reminder.dueAt / 1000)}:R>.`,
      ].join(" "),
      flags: MessageFlags.Ephemeral,
    });
  },
};
