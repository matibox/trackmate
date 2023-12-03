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

  for (const notif of testNotifications) {
    if (notif.date.date() > now.date()) return;
    const client = new Client({ intents: [GatewayIntentBits.Guilds] });

    client.once(Events.ClientReady, async () => {
      await client.users.send('459023179801952286', 'test');
      await client.destroy();
    });

    await client.login(process.env.DISCORD_BOT_TOKEN);
  }

  res.status(200);
}
