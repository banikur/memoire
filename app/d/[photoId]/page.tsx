'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Photo } from '@/lib/store';
import { THEMES } from '@/lib/themes';
import { Download, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function DownloadPage() {
  const params = useParams();
  const photoId = params.photoId as string;
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchPhoto = async () => {
      try {
        const res = await fetch(`/api/photos/${photoId}`);
        if (!res.ok) throw new Error("Not found");
        
        const data = await res.json();
        setPhoto(data);
      } catch (err: any) {
        console.error(err.message || "Unknown error");
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchPhoto();
  }, [photoId]);

  const handleDownload = () => {
    if (!photo) return;
    const a = document.createElement('a');
    a.href = photo.dataUrl;
    a.download = `Memoire_${photo.guestName.replace(/\s+/g, '_')}_${photoId}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (error || !photo) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-6">
          <span className="text-2xl font-bold">!</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Photo Expired</h1>
        <p className="text-slate-500 mb-8 max-w-sm text-center">
          We couldn&apos;t find this memory. It may have expired based on the event&apos;s retention policy.
        </p>
        <Link href="/" className="px-6 py-3 bg-slate-900 text-white rounded-full font-medium hover:bg-slate-800 transition-colors">
          Go to Memoire Hub
        </Link>
      </div>
    );
  }

  const themeDef = photo ? (THEMES[photo.theme] || THEMES.minimal) : THEMES.minimal;

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4 font-sans text-white">
      
      <div className="max-w-md w-full flex flex-col items-center mb-8">
        <h1 className="text-2xl font-bold tracking-widest uppercase mb-2">Memoire</h1>
        <p className="text-neutral-400 text-sm">Your captured moment</p>
      </div>

      <div className="max-w-md w-full relative mb-8">
        {/* Render framed photo */}
        <div className={`flex flex-col relative ${themeDef.wrapperClass}`}>
          <div className="w-full aspect-[4/3] overflow-hidden bg-neutral-900 border border-neutral-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo.dataUrl} alt="Your photo" className="w-full h-full object-cover scale-x-[-1]" />
          </div>
          <div className="pt-3 flex justify-center w-full">
            <span className={`truncate max-w-full ${themeDef.textClass}`}>{photo.guestName}</span>
          </div>
        </div>
      </div>

      <div className="max-w-md w-full">
        <button 
          onClick={() => handleDownload()}
          className="flex items-center gap-2 w-full justify-center px-6 py-4 bg-white text-black rounded-xl font-semibold hover:bg-neutral-200 transition-colors shadow-lg"
        >
          <Download className="w-5 h-5" /> Download / Save Image
        </button>
      </div>
    </div>
  );
}
