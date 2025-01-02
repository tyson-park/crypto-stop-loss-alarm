import { NextResponse } from 'next/server';

// Environment variable for the bot token
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN || '';
if (!BOT_TOKEN) {
  throw new Error('Discord bot token is missing from environment variables.');
}

const BASE_URL = 'https://discord.com/api/v10';

// Helper function to make authenticated API requests
async function discordApiRequest(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bot ${BOT_TOKEN}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `Discord API Error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`
    );
  }
  const data = await response.json();
  console.log(data);
  return data;
}

// Function to get user ID by username
async function getUserIdByUsername(username: string): Promise<string | null> {
  try {
    const guilds = await discordApiRequest('/users/@me/guilds');
    for (const guild of guilds) {
      const members = await discordApiRequest(`/guilds/${guild.id}/members?limit=1000`);
      const member = members.find((m: any) => (m.user.username) === username);

      if (member) {
        return member.user.id;
      }
    }

    return null;
  } catch (error) {
    console.error(`Error finding user by username "${username}":`, error);
    return null;
  }
}

// Function to send a DM to a user by their ID
async function sendDM(userId: string, message: string): Promise<void> {
  try {
    const dmChannel = await discordApiRequest('/users/@me/channels', {
      method: 'POST',
      body: JSON.stringify({ recipient_id: userId }),
    });

    await discordApiRequest(`/channels/${dmChannel.id}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content: message }),
    });

    console.log(`Message successfully sent to user ID ${userId}`);
  } catch (error) {
    console.error(`Error sending DM to user "${userId}":`, error);
    throw error;
  }
}

// API route handler
export async function POST(req: Request) {
  try {
    const { username, message } = await req.json();

    // Input validation
    if (!username || typeof username !== 'string') {
      return NextResponse.json({ error: 'Invalid or missing "username".' }, { status: 400 });
    }
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Invalid or missing "message".' }, { status: 400 });
    }

    // Step 1: Get the user ID by username across all guilds
    const userId = await getUserIdByUsername(username);
    if (!userId) {
      return NextResponse.json(
        { error: `User with username "${username}" not found in any guild.` },
        { status: 404 }
      );
    }

    // Step 2: Send a DM to the user
    await sendDM(userId, message);

    return NextResponse.json(
      { success: true, message: `DM successfully sent to user with username "${username}".` },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in API route handler:', error);
    return NextResponse.json(
      { error: 'Failed to send DM. Please check the server logs for details.' },
      { status: 500 }
    );
  }
}