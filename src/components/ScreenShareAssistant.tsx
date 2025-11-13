'use client';

import { useState, useRef, useCallback } from 'react';

interface ScreenShareAssistantProps {
  onScreenCapture: (imageData: string) => void;
  onAnalysisReceived?: (analysis: string) => void;
}

export default function ScreenShareAssistant({ 
  onScreenCapture, 
  onAnalysisReceived 
}: ScreenShareAssistantProps) {
  const [isSharing, setIsSharing] = useState(false);
  const [lastCapture, setLastCapture] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [autoCapture, setAutoCapture] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const autoCaptureIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startScreenShare = async () => {
    try {
      console.log('[ScreenShare] Requesting screen access...');
      
      // Request screen sharing permission
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          // @ts-ignore - cursor is valid but not in types
          cursor: 'always',
          displaySurface: 'monitor',
        } as MediaTrackConstraints,
        audio: false,
      });

      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      setIsSharing(true);
      console.log('[ScreenShare] ✅ Screen sharing started');

      // Listen for when user stops sharing
      stream.getVideoTracks()[0].addEventListener('ended', () => {
        stopScreenShare();
      });

    } catch (error: any) {
      console.error('[ScreenShare] ❌ Error starting screen share:', error);
      alert('Could not start screen sharing. Please grant permission.');
    }
  };

  const stopScreenShare = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    // Stop auto-capture if enabled
    if (autoCaptureIntervalRef.current) {
      clearInterval(autoCaptureIntervalRef.current);
      autoCaptureIntervalRef.current = null;
    }
    
    setAutoCapture(false);
    setIsSharing(false);
    console.log('[ScreenShare] Screen sharing stopped');
  };

  const toggleAutoCapture = () => {
    if (!isSharing) {
      alert('Please start screen sharing first');
      return;
    }

    if (autoCapture) {
      // Stop auto-capture
      if (autoCaptureIntervalRef.current) {
        clearInterval(autoCaptureIntervalRef.current);
        autoCaptureIntervalRef.current = null;
      }
      setAutoCapture(false);
      console.log('[ScreenShare] Auto-capture disabled');
    } else {
      // Start auto-capture every 5 seconds
      setAutoCapture(true);
      console.log('[ScreenShare] Auto-capture enabled (every 5s)');
      
      autoCaptureIntervalRef.current = setInterval(() => {
        console.log('[ScreenShare] Auto-capturing screen...');
        captureScreen();
      }, 5000);
    }
  };

  const captureScreen = useCallback(async () => {
    if (!videoRef.current || !isSharing) {
      console.log('[ScreenShare] Cannot capture - not sharing');
      return;
    }

    try {
      setIsAnalyzing(true);
      
      // Create canvas to capture current frame
      const canvas = document.createElement('canvas');
      const video = videoRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');
      
      // Draw current video frame to canvas
      ctx.drawImage(video, 0, 0);
      
      // Convert to base64 image (compressed JPEG for faster transmission)
      const imageData = canvas.toDataURL('image/jpeg', 0.8);
      
      console.log('[ScreenShare] 📸 Screen captured:', imageData.length, 'bytes');
      setLastCapture(imageData);
      
      // Send to parent component
      onScreenCapture(imageData);
      
      // Send to AI for analysis
      await analyzeScreen(imageData);
      
    } catch (error) {
      console.error('[ScreenShare] ❌ Error capturing screen:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [isSharing, onScreenCapture]);

  const analyzeScreen = async (imageData: string) => {
    try {
      console.log('[ScreenShare] 🤖 Sending to AI for analysis...');
      
      const response = await fetch('/api/vision/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          image: imageData,
          prompt: 'Analyze this screen and identify any issues, errors, or confusion the user might be experiencing. Provide helpful, simple guidance.'
        }),
      });

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('[ScreenShare] ✅ AI Analysis received:', data.analysis);
      
      if (onAnalysisReceived) {
        onAnalysisReceived(data.analysis);
      }
      
      return data.analysis;
      
    } catch (error) {
      console.error('[ScreenShare] ❌ Error analyzing screen:', error);
      return null;
    }
  };

  return (
    <div className="glass-card p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-4xl">👁️</div>
          <div>
            <h3 className="text-xl font-bold text-white">AI Vision Assistant</h3>
            <p className="text-white/70 text-sm">Let me see your screen to help you better</p>
          </div>
        </div>
        
        {isSharing && (
          <div className="flex items-center gap-2 px-3 py-1 bg-red-500 rounded-full animate-pulse">
            <div className="w-2 h-2 bg-white rounded-full"></div>
            <span className="text-white text-sm font-semibold">Sharing</span>
          </div>
        )}
      </div>

      {/* Video Preview (Hidden) */}
      <video
        ref={videoRef}
        className="hidden"
        playsInline
        muted
      />

      {/* Last Capture Preview */}
      {lastCapture && (
        <div className="relative rounded-lg overflow-hidden border-2 border-white/20">
          <img 
            src={lastCapture} 
            alt="Last screen capture" 
            className="w-full h-auto max-h-64 object-contain bg-gray-900"
          />
          <div className="absolute top-2 right-2 px-3 py-1 bg-black/70 text-white text-xs rounded-full">
            Last capture
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="space-y-3">
        {!isSharing ? (
          <button
            onClick={startScreenShare}
            className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold rounded-xl hover:scale-105 transition-transform shadow-lg flex items-center justify-center gap-2"
          >
            <span className="text-2xl">🖥️</span>
            Start Screen Sharing
          </button>
        ) : (
          <>
            {/* Auto-Capture Toggle */}
            <button
              onClick={toggleAutoCapture}
              className={`w-full px-4 py-3 font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg ${
                autoCapture
                  ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white animate-pulse'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:scale-105'
              }`}
            >
              {autoCapture ? (
                <>
                  <span className="text-xl">🔴</span>
                  Auto-Monitoring ON (Every 5s)
                </>
              ) : (
                <>
                  <span className="text-xl">🤖</span>
                  Enable Auto-Monitoring
                </>
              )}
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={captureScreen}
                disabled={isAnalyzing || autoCapture}
                className={`px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 ${
                  isAnalyzing || autoCapture ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 shadow-lg'
                }`}
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <span className="text-xl">📸</span>
                    Capture Now
                  </>
                )}
              </button>
              
              <button
                onClick={stopScreenShare}
                className="px-4 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white font-semibold rounded-xl hover:scale-105 transition-transform shadow-lg flex items-center justify-center gap-2"
              >
                <span className="text-xl">⏹️</span>
                Stop Sharing
              </button>
            </div>
          </>
        )}
      </div>

      {/* Privacy & Info */}
      <div className="text-xs text-white/60 text-center space-y-1">
        {autoCapture ? (
          <>
            <p className="text-orange-300 font-semibold">🤖 AI is continuously monitoring your screen</p>
            <p>Building context automatically - no need to describe issues!</p>
          </>
        ) : (
          <>
            <p>🔒 Your screen is analyzed only when captured</p>
            <p>Enable auto-monitoring for seamless, context-aware help</p>
          </>
        )}
        <p className="mt-2">All data is processed securely and not stored permanently</p>
      </div>
    </div>
  );
}

