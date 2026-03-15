import { mkdirSync } from "node:fs";
import { join } from "node:path";

import { Database } from "bun:sqlite";
import type { Client } from "discord.js";

const DATABASE_DIRECTORY = join(process.cwd(), "data");
const DATABASE_PATH = join(DATABASE_DIRECTORY, "reminders.sqlite");
const MAX_REMINDER_MINUTES = 60 * 24 * 7;
const RETRY_DELAY_MS = 60_000;

interface ReminderRecord {
  id: number;
  guildId: string;
  channelId: string;
  userId: string;
  message: string;
  dueAt: number;
  createdAt: number;
}

interface CreateReminderInput {
  guildId: string;
  channelId: string;
  userId: string;
  message: string;
  minutes: number;
}

mkdirSync(DATABASE_DIRECTORY, { recursive: true });

const database = new Database(DATABASE_PATH);

database.exec(`
  CREATE TABLE IF NOT EXISTS reminders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guild_id TEXT NOT NULL,
    channel_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    message TEXT NOT NULL,
    due_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL
  )
`);

const insertReminder = database.query(`
  INSERT INTO reminders (guild_id, channel_id, user_id, message, due_at, created_at)
  VALUES (?, ?, ?, ?, ?, ?)
`);

const getReminderById = database.query(`
  SELECT
    id,
    guild_id AS guildId,
    channel_id AS channelId,
    user_id AS userId,
    message,
    due_at AS dueAt,
    created_at AS createdAt
  FROM reminders
  WHERE id = ?
`);

const getPendingReminders = database.query(`
  SELECT
    id,
    guild_id AS guildId,
    channel_id AS channelId,
    user_id AS userId,
    message,
    due_at AS dueAt,
    created_at AS createdAt
  FROM reminders
  ORDER BY due_at ASC
`);

const deleteReminder = database.query(`
  DELETE FROM reminders
  WHERE id = ?
`);

function getReminderText(reminder: ReminderRecord) {
  return [
    `Reminder for <@${reminder.userId}>:`,
    reminder.message,
    `Set <t:${Math.floor(reminder.createdAt / 1000)}:R>`,
  ].join("\n");
}

class ReminderService {
  private client: Client | null = null;
  private readonly timers = new Map<number, ReturnType<typeof setTimeout>>();
  private started = false;

  start(client: Client) {
    this.client = client;

    if (this.started) {
      return;
    }

    this.started = true;

    const reminders = getPendingReminders.all() as ReminderRecord[];

    for (const reminder of reminders) {
      this.schedule(reminder);
    }

    console.log(`Loaded ${reminders.length} reminder(s) from SQLite.`);
  }

  createReminder(input: CreateReminderInput) {
    const minutes = Math.max(1, Math.min(input.minutes, MAX_REMINDER_MINUTES));
    const createdAt = Date.now();
    const dueAt = createdAt + minutes * 60_000;

    const result = insertReminder.run(
      input.guildId,
      input.channelId,
      input.userId,
      input.message,
      dueAt,
      createdAt,
    );

    const reminder = getReminderById.get(
      Number(result.lastInsertRowid),
    ) as ReminderRecord | null;

    if (!reminder) {
      throw new Error("Reminder was created but could not be reloaded.");
    }

    this.schedule(reminder);

    return reminder;
  }

  private schedule(reminder: ReminderRecord) {
    this.clearTimer(reminder.id);

    const delay = Math.max(reminder.dueAt - Date.now(), 0);
    const timer = setTimeout(() => {
      void this.deliver(reminder.id);
    }, delay);

    this.timers.set(reminder.id, timer);
  }

  private clearTimer(id: number) {
    const timer = this.timers.get(id);

    if (!timer) {
      return;
    }

    clearTimeout(timer);
    this.timers.delete(id);
  }

  private async deliver(id: number) {
    this.clearTimer(id);

    const reminder = getReminderById.get(id) as ReminderRecord | null;

    if (!reminder || !this.client) {
      return;
    }

    try {
      const channel = await this.client.channels.fetch(reminder.channelId);

      if (channel?.isTextBased() && "send" in channel) {
        await channel.send(getReminderText(reminder));
        deleteReminder.run(reminder.id);
        return;
      }

      const user = await this.client.users.fetch(reminder.userId);
      await user.send(getReminderText(reminder));
      deleteReminder.run(reminder.id);
    } catch (error) {
      console.error(`Failed to deliver reminder ${reminder.id}. Retrying soon.`);
      console.error(error);

      const retryAt = reminder.dueAt <= Date.now()
        ? Date.now() + RETRY_DELAY_MS
        : reminder.dueAt;

      this.schedule({
        ...reminder,
        dueAt: retryAt,
      });
    }
  }
}

export const reminderService = new ReminderService();
