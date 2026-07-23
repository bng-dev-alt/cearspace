// Helper service to wrap Web Speech API SpeechRecognition with fallback support

/**
 * Web Speech API není součástí standardních TS lib.dom typů. Popisujeme si
 * proto jen tu část kontraktu, kterou skutečně používáme -- díky tomu je
 * zbytek souboru plně typovaný a nepotřebuje `any`.
 */
export interface SpeechRecognitionAlternativeLike {
  transcript: string;
}

export interface SpeechRecognitionResultLike {
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternativeLike;
}

export interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: SpeechRecognitionResultLike;
  };
}

export interface SpeechRecognitionErrorEventLike {
  error?: string;
}

export interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

interface SpeechRecognitionWindow {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
}

/** Prohlížeče se liší prefixem, proto se sahá po obou variantách. */
function getSpeechRecognitionCtor(): SpeechRecognitionConstructor | undefined {
  if (typeof window === 'undefined') return undefined;
  const w = window as unknown as SpeechRecognitionWindow;
  return w.SpeechRecognition || w.webkitSpeechRecognition;
}

export interface VoiceRecognitionCallback {
  onResult: (transcript: string, isFinal: boolean) => void;
  onError: (error: string) => void;
  onEnd: () => void;
}

export const voiceCopilotService = {
  isSupported(): boolean {
    return !!getSpeechRecognitionCtor();
  },

  createRecognition(callbacks: VoiceRecognitionCallback): SpeechRecognitionLike | null {
    const SpeechRecognitionCtor = getSpeechRecognitionCtor();
    if (!SpeechRecognitionCtor) {
      callbacks.onError('Hlasové rozhraní (SpeechRecognition) není podporováno tímto prohlížečem.');
      return null;
    }

    const recognition = new SpeechRecognitionCtor();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'cs-CZ';

    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      const current = finalTranscript || interimTranscript;
      callbacks.onResult(current, !!finalTranscript);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
      callbacks.onError(event.error || 'Chyba při rozpoznávání hlasu.');
    };

    recognition.onend = () => {
      callbacks.onEnd();
    };

    return recognition;
  },
};
