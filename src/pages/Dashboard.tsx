import { useState, useEffect, useRef, useCallback, ReactElement } from "react";
import { Progress } from "@/components/ui/progress";
import dashboardBackground from "@/assets/dashboard-background.png";
import mascot from "@/assets/mascots/mascot.png";
import overall from "@/assets/overall1.png";
import hungry from "@/assets/hungry1.png";
import sleepy from "@/assets/sleepy1.png";
import stressed from "@/assets/stressed1.png";
import Rectangle from "@/components/Rectangle";
import HeartIcon from "@/components/icons/HeartIcon";
import EnergyIcon from "@/components/icons/EnergyIcon";
import HungerIcon from "@/components/icons/HungerIcon";
import StressIcon from "@/components/icons/StressIcon";
import PhysicalIcon from "@/components/icons/PhysicalIcon";
import TaskIcon from "@/components/icons/TaskIcon";
import ChatIcon from "@/components/icons/ChatIcon";
import SettingsIcon from "@/components/icons/SettingsIcon";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import SettingsModal from "@/components/SettingsModal";
import ChatModal from "@/components/ChatModal";
import ScanModal from "@/components/ScanModal";
import TaskModal, { Task } from "@/components/TaskModal";
import DailyCheckInModal from "@/components/DailyCheckInModal";
import PlayButton from "@/components/PlayButton";
import RefreshIcon from "@/components/icons/RefreshIcon";
import { authStorage, authAPI } from "@/lib/api";
import ScanSummaryModal from "@/components/ScanSummaryModal";
import NapIcon from "@/components/icons/NapIcon";
import { Activity, Trees } from "lucide-react";

// Define an interface for the stats for type safety
interface Stat {
  icon: React.ElementType;
  value: number;
  max: number;
  description: string;
}

interface Justification {
  score: number;
  justification: string;
}

interface ScanSummary {
  overall_health: Justification;
  hunger: Justification;
  stress_level: Justification;
  energy_level: Justification;
  sleep_quality: Justification;
}

const TASK_THRESHOLD = 75;
const MIN_TASKS = 2;

type StatKey = "overall_health" | "hunger" | "energy_level" | "stress_level" | "sleep_quality";

type ScanVitals = {
  pulse?: number[];
  breathing?: number[];
  ie_ratio?: number[];
  breath_amp?: number[];
  blood_pressure?: number[];
  apnea?: number[];
};

const taskBuilders: Record<StatKey, () => Task> = {
  overall_health: () => ({
    id: "overall_health",
    title: "Daily Check In",
    description: "Start your day with a quick scan to refresh your vitals and see what's new.",
    completed: false,
    taskType: "Daily Check In",
    action: "Start today's scan to refresh your vitals",
    icon: <HeartIcon className="text-primary-accent ml-2" width={28} height={28} />,
    instructions: [
      "Ready for today's adventure?",
      "Let's start today's scan to refresh your vitals",
      "and see what's new!",
    ],
    buttonText: "start scanning",
  }),
  hunger: () => ({
    id: "hunger",
    title: "Hunger Low — Have a healthy snack",
    description: "Your hunger levels indicate you may need nourishment. A healthy snack can help maintain your energy.",
    completed: false,
    taskType: "Hunger Support",
    action: "Have a healthy snack",
    icon: <NapIcon className="text-primary-accent ml-2" width={32} height={32} />,
    instructions: [
      "Choose a nutritious snack",
      "Take a picture of your snack",
      " - Scan yourself after eating to reassess vitals",
    ],
    buttonText: "take a picture",
    aiReason: "Reason for the action: (ai text)",
  }),
  energy_level: () => ({
    id: "energy_level",
    title: "Energy Low — Take a 30-min power nap",
    description: "Your energy levels are below optimal. A short power nap can help restore your alertness and improve cognitive function.",
    completed: false,
    taskType: "Energy Support",
    action: "Take a 30-min power nap",
    icon: <NapIcon className="text-primary-accent ml-2" width={32} height={32} />,
    instructions: [
      "Take a picture of your napping area to start a",
      "30-min timer",
      " - Scan yourself after 30 mins to reassess vitals",
    ],
    buttonText: "take a picture",
    timerDuration: 30 * 60,
    aiReason: "Reason for the action: (ai text)",
  }),
  stress_level: () => ({
    id: "stress_level",
    title: "Stress High — Take a 10-min breathing exercise",
    description: "Your stress levels are elevated. A brief breathing exercise can help calm your nervous system.",
    completed: false,
    taskType: "Stress Relief",
    action: "Take a 10-min breathing exercise",
    icon: <Activity className="text-primary-accent ml-2" width={32} height={32} />,
    instructions: [
      "Find a quiet space and sit comfortably",
      "10-min timer",
      " - Scan yourself after 10 mins to reassess vitals",
    ],
    buttonText: "start exercise",
    timerDuration: 10 * 60,
    aiReason: "Reason for the action: (ai text)",
  }),
  sleep_quality: () => ({
    id: "sleep_quality",
    title: "Go for a nature walk",
    description: "Spending time in nature can help reduce stress, improve mood, and boost overall well-being.",
    completed: false,
    taskType: "Sleep Support",
    action: "Go for a 20-min nature walk",
    icon: <Trees className="text-primary-accent ml-2" width={32} height={32} />,
    instructions: [
      "Find a nearby park or nature trail",
      "20-min timer",
      " - Scan yourself after the walk to reassess vitals",
    ],
    buttonText: "start walk",
    timerDuration: 20 * 60,
    aiReason: "Reason for the action: (ai text)",
  }),
};

const buildTasksFromStats = (statValues: Record<StatKey, number>): Task[] => {
  const orderedKeys: StatKey[] = ["overall_health", "hunger", "energy_level", "stress_level", "sleep_quality"];

  const tasks: Task[] = [];
  orderedKeys.forEach((key) => {
    if (statValues[key] < TASK_THRESHOLD) {
      const template = taskBuilders[key];
      if (template) tasks.push(template());
    }
  });

  if (tasks.length < MIN_TASKS) {
    const missingKeys = orderedKeys
      .filter((key) => !tasks.find((task) => task.id === key))
      .sort((a, b) => statValues[a] - statValues[b]);

    for (const key of missingKeys) {
      if (tasks.length >= MIN_TASKS) break;
      const template = taskBuilders[key];
      if (template) tasks.push(template());
    }
  }

  return tasks.slice(0, 4);
};

const Dashboard = () => {
  const [username, setUsername] = useState<string>("");
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
  const [chatOpen, setChatOpen] = useState<boolean>(false);
  const [scanModalOpen, setScanModalOpen] = useState<boolean>(false);
  const [taskModalOpen, setTaskModalOpen] = useState<boolean>(false);
  const [dailyCheckInOpen, setDailyCheckInOpen] = useState<boolean>(false);
  const [newTasks, setNewTasks] = useState<Task[]>([]);
  const initialStats: Stat[] = [
    { icon: HeartIcon, value: 50, max: 100, description: "Overall health and wellness" },
    { icon: HungerIcon, value: 50, max: 100, description: "Hunger level and appetite. Higher is more full." },
    { icon: EnergyIcon, value: 50, max: 100, description: "Energy level and vitality" },
    { icon: StressIcon, value: 50, max: 100, description: "Stress balance and calmness. Higher is calmer." },
    { icon: PhysicalIcon, value: 50, max: 100, description: "Physical wellness and fitness" },
  ];
  const [scanSummary, setScanSummary] = useState<ScanSummary | null>(null);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState<boolean>(false);

  const [rawStats, setRawStats] = useState<{
    overall_health: number;
    hunger: number;
    energy_level: number;
    stress_level: number;
    sleep_quality: number;
  }>({
    overall_health: initialStats[0].value,
    hunger: initialStats[1].value,
    energy_level: initialStats[2].value,
    stress_level: initialStats[3].value,
    sleep_quality: initialStats[4].value,
  });
  const [stats, setStats] = useState<Stat[]>(initialStats);
  const [scanVitals, setScanVitals] = useState<ScanVitals | null>(null);

  const fetchScanVitals = useCallback(async () => {
    try {
      if (typeof window === 'undefined') return;
      if (!(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) return;
      const response = await fetch('http://localhost:3000/api/scan/latest');
      if (!response.ok) {
        throw new Error('Failed to fetch latest scan');
      }
      const scanData = await response.json();
      setScanVitals({
        pulse: scanData.pulse,
        breathing: scanData.breathing,
        ie_ratio: scanData.ie_ratio,
        breath_amp: scanData.breath_amp,
        blood_pressure: scanData.blood_pressure,
        apnea: scanData.apnea,
      });
      console.log('Latest scan vitals:', scanData);
    } catch (error) {
      console.warn('Failed to fetch scan vitals:', error);
    }
  }, []);

  const fetchStats = async () => {
    try {
        // Only fetch stats if we're in development (localhost backend)
        // In production, use default stats
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
          
        const response = await fetch('http://localhost:3000/api/stats', {
            signal: controller.signal
          });
          clearTimeout(timeoutId);
          
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          const data = await response.json();
        
        // Store raw stats for mascot selection
        const statSnapshot = {
            overall_health: data.overall_health,
            hunger: data.hunger,
            energy_level: data.energy_level,
            stress_level: data.stress_level,
            sleep_quality: data.sleep_quality,
        };
        setRawStats(statSnapshot);
        
        // Map backend data to frontend stats structure
        const newStats: Stat[] = [
            { icon: HeartIcon, value: data.overall_health, max: 100, description: "Overall health and wellness" },
            { icon: HungerIcon, value: data.hunger, max: 100, description: "Hunger level and appetite. Higher is more full." },
            { icon: EnergyIcon, value: data.energy_level, max: 100, description: "Energy level and vitality" },
            { icon: StressIcon, value: data.stress_level, max: 100, description: "Stress balance and calmness. Higher is calmer." },
            { icon: PhysicalIcon, value: data.sleep_quality, max: 100, description: "Physical wellness and fitness" },
        ];
        setStats(newStats);
        setNewTasks(buildTasksFromStats(statSnapshot));
        fetchScanVitals();
        if (data.scan_summary) {
          setScanSummary(data.scan_summary);
          setIsSummaryModalOpen(true);
        }
        } else {
          // In production, keep default stats
          console.log("Using default stats (production mode)");
        }
    } catch (error) {
        // Silently fail - use default stats
        if (error instanceof Error && error.name !== 'AbortError') {
          console.warn("Failed to fetch stats (using defaults):", error);
        }
    }
  };

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);

  const resolveWebSocketUrl = () => {
    const protocol = typeof window !== "undefined" && window.location.protocol === "https:" ? "wss" : "ws";
    const defaultUrl = typeof window !== "undefined" ? `${protocol}://${window.location.hostname}:8080` : "ws://localhost:8080";
    return import.meta.env.VITE_WS_URL || defaultUrl;
  };

  const connectWebSocket = useCallback(() => {
    if (typeof window === "undefined") return;
    const url = resolveWebSocketUrl();

    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    try {
      const socket = new WebSocket(url);
      wsRef.current = socket;

      socket.onopen = () => {
        console.log("WebSocket connection established");
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      };

      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === 'ai_analysis') {
            console.log('Received AI analysis payload:', message.data);
            const newStats: Stat[] = [
                { icon: HeartIcon, value: message.data.overall_health.score, max: 100, description: "Overall health and wellness" },
                { icon: HungerIcon, value: message.data.hunger.score, max: 100, description: "Hunger level and appetite. Higher is more full." },
                { icon: EnergyIcon, value: message.data.energy_level.score, max: 100, description: "Energy level and vitality" },
                { icon: StressIcon, value: message.data.stress_level.score, max: 100, description: "Stress balance and calmness. Higher is calmer." },
                { icon: PhysicalIcon, value: message.data.sleep_quality.score, max: 100, description: "Physical wellness and fitness" },
            ];
            setStats(newStats);
            const statSnapshot = {
              overall_health: message.data.overall_health.score,
              hunger: message.data.hunger.score,
              energy_level: message.data.energy_level.score,
              stress_level: message.data.stress_level.score,
              sleep_quality: message.data.sleep_quality.score,
            } as Record<StatKey, number>;
            setRawStats(statSnapshot);
            setNewTasks(buildTasksFromStats(statSnapshot));
            setScanSummary(message.data);
            setIsSummaryModalOpen(true);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      socket.onerror = (error) => {
        console.warn('WebSocket connection error:', error);
        socket.close();
      };

      socket.onclose = () => {
        console.log('WebSocket connection closed, retrying in 3s');
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        reconnectTimeoutRef.current = window.setTimeout(() => {
          connectWebSocket();
        }, 3000);
      };
    } catch (error) {
      console.warn("Failed to connect WebSocket, retrying in 3s:", error);
      reconnectTimeoutRef.current = window.setTimeout(() => {
        connectWebSocket();
      }, 3000);
    }
  }, []);

  useEffect(() => {
    const loadUser = async () => {
      try {
        // First check if user is stored locally (fast, synchronous)
        const storedUser = authStorage.getUser();
        if (storedUser?.username) {
          setUsername(storedUser.username);
          return;
        }

        // If not stored, try to get profile from API with timeout
        const profilePromise = authAPI.getProfile();
        const timeoutPromise = new Promise<null>((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 3000)
        );
        
        const user = await Promise.race([profilePromise, timeoutPromise]);
        if (user?.username) {
          setUsername(user.username);
          authStorage.setUser(user);
        } else {
          // No user found, set to guest
          setUsername("guest");
        }
      } catch (error) {
        // User is not logged in or error occurred - set to guest immediately
        setUsername("guest");
      }
    };

    // Load user and stats in parallel (non-blocking)
    loadUser();
    fetchStats();

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
        wsRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };
  }, [connectWebSocket]);

  const getColorClass = (value: number, max: number): string => {
    const percentage = (value / max) * 100;
    if (percentage >= 80) {
      return "bg-green-300";
    } else if (percentage >= 50) {
      return "bg-yellow-200";
    } else if (percentage >= 20) {
      return "bg-orange-300";
    } else {
      return "bg-red-300";
    }
  };

  const getMascotImage = () => {
    const { overall_health, hunger, energy_level, stress_level, sleep_quality } = rawStats;
    
    // If overall_health is 29 or lower, use "overall"
    if (overall_health <= 29) {
      return overall;
    }
    
    // If all stats are 70 or above, use "mascot"
    if (overall_health >= 70 && hunger >= 70 && energy_level >= 70 && stress_level >= 70 && sleep_quality >= 70) {
      return mascot;
    }
    
    // Otherwise, find the lowest stat (check in priority order for ties)
    const statsToCheck = [
      { name: 'hunger', value: hunger, image: hungry },
      { name: 'energy_level', value: energy_level, image: sleepy },
      { name: 'stress_level', value: stress_level, image: stressed },
      { name: 'sleep_quality', value: sleep_quality, image: sleepy },
    ];
    
    // Find the minimum value
    const minValue = Math.min(hunger, energy_level, stress_level, sleep_quality);
    
    // Return the first stat with the minimum value (priority order)
    const lowestStat = statsToCheck.find(stat => stat.value === minValue);
    return lowestStat?.image || mascot;
  };

  const handleRefreshStats = async () => {
    try {
        console.log("Recomputing stats from the latest scan...");
        const response = await fetch('http://localhost:3000/api/stats/recompute', { method: 'POST' });
        if (!response.ok) {
            throw new Error('Failed to recompute stats');
        }
        // After recomputing, fetch the latest stats to update the UI
        const data = await response.json();
        console.log('Fetched stats payload:', data);
        
        // Store raw stats for mascot selection
        setRawStats({
            overall_health: data.overall_health,
            hunger: data.hunger,
            energy_level: data.energy_level,
            stress_level: data.stress_level,
            sleep_quality: data.sleep_quality,
        });
        
        const newStats: Stat[] = [
            { icon: HeartIcon, value: data.overall_health, max: 100, description: "Overall health and wellness" },
            { icon: HungerIcon, value: data.hunger, max: 100, description: "Hunger level and appetite. Higher is more full." },
            { icon: EnergyIcon, value: data.energy_level, max: 100, description: "Energy level and vitality" },
            { icon: StressIcon, value: data.stress_level, max: 100, description: "Stress balance and calmness. Higher is calmer." },
            { icon: PhysicalIcon, value: data.sleep_quality, max: 100, description: "Physical wellness and fitness" },
        ];
        setStats(newStats);
        alert("Stats have been recomputed based on the latest scan.");
    } catch (error) {
        console.error("Failed to recompute stats:", error);
        alert("Could not recompute stats. Make sure a scan has been performed.");
    }
  };


  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${dashboardBackground})` }}
      />
      
      {/* Content */}
      <div className="relative min-h-screen p-8">
        {/* Top Bar */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <Rectangle className="-ml-8 text-primary-accent inder-text font-weight-bold text-5xl" username={`${username}'s vitals`} />
          </div>
          
          <div className="flex flex-col gap-3 items-end">
          <div className="flex gap-3 items-center">
              <button 
                onClick={() => setTaskModalOpen(true)}
                className="w-16 h-16 rounded-full bg-foreground/10 flex items-center justify-center hover:scale-110 transition-all duration-300"
              >
                <TaskIcon className="w-7 h-7 text-foreground" />
              </button>
              <button 
                onClick={() => setChatOpen(true)}
                className="w-16 h-16 rounded-full bg-foreground/10 flex items-center justify-center hover:scale-110 transition-all duration-300"
              >
                <ChatIcon className="w-9 h-9 text-foreground" />
              </button>
              <button
                onClick={() => setSettingsOpen(true)}
                className="w-16 h-16 rounded-full bg-foreground/10 flex items-center justify-center hover:scale-110 transition-all duration-300"
              >
                <SettingsIcon className="w-9 h-9 text-foreground" />
            </button>
            </div>
            <div className="flex gap-3 items-center">
              <button 
                onClick={() => setScanModalOpen(true)}
                className="flex items-center gap-3 bg-foreground/10 text-white px-5 py-3 rounded-full shadow-lg hover:scale-105 transition-all duration-300"
              >
                <PlayButton className="text-white" width={32} height={32} />
                <span className="inder-text text-lg font-medium">scan</span>
            </button>
              <button 
                onClick={handleRefreshStats}
                className="flex items-center gap-3 bg-foreground/10 text-white px-5 py-5 rounded-full shadow-lg hover:scale-105 transition-all duration-300"
              >
                <RefreshIcon className="text-white" width={20} height={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Settings Modal */}
        <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
        
        {/* Chat Modal */}
        <ChatModal open={chatOpen} onOpenChange={setChatOpen} onStatsUpdate={fetchStats} />

        {/* Task Modal */}
        <TaskModal 
          open={taskModalOpen} 
          onOpenChange={setTaskModalOpen}
          username={username}
          tasks={newTasks}
          onTasksUpdate={(tasks) => {
            setNewTasks(tasks);
            setDailyCheckInOpen(true);
          }}
        />

            {/* Scan Instructions Modal */}
            <ScanModal open={scanModalOpen} onOpenChange={setScanModalOpen} />

        {/* Daily Check In Modal */}
        <DailyCheckInModal 
          open={dailyCheckInOpen} 
          onOpenChange={setDailyCheckInOpen} 
          tasks={newTasks}
          username={username}
          onTasksUpdate={setNewTasks}
        />
        {/* Scan Summary Modal */}
        <ScanSummaryModal open={isSummaryModalOpen} onOpenChange={setIsSummaryModalOpen} summary={scanSummary} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-8 -mt-1">
          {/* Left Column - Stats */}
          <div className="ml-4">
          <div>
            
            {/* Stats Bars */}
            <div className="space-y-5 mb-12">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                const colorClass = getColorClass(stat.value, stat.max);
                return (
                  <div key={index} className="relative">
                    <div className="flex items-center gap-3 bg-foreground/10 backdrop-blur-sm rounded-full p-2 pr-5">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className={`w-10 h-10 rounded-full ${colorClass} flex items-center justify-center flex-shrink-0 cursor-help`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{stat.description}</p>
                        </TooltipContent>
                      </Tooltip>
                      <div className="flex-1 relative">
                        <div className="h-8 bg-foreground/20 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${colorClass} transition-all duration-500`}
                            style={{ width: `${(stat.value / stat.max) * 100}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-lg font-medium ml-2 min-w-[50px] text-right inder-text">
                        {Math.round((stat.value / stat.max) * 100)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Raw Vitals Snapshot */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-foreground/90 backdrop-blur-sm rounded-3xl p-6 space-y-3">
                <h3 className="text-background text-sm uppercase tracking-wide">scan vitals</h3>
                <div className="flex flex-col gap-2 text-background/90 text-sm">
                  <div className="flex justify-between">
                    <span>Pulse</span>
                    <span>{scanVitals?.pulse?.[0] ?? "--"} bpm</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Breathing</span>
                    <span>{scanVitals?.breathing?.[0] ?? "--"} rpm</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Inhale/Exhale Ratio</span>
                    <span>{scanVitals?.ie_ratio?.[0] ?? "--"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Breath Amplitude</span>
                    <span>{scanVitals?.breath_amp?.[0] ?? "--"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Blood Pressure (phasic)</span>
                    <span>{scanVitals?.blood_pressure?.[0] ?? "--"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Apnea</span>
                    <span>{scanVitals?.apnea?.[0] ?? "--"}</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-foreground/90 backdrop-blur-sm rounded-3xl p-6 flex flex-col gap-3">
                <h3 className="text-background text-sm uppercase tracking-wide">gpt analysis summary</h3>
                {scanSummary ? (
                  <div className="space-y-3 text-background/90 text-sm">
                    {(["overall_health","hunger","energy_level","stress_level","sleep_quality"] as Array<keyof ScanSummary>).map((key) => {
                      const entry = scanSummary[key];
                      return (
                        <div key={key}>
                          <div className="flex justify-between font-semibold capitalize">
                            <span>{key.replace("_"," ")}</span>
                            <span>{entry.score}/100</span>
                          </div>
                          <p className="text-xs text-background/70">{entry.justification}</p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-background/70 text-xs">
                    Run a scan to trigger the GPT summary of your vitals.
                  </p>
                )}
              </div>
              </div>
            </div>
          </div>

          {/* Right Column - Mood Indicators */}
          <div className="flex flex-col items-center justify-center gap-8 mt-4">
            {/* Mascot */}
            <div className="relative flex items-center justify-center">
              <img src={getMascotImage()} alt="moodi mascot" className="w-[500px] h-auto object-contain animate-bounce-gentle" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
