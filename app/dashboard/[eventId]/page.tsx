'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Photo } from '@/lib/store';
import { THEMES } from '@/lib/themes';
import Link from 'next/link';
import { ArrowLeft, LayoutGrid, Image as ImageIcon, Users } from 'lucide-react';

export default function EventDashboard() {
  const params = useParams();
  const eventId = params.eventId as string;
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const res = await fetch(`/api/photos?eventId=${eventId}`);
        const data = await res.json();
        setPhotos(data.photos || []);
      } catch (err: any) {
        console.error(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    fetchPhotos();
  }, [eventId]);

  const uniqueGuests = new Set(photos.map(p => p.guestName)).size;

  return (
    <div className="min-h-screen bg-slate-50 font-sans p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 flex items-center justify-between">
          <div>
            <Link href="/dashboard" className="text-slate-500 hover:text-slate-900 transition-colors mb-2 inline-flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Back to Setup
            </Link>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 mt-2">Event Gallery & Stats</h1>
            <p className="text-slate-500">Managing event: {eventId}</p>
          </div>
          <div className="flex gap-4">
            <button className="px-6 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors">
              Export All (ZIP)
            </button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-4 bg-slate-100 rounded-xl">
              <ImageIcon className="w-6 h-6 text-slate-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Photos</p>
              <p className="text-3xl font-bold text-slate-900">{photos.length}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-4 bg-slate-100 rounded-xl">
              <Users className="w-6 h-6 text-slate-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Unique Guests (Approx)</p>
              <p className="text-3xl font-bold text-slate-900">{uniqueGuests}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-4 bg-slate-100 rounded-xl">
              <LayoutGrid className="w-6 h-6 text-slate-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Event Status</p>
              <p className="text-3xl font-bold text-emerald-600">Active</p>
            </div>
          </div>
        </div>

        {/* Gallery */}
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Live Gallery Feed</h2>
        
        {loading ? (
          <div className="text-slate-500">Loading gallery...</div>
        ) : photos.length === 0 ? (
          <div className="text-center p-12 bg-white rounded-2xl border border-slate-200 border-dashed">
            <p className="text-slate-500">No photos yet. Launch the Capture App to start!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {[...photos].reverse().map(photo => {
              const themeDef = THEMES[photo.theme] || THEMES.minimal;
              return (
                <div key={photo.id} className={`flex flex-col relative ${themeDef.wrapperClass}`}>
                  <div className="w-full aspect-[4/3] overflow-hidden bg-neutral-900">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photo.dataUrl} alt={photo.guestName} className="w-full h-full object-cover scale-x-[-1]" />
                  </div>
                  <div className="pt-3 flex justify-center w-full">
                    <span className={`truncate max-w-full ${themeDef.textClass}`}>{photo.guestName}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
