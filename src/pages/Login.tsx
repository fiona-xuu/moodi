import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { authAPI, authStorage } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import loginSignupBackground from "@/assets/login-signup-background.png";
import GradientButton from "@/components/GradientButton";
import Stars from "@/components/Stars";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authAPI.login(email, password);
      
      // Store token and user data
      if (response.token) {
        authStorage.setToken(response.token);
      }
      authStorage.setUser(response.user);

      toast({
        title: "Welcome back!",
        description: "You've successfully logged in.",
      });

      // Redirect to dashboard
      navigate("/dashboard");
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Invalid email or password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-6 inter-text">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${loginSignupBackground})` }}
      />
      
      {/* Stars */}
      <Stars duration={2} />
      
      <div className="w-full max-w-md relative z-10">
        <Link to="/" className="inline-flex items-center gap-2 text-foreground/80 hover:text-foreground mb-8 transition-colors text-lg">
          <ArrowLeft className="w-5 h-5" />
          Back to home
        </Link>
        
        <div className="glass-button rounded-2xl p-8 shadow-2xl">
          <h1 
            className="header text-4xl font-bold mb-2"
            style={{ letterSpacing: '0' }}
          >
            Welcome back
          </h1>
          <div className="h-px my-4 bg-white/40 w-full"></div>
          <p className="text-muted-foreground mb-8 text-lg">
            Login to continue your journey
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground text-lg">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background/50 border-border focus:border-primary transition-colors text-lg md:text-lg !text-lg"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground text-lg">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-background/50 border-border focus:border-primary transition-colors text-lg md:text-lg !text-lg"
                required
              />
            </div>
            
            <GradientButton 
              type="submit" 
              className="w-full inder-text text-lg font-bold py-3 rounded-lg shadow-md hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-b from-[hsl(0,53%,77%)] to-[hsl(332,38%,61%)]"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </GradientButton>
          </form>
          
          <p className="text-center text-muted-foreground mt-6 text-lg">
            Don't have an account?{" "}
            <Link to="/signup" className="text-[hsl(0,53%,77%)] hover:underline text-lg">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

