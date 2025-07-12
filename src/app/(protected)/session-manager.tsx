"use client";

import { ReactNode } from "react";

import { useInactivityTimer } from "@/hooks/use-inactivity-timer";

import SessionWarningDialogue from "./session-warning-dialogue";

interface Props {
  children: ReactNode;
  timeout: number;
}

export default function SessionManager({ children, timeout }: Props) {
  const { resetTimer, showWarning, timeRemaining } =
    useInactivityTimer(timeout);

  return (
    <>
      {children}
      <SessionWarningDialogue
        isOpen={showWarning}
        onStaySignedIn={resetTimer}
        timeRemaining={timeRemaining}
      />
    </>
  );
}
