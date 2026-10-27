import { useState, useRef, useEffect, useCallback } from 'react';

export function useShadowingRecorder(language = 'de') {
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState(null);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [recognizedText, setRecognizedText] = useState('');
  const [isSpeechSupported, setIsSpeechSupported] = useState(true);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const recognitionRef = useRef(null);
  const isRecordingRef = useRef(false);
  const accumulatedTranscriptRef = useRef('');
  const retryCountRef = useRef(0);
  const retryTimeoutRef = useRef(null);

  // Speech Recognition initialization
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSpeechSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.lang = language === 'de' ? 'de-DE' : 'en-US';

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = 0; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + ' ';
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      const combined = (finalTranscript + interimTranscript).trim();
      if (combined) {
        retryCountRef.current = 0;
        accumulatedTranscriptRef.current = combined;
        setRecognizedText(combined);
      }
    };

    recognition.onerror = (event) => {
      console.warn('Speech recognition status:', event.error);
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setIsRecording(false);
        isRecordingRef.current = false;
        return;
      }
      if (event.error === 'no-speech' && isRecordingRef.current && retryCountRef.current < 3) {
        retryCountRef.current += 1;
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = setTimeout(() => {
          if (isRecordingRef.current && recognitionRef.current) {
            try { recognitionRef.current.start(); } catch (e) {}
          }
        }, 500);
      }
    };

    recognition.onend = () => {
      if (isRecordingRef.current && retryCountRef.current < 3) {
        retryCountRef.current += 1;
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = setTimeout(() => {
          if (isRecordingRef.current && recognitionRef.current) {
            try { recognitionRef.current.start(); } catch (e) {}
          }
        }, 500);
      }
    };

    recognitionRef.current = recognition;
  }, [language]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);

        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();

      setIsRecording(true);
      isRecordingRef.current = true;
      accumulatedTranscriptRef.current = '';
      setRecognizedText('');
      setRecordSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordSeconds((prev) => prev + 1);
      }, 1000);

      if (recognitionRef.current) {
        try { recognitionRef.current.start(); } catch (e) {}
      }
    } catch (err) {
      alert('Không thể truy cập Microphone! Vui lòng kiểm tra quyền truy cập micro trong trình duyệt.');
      console.error(err);
    }
  }, []);

  const stopRecording = useCallback((onSettled) => {
    isRecordingRef.current = false;
    clearTimeout(retryTimeoutRef.current);
    retryCountRef.current = 0;
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);

      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }

      setTimeout(() => {
        const currentSpoken = (accumulatedTranscriptRef.current || recognizedText).trim();
        if (onSettled) onSettled(currentSpoken);
      }, 400);
    }
  }, [isRecording, recognizedText]);

  const resetAudio = useCallback(() => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setRecognizedText('');
    setIsRecording(false);
    isRecordingRef.current = false;
    accumulatedTranscriptRef.current = '';
    setRecordSeconds(0);
    if (timerRef.current) clearInterval(timerRef.current);
  }, [audioUrl]);

  useEffect(() => {
    return () => {
      isRecordingRef.current = false;
      clearTimeout(retryTimeoutRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (e) {}
      }
    };
  }, [audioUrl]);

  return {
    isRecording,
    audioUrl,
    recordSeconds,
    recognizedText,
    isSpeechSupported,
    startRecording,
    stopRecording,
    resetAudio,
    accumulatedTranscriptRef
  };
}
