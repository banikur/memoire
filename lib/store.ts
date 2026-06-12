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
  // If global memory still has dummy photos from before the reload, we clear it out!
  if (!global._memoirePhotos || global._memoirePhotos.some(p => p.id.startsWith('dummy'))) {
    // Seed with any already-uploaded files on disk
    const uploaded = loadUploadedPhotos();
    global._memoirePhotos = [...uploaded];
  }
  return global._memoirePhotos;
};
