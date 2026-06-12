'use client';
import { useEffect, useState, useMemo, useRef } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence, useAnimationFrame } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';
import { Photo } from '@/lib/store';
import { THEMES } from '@/lib/themes';

// ─── Constants ───────────────────────────────────────────────────────────────
const SKEW = -12;
const BG = '#05070A';

const EVENT_META = {
  coupleName: ['Alice', 'Bob'],
  date: '12 · 06 · 2026',
  location: 'JAKARTA',
  hashtag: '#AliceAndBob2026',
  quote: 'Every memory deserves a frame.',
  couplePhotoUrl: '/img/couple.jpeg' as string | null,
  captureRoute: '/capture/demo-wedding',
};

// ─── Noise grain layer ───────────────────────────────────────────────────────
function NoiseLayer() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none z-[1]"
      style={{ opacity: 0.035, mixBlendMode: 'overlay' }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <filter id="noise">
        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#noise)" />
    </svg>
  );
}

// ─── FilmStrip ───────────────────────────────────────────────────────────────
function FilmStrip({
  photos,
  direction,
  speed,
  widthPct,
  opacity = 1,
  scale = 1,
  blur = 0,
}: {
  photos: Photo[];
  direction: 'up' | 'down';
  speed: number;
  widthPct: number;
  opacity?: number;
  scale?: number;
  blur?: number;
}) {
  const yRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [cardH, setCardH] = useState(120);

  useEffect(() => {
    if (!wrapRef.current) return;
    const ro = new ResizeObserver(([e]) => {
      const innerW = e.contentRect.width - 28;
      setCardH(Math.round(innerW * 0.75));
    });
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  const GAP = 8;
  const singleH = photos.length * (cardH + GAP);

  const items = useMemo(() => {
    if (photos.length === 0) return [];
    const reps = Math.max(4, Math.ceil(2600 / Math.max(1, photos.length * (cardH + GAP))) + 2);
    return Array.from({ length: reps }, () => photos).flat();
  }, [photos, cardH]);

  const SW = 13;
  const SH = 9;
  const SGAP = Math.max(0, cardH + GAP - SH);

  useAnimationFrame((_, delta) => {
    if (!containerRef.current || singleH === 0) return;
    const step = (delta / 1000) * speed;
    if (direction === 'up') {
      yRef.current -= step;
      if (yRef.current <= -singleH) yRef.current += singleH;
    } else {
      yRef.current += step;
      if (yRef.current >= singleH) yRef.current -= singleH;
    }
    containerRef.current.style.transform = `translateY(${yRef.current}px)`;
  });

  return (
    <div
      ref={wrapRef}
      className="relative overflow-hidden flex-shrink-0"
      style={{
        width: `${widthPct}vw`,
        marginTop: '-80%',
        height: '260%',
        background: '#0a0a0a',
        borderLeft: '1px solid rgba(255,255,255,0.04)',
        borderRight: '1px solid rgba(255,255,255,0.04)',
        transform: `skewX(${SKEW}deg) scale(${scale})`,
        transformOrigin: 'center top',
        opacity,
        filter: blur > 0 ? `blur(${blur}px)` : undefined,
      }}
    >
      {/* Left sprockets */}
      <div className="absolute left-0 top-0 bottom-0 overflow-hidden flex flex-col pt-4"
        style={{ width: SW, gap: SGAP }}>
        {Array.from({ length: 100 }).map((_, i) => (
          <div key={i} style={{ width: SW - 4, height: SH, marginLeft: 2, flexShrink: 0, background: '#050505', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 2 }} />
        ))}
      </div>
      {/* Right sprockets */}
      <div className="absolute right-0 top-0 bottom-0 overflow-hidden flex flex-col pt-4"
        style={{ width: SW, gap: SGAP }}>
        {Array.from({ length: 100 }).map((_, i) => (
          <div key={i} style={{ width: SW - 4, height: SH, marginLeft: 2, flexShrink: 0, background: '#050505', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 2 }} />
        ))}
      </div>

      {/* Photos */}
      <div ref={containerRef} className="absolute top-0 flex flex-col"
        style={{ left: SW, right: SW, gap: GAP, willChange: 'transform' }}>
        {items.map((photo, i) => (
          <div key={`${photo.id}-${i}`} className="flex-shrink-0 overflow-hidden relative"
            style={{ height: cardH, background: '#111' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.dataUrl}
              alt=""
              className="w-full h-full object-cover"
              draggable={false}
              style={{ filter: 'saturate(0.82) brightness(0.92)' }}
            />
            {/* Per-photo vignette */}
            <div className="absolute inset-0 pointer-events-none"
              style={{ boxShadow: 'inset 0 0 18px rgba(0,0,0,0.55)' }} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Highlight overlay ───────────────────────────────────────────────────────
function HighlightOverlay({ photo, onDone }: { photo: Photo; onDone: () => void }) {
  const themeDef = THEMES[photo.theme] || THEMES.minimal;
  useEffect(() => {
    const t = setTimeout(onDone, 7000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div
      className="absolute inset-0 z-50 flex items-center justify-center p-16"
      style={{ backdropFilter: 'blur(40px)', background: 'rgba(5,7,10,0.88)' }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
    >
      <motion.div
        initial={{ scale: 0.92, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: -20 }}
        transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
        className={`relative flex flex-col w-full max-w-xl shadow-[0_40px_80px_rgba(0,0,0,0.9)] ${themeDef.wrapperClass}`}
      >
        <div className="w-full aspect-[4/3] overflow-hidden bg-neutral-900 relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo.dataUrl} alt={photo.guestName}
            className="w-full h-full object-cover"
            style={{ filter: 'saturate(0.9)' }} />
          <div className="absolute inset-0" style={{ boxShadow: 'inset 0 0 30px rgba(0,0,0,0.4)' }} />
        </div>
        <div className="pt-6 pb-4 flex flex-col items-center w-full gap-2">
          <motion.p className={`text-2xl text-center ${themeDef.textClass}`}
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}>
            {photo.guestName}
          </motion.p>
          <motion.p
            className="text-[10px] tracking-[0.35em] uppercase text-neutral-500"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 0.65, duration: 0.6 }}>
            Just added to the wall
          </motion.p>
        </div>
      </motion.div>

      {/* Countdown bar */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-32 h-px bg-white/8 overflow-hidden">
        <motion.div className="h-full"
          style={{ background: 'rgba(244,168,183,0.5)' }}
          initial={{ width: '100%' }} animate={{ width: '0%' }}
          transition={{ duration: 7, ease: 'linear' }} />
      </div>
    </motion.div>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────
export default function ProjectionPage() {
  const params = useParams();
  const eventId = params.eventId as string;
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [highlightPhoto, setHighlightPhoto] = useState<Photo | null>(null);
  const [origin, setOrigin] = useState('');
  // guestsOnline diinisialisasi di useEffect (client-only) supaya tidak hydration mismatch
  const [guestsOnline, setGuestsOnline] = useState(0);
  // Flag: apakah ini fetch pertama? Kalau ya, jangan trigger highlight
  const isInitialFetch = useRef(true);

  useEffect(() => {
    setOrigin(window.location.origin);
    setGuestsOnline(Math.floor(Math.random() * 18) + 4);
  }, []);

  // QR mengarah ke halaman capture untuk eventId yang sedang aktif
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
              // Jangan trigger highlight pada fetch pertama (initial load)
              if (newPhotos.length > 0 && !isInitialFetch.current)
                setTimeout(() => setHighlightPhoto(newPhotos[newPhotos.length - 1]), 0);
              return data.photos;
            }
            if (data.photos.length < prev.length) return data.photos;
            return prev;
          });
          // Setelah fetch pertama selesai, aktifkan highlight untuk fetch berikutnya
          isInitialFetch.current = false;
        }
      } catch (e: any) { console.error(e.message); }
    };
    fetchPhotos();
    const iv = setInterval(fetchPhotos, 2000);
    return () => clearInterval(iv);
  }, [eventId]);

  const NUM_STRIPS = 3;

  const stripPhotoSets = useMemo(() => {
    const MIN_PER_STRIP = 4;
    const buckets: Photo[][] = Array.from({ length: NUM_STRIPS }, () => []);
    photos.forEach((photo, i) => { buckets[i % NUM_STRIPS].push(photo); });
    return buckets.map(bucket => {
      const base = bucket.length > 0 ? bucket : photos;
      if (base.length === 0) return [];
      const padded = [...base];
      while (padded.length < MIN_PER_STRIP) padded.push(...base);
      return padded;
    });
  }, [photos]);

  // 3 strip — kiri & kanan lebih redup, tengah paling terang
  const strips: {
    widthPct: number; speed: number; direction: 'up' | 'down';
    opacity: number; blur: number;
  }[] = [
    { widthPct: 14, speed: 18, direction: 'down', opacity: 0.55, blur: 1.2 },
    { widthPct: 16, speed: 13, direction: 'up',   opacity: 1.0,  blur: 0   },
    { widthPct: 14, speed: 20, direction: 'down', opacity: 0.55, blur: 1.2 },
  ];

  return (
    <div className="fixed inset-0 overflow-hidden font-sans text-white select-none"
      style={{ background: BG }}>

      {/* ── Noise grain ── */}
      <NoiseLayer />

      {/* ── Cinematic vignette ── */}
      <div className="absolute inset-0 z-[2] pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 100% 90% at 50% 50%,
            transparent 30%, rgba(5,7,10,0.45) 70%, rgba(5,7,10,0.85) 100%)`,
        }} />

      {/* ── Couple photo background, very dim ── */}
      {EVENT_META.couplePhotoUrl && (
        <div className="absolute inset-0 z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={EVENT_META.couplePhotoUrl} alt=""
            className="w-full h-full object-cover"
            style={{ filter: 'brightness(0.12) saturate(0.3)', transform: 'scale(1.05)' }} />
        </div>
      )}

      {/* ── Subtle pink ambient glow from center-left (the "&") ── */}
      <div className="absolute z-[3] pointer-events-none"
        style={{
          left: '8%', top: '40%',
          width: 500, height: 400,
          background: 'radial-gradient(ellipse, rgba(244,168,183,0.04) 0%, transparent 70%)',
          transform: 'translate(-50%, -50%)',
        }} />

      {/* ══════════════════════════════════════════
          FILMSTRIP PANEL — starts at 42vw, overflows right
      ══════════════════════════════════════════ */}
      <div
        className="absolute top-0 bottom-0 flex flex-row items-start gap-[5px] z-10"
        style={{ left: 'calc(100vw - 47vw - 5px)', width: '48vw', overflow: 'visible' }}
      >
        {stripPhotoSets.some(s => s.length > 0) ? (
          strips.map((s, i) => (
            <FilmStrip key={i} photos={stripPhotoSets[i] ?? []} {...s} />
          ))
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex gap-3">
              {[0, 1, 2].map(i => (
                <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-white/20"
                  animate={{ opacity: [0.2, 0.8, 0.2] }}
                  transition={{ duration: 2, delay: i * 0.4, repeat: Infinity }} />
              ))}
            </div>
          </div>
        )}

        {/* Top/bottom fade */}
        <div className="absolute inset-x-0 top-0 h-48 pointer-events-none z-10"
          style={{ background: `linear-gradient(to bottom, ${BG}, transparent)` }} />
        <div className="absolute inset-x-0 bottom-0 h-48 pointer-events-none z-10"
          style={{ background: `linear-gradient(to top, ${BG}, transparent)` }} />
      </div>

      {/* ══════════════════════════════════════════
          DIAGONAL SEAMLESS DIVIDER — skewed same as strips
      ══════════════════════════════════════════ */}
      <div className="absolute inset-y-0 z-20 pointer-events-none"
        style={{
          left: 'calc(100vw - 47vw - 105px)',
          width: 380,
          transform: `skewX(${SKEW}deg)`,
          transformOrigin: 'center',
          background: `linear-gradient(to right,
            ${BG} 0%, ${BG} 25%,
            rgba(5,7,10,0.93) 50%,
            rgba(5,7,10,0.42) 73%,
            transparent 100%)`,
        }} />

      {/* ══════════════════════════════════════════
          LEFT PANEL BACKGROUND
      ══════════════════════════════════════════ */}
      <div className="absolute inset-y-0 left-0 z-20 pointer-events-none"
        style={{
          width: '46%',
          background: `linear-gradient(to right, ${BG} 0%, ${BG} 68%, transparent 100%)`,
        }} />

      {/* ══════════════════════════════════════════
          LEFT PANEL CONTENT
      ══════════════════════════════════════════ */}
      <div className="absolute inset-y-0 left-0 z-30 flex flex-col justify-between"
        style={{ width: '40%' }}>

        {/* ── Branding ── */}
        <motion.div className="flex items-center gap-2.5 px-12 pt-10"
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}>
          <span className="text-[10px] tracking-[0.5em] uppercase text-white/25 font-light">
            Memoire
          </span>
        </motion.div>

        {/* ── Hero names + quote ── */}
        <div className="flex flex-col px-12 gap-0">

          {/* Names word art */}
          <motion.div
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="font-serif leading-[0.88] text-white/90"
              style={{ fontSize: 'clamp(3.8rem, 6.5vw, 6rem)', fontWeight: 300, letterSpacing: '-0.01em' }}>
              {EVENT_META.coupleName[0]}
            </div>

            {/* Ampersand with soft pink glow */}
            <div
              className="font-serif italic leading-none"
              style={{
                fontSize: 'clamp(2.6rem, 4.2vw, 3.8rem)',
                fontWeight: 300,
                color: '#F4A8B7',
                textShadow: '0 0 30px rgba(244,168,183,0.25)',
                marginLeft: '0.08em',
                marginTop: '-0.06em',
                marginBottom: '-0.06em',
              }}
            >
              &amp;
            </div>

            <div className="font-serif leading-[0.88] text-white/90"
              style={{ fontSize: 'clamp(3.8rem, 6.5vw, 6rem)', fontWeight: 300, letterSpacing: '-0.01em' }}>
              {EVENT_META.coupleName[1]}
            </div>
          </motion.div>

          {/* Quote */}
          <motion.p
            className="font-sans font-light text-white/40 mt-7"
            style={{ fontSize: 'clamp(0.62rem, 0.9vw, 0.78rem)', letterSpacing: '0.22em' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 1 }}>
            {EVENT_META.quote.toUpperCase()}
          </motion.p>

          {/* Thin divider */}
          <motion.div
            className="my-7"
            style={{ height: '1px', background: 'rgba(255,255,255,0.08)' }}
            initial={{ scaleX: 0, originX: 0 }} animate={{ scaleX: 1 }}
            transition={{ delay: 0.7, duration: 1.2, ease: 'easeOut' }}
          />

          {/* Date & location */}
          <motion.p
            className="font-sans font-light uppercase"
            style={{ fontSize: 'clamp(0.6rem, 0.85vw, 0.75rem)', letterSpacing: '0.3em', color: 'rgba(255,255,255,0.35)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 0.75, duration: 0.8 }}>
            {EVENT_META.date} — {EVENT_META.location}
          </motion.p>

          {/* Hashtag */}
          <motion.p
            className="font-mono mt-2"
            style={{ fontSize: 'clamp(0.6rem, 0.85vw, 0.75rem)', letterSpacing: '0.08em', color: 'rgba(255,255,255,0.28)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 0.85, duration: 0.8 }}>
            {EVENT_META.hashtag}
          </motion.p>

          {/* Live counters */}
          <motion.div className="flex gap-6 mt-7"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}>
            <div className="flex flex-col gap-0.5">
              <AnimatePresence mode="wait">
                <motion.span key={photos.length}
                  className="font-serif"
                  style={{ fontSize: 'clamp(1.1rem, 1.8vw, 1.5rem)', color: '#F4A8B7', fontWeight: 300 }}
                  initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}>
                  {photos.length}
                </motion.span>
              </AnimatePresence>
              <span className="font-sans font-light uppercase"
                style={{ fontSize: '0.55rem', letterSpacing: '0.3em', color: 'rgba(255,255,255,0.25)' }}>
                Memories Shared
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="font-serif"
                style={{ fontSize: 'clamp(1.1rem, 1.8vw, 1.5rem)', color: '#F4A8B7', fontWeight: 300 }}>
                {guestsOnline}
              </span>
              <span className="font-sans font-light uppercase"
                style={{ fontSize: '0.55rem', letterSpacing: '0.3em', color: 'rgba(255,255,255,0.25)' }}>
                Guests Online
              </span>
            </div>
          </motion.div>
        </div>

        {/* ── QR Card ── */}
        <motion.div
          className="mx-12 mb-10 flex flex-col gap-5"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 20,
            padding: '24px 28px',
          }}
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 1, ease: 'easeOut' }}
        >
          <div className="flex items-start gap-5">
            {/* QR code */}
            <div className="flex-shrink-0 rounded-[8px] overflow-hidden bg-white p-[7px]"
              style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
              {origin ? (
                <QRCodeSVG value={qrUrl} size={76} bgColor="#ffffff" fgColor={BG} level="M" />
              ) : (
                <div style={{ width: 76, height: 76, background: '#e5e5e5' }} />
              )}
            </div>

            {/* Text */}
            <div className="flex flex-col justify-center gap-2 pt-1">
              <p className="font-sans font-light uppercase"
                style={{ fontSize: '0.6rem', letterSpacing: '0.35em', color: 'rgba(255,255,255,0.55)' }}>
                Scan to Share
              </p>
              <p className="font-sans font-light uppercase"
                style={{ fontSize: '0.6rem', letterSpacing: '0.35em', color: 'rgba(255,255,255,0.55)' }}>
                Your Photo
              </p>
              <p className="font-sans font-light mt-1"
                style={{ fontSize: '0.55rem', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.2)', lineHeight: 1.6 }}>
                Join the memory collection
              </p>
            </div>
          </div>

          {/* Bottom info */}
          <div className="flex items-center justify-between pt-2"
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <AnimatePresence mode="wait">
              <motion.span key={photos.length}
                className="font-sans font-light"
                style={{ fontSize: '0.58rem', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.25)' }}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {photos.length} memories shared
              </motion.span>
            </AnimatePresence>
            <span className="font-mono"
              style={{ fontSize: '0.52rem', color: 'rgba(255,255,255,0.15)', letterSpacing: '0.05em' }}>
              {origin ? qrUrl.replace(/^https?:\/\//, '') : ''}
            </span>
          </div>
        </motion.div>
      </div>

      {/* ── LIVE WALL badge ── */}
      <motion.div
        className="absolute top-8 right-8 z-40 flex items-center gap-2 px-4 py-2"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 100,
        }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.8 }}
      >
        <motion.span
          className="rounded-full flex-shrink-0"
          style={{ width: 6, height: 6, background: '#ef4444' }}
          animate={{ opacity: [1, 0.25, 1] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        />
        <span style={{ fontSize: '0.6rem', letterSpacing: '0.35em', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase' }}>
          Live Wall
        </span>
      </motion.div>

      {/* ── Highlight overlay ── */}
      <AnimatePresence>
        {highlightPhoto && (
          <HighlightOverlay photo={highlightPhoto} onDone={() => setHighlightPhoto(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
