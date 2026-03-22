import { useCallback, useEffect, useRef, useState } from 'react';
import { getTagColor } from '../geo';

type FlowStep = 'menu' | 'capture' | 'caption' | 'submitting' | 'unlocked';

type AcebFlowWebProps = {
  visible: boolean;
  onClose: () => void;
};

export function AcebFlowWeb({ visible, onClose }: AcebFlowWebProps) {
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
  const submitTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tagColor = getTagColor('Featured');

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraReady(false);
  }, []);

  const clearTimers = useCallback(() => {
    if (submitTimerRef.current) {
      clearInterval(submitTimerRef.current);
      submitTimerRef.current = null;
    }
    if (recordingTimerRef.current) {
      clearTimeout(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    clearTimers();
    stopCamera();
    setStep('menu');
    setCapturedImage(null);
    setCaption('');
    setPoints(0);
    setCameraMode('photo');
    setRecording(false);
  }, [clearTimers, stopCamera]);

  useEffect(() => {
    if (!visible) {
      reset();
    }
  }, [reset, visible]);

  useEffect(() => {
    return () => {
      clearTimers();
      stopCamera();
    };
  }, [clearTimers, stopCamera]);

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

  useEffect(() => {
    if (visible && step === 'capture') {
      void startCamera();
      return stopCamera;
    }
    stopCamera();
    return undefined;
  }, [startCamera, step, stopCamera, visible]);

  const takePhoto = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) {
      return;
    }
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }
    ctx.drawImage(video, 0, 0);
    setCapturedImage(canvas.toDataURL('image/jpeg', 0.85));
    setStep('caption');
  }, []);

  const handleVideoCapture = useCallback(() => {
    if (recording) {
      return;
    }
    clearTimers();
    setRecording(true);
    recordingTimerRef.current = setTimeout(() => {
      setRecording(false);
      setCapturedImage(null);
      setStep('caption');
      recordingTimerRef.current = null;
    }, 3000);
  }, [clearTimers, recording]);

  const handleSubmit = useCallback(() => {
    clearTimers();
    setStep('submitting');
    setPoints(0);
    submitTimerRef.current = setInterval(() => {
      setPoints((current) => {
        const next = current + 3;
        if (next >= 30) {
          clearTimers();
          window.setTimeout(() => setStep('unlocked'), 300);
          return 30;
        }
        return next;
      });
    }, 40);
  }, [clearTimers]);

  if (!visible) {
    return null;
  }

  const closeAndReset = () => {
    reset();
    onClose();
  };

  if (step === 'menu') {
    return (
      <div className="aceb-overlay">
        <div className="aceb-panel">
          <div className="aceb-header">
            <div style={{ flex: 1 }}>
              <h2 className="aceb-title">Mostly engineers, mostly all-nighters</h2>
              <p className="aceb-subtitle">Amit Chakma Engineering Building</p>
              <span className="aceb-tag" style={{ background: tagColor.badge, color: tagColor.core, borderColor: `${tagColor.core}30` }}>
                Featured
              </span>
            </div>
            <button aria-label="Close" className="aceb-close" onClick={closeAndReset}>
              x
            </button>
          </div>
          <p className="aceb-section-label">Recent Memento</p>
          <div className="aceb-memento-preview">
            <div className="aceb-memento-preview__thumb aceb-memento-preview__thumb--gold">ZAP</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p className="aceb-preview-title">First week energy in the atrium</p>
              <p className="aceb-preview-meta">@westerneng - 2 days ago</p>
            </div>
          </div>
          <p className="aceb-section-label aceb-section-gap">More Mementos</p>
          <div className="aceb-list">
            {['Lab night with the whole crew', 'View from the 3rd floor bridge', 'That one vending machine moment'].map((label) => (
              <div className="aceb-locked-row" key={label}>
                <div className="aceb-locked-thumb" />
                <div style={{ flex: 1 }}>
                  <p className="aceb-locked-title">{label}</p>
                  <p className="aceb-locked-subtitle">Leave a memento to unlock</p>
                </div>
                <span className="aceb-lock">lock</span>
              </div>
            ))}
          </div>
          <p className="aceb-center-hint">Leave a memento to unlock the rest</p>
          <button className="aceb-cta" onClick={() => setStep('capture')}>
            Leave a Memento
          </button>
          <p className="aceb-center-hint">+30 points on unlock</p>
        </div>
      </div>
    );
  }

  if (step === 'capture') {
    return (
      <div className="aceb-overlay aceb-overlay--dark">
        <div className="aceb-capture-shell">
          <div className="aceb-capture-viewfinder">
            <video autoPlay className="aceb-capture-video" muted playsInline ref={videoRef} />
            <canvas hidden ref={canvasRef} />
            {!cameraReady ? (
              <div className="aceb-capture-fallback">
                <div className="aceb-camera-circle">cam</div>
                <p className="aceb-camera-title">Camera loading...</p>
                <p className="aceb-camera-body">Allow camera access to capture your memento.</p>
              </div>
            ) : null}
            {recording ? <div className="aceb-recording-pill">REC</div> : null}
          </div>
          <div className="aceb-capture-controls">
            <button className="aceb-circle-button" onClick={() => setStep('menu')}>
              back
            </button>
            <button
              className={`aceb-shutter ${recording ? 'aceb-shutter--recording' : ''}`}
              onClick={() => {
                if (cameraMode === 'photo') {
                  takePhoto();
                } else {
                  handleVideoCapture();
                }
              }}
            >
              <span className="aceb-shutter__inner" />
            </button>
            <button className="aceb-mode-toggle" onClick={() => setCameraMode((current) => (current === 'photo' ? 'video' : 'photo'))}>
              {cameraMode === 'photo' ? 'Photo' : 'Video'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'caption') {
    return (
      <div className="aceb-overlay aceb-overlay--dark">
        <div className="aceb-caption-shell">
          <div className="aceb-caption-preview">
            {capturedImage ? <img alt="Captured" className="aceb-caption-image" src={capturedImage} /> : <div className="aceb-caption-video" />}
            <div className="aceb-caption-gradient" />
            {caption ? <div className="aceb-caption-floating">{caption}</div> : null}
          </div>
          <div className="aceb-caption-bar">
            <button className="aceb-circle-button" onClick={() => setStep('capture')}>
              back
            </button>
            <div className="aceb-caption-input-wrap">
              <input
                autoFocus
                className="aceb-caption-input"
                maxLength={120}
                onChange={(event) => setCaption(event.target.value.slice(0, 120))}
                placeholder="Add a caption..."
                type="text"
                value={caption}
              />
              <span className="aceb-caption-count">{caption.length}/120</span>
            </div>
            <button className="aceb-caption-send" disabled={caption.length === 0} onClick={handleSubmit}>
              send
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'submitting') {
    return (
      <div className="aceb-overlay aceb-overlay--dark">
        <div className="aceb-submit-wrap">
          <div className="aceb-submit-ring" />
          <p className="aceb-submit-title">Submitting memento...</p>
          <div className="aceb-points-pill">+{points} pts</div>
        </div>
      </div>
    );
  }

  return (
    <div className="aceb-overlay">
      <div className="aceb-panel">
        <div className="aceb-success-wrap">
          <div className="aceb-success-check">check</div>
          <h2 className="aceb-title">Fragment Collected</h2>
          <p className="aceb-subtitle">Amit Chakma Engineering Building</p>
          <div className="aceb-success-points">+30 points</div>
        </div>
        <p className="aceb-section-label">Your Memento</p>
        <div className="aceb-memento-preview">
          <div className="aceb-memento-preview__thumb">
            {capturedImage ? <img alt="Memento" className="aceb-thumb-image" src={capturedImage} /> : <div className="aceb-memento-preview__thumb--purple" />}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p className="aceb-preview-title">{caption || 'Your memento'}</p>
            <p className="aceb-preview-meta">Just now</p>
          </div>
        </div>
        <p className="aceb-section-label aceb-section-gap">Unlocked Mementos</p>
        <div className="aceb-list">
          {[
            { text: 'First week energy in the atrium', by: '@westerneng', time: '2 days ago' },
            { text: 'Lab night with the whole crew', by: '@jchen22', time: '5 days ago' },
            { text: 'View from the 3rd floor bridge', by: '@smurad', time: '1 week ago' },
            { text: 'That one vending machine moment', by: '@tpark', time: '2 weeks ago' },
          ].map((item, index) => (
            <div className="aceb-locked-row aceb-locked-row--unlocked" key={item.text}>
              <div
                className="aceb-unlocked-thumb"
                style={{
                  background: `linear-gradient(135deg, hsl(${220 + index * 30}, 60%, 85%), hsl(${240 + index * 30}, 50%, 75%))`,
                }}
              />
              <div style={{ flex: 1 }}>
                <p className="aceb-locked-title">{item.text}</p>
                <p className="aceb-locked-subtitle">{`${item.by} - ${item.time}`}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="aceb-tags">
          {['Collected', 'Featured'].map((label) => (
            <span className="aceb-tag" key={label} style={{ background: tagColor.badge, color: tagColor.core, borderColor: `${tagColor.core}30` }}>
              {label}
            </span>
          ))}
        </div>
        <button className="aceb-cta aceb-cta--done" onClick={closeAndReset}>
          Back to Map
        </button>
      </div>
    </div>
  );
}
