import { NextResponse } from 'next/server';
import { getStore } from '@/lib/store';
import fs from 'fs';
import path from 'path';

// Ensure public/upload exists at runtime
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'upload');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const eventId = searchParams.get('eventId');
  const since = searchParams.get('since');

  const store = getStore();
  let filtered = store;

  if (eventId) {
    filtered = filtered.filter(p => p.eventId === eventId);
  }
  if (since && !isNaN(Number(since))) {
    filtered = filtered.filter(p => p.createdAt > Number(since));
  }

  return NextResponse.json({ photos: filtered });
}

export async function POST(req: Request) {
  const body = await req.json();
  const store = getStore();

  const id = Math.random().toString(36).substring(2, 10);
  let dataUrl: string = body.dataUrl;

  // If it's a base64 data URL, save to disk and replace with a public URL
  if (dataUrl && dataUrl.startsWith('data:image/')) {
    try {
      const matches = dataUrl.match(/^data:image\/(\w+);base64,(.+)$/);
      if (matches) {
        const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
        const buffer = Buffer.from(matches[2], 'base64');
        const filename = `${id}.${ext}`;
        fs.writeFileSync(path.join(UPLOAD_DIR, filename), buffer);
        // Serve via API route so it's always fresh (not blocked by Next.js static cache)
        dataUrl = `/api/upload/${filename}`;
      }
    } catch (err) {
      console.error('Failed to save photo to disk:', err);
      // Fall back to keeping the base64 dataUrl
    }
  }

  const newPhoto = {
    id,
    eventId: body.eventId || 'demo',
    dataUrl,
    guestName: body.guestName || 'Guest',
    theme: body.theme || 'minimal',
    createdAt: Date.now(),
  };

  // Keep store size manageable for prototype
  if (store.length > 500) {
    store.shift();
  }

  store.push(newPhoto);

  return NextResponse.json({ photo: newPhoto });
}
