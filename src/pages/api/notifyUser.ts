import dayjs from 'dayjs';
import type { NextApiRequest, NextApiResponse } from 'next';
import { Client, Events, GatewayIntentBits } from 'discord.js';

const testNotifications = [
  {
    date: dayjs().subtract(1, 'day'),
  },
  {
    date: dayjs().add(1, 'day'),
  },
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const now = dayjs();
  const client = new Client({ intents: [GatewayIntentBits.Guilds] });

  for (const notif of testNotifications) {
    if (notif.date.date() <= now.date()) {
      await client.login(process.env.DISCORD_BOT_TOKEN);
      client.once(Events.ClientReady, async () => {
        await client.users.send('459023179801952286', 'test');
        await client.destroy();
      });
    }
  }

  res.status(201).end();
}
