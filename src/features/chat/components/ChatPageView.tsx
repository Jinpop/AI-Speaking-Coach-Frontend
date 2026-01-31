import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMembershipStatus } from "../../../shared/api/membership";
import { postChatSTT, postChatTTS, streamChatLLM } from "../../../shared/api/chat";
import * as S from "../ChatPage.styled";
import ChatHeader from "./ChatHeader";
import ChatIntroMessage from "./ChatIntroMessage";
import ChatMessageItem from "./ChatMessageItem";
import VoiceRecorderPanel from "./VoiceRecorderPanel";
import { useChatAudio } from "../hooks/useChatAudio";

type Message = {
  id: string;
  role: "ai" | "user";
  text: string;
  audioUrl?: string | null;
  isPending?: boolean;
  isAudioLoading?: boolean;
};

export default function ChatPageView() {
  const navigate = useNavigate();
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedDuration, setRecordedDuration] = useState<number | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const messageAudioRef = useRef<HTMLAudioElement | null>(null);
  const messagesRef = useRef<HTMLDivElement | null>(null);
  const audioUrlsRef = useRef<Set<string>>(new Set());

  const {
    status,
    isRecording,
    isConnecting,
    isAiPlaying,
    isPlaying,
    formattedTimer,
    displayHint,
    ring,
    levels,
    startRecording,
    stopRecording,
    resetRecording,
    playRecording,
    playAiIntro,
  } = useChatAudio({
    onRecordReady: (blob) => {
      setRecordedBlob(blob);
    },
  });

  const handleStartRecording = useCallback(() => {
    setSendError(null);
    startRecording();
  }, [startRecording]);

  const handleResetRecording = useCallback(() => {
    setSendError(null);
    setRecordedBlob(null);
    setRecordedDuration(null);
    resetRecording();
  }, [resetRecording]);

  const stopMessagePlayback = useCallback(() => {
    if (messageAudioRef.current) {
      messageAudioRef.current.pause();
      messageAudioRef.current.currentTime = 0;
    }
    setPlayingId(null);
  }, []);

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

  const handleSend = useCallback(async () => {
    if (!recordedBlob || isSending) return;
    setIsSending(true);
    setSendError(null);
    try {
      if (recordedDuration !== null && recordedDuration < 1) {
        setSendError("음성이 너무 짧아요. 다시 녹음해 주세요.");
        return;
      }
      if (recordedBlob.size < 1024) {
        setSendError("녹음이 너무 짧아 전송할 수 없어요. 다시 녹음해 주세요.");
        return;
      }
      const { userText } = await postChatSTT(recordedBlob);
      const hasKorean = /[가-힣]/.test(userText);
      if (hasKorean) {
        setSendError("영어로 말해주세요");
        return;
      }
      const userAudioUrl = URL.createObjectURL(recordedBlob);
      audioUrlsRef.current.add(userAudioUrl);
      const baseId = Date.now().toString();
      const userId = `${baseId}-user`;
      const aiId = `${baseId}-ai`;
      const history = messages.map((message) => ({
        role: message.role === "ai" ? "assistant" : "user",
        content: message.text,
      }));

      setMessages((prev) => [
        ...prev,
        { id: userId, role: "user", text: userText, audioUrl: userAudioUrl },
        { id: aiId, role: "ai", text: "", isPending: true, isAudioLoading: false },
      ]);

      const stream = await streamChatLLM(userText, history);
      const reader = stream.getReader();
      let buffer = "";
      let aiText = "";
      let ttsKey: string | null = null;
      let doneStreaming = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += value;
        const events = buffer.split("\n\n");
        buffer = events.pop() ?? "";
        for (const event of events) {
          const lines = event.split("\n");
          const dataLines = lines.filter((line) => line.startsWith("data:"));
          if (!dataLines.length) continue;
          const data = dataLines.map((line) => line.replace(/^data:\s*/, "")).join("\n");
          if (data === "[DONE]") {
            doneStreaming = true;
            break;
          }
          let payload: { type?: string; text?: string; ttsKey?: string } | null = null;
          try {
            payload = JSON.parse(data);
          } catch {
            payload = null;
          }

          if (payload?.type === "meta" && payload.ttsKey) {
            ttsKey = payload.ttsKey;
            continue;
          }
          if (payload?.type === "chunk" && payload.text) {
            aiText += payload.text;
          } else if (payload?.type === "done") {
            doneStreaming = true;
          } else if (!payload) {
            aiText += data;
          }

          if (aiText) {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === aiId ? { ...msg, text: aiText, isPending: false } : msg,
              ),
            );
          }
        }
        if (doneStreaming) break;
      }

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiId ? { ...msg, isAudioLoading: true } : msg,
        ),
      );

      const { aiAudioBase64 } = await postChatTTS(aiText);
      const aiAudioUrl = aiAudioBase64.includes(",")
        ? aiAudioBase64
        : `data:audio/mpeg;base64,${aiAudioBase64}`;
      audioUrlsRef.current.add(aiAudioUrl);

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiId
            ? { ...msg, audioUrl: aiAudioUrl, isPending: false, isAudioLoading: false }
            : msg,
        ),
      );

      window.setTimeout(() => {
        handlePlayMessage(aiId, aiAudioUrl);
      }, 0);

      handleResetRecording();
    } catch (error) {
      const raw = error instanceof Error ? error.message : "";
      const isNonEnglish =
        raw.includes("NON_ENGLISH_INPUT") ||
        raw.toLowerCase().includes("non_english") ||
        raw.toLowerCase().includes("respond in english");
      if (isNonEnglish) {
        setSendError("영어로 말해주세요");
      } else {
        setSendError("음성 전송에 실패했어요. 다시 녹음 후 보내주세요.");
      }
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id.endsWith("-ai") ? { ...msg, isAudioLoading: false } : msg,
        ),
      );
    } finally {
      setIsSending(false);
    }
  }, [
    handlePlayMessage,
    handleResetRecording,
    isSending,
    messages,
    recordedBlob,
    recordedDuration,
  ]);

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
    if (!recordedBlob) {
      setRecordedDuration(null);
      return;
    }
    let active = true;
    const previewUrl = URL.createObjectURL(recordedBlob);
    const previewAudio = new Audio(previewUrl);
    const handleLoaded = () => {
      if (!active) return;
      const duration = Number.isFinite(previewAudio.duration)
        ? previewAudio.duration
        : null;
      setRecordedDuration(duration);
      URL.revokeObjectURL(previewUrl);
    };
    const handleError = () => {
      if (!active) return;
      setRecordedDuration(null);
      URL.revokeObjectURL(previewUrl);
    };
    previewAudio.addEventListener("loadedmetadata", handleLoaded);
    previewAudio.addEventListener("error", handleError);
    return () => {
      active = false;
      previewAudio.removeEventListener("loadedmetadata", handleLoaded);
      previewAudio.removeEventListener("error", handleError);
      URL.revokeObjectURL(previewUrl);
    };
  }, [recordedBlob]);

  useEffect(() => {
    return () => {
      stopMessagePlayback();
      audioUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [stopMessagePlayback]);

  useEffect(() => {
    const container = messagesRef.current;
    if (!container || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => {
      container.scrollTop = container.scrollHeight;
    });
    observer.observe(container);
    container.scrollTop = container.scrollHeight;
    return () => observer.disconnect();
  }, []);

  const micDisabled =
    isAiPlaying || isPlaying || isConnecting || Boolean(playingId);
  const hint = status === "finished" ? (sendError ?? "") : displayHint;
  const showRetry = Boolean(sendError);

  return (
    <S.Page>
      <ChatHeader />
      <S.ChatCard>
        <S.Messages ref={messagesRef}>
          <ChatIntroMessage isPlaying={isAiPlaying} onPlay={playAiIntro} />
          {messages.map((message) => (
            <ChatMessageItem
              key={message.id}
              role={message.role}
              text={message.text}
              audioUrl={message.audioUrl}
              isPending={message.isPending}
              isAudioLoading={message.isAudioLoading}
              isPlaying={playingId === message.id}
              onPlay={
                message.audioUrl
                  ? () => handlePlayMessage(message.id, message.audioUrl!)
                  : undefined
              }
            />
          ))}
        </S.Messages>
        <S.FooterNote>
          입력은 UI 틀만 구성되어 있어요. 이후 연동 시 활성화됩니다.
        </S.FooterNote>
        <VoiceRecorderPanel
          isRecording={isRecording}
          micDisabled={micDisabled}
          isConnecting={isConnecting}
          formattedTimer={formattedTimer}
          displayHint={hint}
          ring={ring}
          levels={levels}
          status={status}
          onStart={handleStartRecording}
          onStop={stopRecording}
          onReset={handleResetRecording}
          onPlay={playRecording}
          onSend={handleSend}
          canSend={Boolean(recordedBlob)}
          isSending={isSending}
          showRetry={showRetry}
        />
      </S.ChatCard>
    </S.Page>
  );
}
