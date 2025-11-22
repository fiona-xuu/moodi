import { Link } from "react-router-dom";
import { UserPlus, Menu, Settings, Heart, Leaf, Sparkles, Smile, Moon } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import heroBackground from "@/assets/hero-background.png";

const Dashboard = () => {
  const stats = [
    { icon: Heart, value: 47, max: 100, color: "bg-orange-400" },
    { icon: Leaf, value: 100, max: 100, color: "bg-green-400" },
    { icon: Sparkles, value: 10, max: 100, color: "bg-red-400" },
    { icon: Smile, value: 47, max: 100, color: "bg-orange-400" },
    { icon: Moon, value: 47, max: 100, color: "bg-orange-400" },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBackground})` }}
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-background/10 backdrop-blur-sm" />
      
      {/* Content */}
      <div className="relative min-h-screen p-6">
        {/* Top Bar */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-5xl font-bold text-foreground mb-8">USERNAME</h1>
          </div>
          
          <div className="flex gap-3 items-center">
            <span className="font-display text-2xl font-bold text-accent">moodi</span>
            <button className="w-12 h-12 rounded-full bg-foreground/90 flex items-center justify-center hover:bg-foreground transition-colors">
              <UserPlus className="w-5 h-5 text-background" />
            </button>
            <button className="w-12 h-12 rounded-full bg-foreground/90 flex items-center justify-center hover:bg-foreground transition-colors">
              <Menu className="w-5 h-5 text-background" />
            </button>
            <Link to="/settings">
              <button className="w-12 h-12 rounded-full bg-foreground/90 flex items-center justify-center hover:bg-foreground transition-colors">
                <Settings className="w-5 h-5 text-background" />
              </button>
            </Link>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Stats */}
          <div>
            <h2 className="text-4xl font-bold text-foreground mb-6">STATS</h2>
            
            {/* Stats Bars */}
            <div className="space-y-4 mb-8">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="relative">
                    <div className="flex items-center gap-3 bg-foreground/10 backdrop-blur-sm rounded-full p-2 pr-6">
                      <div className={`w-10 h-10 rounded-full ${stat.color} flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-5 h-5 text-background" />
                      </div>
                      <div className="flex-1 relative">
                        <div className="h-8 bg-foreground/20 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${stat.color} transition-all duration-500`}
                            style={{ width: `${(stat.value / stat.max) * 100}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-foreground font-semibold ml-3 min-w-[80px] text-right">
                        {stat.value}/{stat.max}
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
