import { useState, useEffect } from "react";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import GradientButton from "./GradientButton";
import { Task } from "./TaskModal";

interface TaskDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task;
  onRequestPhotoUpload?: (task: Task) => void;
  isUploadingProof?: boolean;
  uploadStatus?: string | null;
}

const TaskDetailModal = ({ open, onOpenChange, task, onRequestPhotoUpload, isUploadingProof, uploadStatus }: TaskDetailModalProps) => {
  const [timer, setTimer] = useState(task.timerDuration || 0);
  const [isTimerActive, setIsTimerActive] = useState(false);

  // Reset timer when modal opens (but don't start it)
  useEffect(() => {
    if (open && task.timerDuration) {
      setTimer(task.timerDuration);
      setIsTimerActive(false);
    }
  }, [open, task.timerDuration]);

  // Timer countdown effect - only runs when timer is active
  useEffect(() => {
    if (!isTimerActive || !task.timerDuration) return;

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 0) {
          setIsTimerActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerActive, task.timerDuration]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!bg-primary-background border-none rounded-lg p-8 max-w-lg [&>button.absolute.right-4.top-4]:hidden">
        <DialogClose className="absolute right-6 top-6 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-0 disabled:pointer-events-none z-50">
          <X className="h-5 w-5 text-primary-accent" />
          <span className="sr-only">Close</span>
        </DialogClose>
        <DialogHeader className="mb-2">
          <DialogTitle className="text-3xl font-bold inder-text mb-3">
            <span className="text-primary-accent">Task</span>{" "}
            <span className="text-primary-accent/90 font-light">— {task.taskType}</span>
          </DialogTitle>
          <div className="h-px bg-primary-accent/40 w-full"></div>
        </DialogHeader>

        <div className="inder-text space-y-6">
          {/* Main Task with Icon */}
          <div className="flex items-center gap-5">
            {task.icon}
            <span className="text-primary-accent text-xl">{task.action}</span>
          </div>

          {/* AI Text Placeholder */}
          {task.aiReason && (
            <div>
              <p className="text-primary-accent/80 text-md mb-2">{task.aiReason}</p>
            </div>
          )}

          {/* Instructions */}
          <div className="space-y-1 !text-xl">
            {task.instructions.map((instruction, index) => (
              <p key={index} className={`text-primary-accent ${index === task.instructions.length - 1 ? 'text-lg' : ''}`}>
                {instruction}
              </p>
            ))}
            {task.timerDuration && isTimerActive && (
              <p className="text-primary-accent/80 text-sm">(timer: {formatTimer(timer)})</p>
            )}
          </div>

          {/* Action Button */}
          <div className="pt-4">
            <GradientButton
              onClick={() => {
                if (task.requiresPhoto && onRequestPhotoUpload) {
                  onRequestPhotoUpload(task);
                  return;
                }
                if (task.timerDuration && !isTimerActive) {
                  setIsTimerActive(true);
                  setTimer(task.timerDuration);
                }
              }}
              disabled={(task.requiresPhoto && isUploadingProof) || (isTimerActive && task.timerDuration !== undefined)}
              className="w-full inder-text text-lg font-bold py-3 rounded-lg shadow-md hover:scale-105 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {task.requiresPhoto && isUploadingProof
                ? "uploading photo..."
                : task.requiresPhoto
                  ? task.buttonText
                  : (isTimerActive && task.timerDuration ? `timer: ${formatTimer(timer)}` : task.buttonText)}
            </GradientButton>
            {uploadStatus && task.requiresPhoto && (
              <p className="text-primary-accent/70 text-xs mt-2">{uploadStatus}</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDetailModal;

