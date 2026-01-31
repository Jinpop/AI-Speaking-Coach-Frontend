import styled from "styled-components";

export const Page = styled.main`
  height: 100%;
  min-height: 0;
  padding: 16px clamp(16px, 4vw, 56px) 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: #f7f5f2;
  flex: 1;
  overflow: hidden;
`;

export const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const Title = styled.h1`
  margin: 0;
  font-size: clamp(24px, 3vw, 32px);
  letter-spacing: -0.02em;
`;

export const Description = styled.p`
  margin: 0;
  color: #6b7280;
  font-size: 14px;
`;

export const TopicRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

export const TopicPill = styled.span`
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  color: #1d4ed8;
  background: rgba(37, 99, 235, 0.1);
`;

export const ChatCard = styled.section`
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid rgba(148, 163, 184, 0.24);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 100%;
  max-height: 100%;
  min-height: 0;
`;

export const Messages = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
`;

export const MessageRow = styled.div<{ $role: "ai" | "user" }>`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  justify-content: ${({ $role }) =>
    $role === "user" ? "flex-end" : "flex-start"};
`;

export const Avatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #111827;
  color: #ffffff;
  font-size: 12px;
  font-weight: 700;
  display: grid;
  place-items: center;
`;

export const Bubble = styled.div<{ $role: "ai" | "user" }>`
  max-width: min(560px, 78%);
  padding: 12px 14px;
  border-radius: 14px;
  font-size: 14px;
  line-height: 1.5;
  background: ${({ $role }) => ($role === "user" ? "#111827" : "#f1f5f9")};
  color: ${({ $role }) => ($role === "user" ? "#ffffff" : "#0f172a")};
  border: ${({ $role }) =>
    $role === "user" ? "none" : "1px solid rgba(148, 163, 184, 0.24)"};
  display: flex;
  flex-direction: column;
`;

export const TypingDots = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;

  span {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #94a3b8;
    animation: typingPulse 1s infinite ease-in-out;
  }

  span:nth-child(2) {
    animation-delay: 0.15s;
  }

  span:nth-child(3) {
    animation-delay: 0.3s;
  }

  @keyframes typingPulse {
    0%,
    80%,
    100% {
      transform: scale(0.75);
      opacity: 0.5;
    }
    40% {
      transform: scale(1);
      opacity: 1;
    }
  }
`;

export const AudioRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
`;

export const LoadingRow = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  padding: 4px 8px;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.16);
  color: #64748b;
  font-size: 12px;
  font-weight: 600;
`;

export const LoadingIcon = styled.span`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid rgba(148, 163, 184, 0.4);
  border-top-color: #64748b;
  display: inline-block;
  animation: spin 0.9s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

export const AudioButton = styled.button<{ $playing?: boolean }>`
  width: 34px;
  height: 34px;
  padding: 0;
  border-radius: 50%;
  border: none;
  background: #111827;
  color: #ffffff;
  font-weight: 700;
  font-size: 12px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0;
`;

export const AudioMeta = styled.span`
  font-size: 12px;
  color: #94a3b8;
`;

export const AudioIcon = styled.svg`
  width: 14px;
  height: 14px;
  fill: #ffffff;
`;

export const PauseIcon = styled.svg`
  width: 14px;
  height: 14px;
  fill: #ffffff;
`;

export const InputBar = styled.div`
  border-top: 1px solid rgba(148, 163, 184, 0.24);
  padding: 12px 14px;
  display: flex;
  gap: 10px;
  align-items: center;
  background: #f8fafc;
`;

export const VoicePanel = styled.div`
  border-top: 1px solid rgba(148, 163, 184, 0.24);
  background: #f8fafc;
  padding: 18px 16px 16px;
  display: grid;
  gap: 14px;
`;

export const VoiceHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
`;

export const VoiceTitle = styled.span`
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
`;

export const VoiceHint = styled.span`
  font-size: 16px;
  color: #b91c1c;
  text-align: center;
  width: fit-content;
  font-weight: 700;
  margin: 0 auto;
  padding: 6px 12px;
  border-radius: 999px;
  background: #fee2e2;
  border: 1px solid rgba(185, 28, 28, 0.18);

  a {
    color: #2563eb;
    font-weight: 700;
    text-decoration: none;
  }
`;

export const MicCenter = styled.div`
  display: grid;
  place-items: center;
  padding: 8px 0 4px;
`;

export const MicWrap = styled.div`
  position: relative;
  width: 96px;
  height: 96px;
  display: grid;
  place-items: center;
`;

export const MicCircle = styled.button<{ $recording?: boolean }>`
  width: 84px;
  height: 84px;
  border-radius: 50%;
  border: none;
  background: ${({ $recording }) => ($recording ? "#ef4444" : "#111827")};
  display: grid;
  place-items: center;
  box-shadow: ${({ $recording }) =>
    $recording
      ? "0 12px 28px rgba(239, 68, 68, 0.35)"
      : "0 12px 24px rgba(15, 23, 42, 0.16)"};
  cursor: pointer;
  position: relative;
  z-index: 1;

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`;

export const MicIcon = styled.svg`
  width: 28px;
  height: 28px;
  fill: #ffffff;
`;

export const PlayIcon = styled.svg`
  width: 26px;
  height: 26px;
  fill: #ffffff;
`;

export const TimerRing = styled.svg`
  position: absolute;
  inset: 0;
  transform: rotate(-90deg);
  pointer-events: none;
`;

export const RingTrack = styled.circle`
  fill: none;
  stroke: rgba(148, 163, 184, 0.35);
  stroke-width: 6;
`;

export const RingProgress = styled.circle`
  fill: none;
  stroke: #ef4444;
  stroke-width: 6;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.2s linear;
`;

export const LevelRow = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 6px;
  height: 36px;
`;

export const LevelBar = styled.span<{ $height: number; $active?: boolean }>`
  width: 6px;
  height: ${({ $height }) => `${$height}px`};
  border-radius: 999px;
  background: ${({ $active }) => ($active ? "#ef4444" : "#cbd5f5")};
  transition: height 0.12s ease;
`;

export const Timer = styled.span<{ $recording?: boolean }>`
  font-size: 12px;
  color: ${({ $recording }) => ($recording ? "#ef4444" : "#94a3b8")};
  font-weight: 700;
  text-align: center;
`;

export const ButtonRow = styled.div`
  display: flex;
  gap: 10px;
  justify-content: center;
  flex-wrap: wrap;
`;

export const PrimaryButton = styled.button`
  padding: 10px 16px;
  border-radius: 12px;
  border: none;
  background: #111827;
  color: #ffffff;
  font-weight: 700;
  cursor: pointer;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const SecondaryButton = styled.button`
  padding: 10px 16px;
  border-radius: 12px;
  border: 1px solid rgba(15, 23, 42, 0.18);
  background: #ffffff;
  color: #111827;
  font-weight: 700;
  cursor: pointer;
`;

export const GhostButton = styled.button`
  padding: 10px 16px;
  border-radius: 12px;
  border: 1px dashed rgba(148, 163, 184, 0.6);
  background: transparent;
  color: #64748b;
  font-weight: 700;
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const FooterNote = styled.p`
  margin: 0;
  padding: 0 16px 16px;
  font-size: 12px;
  color: #94a3b8;
`;
