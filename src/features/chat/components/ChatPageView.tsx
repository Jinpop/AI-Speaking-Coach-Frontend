import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMembershipStatus } from "../../../shared/api/membership";
import { postChatTurn } from "../../../shared/api/chat";
import * as S from "../ChatPage.styled";
import ChatHeader from "./ChatHeader";
import ChatIntroMessage from "./ChatIntroMessage";
import ChatMessageItem from "./ChatMessageItem";
import VoiceRecorderPanel from "./VoiceRecorderPanel";
import introTts from "../../../assets/intro_tts.mp3";

export default function ChatPageView() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"idle" | "recording" | "finished">(
    "idle",
  );
  const [secondsLeft, setSecondsLeft] = useState(15);
  const [levels, setLevels] = useState<number[]>(() =>
    Array.from({ length: 14 }, () => 8),
  );
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAiPlaying, setIsAiPlaying] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [messages, setMessages] = useState<
    Array<{
      id: string;
      role: "ai" | "user";
      text: string;
      audioUrl?: string | null;
    }>
  >([]);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(0);
  const [recordError, setRecordError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array<ArrayBuffer> | null>(null);
  const rafRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const aiAudioRef = useRef<HTMLAudioElement | null>(null);
  const messageAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlsRef = useRef<Set<string>>(new Set());
  const autoPlayRef = useRef(false);

  const stopPlayback = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setPlaybackTime(0);
  }, []);

  const stopMessagePlayback = useCallback(() => {
    if (messageAudioRef.current) {
      messageAudioRef.current.pause();
      messageAudioRef.current.currentTime = 0;
    }
    setPlayingId(null);
  }, []);

  const stopAiPlayback = useCallback(() => {
    if (aiAudioRef.current) {
      aiAudioRef.current.pause();
      aiAudioRef.current.currentTime = 0;
    }
    setIsAiPlaying(false);
  }, []);

  const stopRecording = useCallback(() => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (status !== "recording") return;
    const timer = window.setTimeout(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          stopRecording();
          setStatus("finished");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [status, secondsLeft, stopRecording]);

  useEffect(() => {
    if (status !== "recording") return;
    const tick = () => {
      const analyser = analyserRef.current;
      const dataArray = dataArrayRef.current;
      if (!analyser || !dataArray) return;
      analyser.getByteTimeDomainData(dataArray);
      let sum = 0;
      for (let i = 0; i < dataArray.length; i += 1) {
        const value = (dataArray[i] - 128) / 128;
        sum += value * value;
      }
      const rms = Math.sqrt(sum / dataArray.length);
      const intensity = Math.min(1, rms * 6.5);
      const min = 8;
      const max = 48;
      setLevels((prev) =>
        prev.map((_, index) => {
          const variance = 0.65 + (index % 4) * 0.12;
          return Math.round(min + (max - min) * intensity * variance);
        }),
      );
      rafRef.current = window.requestAnimationFrame(tick);
    };
    rafRef.current = window.requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [status]);

  const handleStart = useCallback(() => {
    setRecordError(null);
    setSendError(null);
    stopAiPlayback();
    stopPlayback();
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    setRecordedBlob(null);
    if (isAiPlaying) {
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setRecordError("이 브라우저에서는 마이크 접근을 지원하지 않습니다.");
      return;
    }
    if (typeof MediaRecorder === "undefined") {
      setRecordError("이 브라우저에서는 녹음을 지원하지 않습니다.");
      return;
    }
    setSecondsLeft(15);
    setStatus("recording");
    setIsConnecting(true);
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        setIsConnecting(false);
        mediaStreamRef.current = stream;
        const mimeType = MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : undefined;
        const mediaRecorder = new MediaRecorder(
          stream,
          mimeType ? { mimeType } : undefined,
        );
        mediaRecorderRef.current = mediaRecorder;
        const chunks: BlobPart[] = [];

        mediaRecorder.addEventListener("dataavailable", (event) => {
          if (event.data.size > 0) chunks.push(event.data);
        });
        mediaRecorder.addEventListener("stop", () => {
          const blob = new Blob(chunks, { type: "audio/webm" });
          setAudioUrl(URL.createObjectURL(blob));
          setRecordedBlob(blob);
        });

        const audioContext = new AudioContext();
        audioContextRef.current = audioContext;
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 512;
        analyserRef.current = analyser;
        source.connect(analyser);
        dataArrayRef.current = new Uint8Array(
          analyser.frequencyBinCount,
        ) as Uint8Array<ArrayBuffer>;

        mediaRecorder.start();
      })
      .catch(() => {
        setRecordError("마이크 권한이 필요합니다.");
        setIsConnecting(false);
        setStatus("idle");
      });
  }, [audioUrl, isAiPlaying, stopAiPlayback, stopPlayback]);

  const handleStop = useCallback(() => {
    stopRecording();
    setIsConnecting(false);
    setStatus("finished");
  }, [stopRecording]);

  const handleReset = useCallback(() => {
    setStatus("idle");
    setSecondsLeft(15);
    setLevels(Array.from({ length: 14 }, () => 8));
    setRecordError(null);
    setSendError(null);
    setIsConnecting(false);
    stopAiPlayback();
    stopPlayback();
    stopMessagePlayback();
    setRecordedBlob(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
  }, [audioUrl, stopAiPlayback, stopMessagePlayback, stopPlayback]);

  const handleAiPlay = useCallback(() => {
    if (!aiAudioRef.current) {
      aiAudioRef.current = new Audio(introTts);
      aiAudioRef.current.addEventListener("ended", () => {
        setIsAiPlaying(false);
      });
    }
    if (isAiPlaying) {
      stopAiPlayback();
      return;
    }
    aiAudioRef.current
      .play()
      .then(() => setIsAiPlaying(true))
      .catch(() => setIsAiPlaying(false));
  }, [isAiPlaying, stopAiPlayback]);

  const handlePlayMessage = useCallback(
    (id: string, url: string) => {
      if (playingId === id) {
        stopMessagePlayback();
        return;
      }
      if (!messageAudioRef.current || messageAudioRef.current.src !== url) {
        messageAudioRef.current = new Audio(url);
        messageAudioRef.current.addEventListener("ended", () => {
          setPlayingId(null);
        });
      }
      messageAudioRef.current
        .play()
        .then(() => setPlayingId(id))
        .catch(() => setPlayingId(null));
    },
    [playingId, stopMessagePlayback],
  );

  const handlePlay = useCallback(() => {
    if (!audioUrl) return;
    if (isPlaying) {
      stopPlayback();
      return;
    }
    if (!audioRef.current) {
      audioRef.current = new Audio(audioUrl);
    }
    audioRef.current
      .play()
      .then(() => setIsPlaying(true))
      .catch(() => setIsPlaying(false));
  }, [audioUrl, isPlaying, stopPlayback]);

  useEffect(() => {
    const audio = audioUrl ? new Audio(audioUrl) : null;
    if (!audio) {
      return;
    }
    audioRef.current = audio;
    const handleLoaded = () => {
      setPlaybackDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    };
    const handleTime = () => {
      setPlaybackTime(audio.currentTime);
    };
    const handleEnded = () => {
      setIsPlaying(false);
      setPlaybackTime(audio.duration || 0);
    };
    audio.addEventListener("loadedmetadata", handleLoaded);
    audio.addEventListener("timeupdate", handleTime);
    audio.addEventListener("ended", handleEnded);
    return () => {
      audio.removeEventListener("loadedmetadata", handleLoaded);
      audio.removeEventListener("timeupdate", handleTime);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [audioUrl]);

  const handleSend = useCallback(async () => {
    if (!recordedBlob || isSending) return;
    setIsSending(true);
    setSendError(null);
    try {
      const userAudioUrl = URL.createObjectURL(recordedBlob);
      audioUrlsRef.current.add(userAudioUrl);
      const baseId = Date.now().toString();
      const userId = `${baseId}-user`;
      const aiId = `${baseId}-ai`;
      const history = messages.map((message) => ({
        role: message.role,
        content: message.text,
      }));
      const response = await postChatTurn(recordedBlob, history);
      let aiAudioUrl: string | null = null;
      if (response.aiAudioBase64) {
        const base64Payload = response.aiAudioBase64.includes(",")
          ? response.aiAudioBase64
          : `data:audio/mpeg;base64,${response.aiAudioBase64}`;
        aiAudioUrl = base64Payload;
      }
      if (aiAudioUrl) audioUrlsRef.current.add(aiAudioUrl);
      setMessages((prev) => [
        ...prev,
        {
          id: userId,
          role: "user",
          text: response.userText,
          audioUrl: userAudioUrl,
        },
        { id: aiId, role: "ai", text: response.aiText, audioUrl: aiAudioUrl },
      ]);
      if (aiAudioUrl) {
        window.setTimeout(() => {
          handlePlayMessage(aiId, aiAudioUrl);
        }, 0);
      }
      handleReset();
    } catch (error) {
      if (error instanceof Error) {
        setSendError(error.message);
      } else {
        setSendError("채팅 전송에 실패했습니다.");
      }
    } finally {
      setIsSending(false);
    }
  }, [handlePlayMessage, handleReset, isSending, messages, recordedBlob]);

  const isRecording = status === "recording";
  const formatTime = useCallback((value: number) => {
    const clamped = Math.max(0, Math.floor(value));
    const minutes = Math.floor(clamped / 60);
    const seconds = clamped % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }, []);

  const formattedTimer = useMemo(() => {
    if (status === "finished") {
      return `${formatTime(playbackTime)} / ${formatTime(playbackDuration)}`;
    }
    return `00:${String(status === "recording" ? secondsLeft : 15).padStart(2, "0")}`;
  }, [formatTime, playbackDuration, playbackTime, secondsLeft, status]);

  const displayHint = useMemo(() => {
    if (status === "finished") {
      return sendError ?? recordError ?? "";
    }
    return recordError ?? "";
  }, [recordError, sendError, status]);

  const ring = useMemo(() => {
    const radius = 44;
    const circumference = 2 * Math.PI * radius;
    const progress =
      status === "recording"
        ? secondsLeft / 15
        : playbackDuration > 0
          ? playbackTime / playbackDuration
          : 0;
    return {
      radius,
      circumference,
      offset: circumference * (1 - progress),
    };
  }, [playbackDuration, playbackTime, secondsLeft, status]);

  useEffect(() => {
    return () => {
      stopRecording();
      stopPlayback();
      stopAiPlayback();
      stopMessagePlayback();
      audioUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [stopAiPlayback, stopMessagePlayback, stopPlayback, stopRecording]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const response = await getMembershipStatus();
        if (!active) return;
        if (response.state === "none") {
          navigate("/404", { replace: true });
        }
      } catch {
        if (!active) return;
        navigate("/404", { replace: true });
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [navigate]);

  useEffect(() => {
    if (autoPlayRef.current) return;
    const onFirstGesture = () => {
      if (autoPlayRef.current) return;
      autoPlayRef.current = true;
      handleAiPlay();
      window.removeEventListener("pointerdown", onFirstGesture);
      window.removeEventListener("keydown", onFirstGesture);
    };
    window.addEventListener("pointerdown", onFirstGesture, { once: true });
    window.addEventListener("keydown", onFirstGesture, { once: true });
    return () => {
      window.removeEventListener("pointerdown", onFirstGesture);
      window.removeEventListener("keydown", onFirstGesture);
    };
  }, [handleAiPlay]);

  return (
    <S.Page>
      <ChatHeader />
      <S.ChatCard>
        <S.Messages>
          <ChatIntroMessage isPlaying={isAiPlaying} onPlay={handleAiPlay} />
          {messages.map((message) => (
            <ChatMessageItem
              key={message.id}
              role={message.role}
              text={message.text}
              audioUrl={message.audioUrl}
              isPlaying={playingId === message.id}
              onPlay={
                message.audioUrl
                  ? () => handlePlayMessage(message.id, message.audioUrl!)
                  : undefined
              }
            />
          ))}
        </S.Messages>
        <VoiceRecorderPanel
          isRecording={isRecording}
          micDisabled={isAiPlaying || isPlaying || isConnecting}
          isConnecting={isConnecting}
          formattedTimer={formattedTimer}
          displayHint={displayHint}
          ring={ring}
          levels={levels}
          status={status}
          onStart={handleStart}
          onStop={handleStop}
          onReset={handleReset}
          onPlay={handlePlay}
          onSend={handleSend}
          canSend={Boolean(recordedBlob)}
          isSending={isSending}
        />
      </S.ChatCard>
    </S.Page>
  );
}
