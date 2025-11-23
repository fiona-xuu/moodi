import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { authAPI, authStorage } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import loginSignupBackground from "@/assets/login-signup-background.png";
import GradientButton from "@/components/GradientButton";

const Signup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authAPI.signup(name, email, password);
      
      // Show success toast - confirmation email was sent
      toast({
        title: "Confirmation email sent!",
        description: `We've sent a confirmation email to ${response.email}. Please check your inbox and click the link to verify your account.`,
      });

      // Mark that email was sent (keep email in form for resend option)
      setEmailSent(true);
      setName("");
      setPassword("");
    } catch (error) {
      toast({
        title: "Signup failed",
        description: error instanceof Error ? error.message : "Could not create account. Please try again.",
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
            Join moodi
          </h1>
          <div className="h-px my-4 bg-white/40 w-full"></div>
          <p className="text-muted-foreground mb-6 text-lg">
            Start your mindful journey today
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground text-lg">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-background/50 border-border focus:border-primary transition-colors text-lg md:text-lg !text-lg"
                required
              />
            </div>
            
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
              {isLoading ? "Creating account..." : "Sign up"}
            </GradientButton>
          </form>
          
          {emailSent && (
            <div className="mt-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
              <p className="text-base text-foreground/80 mb-3">
                Didn't receive the email? Check your spam folder or
              </p>
              <button
                type="button"
                onClick={async () => {
                  if (!email) return;
                  setIsResending(true);
                  try {
                    await authAPI.resendConfirmationEmail(email);
                    toast({
                      title: "Email resent!",
                      description: `We've sent another confirmation email to ${email}. Please check your inbox.`,
                    });
                  } catch (error) {
                    toast({
                      title: "Failed to resend email",
                      description: error instanceof Error ? error.message : "Could not resend confirmation email. Please try again.",
                      variant: "destructive",
                    });
                  } finally {
                    setIsResending(false);
                  }
                }}
                disabled={isResending || !email}
                className="text-primary hover:underline text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isResending ? "Resending..." : "Resend confirmation email"}
              </button>
            </div>
          )}

          <p className="text-center text-muted-foreground mt-6 text-lg">
            Already have an account?{" "}
            <Link to="/login" className="text-[hsl(0,53%,77%)] hover:underline text-lg">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;

