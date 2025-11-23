import { useEffect, useState } from "react";
import { X, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import TaskDetailModal from "./TaskDetailModal";
import DailyCheckInModal from "./DailyCheckInModal";
import { ReactElement } from "react";

export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  taskType: string; // e.g., "Energy Low", "Stress High"
  action: string; // e.g., "Take a 30-min power nap"
  icon: ReactElement; // Icon component
  instructions: string[]; // Array of instruction strings
  buttonText: string; // Button action text
  timerDuration?: number; // Timer duration in seconds (optional)
  aiReason?: string; // AI-generated reason text (optional)
  requiresPhoto?: boolean;
}

interface TaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  username?: string;
  onTasksUpdate?: (tasks: Task[]) => void;
  tasks?: Task[];
}

const TaskModal = ({ open, onOpenChange, username = "guest", onTasksUpdate, tasks = [] }: TaskModalProps) => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskDetailOpen, setTaskDetailOpen] = useState(false);
  const [dailyCheckInOpen, setDailyCheckInOpen] = useState(false);
  const [localTasks, setLocalTasks] = useState<Task[]>(tasks);

  // Keep local snapshot in sync with upstream tasks
  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  const handleTaskClick = (task: Task) => {
    // If it's the Daily Check In task, open DailyCheckInModal instead
    if (task.id === "1" || task.taskType === "Daily Check In") {
      setDailyCheckInOpen(true);
      // Close the task list modal when opening Daily Check In
      onOpenChange(false);
    } else {
      setSelectedTask(task);
      setTaskDetailOpen(true);
    }
  };

  const handleTaskComplete = (taskId: string) => {
    setLocalTasks(prevTasks => {
      const updated = prevTasks.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      );
      onTasksUpdate?.(updated);
      return updated;
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="!bg-primary-background/95 border-none rounded-lg p-8 max-w-lg [&>button.absolute.right-4.top-4]:hidden">
          <DialogClose className="absolute right-6 top-6 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-0 disabled:pointer-events-none z-50">
            <X className="h-5 w-5 text-primary-accent" />
            <span className="sr-only">Close</span>
          </DialogClose>
          <DialogHeader className="mb-2">
            <DialogTitle className="text-4xl font-bold text-primary-accent inder-text mb-3">
              List of Tasks
            </DialogTitle>
            <div className="h-px bg-primary-accent/40 w-full"></div>
          </DialogHeader>

          <div className="space-y-3 inder-text mb-3">
            {tasks.length === 0 ? (
              <p className="text-primary-accent/70 text-base pl-1">
                All vitals look strong right now. Once a bar falls below 75%, a matching task will appear here.
              </p>
            ) : (
              localTasks.map((task) => (
                <button
                  key={task.id}
                  onClick={() => handleTaskClick(task)}
                  className="w-full flex items-center gap-3 p-3 -ml-1 rounded-lg hover:bg-primary-accent/10 transition-colors text-left"
                >
                  <div
                    className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                      task.completed
                        ? "bg-primary-accent border-primary-accent"
                        : "border-primary-accent"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTaskComplete(task.id);
                    }}
                  >
                    {task.completed && (
                      <Check className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <span className="text-primary-accent text-base">
                    {task.title}
                  </span>
                </button>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {selectedTask && (
        <TaskDetailModal
          open={taskDetailOpen}
          onOpenChange={setTaskDetailOpen}
          task={selectedTask}
        />
      )}

      {/* Daily Check In Modal */}
      <DailyCheckInModal
        open={dailyCheckInOpen}
        onOpenChange={setDailyCheckInOpen}
        tasks={localTasks}
        username={username}
        onTasksUpdate={onTasksUpdate}
      />
    </>
  );
};

export default TaskModal;

