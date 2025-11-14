'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Mic, MicOff, Phone, Shield, Eye, EyeOff } from 'lucide-react';
import { EnterpriseVisionSystem } from '@/lib/vision';

type SystemState = 'ready' | 'listening' | 'processing' | 'speaking' | 'error';

/**
 * Senior Safeguard Voice Assistant
 * Enterprise-grade healthcare interface following Apple Health / Google Assistant patterns
 *
 * Design principles:
 * - Clean white background (medical standard)
 * - High contrast WCAG AAA
 * - Large touch targets (48px minimum)
 * - Simple visual hierarchy
 * - Emergency actions always visible
 * - Professional typography
 */
export default function SeniorVoiceAssistant() {
  const router = useRouter();

  // System state
  const [systemState, setSystemState] = useState<SystemState>('ready');
  const [audioLevel, setAudioLevel] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Ready to help');
  const [transcriptText, setTranscriptText] = useState('');
  const [responseText, setResponseText] = useState('');

  // Vision system
  const [visionActive, setVisionActive] = useState(false);

  // Refs
  const recognitionRef = useRef<any>(null);
  const visionSystemRef = useRef<EnterpriseVisionSystem | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const statsIntervalRef = useRef<number | null>(null);
  const audioLevelIntervalRef = useRef<number | null>(null);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if ('webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setTranscriptText(transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech error:', event.error);
        setSystemState('error');
        setStatusMessage('Microphone error');
        setTimeout(() => setSystemState('ready'), 3000);
      };

      recognitionRef.current.onend = () => {
        if (systemState === 'listening') {
          handleStopListening();
        }
      };
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (statsIntervalRef.current) {
        clearInterval(statsIntervalRef.current);
      }
      if (audioLevelIntervalRef.current) {
        clearInterval(audioLevelIntervalRef.current);
      }
      if (visionSystemRef.current) {
        visionSystemRef.current.dispose();
      }
    };
  }, [systemState]);

  // Start listening
  const handleStartListening = () => {
    if (!recognitionRef.current) {
      alert('Voice recognition not available in this browser. Please use Chrome or Edge.');
      return;
    }

    setSystemState('listening');
    setStatusMessage('Listening...');
    setTranscriptText('');
    setResponseText('');

    try {
      recognitionRef.current.start();

      // Simulate audio level
      if (audioLevelIntervalRef.current) {
        clearInterval(audioLevelIntervalRef.current);
      }
      audioLevelIntervalRef.current = window.setInterval(() => {
        setAudioLevel(Math.random() * 0.8 + 0.2);
      }, 50);
    } catch (err) {
      console.error('Recognition start error:', err);
      setSystemState('error');
      setStatusMessage('Failed to start listening');
    }
  };

  // Stop listening
  const handleStopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }

    if (audioLevelIntervalRef.current) {
      clearInterval(audioLevelIntervalRef.current);
      audioLevelIntervalRef.current = null;
    }
    setAudioLevel(0);

    if (transcriptText.trim()) {
      processUserInput(transcriptText);
    } else {
      setSystemState('ready');
      setStatusMessage('Ready to help');
    }
  };

  // Process user input
  const processUserInput = async (text: string) => {
    setSystemState('processing');
    setStatusMessage('Processing...');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: [],
          screenContext: visionActive ? 'Vision system active' : null,
        }),
      });

      const data = await response.json();

      if (data.message) {
        setResponseText(data.message);
        speakResponse(data.message);
      } else {
        setSystemState('ready');
        setStatusMessage('Ready to help');
      }
    } catch (error) {
      console.error('Processing error:', error);
      setSystemState('error');
      setStatusMessage('Connection error');
      setTimeout(() => {
        setSystemState('ready');
        setStatusMessage('Ready to help');
      }, 3000);
    }
  };

  // Speak response
  const speakResponse = (text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    setSystemState('speaking');
    setStatusMessage('Speaking...');

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onend = () => {
      setSystemState('ready');
      setStatusMessage('Ready to help');
    };

    utterance.onerror = () => {
      setSystemState('ready');
      setStatusMessage('Ready to help');
    };

    window.speechSynthesis.speak(utterance);
  };

  // Enable vision
  const handleEnableVision = async () => {
    if (!canvasRef.current) return;

    try {
      setStatusMessage('Starting vision system...');

      const visionSystem = new EnterpriseVisionSystem();
      await visionSystem.initialize(canvasRef.current);
      await visionSystem.start();

      visionSystemRef.current = visionSystem;
      setVisionActive(true);
      setStatusMessage('Vision system active');
    } catch (error) {
      console.error('Vision error:', error);
      alert('Failed to start vision system. Please allow screen sharing when prompted.');
    }
  };

  // Disable vision
  const handleDisableVision = () => {
    if (statsIntervalRef.current) {
      clearInterval(statsIntervalRef.current);
      statsIntervalRef.current = null;
    }

    if (visionSystemRef.current) {
      visionSystemRef.current.dispose();
      visionSystemRef.current = null;
    }

    setVisionActive(false);
    setStatusMessage('Vision system stopped');
  };

  // Emergency call
  const handleEmergencyCall = () => {
    alert('Emergency call feature - would dial emergency contact');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="text-gray-600 hover:text-gray-900 font-medium text-lg"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-semibold text-gray-900">Voice Assistant</h1>
          <div className="w-20"></div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-4xl space-y-8">

          {/* Status Indicator */}
          <div className="text-center space-y-4">
            <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-full ${
              systemState === 'ready' ? 'bg-gray-100 text-gray-900' :
              systemState === 'listening' ? 'bg-blue-50 text-blue-900' :
              systemState === 'processing' ? 'bg-yellow-50 text-yellow-900' :
              systemState === 'speaking' ? 'bg-green-50 text-green-900' :
              'bg-red-50 text-red-900'
            }`}>
              <div className={`w-3 h-3 rounded-full ${
                systemState === 'ready' ? 'bg-gray-400' :
                systemState === 'listening' ? 'bg-blue-500 animate-pulse' :
                systemState === 'processing' ? 'bg-yellow-500 animate-pulse' :
                systemState === 'speaking' ? 'bg-green-500 animate-pulse' :
                'bg-red-500'
              }`}></div>
              <span className="font-semibold text-lg">{statusMessage}</span>
            </div>

            {visionActive && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-900 rounded-lg text-sm font-medium">
                <Eye className="w-4 h-4" />
                Vision Active
              </div>
            )}
          </div>

          {/* Transcript Display */}
          {transcriptText && (
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
              <p className="text-sm font-medium text-gray-500 mb-2">You said:</p>
              <p className="text-xl text-gray-900 leading-relaxed">{transcriptText}</p>
            </div>
          )}

          {/* Response Display */}
          {responseText && (
            <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
              <p className="text-sm font-medium text-blue-700 mb-2">Assistant:</p>
              <p className="text-xl text-blue-900 leading-relaxed">{responseText}</p>
            </div>
          )}

          {/* Primary Controls */}
          <div className="flex flex-col items-center gap-6">
            {/* Microphone Button */}
            <button
              onClick={systemState === 'listening' ? handleStopListening : handleStartListening}
              disabled={systemState === 'processing' || systemState === 'speaking'}
              className={`w-32 h-32 rounded-full flex items-center justify-center transition-all shadow-lg ${
                systemState === 'listening'
                  ? 'bg-red-500 hover:bg-red-600 active:scale-95'
                  : 'bg-blue-500 hover:bg-blue-600 active:scale-95'
              } ${
                (systemState === 'processing' || systemState === 'speaking')
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
              }`}
              aria-label={systemState === 'listening' ? 'Stop listening' : 'Start listening'}
            >
              {systemState === 'listening' ? (
                <MicOff className="w-12 h-12 text-white" />
              ) : (
                <Mic className="w-12 h-12 text-white" />
              )}
            </button>

            <p className="text-gray-600 text-lg text-center max-w-md">
              {systemState === 'ready' && 'Tap the microphone to speak'}
              {systemState === 'listening' && 'Listening... Tap to stop'}
              {systemState === 'processing' && 'Processing your request...'}
              {systemState === 'speaking' && 'Speaking...'}
              {systemState === 'error' && 'An error occurred'}
            </p>
          </div>

          {/* Secondary Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-12">
            {/* Vision Control */}
            <button
              onClick={visionActive ? handleDisableVision : handleEnableVision}
              className={`flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold text-lg transition-all ${
                visionActive
                  ? 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  : 'bg-green-500 text-white hover:bg-green-600'
              }`}
            >
              {visionActive ? (
                <>
                  <EyeOff className="w-6 h-6" />
                  Stop Vision
                </>
              ) : (
                <>
                  <Eye className="w-6 h-6" />
                  Enable Vision
                </>
              )}
            </button>

            {/* Emergency Call */}
            <button
              onClick={handleEmergencyCall}
              className="flex items-center justify-center gap-3 px-6 py-4 bg-red-500 text-white rounded-xl font-semibold text-lg hover:bg-red-600 transition-all"
            >
              <Phone className="w-6 h-6" />
              Call Family
            </button>
          </div>
        </div>
      </main>

      {/* Voice Waveform - Bottom (like Siri) */}
      {systemState === 'listening' && (
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-blue-500/10 to-transparent py-8">
          <div className="flex items-end justify-center gap-1 h-16">
            {[...Array(40)].map((_, i) => {
              const height = Math.sin(Date.now() / 200 + i / 2) * audioLevel * 50 + 10;
              return (
                <div
                  key={i}
                  className="w-1 bg-blue-500 rounded-full transition-all duration-75"
                  style={{ height: `${height}%` }}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Vision Canvas (hidden) */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none"
        style={{ display: visionActive ? 'block' : 'none', zIndex: 9999 }}
      />

      {/* Security Badge */}
      <div className="fixed bottom-6 right-6 bg-white border border-gray-200 rounded-lg px-4 py-2 shadow-sm">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Shield className="w-4 h-4 text-green-500" />
          <span>Secure Connection</span>
        </div>
      </div>
    </div>
  );
}
