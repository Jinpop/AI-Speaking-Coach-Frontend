import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMembershipStatus } from "../../../shared/api/membership";
import { postChatSTT, postChatTTS, streamChatLLM } from "../../../shared/api/chat";
import { CHAT_AUDIO, CHAT_UI } from "../constants";
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
  // 사용자가 방금 녹음한 원본 오디오(전송/STT/미리듣기 용)
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  // recordedBlob의 길이(초). 너무 짧은 녹음 전송 방지용
  const [recordedDuration, setRecordedDuration] = useState<number | null>(null);
  // 전송(STT→LLM→TTS) 파이프라인 진행 중 플래그
  const [isSending, setIsSending] = useState(false);
  // 전송 과정에서 발생한 사용자 노출 에러 메시지
  const [sendError, setSendError] = useState<string | null>(null);
  // 화면에 표시되는 대화 메시지 목록(사용자/AI)
  const [messages, setMessages] = useState<Message[]>([]);
  // 현재 재생 중인 메시지 id(없으면 null)
  const [playingId, setPlayingId] = useState<string | null>(null);

  // 메시지별 오디오 재생을 위한 단일 Audio 인스턴스(중복 재생 방지)
  const messageAudioRef = useRef<HTMLAudioElement | null>(null);
  // 메시지 스크롤 컨테이너 ref(오토스크롤/스크롤 감지에 사용)
  const messagesRef = useRef<HTMLDivElement | null>(null);
  // createObjectURL로 만든 URL들을 모아두고 unmount 시 revokeObjectURL 처리
  const audioUrlsRef = useRef<Set<string>>(new Set());
  // 사용자가 수동 스크롤로 위를 보고 있으면 오토스크롤을 끄기 위한 플래그
  const autoScrollRef = useRef(true);

  // 메시지 영역을 맨 아래로 스크롤(새 메시지 도착 시 사용)
  const scrollToBottom = useCallback(() => {
    const container = messagesRef.current;
    if (!container) return;
    container.scrollTop = container.scrollHeight;
  }, []);

  const {
    // useChatAudio: 녹음/연결/재생 상태 + UI 표시 값 + 제어 함수들을 제공
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

  // 녹음 시작: 에러 초기화 후 hook을 통해 마이크 녹음 시작
  const handleStartRecording = useCallback(() => {
    setSendError(null);
    startRecording();
  }, [startRecording]);

  // 녹음 리셋: 화면/상태 초기화 + hook 내부 녹음 상태 리셋
  const handleResetRecording = useCallback(() => {
    setSendError(null);
    setRecordedBlob(null);
    setRecordedDuration(null);
    resetRecording();
  }, [resetRecording]);

  // 메시지 오디오 재생 중단(정지/되감기)
  const stopMessagePlayback = useCallback(() => {
    if (messageAudioRef.current) {
      messageAudioRef.current.pause();
      messageAudioRef.current.currentTime = 0;
    }
    setPlayingId(null);
  }, []);

  // 특정 메시지의 오디오를 재생(같은 메시지를 다시 누르면 토글로 정지)
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

  // 녹음된 음성을 서버로 보내고(STT) → LLM 스트리밍 응답을 받으며 UI 갱신 → TTS 생성 후 재생
  const handleSend = useCallback(async () => {
    if (!recordedBlob || isSending) return;
    setIsSending(true);
    setSendError(null);
    try {
      // 1) 전송 전 유효성 검사(너무 짧은 녹음 방지)
      if (recordedDuration !== null && recordedDuration < CHAT_AUDIO.minRecordingSeconds) {
        setSendError("음성이 너무 짧아요. 다시 녹음해 주세요.");
        return;
      }
      if (recordedBlob.size < CHAT_AUDIO.minRecordingBytes) {
        setSendError("녹음이 너무 짧아 전송할 수 없어요. 다시 녹음해 주세요.");
        return;
      }

      // 2) STT로 유저 발화 텍스트 추출(프로젝트 요구사항: 영어 입력만 허용)
      const { userText } = await postChatSTT(recordedBlob);
      const hasKorean = /[가-힣]/.test(userText);
      if (hasKorean) {
        setSendError("영어로 말해주세요");
        return;
      }

      // 3) 현재 녹음 오디오를 로컬 URL로 만들어 메시지에 붙임(미리듣기/재생)
      const userAudioUrl = URL.createObjectURL(recordedBlob);
      audioUrlsRef.current.add(userAudioUrl);
      const baseId = Date.now().toString();
      const userId = `${baseId}-user`;
      const aiId = `${baseId}-ai`;

      // 4) 이전 대화 히스토리를 LLM 입력 포맷으로 변환
      const history = messages.map((message) => ({
        role: message.role === "ai" ? "assistant" : "user",
        content: message.text,
      }));

      // 5) UI에 유저 메시지 + 비어있는 AI 메시지(스트리밍 자리 표시) 추가
      setMessages((prev) => [
        ...prev,
        { id: userId, role: "user", text: userText, audioUrl: userAudioUrl },
        { id: aiId, role: "ai", text: "", isPending: true, isAudioLoading: false },
      ]);

      // 6) LLM 스트리밍 응답(SSE 유사)을 읽으면서 AI 텍스트를 점진적으로 업데이트
      const stream = await streamChatLLM(userText, history);
      const reader = stream.getReader();
      let buffer = "";
      let aiText = "";
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

          if (payload?.type === "meta") continue;
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

      // 7) 텍스트 스트리밍이 끝나면 TTS 생성 중 로딩 표시
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === aiId ? { ...msg, isAudioLoading: true } : msg,
        ),
      );

      // 8) TTS 생성 후 AI 메시지에 오디오 URL을 붙이고(필요 시 data URL로 보정) 자동 재생
      const { aiAudioBase64 } = await postChatTTS(aiText);
      const aiAudioUrl = aiAudioBase64.includes(",")
        ? aiAudioBase64
        : `${CHAT_UI.aiAudioDataUrlPrefix}${aiAudioBase64}`;
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

      // 9) 한 턴 완료 후 다음 입력을 위해 녹음 상태 초기화
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
    // 멤버십이 없으면(또는 조회 실패 시) 채팅 페이지 접근을 막고 404로 이동
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
    // recordedBlob이 바뀌면 브라우저 메타데이터로 duration을 계산(짧은 녹음 전송 방지용)
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
    const urls = audioUrlsRef.current;
    return () => {
      // 페이지 이탈 시 재생/URL 리소스 정리
      stopMessagePlayback();
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [stopMessagePlayback]);

  useLayoutEffect(() => {
    // 새 메시지가 추가될 때, 사용자가 바닥 근처를 보고 있으면 자동으로 아래로 스크롤
    if (!autoScrollRef.current) return;
    const id = window.requestAnimationFrame(scrollToBottom);
    return () => window.cancelAnimationFrame(id);
  }, [messages, scrollToBottom]);

  // 사용자가 스크롤로 위를 탐색 중이면 autoScrollRef를 꺼서 강제 스크롤을 막음
  const handleMessagesScroll = useCallback(() => {
    const container = messagesRef.current;
    if (!container) return;
    const threshold = CHAT_UI.autoScrollThresholdPx;
    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    autoScrollRef.current = distanceFromBottom <= threshold;
  }, []);

  // 녹음 중/재생 중/연결 중/메시지 오디오 재생 중에는 마이크 조작을 막음
  const micDisabled =
    isAiPlaying || isPlaying || isConnecting || Boolean(playingId);
  // 녹음 완료 상태에선 에러 메시지를 우선 표시(없으면 빈 문자열)
  const hint = status === "finished" ? (sendError ?? "") : displayHint;
  // 에러가 있으면 재시도 UI 노출
  const showRetry = Boolean(sendError);

  return (
    <S.Page>
      <ChatHeader />
      <S.ChatCard>
        <S.Messages ref={messagesRef} onScroll={handleMessagesScroll}>
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
