'use client';
import { useState, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Webcam from 'react-webcam';
import { QRCodeSVG } from 'qrcode.react';
import { Camera, RefreshCw, Send, CheckCircle2, Image as ImageIcon, Sparkles } from 'lucide-react';
import { THEMES, ThemeId } from '@/lib/themes';

export default function CapturePage() {
  const params = useParams();
  const eventId = params.eventId as string;

  
  const webcamRef = useRef<Webcam>(null);
  
  const [step, setStep] = useState<'welcome' | 'camera' | 'preview' | 'success'>('welcome');
  const [selectedTheme, setSelectedTheme] = useState<ThemeId>('minimal');
  
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [guestName, setGuestName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedPhotoId, setGeneratedPhotoId] = useState<string | null>(null);

  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setImgSrc(imageSrc);
      setStep('preview');
    }
  }, []);

  const retake = () => {
    setImgSrc(null);
    setGuestName('');
    setStep('camera');
  };

  const submitPhoto = async () => {
    if (!imgSrc) return;
    setIsSubmitting(true);
    
    try {
      const res = await fetch('/api/photos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId,
          dataUrl: imgSrc,
          guestName: guestName.trim() || 'Guest',
          theme: selectedTheme
        }),
      });
      
      const data = await res.json();
      setGeneratedPhotoId(data.photo.id);
      setStep('success');
    } catch (error: any) {
      console.error("Failed to upload photo:", error.message || "Unknown error");
      alert("Failed to submit photo. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadUrl = generatedPhotoId 
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/d/${generatedPhotoId}`
    : '';

  const activeThemeDef = THEMES[selectedTheme];

  return (
    <div className="fixed inset-0 bg-neutral-950 flex flex-col text-white font-sans selection:bg-white selection:text-black touch-none overflow-y-auto overflow-x-hidden">
      {/* Header */}
      <header className="py-6 px-8 text-center flex-shrink-0 z-10">
        <h1 className="text-2xl font-bold tracking-widest uppercase text-white/90 flex justify-center items-center gap-3">
          <Sparkles className="w-5 h-5 text-yellow-400" /> Memoire
        </h1>
        <p className="text-white/50 text-sm mt-1">Interactive Photo Booth</p>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative flex items-center justify-center w-full max-w-4xl mx-auto px-4 pb-8 h-full">
        
        {step === 'welcome' && (
          <div className="flex flex-col items-center justify-center animate-in fade-in max-w-md w-full my-auto pb-12">
            <h2 className="text-3xl font-bold mb-2">Welcome!</h2>
            <p className="text-neutral-400 mb-8 text-center">Help us build our memory wall. Choose a frame style for your photo below.</p>

            <div className="grid grid-cols-1 gap-4 w-full mb-8">
              {(Object.entries(THEMES) as [ThemeId, typeof THEMES[ThemeId]][]).map(([id, theme]) => (
                <button
                  key={id}
                  onClick={() => setSelectedTheme(id)}
                  className={`p-4 rounded-2xl border-2 text-left transition-all flex items-center gap-4 ${
                    selectedTheme === id
                      ? 'border-white bg-white/10 shadow-[0_0_20px_rgba(255,255,255,0.1)]'
                      : 'border-neutral-800 bg-neutral-900/50 hover:bg-neutral-800'
                  }`}
                >
                  <div className="w-12 h-12 bg-neutral-800 rounded-xl flex items-center justify-center flex-shrink-0">
                    <ImageIcon className="w-6 h-6 text-neutral-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-lg text-white">{theme.name}</p>
                    <p className="text-sm text-neutral-500">Tap to select this frame</p>
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={() => setStep('camera')}
              className="w-full px-8 py-4 bg-white text-black rounded-xl font-semibold hover:bg-neutral-200 transition-colors text-lg shadow-xl hover:scale-[1.02] active:scale-[0.98]"
            >
              Start Capturing
            </button>
          </div>
        )}

        {step === 'camera' && (
          <div className="w-full flex justify-center flex-col items-center my-auto">
            {/* The Live View inside the chosen physical frame wrapper */}
            <div className={`relative w-full max-w-2xl flex flex-col ${activeThemeDef.wrapperClass}`}>
              <div className="w-full aspect-[4/3] bg-neutral-900 overflow-hidden relative">
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  videoConstraints={{ facingMode: "user" }}
                  className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
                />
              </div>
              <div className="pt-4 flex justify-center items-center w-full">
                <span className={`truncate w-full max-w-[200px] text-center opacity-50 ${activeThemeDef.textClass}`}>
                  Name placeholder...
                </span>
              </div>
            </div>
            
            <div className="mt-8 flex justify-center w-full">
              <button 
                onClick={capture}
                className="w-20 h-20 bg-white rounded-full border-8 border-neutral-800 flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(255,255,255,0.2)] group"
              >
                <div className="w-14 h-14 rounded-full border-2 border-transparent group-hover:border-neutral-200 transition-colors flex items-center justify-center">
                   <Camera className="w-7 h-7 text-neutral-900" />
                </div>
              </button>
            </div>
            <button
               onClick={() => setStep('welcome')}
               className="mt-6 text-neutral-400 text-sm hover:text-white"
            >
              Cancel & Change Frame
            </button>
          </div>
        )}

        {step === 'preview' && imgSrc && (
          <div className="w-full flex flex-col items-center max-w-2xl my-auto">
            {/* Render with chosen theme wrapper */}
            <div className={`relative w-full flex flex-col transition-all ${activeThemeDef.wrapperClass}`}>
              <div className="w-full aspect-[4/3] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imgSrc} alt="Captured preview" className="w-full h-full object-cover scale-x-[-1]" />
              </div>
              <div className="pt-4 flex justify-center w-full min-h-[3rem]">
                 <span className={`truncate ${activeThemeDef.textClass}`}>
                   {guestName || 'Your Name'}
                 </span>
              </div>
            </div>
            
            <div className="mt-8 w-full max-w-sm">
              <input 
                type="text" 
                placeholder="Type your name (optional)" 
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                autoFocus
                className="w-full bg-neutral-900 text-white placeholder:text-neutral-500 border border-neutral-800 rounded-xl px-6 py-4 outline-none focus:border-white transition-colors text-center text-lg shadow-inner"
              />
            </div>

            <div className="mt-8 flex gap-4 justify-center w-full pb-8">
              <button 
                onClick={() => retake()}
                className="flex items-center gap-2 px-6 py-4 bg-neutral-900 text-white rounded-xl border border-neutral-800 hover:bg-neutral-800 transition-colors"
                disabled={isSubmitting}
              >
                <RefreshCw className="w-5 h-5" /> Retake
              </button>
              <button 
                onClick={() => submitPhoto()}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-8 py-4 bg-white text-black rounded-xl hover:bg-neutral-200 transition-colors disabled:opacity-50 font-medium whitespace-nowrap"
              >
                {isSubmitting ? 'Sending...' : 'Submit to Wall'} <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="flex flex-col items-center text-center animate-in fade-in zoom-in duration-500 my-auto pb-12">
            <div className="w-20 h-20 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-bold mb-2">Sent to Live Wall!</h2>
            <p className="text-neutral-400 mb-12">Scan the QR code to save your photo memory to your phone.</p>
            
            <div className="bg-white p-6 rounded-3xl shadow-[0_0_50px_rgba(255,255,255,0.1)] mb-12 flex justify-center items-center">
              <QRCodeSVG value={downloadUrl} size={180} />
            </div>
            
            <button 
              onClick={() => {
                 setImgSrc(null);
                 setGuestName('');
                 setStep('welcome');
              }}
              className="px-8 py-4 bg-neutral-900 border border-neutral-800 rounded-full font-medium hover:bg-neutral-800 transition-colors"
            >
              Take Another Photo
            </button>
          </div>
        )}

      </main>
    </div>
  );
}
