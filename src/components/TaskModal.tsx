import { useState } from "react";
import { X, Check, Calendar, Activity, Trees } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import TaskDetailModal from "./TaskDetailModal";
import DailyCheckInModal from "./DailyCheckInModal";
import NapIcon from "./icons/NapIcon";
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
}

interface TaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  username?: string;
  onTasksUpdate?: (tasks: Task[]) => void;
}

const TaskModal = ({ open, onOpenChange, username = "guest", onTasksUpdate }: TaskModalProps) => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskDetailOpen, setTaskDetailOpen] = useState(false);
  const [dailyCheckInOpen, setDailyCheckInOpen] = useState(false);

  // Sample tasks - you can replace this with actual data from your API
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      title: "Daily Check In",
      description: "Start your day with a quick scan to refresh your vitals and see what's new.",
      completed: false,
      taskType: "Daily Check In",
      action: "Start today's scan to refresh your vitals",
      icon: <Calendar className="text-primary-accent ml-2" width={32} height={32} />,
      instructions: [
        "Ready for today's adventure?",
        "Let's start today's scan to refresh your vitals",
        "and see what's new!"
      ],
      buttonText: "start scanning",
      timerDuration: undefined, // No timer for daily check in
      aiReason: undefined // No AI reason for daily check in
    },
    {
      id: "2",
      title: "Energy Low — Take a 30-min power nap",
      description: "Your energy levels are below optimal. A short power nap can help restore your alertness and improve cognitive function.",
      completed: false,
      taskType: "Energy Low",
      action: "Take a 30-min power nap",
      icon: <NapIcon className="text-primary-accent ml-2" width={32} height={32} />,
      instructions: [
        "Take a picture of your napping area to start a",
        "30-min timer",
        " - Scan yourself after 30 mins to reassess vitals"
      ],
      buttonText: "take a picture",
      timerDuration: 30 * 60, // 30 minutes in seconds
      aiReason: "Reason for the action: (ai text)"
    },
    {
      id: "3",
      title: "Stress High — Take a 10-min breathing exercise",
      description: "Your stress levels are elevated. A brief breathing exercise can help calm your nervous system.",
      completed: false,
      taskType: "Stress High",
      action: "Take a 10-min breathing exercise",
      icon: <Activity className="text-primary-accent ml-2" width={32} height={32} />,
      instructions: [
        "Find a quiet space and sit comfortably",
        "10-min timer",
        " - Scan yourself after 10 mins to reassess vitals"
      ],
      buttonText: "start exercise",
      timerDuration: 10 * 60, // 10 minutes in seconds
      aiReason: "Reason for the action: (ai text)"
    },
    {
      id: "4",
      title: "Hunger Low — Have a healthy snack",
      description: "Your hunger levels indicate you may need nourishment. A healthy snack can help maintain your energy.",
      completed: false,
      taskType: "Hunger Low",
      action: "Have a healthy snack",
      icon: <NapIcon className="text-primary-accent ml-2" width={32} height={32} />,
      instructions: [
        "Choose a nutritious snack",
        "Take a picture of your snack",
        " - Scan yourself after eating to reassess vitals"
      ],
      buttonText: "take a picture",
      timerDuration: undefined, // No timer for this task
      aiReason: "Reason for the action: (ai text)"
    },
    {
      id: "5",
      title: "Go for a nature walk",
      description: "Spending time in nature can help reduce stress, improve mood, and boost overall well-being.",
      completed: false,
      taskType: "Nature Walk",
      action: "Go for a 20-min nature walk",
      icon: <Trees className="text-primary-accent ml-2" width={32} height={32} />,
      instructions: [
        "Find a nearby park or nature trail",
        "20-min timer",
        " - Scan yourself after the walk to reassess vitals"
      ],
      buttonText: "start walk",
      timerDuration: 20 * 60, // 20 minutes in seconds
      aiReason: "Reason for the action: (ai text)"
    },
  ]);

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
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
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
            {tasks.map((task) => (
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
                <span
                  className={`text-primary-accent text-base ${
                    task.id === ""
                  }`}
                >
                  {task.title}
                </span>
              </button>
            ))}
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
        tasks={[]}
        username={username}
        onTasksUpdate={onTasksUpdate}
      />
    </>
  );
};

export default TaskModal;

