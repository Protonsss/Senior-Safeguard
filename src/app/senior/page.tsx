'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { EnterpriseVisionSystem } from '@/lib/vision';

type AssistantState = 'ready' | 'listening' | 'processing' | 'speaking';

export default function SeniorVoiceAssistant() {
  const router = useRouter();

  const [state, setState] = useState<AssistantState>('ready');
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [visionEnabled, setVisionEnabled] = useState(false);

  const recognitionRef = useRef<any>(null);
  const visionRef = useRef<EnterpriseVisionSystem | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if ('webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const text = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setTranscript(text);
      };

      recognitionRef.current.onerror = () => setState('ready');

      recognitionRef.current.onend = () => {
        if (state === 'listening' && transcript) {
          handleProcess();
        } else {
          setState('ready');
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
      if (visionRef.current) {
        visionRef.current.dispose();
      }
    };
  }, [state, transcript]);

  const handleListen = () => {
    if (!recognitionRef.current) {
      alert('Voice not supported. Please use Chrome or Edge.');
      return;
    }

    setState('listening');
    setTranscript('');
    setResponse('');

    try {
      recognitionRef.current.start();
    } catch (err) {
      console.error(err);
      setState('ready');
    }
  };

  const handleProcess = async () => {
    if (!transcript.trim()) {
      setState('ready');
      return;
    }

    setState('processing');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: transcript,
          history: [],
          screenContext: visionEnabled ? 'Vision active' : null,
        }),
      });

      const data = await res.json();

      if (data.message) {
        setResponse(data.message);
        handleSpeak(data.message);
      } else {
        setState('ready');
      }
    } catch (error) {
      console.error(error);
      setState('ready');
    }
  };

  const handleSpeak = (text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      setState('ready');
      return;
    }

    setState('speaking');
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onend = () => setState('ready');
    utterance.onerror = () => setState('ready');

    window.speechSynthesis.speak(utterance);
  };

  const handleEnableVision = async () => {
    if (!canvasRef.current) return;

    try {
      const vision = new EnterpriseVisionSystem();
      await vision.initialize(canvasRef.current);
      await vision.start();
      visionRef.current = vision;
      setVisionEnabled(true);
    } catch (error) {
      console.error(error);
      alert('Vision system failed to start.');
    }
  };

  const handleDisableVision = () => {
    if (visionRef.current) {
      visionRef.current.dispose();
      visionRef.current = null;
    }
    setVisionEnabled(false);
  };

  const handleEmergencyCall = () => {
    if (confirm('Call your emergency contact?')) {
      alert('Calling emergency contact...');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
          >
            ← Back
          </button>
          <h1 className="text-xl font-semibold text-gray-900">Voice Assistant</h1>
          <div className="w-16"></div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-4xl mx-auto px-6 py-16">

        {/* Status */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <div className={`
            px-6 py-3 rounded-full font-medium text-sm
            shadow-sm transition-all duration-300
            ${state === 'ready' ? 'bg-white text-gray-700 shadow-gray-100' : ''}
            ${state === 'listening' ? 'bg-blue-50 text-blue-700 shadow-blue-100' : ''}
            ${state === 'processing' ? 'bg-amber-50 text-amber-700 shadow-amber-100' : ''}
            ${state === 'speaking' ? 'bg-green-50 text-green-700 shadow-green-100' : ''}
          `}>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                state === 'ready' ? 'bg-gray-400' :
                state === 'listening' ? 'bg-blue-500 animate-pulse' :
                state === 'processing' ? 'bg-amber-500 animate-pulse' :
                'bg-green-500 animate-pulse'
              }`}></div>
              {state === 'ready' && 'Ready'}
              {state === 'listening' && 'Listening'}
              {state === 'processing' && 'Processing'}
              {state === 'speaking' && 'Speaking'}
            </div>
          </div>

          {visionEnabled && (
            <div className="px-6 py-3 rounded-full font-medium text-sm bg-green-50 text-green-700 shadow-sm shadow-green-100">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                Vision Active
              </div>
            </div>
          )}
        </div>

        {/* Conversation */}
        <div className="space-y-6 mb-12">
          {transcript && (
            <div className="bg-white rounded-2xl p-6 shadow-sm shadow-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">You</p>
              <p className="text-lg text-gray-900 leading-relaxed">{transcript}</p>
            </div>
          )}

          {response && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 shadow-sm shadow-blue-100">
              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-2">Assistant</p>
              <p className="text-lg text-gray-900 leading-relaxed">{response}</p>
            </div>
          )}
        </div>

        {/* Primary Action */}
        <div className="mb-16">
          <button
            onClick={state === 'ready' ? handleListen : undefined}
            disabled={state !== 'ready'}
            className={`
              w-full py-6 rounded-2xl font-semibold text-lg
              transition-all duration-200
              ${state === 'ready'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 hover:scale-[1.02] active:scale-[0.98]'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            {state === 'ready' && 'Press to Speak'}
            {state === 'listening' && 'Listening...'}
            {state === 'processing' && 'Processing...'}
            {state === 'speaking' && 'Speaking...'}
          </button>
          <p className="text-center text-sm text-gray-500 mt-4">
            Press the button and speak your question
          </p>
        </div>

        {/* Secondary Actions */}
        <div className="grid grid-cols-2 gap-4 mb-12">
          <button
            onClick={visionEnabled ? handleDisableVision : handleEnableVision}
            className={`
              py-5 rounded-xl font-semibold
              transition-all duration-200
              ${visionEnabled
                ? 'bg-white text-gray-700 shadow-sm shadow-gray-100 hover:shadow-md'
                : 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg shadow-green-200 hover:shadow-xl hover:shadow-green-300 hover:scale-[1.02] active:scale-[0.98]'
              }
            `}
          >
            {visionEnabled ? 'Stop Vision' : 'Enable Vision'}
          </button>

          <button
            onClick={handleEmergencyCall}
            className="py-5 rounded-xl font-semibold bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-lg shadow-red-200 hover:shadow-xl hover:shadow-red-300 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            Call Family
          </button>
        </div>

        {/* Instructions */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">How to use</h2>
          <ol className="space-y-3 text-gray-600">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold flex items-center justify-center">1</span>
              <span>Press the &quot;Press to Speak&quot; button above</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold flex items-center justify-center">2</span>
              <span>Speak your question clearly and naturally</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold flex items-center justify-center">3</span>
              <span>Wait for the assistant to process and respond</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold flex items-center justify-center">4</span>
              <span>The assistant will speak the answer to you</span>
            </li>
          </ol>
        </div>
      </main>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none"
        style={{ display: visionEnabled ? 'block' : 'none', zIndex: 9999 }}
      />

      {/* Security Badge */}
      <div className="fixed bottom-6 right-6 px-4 py-2 rounded-lg bg-white/80 backdrop-blur-sm shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span>Secure</span>
        </div>
      </div>
    </div>
  );
}
