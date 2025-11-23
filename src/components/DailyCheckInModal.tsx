import { useState, useEffect } from "react";
import { X, Check, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import GradientButton from "./GradientButton";
import { Task } from "./TaskModal";

interface DailyCheckInModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tasks: Task[];
  username: string;
  onTasksUpdate?: (tasks: Task[]) => void;
}

type ScanState = 'idle' | 'initializing' | 'waiting' | 'processing' | 'complete';

const DailyCheckInModal = ({ open, onOpenChange, tasks, username, onTasksUpdate }: DailyCheckInModalProps) => {
  const [scanState, setScanState] = useState<ScanState>('idle');
  const [displayTasks, setDisplayTasks] = useState<Task[]>(tasks);
  const [scanStartTime, setScanStartTime] = useState<number | null>(null);

  const hasTasks = displayTasks && displayTasks.length > 0;
  const firstLetter = username && username !== "guest" ? username.charAt(0).toUpperCase() : "G";
  const isScanning = scanState === 'initializing' || scanState === 'waiting' || scanState === 'processing';
  const scanComplete = scanState === 'complete';

  // Poll for new scans when scanning
  useEffect(() => {
    if (scanState !== 'waiting' && scanState !== 'processing' || !open || !scanStartTime) return;

    const pollInterval = setInterval(async () => {
      try {
        // Check for latest scan
        const response = await fetch('http://localhost:3000/api/scan/latest');
        if (response.ok) {
          const scanData = await response.json();
          
          // Check if scan data exists and was created after scan start time
          // For now, we'll check if scan data exists (meaning a new scan was uploaded)
          if (scanData && Object.keys(scanData).length > 0) {
            // Check if this scan was created after we started scanning
            // We'll assume if scan data exists and we're polling, it's a new scan
            // In production, you'd compare timestamps
            
            // Scan detected, now processing
            setScanState('processing');
            
            // Fetch tasks based on scan results
            try {
              const tasksResponse = await fetch('http://localhost:3000/api/scan/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(scanData)
              });
              
              if (tasksResponse.ok) {
                const tasksData = await tasksResponse.json();
                const newTasks: Task[] = tasksData.tasks || [];
                setDisplayTasks(newTasks);
                if (onTasksUpdate) {
                  onTasksUpdate(newTasks);
                }
                setScanState('complete');
                setScanStartTime(null);
                return; // Exit polling
              }
            } catch (e) {
              // If tasks endpoint doesn't exist, determine tasks from scan data
            }
            
            // Fallback: determine tasks based on scan data
            const determinedTasks = determineTasksFromScan(scanData);
            setDisplayTasks(determinedTasks);
            if (onTasksUpdate) {
              onTasksUpdate(determinedTasks);
            }
            setScanState('complete');
            setScanStartTime(null);
          }
        }
      } catch (error) {
        console.error("Error polling for scan:", error);
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(pollInterval);
  }, [scanState, open, scanStartTime, onTasksUpdate]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (open) {
      // Always start in initial state when modal opens
      setScanState('idle');
      setDisplayTasks([]);
      setScanStartTime(null);
    } else {
      setScanState('idle');
      setDisplayTasks([]);
      setScanStartTime(null);
    }
  }, [open]);
  
  // Update display tasks when tasks prop changes (after scan completes)
  useEffect(() => {
    if (tasks && tasks.length >= 0 && (scanState === 'waiting' || scanState === 'processing') && open) {
      setDisplayTasks(tasks);
      setScanState('complete');
    }
  }, [tasks, scanState, open]);

  // Helper function to determine tasks from scan data
  const determineTasksFromScan = (scanData: any): Task[] => {
    // This is a placeholder - you'll need to implement logic based on your scan data structure
    // For now, return empty array (healthy state) or sample tasks based on scan metrics
    const tasks: Task[] = [];
    
    // Example: If energy is low, add nap task
    // You'll need to adjust this based on your actual scan data structure
    return tasks;
  };

  const handleStartScanning = () => {
    setScanState('initializing');
    setScanStartTime(Date.now()); // Record when scanning started
    
    // Simulate initialization delay, then switch to waiting state
    setTimeout(() => {
      setScanState('waiting');
    }, 1000);
    
    // The polling will handle detecting when scan is complete
  };
  
  const getButtonText = () => {
    switch (scanState) {
      case 'initializing':
        return 'initializing scan...';
      case 'waiting':
        return 'waiting for scan to complete...';
      case 'processing':
        return 'processing scan data...';
      default:
        return 'start scanning';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!bg-primary-background border-none rounded-lg p-8 max-w-lg [&>button.absolute.right-4.top-4]:hidden">
        <DialogClose className="absolute right-6 top-6 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-0 disabled:pointer-events-none z-50">
          <X className="h-5 w-5 text-primary-accent" />
          <span className="sr-only">Close</span>
        </DialogClose>
        <DialogHeader className="mb-4">
          <DialogTitle className="text-4xl font-bold text-primary-accent inder-text mb-3">
            Daily Check In
          </DialogTitle>
          <div className="h-px bg-primary-accent/40 w-full"></div>
        </DialogHeader>

        <div className="inder-text space-y-4 relative">
          {!scanComplete ? (
            /* Initial State - Start Scanning */
            <>
              <p className="text-primary-accent text-lg">
                Ready for today's adventure?
              </p>
              <p className="text-primary-accent text-base">
                Let's start today's scan to refresh your vitals
              </p>
              <p className="text-primary-accent text-base">
                and see what's new!
              </p>
              
              <div className="pt-4">
                <GradientButton
                  onClick={handleStartScanning}
                  disabled={isScanning}
                  className="w-full inder-text text-lg font-bold py-3 rounded-lg shadow-md hover:scale-105 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                >
                  {isScanning ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>{getButtonText()}</span>
                    </>
                  ) : (
                    "start scanning"
                  )}
                </GradientButton>
              </div>
            </>
          ) : (
            /* Scan Complete State - Show Results */
            <>
              <p className="text-primary-accent text-lg">Scan Complete!</p>

              {hasTasks ? (
                <>
                  {/* Tasks Available */}
                  <p className="text-primary-accent text-base">
                    Here are your new tasks for today:
                  </p>
                  
                  {/* Task List */}
                  <div className="space-y-2">
                    {displayTasks.map((task, index) => (
                      <div key={task.id} className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-accent flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                        <span
                          className={`text-primary-accent text-base ${
                            index === 1 ? "underline" : ""
                          }`}
                        >
                          {task.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                /* No Tasks Available */
                <p className="text-primary-accent/80 text-base">
                  Looking healthy! You have no new tasks for today
                </p>
              )}
            </>
          )}

          {/* User Icon - Bottom Right */}
          <div className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-primary-accent/30 flex items-center justify-center shadow-md">
            <span className="text-primary-accent font-bold text-lg">{firstLetter}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DailyCheckInModal;

