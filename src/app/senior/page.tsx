'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { EnterpriseVisionSystem } from '@/lib/vision';

type AssistantState = 'ready' | 'listening' | 'processing' | 'speaking';

/**
 * Senior Safeguard Voice Assistant
 * Plain, trustworthy healthcare interface - NO animations, NO effects
 * Designed to look like hospital patient portals (MyChart, medical devices)
 */
export default function SeniorVoiceAssistant() {
  const router = useRouter();

  // State
  const [state, setState] = useState<AssistantState>('ready');
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [visionEnabled, setVisionEnabled] = useState(false);

  // Refs
  const recognitionRef = useRef<any>(null);
  const visionRef = useRef<EnterpriseVisionSystem | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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
        const text = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setTranscript(text);
      };

      recognitionRef.current.onerror = () => {
        setState('ready');
      };

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

  // Start listening
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

  // Process input
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

  // Speak response
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

  // Enable vision
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

  // Disable vision
  const handleDisableVision = () => {
    if (visionRef.current) {
      visionRef.current.dispose();
      visionRef.current = null;
    }
    setVisionEnabled(false);
  };

  // Emergency call
  const handleEmergencyCall = () => {
    if (confirm('Call your emergency contact?')) {
      alert('Calling emergency contact...');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#ffffff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        borderBottom: '1px solid #d1d5db',
        padding: '16px 24px',
        backgroundColor: '#ffffff'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <button
            onClick={() => router.push('/')}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '16px',
              color: '#374151',
              cursor: 'pointer',
              padding: '8px 16px'
            }}
          >
            ← Back
          </button>
          <h1 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#111827',
            margin: 0
          }}>
            Voice Assistant
          </h1>
          <div style={{ width: '80px' }}></div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: '40px 24px'
      }}>

        {/* Status */}
        <div style={{
          textAlign: 'center',
          marginBottom: '32px'
        }}>
          <div style={{
            display: 'inline-block',
            padding: '12px 24px',
            border: '2px solid #d1d5db',
            borderRadius: '4px',
            backgroundColor: state === 'listening' ? '#eff6ff' : '#ffffff'
          }}>
            <p style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#111827',
              margin: 0
            }}>
              {state === 'ready' && 'Ready'}
              {state === 'listening' && 'Listening...'}
              {state === 'processing' && 'Processing...'}
              {state === 'speaking' && 'Speaking...'}
            </p>
          </div>

          {visionEnabled && (
            <div style={{
              display: 'inline-block',
              marginLeft: '16px',
              padding: '12px 24px',
              border: '2px solid #10b981',
              borderRadius: '4px',
              backgroundColor: '#f0fdf4'
            }}>
              <p style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#047857',
                margin: 0
              }}>
                Vision Active
              </p>
            </div>
          )}
        </div>

        {/* Transcript */}
        {transcript && (
          <div style={{
            marginBottom: '24px',
            padding: '24px',
            border: '2px solid #d1d5db',
            borderRadius: '4px',
            backgroundColor: '#f9fafb'
          }}>
            <p style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#6b7280',
              margin: '0 0 8px 0'
            }}>
              You said:
            </p>
            <p style={{
              fontSize: '18px',
              color: '#111827',
              margin: 0,
              lineHeight: '1.6'
            }}>
              {transcript}
            </p>
          </div>
        )}

        {/* Response */}
        {response && (
          <div style={{
            marginBottom: '24px',
            padding: '24px',
            border: '2px solid #3b82f6',
            borderRadius: '4px',
            backgroundColor: '#eff6ff'
          }}>
            <p style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#1e40af',
              margin: '0 0 8px 0'
            }}>
              Assistant:
            </p>
            <p style={{
              fontSize: '18px',
              color: '#1e3a8a',
              margin: 0,
              lineHeight: '1.6'
            }}>
              {response}
            </p>
          </div>
        )}

        {/* Main Button */}
        <div style={{
          textAlign: 'center',
          marginBottom: '48px'
        }}>
          <button
            onClick={state === 'ready' ? handleListen : undefined}
            disabled={state !== 'ready'}
            style={{
              width: '100%',
              maxWidth: '400px',
              padding: '24px',
              fontSize: '20px',
              fontWeight: '600',
              color: '#ffffff',
              backgroundColor: state === 'ready' ? '#3b82f6' : '#9ca3af',
              border: 'none',
              borderRadius: '4px',
              cursor: state === 'ready' ? 'pointer' : 'not-allowed'
            }}
          >
            {state === 'ready' && 'Press to Speak'}
            {state === 'listening' && 'Listening...'}
            {state === 'processing' && 'Processing...'}
            {state === 'speaking' && 'Speaking...'}
          </button>

          <p style={{
            marginTop: '16px',
            fontSize: '16px',
            color: '#6b7280'
          }}>
            Press the button, then speak your question
          </p>
        </div>

        {/* Secondary Actions */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px',
          marginBottom: '32px'
        }}>
          {/* Vision */}
          <button
            onClick={visionEnabled ? handleDisableVision : handleEnableVision}
            style={{
              padding: '20px',
              fontSize: '18px',
              fontWeight: '600',
              color: visionEnabled ? '#374151' : '#ffffff',
              backgroundColor: visionEnabled ? '#f3f4f6' : '#10b981',
              border: '2px solid #d1d5db',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {visionEnabled ? 'Stop Vision' : 'Enable Vision'}
          </button>

          {/* Emergency */}
          <button
            onClick={handleEmergencyCall}
            style={{
              padding: '20px',
              fontSize: '18px',
              fontWeight: '600',
              color: '#ffffff',
              backgroundColor: '#dc2626',
              border: '2px solid #dc2626',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Call Family
          </button>
        </div>

        {/* Instructions */}
        <div style={{
          padding: '24px',
          border: '2px solid #d1d5db',
          borderRadius: '4px',
          backgroundColor: '#f9fafb'
        }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#111827',
            margin: '0 0 16px 0'
          }}>
            How to use:
          </h2>
          <ol style={{
            margin: 0,
            paddingLeft: '24px',
            color: '#374151',
            fontSize: '16px',
            lineHeight: '1.8'
          }}>
            <li>Press &quot;Press to Speak&quot; button</li>
            <li>Speak your question clearly</li>
            <li>Wait for the assistant to respond</li>
            <li>The assistant will speak the answer to you</li>
          </ol>
        </div>
      </div>

      {/* Canvas (hidden) */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          display: visionEnabled ? 'block' : 'none',
          zIndex: 9999
        }}
      />

      {/* Footer */}
      <div style={{
        position: 'fixed',
        bottom: '16px',
        right: '16px',
        padding: '8px 16px',
        border: '1px solid #d1d5db',
        borderRadius: '4px',
        backgroundColor: '#ffffff',
        fontSize: '14px',
        color: '#6b7280'
      }}>
        🔒 Secure
      </div>
    </div>
  );
}
