import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import dashboardBackground from "@/assets/dashboard-background.png";
import Rectangle from "@/components/Rectangle";
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
import { authStorage, authAPI } from "@/lib/api";

const Dashboard = () => {
  const [username, setUsername] = useState<string>("guest");
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
  const [chatOpen, setChatOpen] = useState<boolean>(false);

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

    loadUser();
  }, []);

  const getColorClass = (value: number, max: number): string => {
    const percentage = (value / max) * 100;
    if (percentage >= 80) {
      return "bg-green-400";
    } else if (percentage >= 50) {
      return "bg-yellow-400";
    } else if (percentage >= 20) {
      return "bg-orange-400";
    } else {
      return "bg-red-400";
    }
  };

  const stats = [
    { icon: Heart, value: 47, max: 100, description: "Emotional well-being and mood" },
    { icon: HungerIcon, value: 100, max: 100, description: "Hunger level and appetite" },
    { icon: EnergyIcon, value: 10, max: 100, description: "Energy level and vitality" },
    { icon: StressIcon, value: 60, max: 100, description: "Stress level and tension" },
    { icon: PhysicalIcon, value: 80, max: 100, description: "Physical health and fitness" },
  ];

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
          
          <div className="flex gap-3 items-center">
            <button className="w-16 h-16 rounded-full bg-primary-accent/75 flex items-center justify-center hover:scale-110 transition-all duration-300">
              <TaskIcon className="w-7 h-7 text-primary-text" />
            </button>
            <button 
              onClick={() => setChatOpen(true)}
              className="w-16 h-16 rounded-full bg-primary-accent/75 flex items-center justify-center hover:scale-110 transition-all duration-300"
            >
              <ChatIcon className="w-9 h-9 text-primary-text" />
            </button>
            <button
              onClick={() => setSettingsOpen(true)}
              className="w-16 h-16 rounded-full bg-primary-accent/75 flex items-center justify-center hover:scale-110 transition-all duration-300"
            >
              <SettingsIcon className="w-9 h-9 text-primary-text" />
            </button>
          </div>
        </div>

        {/* Settings Modal */}
        <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />
        
        {/* Chat Modal */}
        <ChatModal open={chatOpen} onOpenChange={setChatOpen} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Stats */}
          <div>
            <h2 className="text-4xl font-medium text-foreground inder-text ml-4 mb-6">statistics</h2>
            
            {/* Stats Bars */}
            <div className="space-y-4 mb-8">
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

          {/* Right Column - Mood Indicators */}
          <div className="flex flex-col items-center justify-center gap-12">
            {/* Sad Face */}
            <div className="relative">
              <div className="w-64 h-64 rounded-full border-[20px] border-foreground bg-transparent flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  {/* Eyes */}
                  <rect x="25" y="30" width="15" height="15" fill="currentColor" className="text-foreground" />
                  <rect x="60" y="30" width="15" height="15" fill="currentColor" className="text-foreground" />
                  {/* Sad Mouth */}
                  <path d="M 30 70 Q 50 60 70 70" stroke="currentColor" strokeWidth="8" fill="none" className="text-foreground" />
                </svg>
              </div>
            </div>

            {/* Happy Face */}
            <div className="relative">
              <div className="w-64 h-64 rounded-full border-[20px] border-foreground bg-transparent flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  {/* Eyes */}
                  <rect x="25" y="35" width="15" height="15" fill="currentColor" className="text-foreground" />
                  <rect x="60" y="35" width="15" height="15" fill="currentColor" className="text-foreground" />
                  {/* Happy Mouth */}
                  <path d="M 30 60 Q 50 75 70 60" stroke="currentColor" strokeWidth="8" fill="none" className="text-foreground" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
