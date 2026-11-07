import { useEffect, useRef, useState } from 'react';
import { AudioLines, Square } from 'lucide-react';
import { trackAnalyticsEvent } from '../../platform/analytics/analyticsEvents.ts';
import { getSpeechRetryDelayMs } from '../../platform/audio/retryPolicy.ts';

type AudioStatus = 'idle' | 'loading' | 'playing' | 'retrying' | 'cancelled' | 'error';

interface ReadAloudButtonProps {
  text: string;
}

const statusLabels: Record<AudioStatus, string> = {
  idle: 'Ready',
  loading: 'Preparing audio…',
  playing: 'Reading aloud',
  retrying: 'Retrying audio…',
  cancelled: 'Reading stopped',
  error: 'Audio unavailable',
};

export function ReadAloudButton({ text }: ReadAloudButtonProps) {
  const [status, setStatus] = useState<AudioStatus>('idle');
  const generationRef = useRef(0);
  const retryTimerRef = useRef<number | null>(null);
  const active = status === 'loading' || status === 'playing' || status === 'retrying';

  const speak = (generation: number, attempt: number) => {
    if (generation !== generationRef.current) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)
      || typeof SpeechSynthesisUtterance === 'undefined') {
      setStatus('error');
      void trackAnalyticsEvent('audio_failed');
      return;
    }

    setStatus(attempt === 0 ? 'loading' : 'retrying');
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = navigator.language || 'en-US';
    utterance.rate = 1;

    utterance.onstart = () => {
      if (generation === generationRef.current) setStatus('playing');
    };

    utterance.onend = () => {
      if (generation !== generationRef.current) return;
      setStatus('idle');
      void trackAnalyticsEvent('audio_completed');
    };

    utterance.onerror = (event) => {
      if (generation !== generationRef.current) return;
      if (event.error === 'canceled' || event.error === 'interrupted') {
        setStatus('cancelled');
        return;
      }
      if (attempt < 2) {
        setStatus('retrying');
        void trackAnalyticsEvent('audio_retry_scheduled');
        retryTimerRef.current = window.setTimeout(() => {
          retryTimerRef.current = null;
          if (generation !== generationRef.current) return;
          void trackAnalyticsEvent('audio_retry_executed');
          speak(generation, attempt + 1);
        }, getSpeechRetryDelayMs(attempt));
        return;
      }
      setStatus('error');
      void trackAnalyticsEvent('audio_failed');
    };

    window.speechSynthesis.speak(utterance);
  };

  const stop = () => {
    const wasActive = active;
    generationRef.current += 1;
    if (retryTimerRef.current !== null) {
      window.clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setStatus('cancelled');
    if (wasActive) void trackAnalyticsEvent('audio_aborted');
  };

  const start = () => {
    generationRef.current += 1;
    const generation = generationRef.current;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)
      || typeof SpeechSynthesisUtterance === 'undefined') {
      setStatus('error');
      void trackAnalyticsEvent('audio_failed');
      return;
    }
    window.speechSynthesis.cancel();
    void trackAnalyticsEvent('audio_started');
    speak(generation, 0);
  };

  useEffect(() => () => {
    generationRef.current += 1;
    if (retryTimerRef.current !== null) window.clearTimeout(retryTimerRef.current);
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  }, []);

  return (
    <div className="inline-flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={active ? stop : start}
        aria-label={active ? 'Stop reading this topic aloud' : 'Read this topic aloud'}
        className="inline-flex items-center gap-1.5 rounded-md border border-cyan-300/25 px-2.5 py-1.5 text-xs text-cyan-200 hover:bg-cyan-300/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300"
      >
        {active ? <Square className="h-3.5 w-3.5" /> : <AudioLines className="h-3.5 w-3.5" />}
        {active ? 'Stop reading' : 'Read aloud'}
      </button>
      <span className="text-[10px] text-slate-400" role="status" aria-live="polite">
        {statusLabels[status]}
      </span>
    </div>
  );
}
