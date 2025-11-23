import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import dashboardBackground from "@/assets/dashboard-background.png";
import mascot from "@/assets/mascot.png";
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
import PlayButton from "@/components/PlayButton";
import RefreshIcon from "@/components/icons/RefreshIcon";
import { authStorage, authAPI } from "@/lib/api";

// Define an interface for the stats for type safety
interface Stat {
  icon: React.ElementType;
  value: number;
  max: number;
  description: string;
}

const Dashboard = () => {
  const [username, setUsername] = useState<string>("guest");
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
  const [chatOpen, setChatOpen] = useState<boolean>(false);
  const [stats, setStats] = useState<Stat[]>([
    { icon: PhysicalIcon, value: 50, max: 100, description: "Overall physical health and fitness" },
    { icon: HungerIcon, value: 50, max: 100, description: "Hunger level and appetite. Higher is more full." },
    { icon: EnergyIcon, value: 50, max: 100, description: "Energy level and vitality" },
    { icon: StressIcon, value: 50, max: 100, description: "Stress level and tension. Lower is better." },
    { icon: HeartIcon, value: 50, max: 100, description: "Sleep quality and restfulness" },
  ]);

  useEffect(() => {
    const loadUser = async () => {
      try {
        // First check if user is stored locally
        const storedUser = authStorage.getUser();
        if (storedUser?.username) {
          setUsername(storedUser.username);
          return;
        }

        // If not stored, try to get profile from API
        const user = await authAPI.getProfile();
        if (user?.username) {
          setUsername(user.username);
          authStorage.setUser(user);
        }
      } catch (error) {
        // User is not logged in or error occurred
        setUsername("guest");
      }
    };

    const fetchStats = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/stats');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            
            // Map backend data to frontend stats structure
            const newStats: Stat[] = [
                { icon: PhysicalIcon, value: data.overall_health, max: 100, description: "Overall physical health and fitness" },
                { icon: HungerIcon, value: data.hunger, max: 100, description: "Hunger level and appetite. Higher is more full." },
                { icon: EnergyIcon, value: data.energy_level, max: 100, description: "Energy level and vitality" },
                { icon: StressIcon, value: data.stress_level, max: 100, description: "Stress level and tension. Lower is better." },
                { icon: HeartIcon, value: data.sleep_quality, max: 100, description: "Sleep quality and restfulness" },
            ];
            setStats(newStats);

        } catch (error) {
            console.error("Failed to fetch stats:", error);
        }
    };

    loadUser();
    fetchStats();
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

  const handleRefreshStats = async () => {
    try {
        console.log("Recomputing stats from the latest scan...");
        const response = await fetch('http://localhost:3000/api/stats/recompute', { method: 'POST' });
        if (!response.ok) {
            throw new Error('Failed to recompute stats');
        }
        // After recomputing, fetch the latest stats to update the UI
        const data = await response.json();
        const newStats: Stat[] = [
            { icon: PhysicalIcon, value: data.overall_health, max: 100, description: "Overall physical health and fitness" },
            { icon: HungerIcon, value: data.hunger, max: 100, description: "Hunger level and appetite. Higher is more full." },
            { icon: EnergyIcon, value: data.energy_level, max: 100, description: "Energy level and vitality" },
            { icon: StressIcon, value: data.stress_level, max: 100, description: "Stress level and tension. Lower is better." },
            { icon: HeartIcon, value: data.sleep_quality, max: 100, description: "Sleep quality and restfulness" },
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
              <button className="w-16 h-16 rounded-full bg-foreground/10 flex items-center justify-center hover:scale-110 transition-all duration-300">
                <TaskIcon className="w-7 h-7 text-foreground" />
              </button>
              <button 
                onClick={() => setChatOpen(true)}
                className="w-16 h-16 rounded-full bg-foreground/10 flex items-center justify-center hover:scale-110 transition-all duration-300"
              >
                <ChatIcon className="w-9 h-9 text-primary-text" />
              </button>
              <button
                onClick={() => setSettingsOpen(true)}
                className="w-16 h-16 rounded-full bg-foreground/10 flex items-center justify-center hover:scale-110 transition-all duration-300"
              >
                <SettingsIcon className="w-9 h-9 text-foreground" />
              </button>
            </div>
            <div className="flex gap-3 items-center">
              <button className="flex items-center gap-3 bg-foreground/10 text-white px-5 py-3 rounded-full shadow-lg hover:scale-105 transition-all duration-300">
                <PlayButton className="text-white" width={32} height={32} />
                <span className="inder-text text-lg font-medium">scan</span>
              </button>
              <button 
                onClick={handleRefreshStats}
                className="flex items-center gap-3 bg-foreground/10 text-white px-5 py-5 rounded-full shadow-lg hover:scale-105 transition-all duration-300"
              >
                <RefreshIcon className="text-white" width={18} height={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Settings Modal */}
        <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
        
        {/* Chat Modal */}
        <ChatModal open={chatOpen} onOpenChange={setChatOpen} />

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
              <img src={mascot} alt="moodi mascot" className="w-[500px] h-auto object-contain animate-bounce-gentle" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
