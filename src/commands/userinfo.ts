import { GuildMember, SlashCommandBuilder } from "discord.js";

import type { Command } from "../types/command.js";

export const userInfoCommand: Command = {
  data: new SlashCommandBuilder()
    .setName("userinfo")
    .setDescription("Show information about your Discord account."),
  async execute(interaction) {
    const member =
      interaction.member instanceof GuildMember ? interaction.member : null;
    const createdAt = Math.floor(interaction.user.createdTimestamp / 1000);
    const joinedAt = member?.joinedTimestamp
      ? Math.floor(member.joinedTimestamp / 1000)
      : null;

    await interaction.reply({
      content: [
        `User: ${interaction.user.tag}`,
        `Display name: ${member?.displayName ?? interaction.user.username}`,
        `User ID: ${interaction.user.id}`,
        `Account created: <t:${createdAt}:F>`,
        joinedAt ? `Joined server: <t:${joinedAt}:F>` : "Joined server: Unknown",
      ].join("\n"),
    });
  },
};
