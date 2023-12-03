import { Client, Events, GatewayIntentBits } from 'discord.js';

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, () => {
  console.log('Bot is ready!');
});

void client.login(process.env.DISCORD_BOT_TOKEN);

// Function to send a direct message to a user
export async function sendDirectMessage(userId: string, message: string) {
  await client.users.send(userId, message);
}

// Schedule a task to send a message 1 minute after the API call
