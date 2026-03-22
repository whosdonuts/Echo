'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { getTagColor } from '@/lib/geo';

type FlowStep = 'menu' | 'capture' | 'caption' | 'submitting' | 'unlocked';

interface Props {
  onClose: () => void;
}

export default function AcebFlow({ onClose }: Props) {
  const [step, setStep] = useState<FlowStep>('menu');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [points, setPoints] = useState(0);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraMode, setCameraMode] = useState<'photo' | 'video'>('photo');
  const [recording, setRecording] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const tagColor = getTagColor('Featured');

  // ── Camera lifecycle ──────────────────────────────────────────────────

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 960 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraReady(true);
    } catch {
      setCameraReady(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraReady(false);
  }, []);

  useEffect(() => {
    if (step === 'capture') {
      startCamera();
    } else {
      stopCamera();
    }
    return stopCamera;
  }, [step, startCamera, stopCamera]);

  // ── Capture handlers ──────────────────────────────────────────────────

  const takePhoto = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    setCapturedImage(canvas.toDataURL('image/jpeg', 0.85));
    setStep('caption');
  }, []);

  const handleVideoToggle = useCallback(() => {
    if (cameraMode === 'photo') {
      setCameraMode('video');
    } else {
      if (recording) {
        setRecording(false);
        setCapturedImage('/placeholder-video-thumb.jpg');
        setStep('caption');
      } else {
        setRecording(true);
        setTimeout(() => {
          setRecording(false);
          setCapturedImage('/placeholder-video-thumb.jpg');
          setStep('caption');
        }, 3000);
      }
    }
  }, [cameraMode, recording]);

  const handleShutter = useCallback(() => {
    if (cameraMode === 'photo') {
      takePhoto();
    } else {
      handleVideoToggle();
    }
  }, [cameraMode, takePhoto, handleVideoToggle]);

  // ── Submit ────────────────────────────────────────────────────────────

  const handleSubmit = useCallback(() => {
    setStep('submitting');
    let p = 0;
    const interval = setInterval(() => {
      p += 3;
      if (p >= 30) {
        clearInterval(interval);
        setPoints(30);
        setTimeout(() => setStep('unlocked'), 300);
      } else {
        setPoints(p);
      }
    }, 40);
  }, []);

  // ── Renders ───────────────────────────────────────────────────────────

  if (step === 'menu') return <MenuScreen tagColor={tagColor} onCapture={() => setStep('capture')} onClose={onClose} />;
  if (step === 'capture') {
    return (
      <CaptureScreen
        videoRef={videoRef}
        canvasRef={canvasRef}
        cameraReady={cameraReady}
        cameraMode={cameraMode}
        recording={recording}
        onModeToggle={() => setCameraMode(cameraMode === 'photo' ? 'video' : 'photo')}
        onShutter={handleShutter}
        onBack={() => setStep('menu')}
      />
    );
  }
  if (step === 'caption') {
    return (
      <CaptionScreen
        image={capturedImage}
        caption={caption}
        setCaption={setCaption}
        onSubmit={handleSubmit}
        onBack={() => { setCapturedImage(null); setStep('capture'); }}
      />
    );
  }
  if (step === 'submitting') return <SubmittingScreen points={points} />;
  return <UnlockedScreen tagColor={tagColor} onClose={onClose} caption={caption} image={capturedImage} />;
}

// ═════════════════════════════════════════════════════════════════════════
// Sub-screens
// ═════════════════════════════════════════════════════════════════════════

function MenuScreen({ tagColor, onCapture, onClose }: {
  tagColor: { core: string; badge: string };
  onCapture: () => void;
  onClose: () => void;
}) {
  return (
    <div className="aceb-overlay">
      <div className="aceb-panel aceb-panel--menu">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex-1">
            <h2 className="text-lg font-bold" style={{ color: 'rgba(20,10,50,0.92)' }}>Mostly engineers, mostly all-nighters</h2>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(20,10,50,0.4)' }}>
              Amit Chakma Engineering Building
            </p>
            <span
              className="inline-block mt-2 text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full"
              style={{ background: tagColor.badge, color: tagColor.core, border: `1px solid ${tagColor.core}30` }}
            >
              Featured
            </span>
          </div>
          <button onClick={onClose} className="aceb-close" aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Preview memento */}
        <div className="mb-4">
          <p className="text-[10px] font-medium uppercase tracking-wider mb-2" style={{ color: 'rgba(20,10,50,0.3)' }}>
            Recent Memento
          </p>
          <div className="aceb-memento-preview">
            <div className="aceb-memento-preview__thumb">
              <div className="w-full h-full flex items-center justify-center text-2xl" style={{ background: 'linear-gradient(135deg, #fef3c7, #fde68a)' }}>
                <span style={{ filter: 'grayscale(0.2)' }}>&#9889;</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate" style={{ color: 'rgba(20,10,50,0.8)' }}>
                First week energy in the atrium
              </p>
              <p className="text-[10px] mt-0.5" style={{ color: 'rgba(20,10,50,0.3)' }}>
                @westerneng &middot; 2 days ago
              </p>
            </div>
          </div>
        </div>

        {/* Locked content */}
        <div className="mb-5">
          <p className="text-[10px] font-medium uppercase tracking-wider mb-2" style={{ color: 'rgba(20,10,50,0.3)' }}>
            More Mementos
          </p>
          <div className="flex flex-col gap-2">
            {['Lab night with the whole crew', 'View from the 3rd floor bridge', 'That one vending machine moment'].map((t, i) => (
              <div key={i} className="aceb-locked-row">
                <div className="aceb-locked-row__thumb" />
                <div className="flex-1 min-w-0">
                  <div className="aceb-locked-row__text" style={{ width: `${65 + i * 8}%` }} />
                  <div className="aceb-locked-row__sub" />
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(20,10,50,0.18)" strokeWidth="2" strokeLinecap="round">
                  <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
              </div>
            ))}
          </div>
          <p className="text-center text-[10px] mt-3" style={{ color: 'rgba(20,10,50,0.28)' }}>
            Leave a memento to unlock the rest
          </p>
        </div>

        {/* CTA */}
        <button onClick={onCapture} className="aceb-cta">
          Leave a Memento
        </button>
        <p className="text-center text-[10px] mt-2" style={{ color: 'rgba(20,10,50,0.28)' }}>
          +30 points on unlock
        </p>
      </div>
    </div>
  );
}

function CaptureScreen({ videoRef, canvasRef, cameraReady, cameraMode, recording, onModeToggle, onShutter, onBack }: {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  cameraReady: boolean;
  cameraMode: 'photo' | 'video';
  recording: boolean;
  onModeToggle: () => void;
  onShutter: () => void;
  onBack: () => void;
}) {
  return (
    <div className="aceb-overlay aceb-overlay--dark">
      <div className="aceb-capture">
        {/* Viewfinder */}
        <div className="aceb-capture__viewfinder">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="aceb-capture__video"
          />
          <canvas ref={canvasRef} className="hidden" />
          {!cameraReady && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3" style={{ background: '#111' }}>
              <div className="w-12 h-12 rounded-full border-2 flex items-center justify-center" style={{ borderColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.3)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
              </div>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Camera loading&hellip;</p>
              <p className="text-[10px] max-w-[200px] text-center" style={{ color: 'rgba(255,255,255,0.2)' }}>
                Allow camera access to capture your memento
              </p>
            </div>
          )}
          {recording && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1 rounded-full" style={{ background: 'rgba(220,38,38,0.8)' }}>
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span className="text-[11px] text-white font-medium">REC</span>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="aceb-capture__controls">
          <button onClick={onBack} className="aceb-capture__back">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>

          <button onClick={onShutter} className={`aceb-shutter ${recording ? 'aceb-shutter--recording' : ''}`}>
            <span className="aceb-shutter__inner" />
          </button>

          <button onClick={onModeToggle} className="aceb-capture__mode">
            <span className={`aceb-mode-label ${cameraMode === 'photo' ? 'aceb-mode-label--active' : ''}`}>Photo</span>
            <span className={`aceb-mode-label ${cameraMode === 'video' ? 'aceb-mode-label--active' : ''}`}>Video</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function CaptionScreen({ image, caption, setCaption, onSubmit, onBack }: {
  image: string | null;
  caption: string;
  setCaption: (v: string) => void;
  onSubmit: () => void;
  onBack: () => void;
}) {
  const maxLen = 120;
  return (
    <div className="aceb-overlay aceb-overlay--dark">
      <div className="aceb-caption">
        {/* Background preview */}
        <div className="aceb-caption__preview">
          {image ? (
            <img src={image} alt="Captured" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full" style={{ background: 'linear-gradient(135deg, #1e1b4b, #312e81)' }} />
          )}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(transparent 40%, rgba(0,0,0,0.7))' }} />
        </div>

        {/* Caption overlay */}
        <div className="aceb-caption__overlay">
          {/* Floating caption text preview */}
          {caption && (
            <div className="aceb-caption__floating">
              <p className="text-sm font-medium text-white text-center leading-snug">{caption}</p>
            </div>
          )}
        </div>

        {/* Bottom bar */}
        <div className="aceb-caption__bar">
          <button onClick={onBack} className="aceb-caption__back-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
          <div className="aceb-caption__input-wrap">
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value.slice(0, maxLen))}
              placeholder="Add a caption..."
              className="aceb-caption__input"
              maxLength={maxLen}
              autoFocus
            />
            <span className="aceb-caption__count">{caption.length}/{maxLen}</span>
          </div>
          <button
            onClick={onSubmit}
            disabled={caption.length === 0}
            className="aceb-caption__send"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function SubmittingScreen({ points }: { points: number }) {
  return (
    <div className="aceb-overlay aceb-overlay--dark">
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="aceb-submit-ring" />
        <p className="text-white text-sm font-medium tracking-wide">Submitting memento&hellip;</p>
        <div className="aceb-points-pill">+{points} pts</div>
      </div>
    </div>
  );
}

function UnlockedScreen({ tagColor, onClose, caption, image }: {
  tagColor: { core: string; badge: string };
  onClose: () => void;
  caption: string;
  image: string | null;
}) {
  return (
    <div className="aceb-overlay">
      <div className="aceb-panel aceb-panel--unlocked">
        {/* Success header */}
        <div className="flex flex-col items-center mb-5">
          <div className="aceb-unlock-check">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
          </div>
          <h2 className="text-lg font-bold mt-3" style={{ color: 'rgba(20,10,50,0.92)' }}>Fragment Collected</h2>
          <p className="text-xs mt-1" style={{ color: 'rgba(20,10,50,0.4)' }}>Amit Chakma Engineering Building</p>
          <div className="aceb-points-earned">+30 points</div>
        </div>

        {/* Your memento */}
        <div className="mb-4">
          <p className="text-[10px] font-medium uppercase tracking-wider mb-2" style={{ color: 'rgba(20,10,50,0.3)' }}>Your Memento</p>
          <div className="aceb-memento-preview">
            <div className="aceb-memento-preview__thumb">
              {image ? (
                <img src={image} alt="Memento" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full" style={{ background: 'linear-gradient(135deg, #ddd6fe, #c4b5fd)' }} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate" style={{ color: 'rgba(20,10,50,0.8)' }}>
                {caption || 'Your memento'}
              </p>
              <p className="text-[10px] mt-0.5" style={{ color: 'rgba(20,10,50,0.3)' }}>Just now</p>
            </div>
          </div>
        </div>

        {/* Unlocked content */}
        <div className="mb-5">
          <p className="text-[10px] font-medium uppercase tracking-wider mb-2" style={{ color: 'rgba(20,10,50,0.3)' }}>
            Unlocked Mementos
          </p>
          <div className="flex flex-col gap-2">
            {[
              { text: 'First week energy in the atrium', by: '@westerneng', time: '2 days ago' },
              { text: 'Lab night with the whole crew', by: '@jchen22', time: '5 days ago' },
              { text: 'View from the 3rd floor bridge', by: '@smurad', time: '1 week ago' },
              { text: 'That one vending machine moment', by: '@tpark', time: '2 weeks ago' },
            ].map((m, i) => (
              <div key={i} className="aceb-unlocked-row">
                <div className="aceb-unlocked-row__thumb" style={{
                  background: `linear-gradient(135deg, hsl(${220 + i * 30}, 60%, 85%), hsl(${240 + i * 30}, 50%, 75%))`,
                }} />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-medium truncate" style={{ color: 'rgba(20,10,50,0.75)' }}>{m.text}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: 'rgba(20,10,50,0.3)' }}>{m.by} &middot; {m.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 mb-5">
          <span
            className="inline-block text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full"
            style={{ background: tagColor.badge, color: tagColor.core, border: `1px solid ${tagColor.core}30` }}
          >
            Collected
          </span>
          <span
            className="inline-block text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full"
            style={{ background: tagColor.badge, color: tagColor.core, border: `1px solid ${tagColor.core}30` }}
          >
            Featured
          </span>
        </div>

        <button onClick={onClose} className="aceb-cta aceb-cta--done">
          Back to Map
        </button>
      </div>
    </div>
  );
}
