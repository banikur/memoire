import { ThemeId } from './themes';
import fs from 'fs';
import path from 'path';

export type Photo = {
  id: string;
  eventId: string;
  dataUrl: string; // /api/upload/xxx.jpg or https://... (dummy)
  guestName: string;
  theme: ThemeId;
  createdAt: number;
};

const DUMMY_PHOTOS: Photo[] = [
  {
    id: 'dummy-1',
    eventId: 'demo-wedding',
    dataUrl: 'https://picsum.photos/seed/wedding1/800/600',
    guestName: 'Lisa & Bani',
    theme: 'polaroid',
    createdAt: Date.now() - 100000,
  },
  {
    id: 'dummy-2',
    eventId: 'demo-wedding',
    dataUrl: 'https://picsum.photos/seed/wedding2/800/600',
    guestName: 'Charlie',
    theme: 'minimal',
    createdAt: Date.now() - 80000,
  },
  {
    id: 'dummy-3',
    eventId: 'demo-wedding',
    dataUrl: 'https://picsum.photos/seed/wedding3/800/600',
    guestName: 'Dave',
    theme: 'rustic',
    createdAt: Date.now() - 60000,
  },
  {
    id: 'dummy-4',
    eventId: 'demo-wedding',
    dataUrl: 'https://picsum.photos/seed/wedding4/800/600',
    guestName: 'Eve',
    theme: 'dark',
    createdAt: Date.now() - 40000,
  },
  {
    id: 'dummy-5',
    eventId: 'demo-wedding',
    dataUrl: 'https://picsum.photos/seed/wedding5/800/600',
    guestName: 'Frank & Grace',
    theme: 'polaroid',
    createdAt: Date.now() - 20000,
  },
];

/**
 * Scan public/upload/ and return Photo entries for any files not already in store.
 * This ensures uploaded files persisted on disk survive server restarts.
 */
function loadUploadedPhotos(): Photo[] {
  try {
    const uploadDir = path.join(process.cwd(), 'public', 'upload');
    if (!fs.existsSync(uploadDir)) return [];

    const exts = new Set(['.jpg', '.jpeg', '.png', '.webp']);
    const files = fs
      .readdirSync(uploadDir)
      .filter(f => exts.has(path.extname(f).toLowerCase()))
      .sort(); // oldest first by filename (id is random but consistent)

    return files.map((filename, i) => {
      const id = path.basename(filename, path.extname(filename));
      const stat = fs.statSync(path.join(uploadDir, filename));
      return {
        id,
        eventId: 'demo-wedding',
        dataUrl: `/api/upload/${filename}`,
        guestName: 'Guest',
        theme: 'minimal' as ThemeId,
        createdAt: stat.mtimeMs - i, // keep order
      };
    });
  } catch {
    return [];
  }
}

declare global {
  var _memoirePhotos: Photo[] | undefined;
}

export const getStore = (): Photo[] => {
  if (!global._memoirePhotos) {
    // Seed with dummy + any already-uploaded files on disk
    const uploaded = loadUploadedPhotos();
    const uploadedIds = new Set(uploaded.map(p => p.id));

    // Keep dummy photos that don't clash with real uploaded IDs
    const dummies = DUMMY_PHOTOS.filter(p => !uploadedIds.has(p.id));

    global._memoirePhotos = [...dummies, ...uploaded];
  }
  return global._memoirePhotos;
};
