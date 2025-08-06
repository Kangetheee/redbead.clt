"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import CircularProgress from "@/components/ui/circular-progress";
import { ONE_MINUTE, WARNING_TIME } from "@/hooks/use-inactivity-timer";

interface Props {
  isOpen: boolean;
  onStaySignedIn: () => void;
  timeRemaining: number;
}

export default function SessionWarningDialogue({
  isOpen,
  onStaySignedIn,
  timeRemaining,
}: Props) {
  const progressPercentage = (timeRemaining / WARNING_TIME) * 100;
  const minutes = Math.floor(timeRemaining / ONE_MINUTE);
  const seconds = Math.floor((timeRemaining % ONE_MINUTE) / 1000);

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Session Expiring Soon</AlertDialogTitle>
          <AlertDialogDescription>
            Your session is about to expire due to inactivity. Would you like to
            stay signed in?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="my-4 flex justify-center">
          <CircularProgress
            progress={progressPercentage}
            size={200}
            strokeWidth={15}
          >
            <div className="text-center">
              <div className="text-2xl font-bold">{minutes} Min</div>
              <div className="text-xl">{seconds} Sec</div>
            </div>
          </CircularProgress>
        </div>
        <AlertDialogFooter>
          <AlertDialogAction onClick={onStaySignedIn}>
            Stay Signed In
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
