import { useState, useEffect } from "react";
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

const Dashboard = () => {
  const [username, setUsername] = useState<string>("");
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
  const [chatOpen, setChatOpen] = useState<boolean>(false);
  const [scanModalOpen, setScanModalOpen] = useState<boolean>(false);
  const [taskModalOpen, setTaskModalOpen] = useState<boolean>(false);
  const [dailyCheckInOpen, setDailyCheckInOpen] = useState<boolean>(false);
  const [newTasks, setNewTasks] = useState<Task[]>([]);
  const [scanSummary, setScanSummary] = useState<ScanSummary | null>(null);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState<boolean>(false);
  const initialStats: Stat[] = [
    { icon: HeartIcon, value: 50, max: 100, description: "Overall health and wellness" },
    { icon: HungerIcon, value: 50, max: 100, description: "Hunger level and appetite. Higher is more full." },
    { icon: EnergyIcon, value: 50, max: 100, description: "Energy level and vitality" },
    { icon: StressIcon, value: 50, max: 100, description: "Stress level and tension. Lower is better." },
    { icon: PhysicalIcon, value: 50, max: 100, description: "Physical wellness and fitness" },
  ];

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
        setRawStats({
            overall_health: data.overall_health,
            hunger: data.hunger,
            energy_level: data.energy_level,
            stress_level: data.stress_level,
            sleep_quality: data.sleep_quality,
        });
        
        // Map backend data to frontend stats structure
        const newStats: Stat[] = [
            { icon: HeartIcon, value: data.overall_health, max: 100, description: "Overall health and wellness" },
            { icon: HungerIcon, value: data.hunger, max: 100, description: "Hunger level and appetite. Higher is more full." },
            { icon: EnergyIcon, value: data.energy_level, max: 100, description: "Energy level and vitality" },
            { icon: StressIcon, value: data.stress_level, max: 100, description: "Stress level and tension. Lower is better." },
            { icon: PhysicalIcon, value: data.sleep_quality, max: 100, description: "Physical wellness and fitness" },
        ];
        setStats(newStats);
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

    // Only connect to WebSocket if we're in development (localhost)
    let ws: WebSocket | null = null;
    try {
      // Check if we're in a browser environment and WebSocket is available
      // Only connect in development
      if (typeof WebSocket !== 'undefined' && 
          (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
        ws = new WebSocket('ws://localhost:8080');
        
        // Set a connection timeout
        const connectionTimeout = setTimeout(() => {
          if (ws && ws.readyState === WebSocket.CONNECTING) {
            ws.close();
            console.warn('WebSocket connection timeout');
          }
        }, 2000); // 2 second timeout

        ws.onopen = () => {
          clearTimeout(connectionTimeout);
          console.log('WebSocket connection established');
        };

        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            if (message.type === 'ai_analysis') {
              console.log('Received AI analysis:', message.data);
              const newStats: Stat[] = [
                  { icon: HeartIcon, value: message.data.overall_health.score, max: 100, description: "Overall health and wellness" },
                  { icon: HungerIcon, value: message.data.hunger.score, max: 100, description: "Hunger level and appetite. Higher is more full." },
                  { icon: EnergyIcon, value: message.data.energy_level.score, max: 100, description: "Energy level and vitality" },
                  { icon: StressIcon, value: message.data.stress_level.score, max: 100, description: "Stress level and tension. Lower is better." },
                  { icon: PhysicalIcon, value: message.data.sleep_quality.score, max: 100, description: "Physical wellness and fitness" },
              ];
              setStats(newStats);
              setScanSummary(message.data);
              setIsSummaryModalOpen(true);
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        ws.onerror = (error) => {
          clearTimeout(connectionTimeout);
          console.warn('WebSocket connection error (this is normal if backend is not running):', error);
        };

        ws.onclose = () => {
          clearTimeout(connectionTimeout);
          console.log('WebSocket connection closed');
        };
      }
    } catch (error) {
      console.warn('WebSocket connection failed (this is normal if backend is not running):', error);
    }

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

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
            { icon: StressIcon, value: data.stress_level, max: 100, description: "Stress level and tension. Lower is better." },
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

            {/* Graphs */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-foreground/90 backdrop-blur-sm rounded-3xl p-6">
                <h3 className="text-background text-sm mb-4">energy trend graph</h3>
                <svg viewBox="0 0 200 100" className="w-full h-24">
                  <polyline
                    points="0,70 40,30 80,50 120,20 160,60 200,40"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-background"
                  />
                </svg>
              </div>
              
              <div className="bg-foreground/90 backdrop-blur-sm rounded-3xl p-6 flex items-center justify-center">
                <h3 className="text-background text-2xl font-semibold text-center">
                  stress<br />trend<br />graph
                </h3>
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
