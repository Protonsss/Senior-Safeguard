import { useState, useEffect, useRef, useCallback } from 'react';

type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking' | 'error';

interface UseVoiceRecognitionReturn {
  state: VoiceState;
  transcript: string;
  response: string;
  startListening: () => void;
  stopListening: () => void;
  isSupported: boolean;
}

export function useVoiceRecognition(): UseVoiceRecognitionReturn {
  const [state, setState] = useState<VoiceState>('idle');
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [isSupported, setIsSupported] = useState(false);

  const recognitionRef = useRef<any>(null);

  // Check browser support
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      setIsSupported(true);
    }
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    if (!isSupported || typeof window === 'undefined') return;

    const SpeechRecognition = (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const result = Array.from(event.results)
        .map((r: any) => r[0].transcript)
        .join('');
      setTranscript(result);
    };

    recognition.onerror = (event: any) => {
      console.error('[Voice] Recognition error:', event.error);

      // Only set error for critical errors
      if (!['no-speech', 'audio-capture', 'network'].includes(event.error)) {
        setState('error');
        setTimeout(() => setState('idle'), 3000);
      } else {
        setState('idle');
      }
    };

    recognition.onend = () => {
      if (state === 'listening') {
        // Auto-process when listening ends
        if (transcript.trim()) {
          processTranscript(transcript);
        } else {
          setState('idle');
        }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.stop();
      } catch (e) {
        // Ignore errors on cleanup
      }
    };
  }, [isSupported, state, transcript]);

  // Process transcript through AI
  const processTranscript = useCallback(async (text: string) => {
    setState('processing');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: [],
        }),
      });

      const data = await res.json();

      if (data.message) {
        setResponse(data.message);
        speakResponse(data.message);
      } else {
        setState('idle');
      }
    } catch (error) {
      console.error('[Voice] Processing error:', error);
      setState('error');
      setTimeout(() => setState('idle'), 3000);
    }
  }, []);

  // Speak response using TTS
  const speakResponse = useCallback((text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      setState('idle');
      return;
    }

    setState('speaking');
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onend = () => setState('idle');
    utterance.onerror = () => setState('idle');

    window.speechSynthesis.speak(utterance);
  }, []);

  // Start listening
  const startListening = useCallback(() => {
    if (!recognitionRef.current || !isSupported) {
      alert('Voice recognition not supported. Please use Chrome or Edge.');
      return;
    }

    if (state !== 'idle') return;

    setState('listening');
    setTranscript('');
    setResponse('');

    try {
      recognitionRef.current.start();
    } catch (err) {
      console.error('[Voice] Start error:', err);
      setState('idle');
    }
  }, [isSupported, state]);

  // Stop listening (manual)
  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;

    try {
      recognitionRef.current.stop();
    } catch (err) {
      console.error('[Voice] Stop error:', err);
    }

    setState('idle');
  }, []);

  return {
    state,
    transcript,
    response,
    startListening,
    stopListening,
    isSupported,
  };
}
