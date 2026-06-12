'use client';
import { useEffect, useState, useMemo, useRef } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';
import { Photo } from '@/lib/store';
import { THEMES } from '@/lib/themes';

// ─── Constants ───────────────────────────────────────────────────────────────
const BG = '#05070A';

const EVENT_META = {
  coupleName: ['Lisa', 'Bani'],
  date: '12 · 06 · 2026',
  location: 'JAKARTA',
  hashtag: '#LisaAndBani2026',
  quote: 'Every memory deserves a frame.',
  couplePhotoUrl: '/img/couple.jpeg' as string | null,
  captureRoute: '/capture/demo-wedding',
};

// ─── Noise grain layer ───────────────────────────────────────────────────────
function NoiseLayer() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none z-[1]"
      style={{ opacity: 0.05, mixBlendMode: 'overlay' }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <filter id="noise">
        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#noise)" />
    </svg>
  );
}

// ─── FilmStrip ───────────────────────────────────────────────────────────────
function FilmStrip({
  photos,
  opacity = 1,
  scale = 1,
  blur = 0,
  direction = 'up',
  speed = 40,
}: {
  photos: Photo[];
  opacity?: number;
  scale?: number;
  blur?: number;
  direction?: 'up' | 'down';
  speed?: number;
}) {
  const cardH = 300;
  const GAP = 12;
  const SW = 18; 
  const SH = 12; 
  const SGAP = 24; 

  // We ensure exactly 30 items per block so the height is always exactly 9360px
  const items = useMemo(() => {
    if (photos.length === 0) return [];
    const reps = Math.ceil(30 / photos.length);
    return Array.from({ length: reps }, () => photos).flat().slice(0, 30);
  }, [photos]);

  const blockHeight = 9360; // 30 * (300 + 12)
  const sprocketCount = 260; // 9360 / (12 + 24)

  const StripBlock = () => (
    <div className="relative w-full flex-shrink-0" style={{ height: blockHeight }}>
      {/* Left sprockets */}
      <div className="absolute left-0 top-0 bottom-0 flex flex-col" style={{ width: SW, gap: SGAP }}>
        {Array.from({ length: sprocketCount }).map((_, i) => (
          <div key={i} style={{ width: SW - 6, height: SH, marginLeft: 3, flexShrink: 0, background: '#050505', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 3 }} />
        ))}
      </div>
      {/* Right sprockets */}
      <div className="absolute right-0 top-0 bottom-0 flex flex-col" style={{ width: SW, gap: SGAP }}>
        {Array.from({ length: sprocketCount }).map((_, i) => (
          <div key={i} style={{ width: SW - 6, height: SH, marginLeft: 3, flexShrink: 0, background: '#050505', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 3 }} />
        ))}
      </div>
      {/* Photos */}
      {items.length > 0 && (
        <div className="absolute top-0 flex flex-col" style={{ left: SW, right: SW, gap: GAP }}>
          {items.map((photo, i) => (
            <div key={`${photo.id}-${i}`} className="flex-shrink-0 overflow-hidden relative" style={{ height: cardH, background: '#111', borderRadius: 4 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.dataUrl} alt="" className="w-full h-full object-cover" draggable={false} style={{ filter: 'saturate(0.7) brightness(0.85) contrast(1.1)' }} />
              <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: 'inset 0 0 40px rgba(0,0,0,0.6)' }} />
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div
      className="relative flex-shrink-0 overflow-hidden"
      style={{
        width: 280,
        height: '180vh', 
        opacity,
        filter: blur > 0 ? `blur(${blur}px)` : undefined,
        transform: `scale(${scale})`,
        transformOrigin: 'center center',
        boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
        borderRadius: 8,
        background: '#0a0a0a',
      }}
    >
      <motion.div
        className="absolute left-0 right-0 flex flex-col"
        style={{ gap: 0 }}
        animate={{ y: direction === 'up' ? ['0%', '-50%'] : ['-50%', '0%'] }}
        transition={{ duration: speed, ease: 'linear', repeat: Infinity }}
      >
        <StripBlock />
        <StripBlock />
      </motion.div>
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────
export default function ProjectionPage() {
  const params = useParams();
  const eventId = params.eventId as string;
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [origin, setOrigin] = useState('');
  const [coupleImgUrl, setCoupleImgUrl] = useState(EVENT_META.couplePhotoUrl || '/img/couple.jpeg');
  const isInitialFetch = useRef(true);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const qrUrl = `${origin}/capture/${eventId}`;

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const res = await fetch(`/api/photos?eventId=${eventId}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.photos) {
          setPhotos(prev => {
            if (data.photos.length > prev.length) {
              const newPhotos = data.photos.filter((np: Photo) => !prev.some(p => p.id === np.id));
              return data.photos;
            }
            if (data.photos.length < prev.length) return data.photos;
            return prev;
          });
          isInitialFetch.current = false;
        }
      } catch (e: any) { console.error(e.message); }
    };
    fetchPhotos();
    const iv = setInterval(fetchPhotos, 2000);
    return () => clearInterval(iv);
  }, [eventId]);

  const NUM_STRIPS = 4;

  const stripPhotoSets = useMemo(() => {
    const reversedPhotos = [...photos].reverse();
    if (reversedPhotos.length === 0) return [[], [], [], []];

    // Snake Priority Offset:
    // We want all strips to contain ALL photos so they stack vertically.
    // BUT we offset them so the NEWEST photo appears in the Main strip first.
    // Strip 2 (Main hero) -> Offset 0 (Newest photo)
    // Strip 1 (Secondary left) -> Offset 1 (2nd newest)
    // Strip 3 (Background right) -> Offset 2 (3rd newest)
    // Strip 0 (Background left) -> Offset 3 (4th newest)
    const stripOffsets: Record<number, number> = {
      2: 0,
      1: 1,
      3: 2,
      0: 3,
    };
    
    return Array.from({ length: NUM_STRIPS }).map((_, i) => {
      const idealOffset = stripOffsets[i];
      const actualOffset = idealOffset % reversedPhotos.length;
      return [...reversedPhotos.slice(actualOffset), ...reversedPhotos.slice(0, actualOffset)];
    });
  }, [photos]);

  const stripsConfig: any[] = [
    { scale: 0.9, opacity: 0.9, direction: 'down', speed: 1800 },  // Background left
    { scale: 1.15, opacity: 0.85, direction: 'up', speed: 1500 },  // Foreground mid-left
    { scale: 1.45, opacity: 1.0, direction: 'down', speed: 1200 },   // Main hero center
    { scale: 0.85, opacity: 0.8, direction: 'up', speed: 1500 },  // Background right
  ];

  return (
    <div className="fixed inset-0 overflow-hidden font-sans text-white select-none"
      style={{ background: BG }}>

      {/* ══════════════════════════════════════════
          BACKGROUND & LEFT PANEL
      ══════════════════════════════════════════ */}
      {/* Couple Photo Background */}
      <div className="absolute inset-y-0 left-0 w-[50%] z-[0] pointer-events-none"
        style={{
          WebkitMaskImage: 'linear-gradient(to right, black 50%, transparent 100%)',
          maskImage: 'linear-gradient(to right, black 50%, transparent 100%)'
        }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={coupleImgUrl} alt=""
          className="w-full h-full object-cover"
          style={{ filter: 'brightness(0.5) saturate(0.5)' }}
          onError={() => {
            if (coupleImgUrl.endsWith('.jpeg')) setCoupleImgUrl('/img/couple.jpg');
            else if (coupleImgUrl.endsWith('.jpg')) setCoupleImgUrl('/img/couple.png');
          }}
        />
      </div>

      {/* Cinematic Base Background */}
      <div className="absolute inset-0 z-[0] pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 120% 120% at 50% 50%, transparent 0%, rgba(5,7,10,0.85) 60%, #05070A 100%)`,
        }} />

      {/* ══════════════════════════════════════════
          FILM STRIPS (DIAGONAL MASK)
      ══════════════════════════════════════════ */}
      <div className="absolute inset-0 z-[1] overflow-hidden pointer-events-none">

        {/* Cinematic Background Gradient specifically for the right area */}
        <div className="absolute inset-0 z-[0] pointer-events-none"
          style={{
            background: `radial-gradient(circle at 50% 50%, transparent 0%, rgba(5,7,10,0.8) 100%)`,
          }} />

        {/* ── Film Strips Container ── */}
        {/* Menambahkan offset kiri 15vw agar lebih bergeser ke kanan */}
        <div className="absolute inset-y-0 -right-[20vw] left-[15vw] flex items-center justify-center pointer-events-none">
          <div
            className="flex flex-row justify-center items-center gap-10"
            style={{
              width: '180%',
              transform: 'rotate(-25deg)',
              WebkitMaskImage: 'linear-gradient(to right, transparent 35%, black 48%)',
              maskImage: 'linear-gradient(to right, transparent 35%, black 48%)',
            }}
          >
            {stripPhotoSets.some(s => s.length > 0) ? (
              stripsConfig.map((s, i) => (
                <FilmStrip key={i} photos={stripPhotoSets[i] ?? []} {...s} />
              ))
            ) : (
              <div className="flex gap-3 items-center justify-center h-full w-full">
                {[0, 1, 2].map(i => (
                  <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-white/20"
                    animate={{ opacity: [0.2, 0.8, 0.2] }}
                    transition={{ duration: 2, delay: i * 0.4, repeat: Infinity }} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>



      {/* ── Noise grain over everything but text ── */}
      <div className="z-[3] absolute inset-0 pointer-events-none">
        <NoiseLayer />
      </div>

      {/* ── Subtle pink ambient glow behind names ── */}
      <div className="absolute z-[4] pointer-events-none"
        style={{
          left: '12%', top: '50%',
          width: 600, height: 600,
          background: 'radial-gradient(circle, rgba(244,168,183,0.06) 0%, transparent 60%)',
          transform: 'translate(-50%, -50%)',
        }} />

      {/* ══════════════════════════════════════════
          INFORMATION LAYER
      ══════════════════════════════════════════ */}
      <div className="absolute inset-0 z-[10] pointer-events-none">

        {/* ── Logo ── */}
        <motion.div className="absolute top-12 left-12"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ duration: 2, ease: 'easeOut' }}>
          <span className="text-[10px] tracking-[0.5em] uppercase text-white/30 font-light">
            Memoire
          </span>
        </motion.div>

        {/* ── Couple Names, Date & Quote ── */}
        <div className="absolute" style={{ top: '48%', left: '12%', transform: 'translateY(-50%)' }}>

          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="flex justify-center mb-6"
          >
            <span className="font-sans font-light uppercase"
              style={{ fontSize: '0.7rem', letterSpacing: '0.4em', color: 'rgba(255,255,255,0.6)' }}>
              {EVENT_META.date}
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="flex flex-col items-center"
          >
            <div className="font-serif leading-[0.9] text-white/95"
              style={{ fontSize: 'clamp(4rem, 7vw, 7.5rem)', fontWeight: 300, letterSpacing: '-0.02em' }}>
              {EVENT_META.coupleName[0]}
            </div>

            {/* Glowing Ampersand */}
            <div
              className="font-serif italic leading-none my-4"
              style={{
                fontSize: 'clamp(2.5rem, 4.5vw, 4rem)',
                fontWeight: 300,
                color: '#F4A8B7',
                textShadow: '0 0 40px rgba(244,168,183,0.3)',
              }}
            >
              &amp;
            </div>

            <div className="font-serif leading-[0.9] text-white/95"
              style={{ fontSize: 'clamp(4rem, 7vw, 7.5rem)', fontWeight: 300, letterSpacing: '-0.02em' }}>
              {EVENT_META.coupleName[1]}
            </div>
          </motion.div>

          <motion.p
            className="font-sans font-light text-center mt-12"
            style={{ fontSize: 'clamp(0.65rem, 1vw, 0.85rem)', letterSpacing: '0.25em', color: 'rgba(255,255,255,0.45)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1.5 }}>
            {EVENT_META.quote.toUpperCase()}
          </motion.p>
        </div>



        {/* ── QR Card ── */}
        <motion.div
          className="absolute bottom-12 right-12 flex flex-col gap-6"
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 24,
            padding: '28px 32px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            backdropFilter: 'blur(20px)',
            pointerEvents: 'auto',
          }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 1.5, ease: 'easeOut' }}
        >
          <div className="flex items-center gap-8">
            {/* Text on left */}
            <div className="flex flex-col gap-2">
              <p className="font-sans font-light uppercase"
                style={{ fontSize: '0.65rem', letterSpacing: '0.35em', color: 'rgba(255,255,255,0.6)' }}>
                Scan to Share
              </p>
              <p className="font-sans font-light uppercase"
                style={{ fontSize: '0.65rem', letterSpacing: '0.35em', color: 'rgba(255,255,255,0.6)' }}>
                Your Photo
              </p>
              <p className="font-sans font-light mt-2"
                style={{ fontSize: '0.6rem', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.25)' }}>
                Join the collection
              </p>
            </div>

            {/* QR code on right */}
            <div className="flex-shrink-0 rounded-[10px] overflow-hidden bg-white p-[8px]"
              style={{ boxShadow: '0 10px 30px rgba(0,0,0,0.4)' }}>
              {origin ? (
                <QRCodeSVG value={qrUrl} size={84} bgColor="#ffffff" fgColor={BG} level="M" />
              ) : (
                <div style={{ width: 84, height: 84, background: '#e5e5e5' }} />
              )}
            </div>
          </div>
        </motion.div>

        {/* ── LIVE WALL badge ── */}
        <motion.div
          className="absolute top-12 right-12 flex items-center gap-3 px-5 py-2.5"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 100,
            backdropFilter: 'blur(10px)',
          }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1.5 }}
        >
          <motion.span
            className="rounded-full flex-shrink-0"
            style={{ width: 6, height: 6, background: '#ef4444', boxShadow: '0 0 10px rgba(239,68,68,0.5)' }}
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
          <span style={{ fontSize: '0.65rem', letterSpacing: '0.35em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>
            Live Wall
          </span>
        </motion.div>

      </div>
    </div>
  );
}
