import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { authAPI, authStorage } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

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
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--gradient-twilight-from))] via-[hsl(var(--gradient-twilight-via))] to-[hsl(var(--gradient-twilight-to))] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 text-foreground/80 hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>
        
        <div className="glass-button rounded-2xl p-8 shadow-2xl">
          <h1 className="font-display text-4xl font-bold text-foreground mb-2">
            Join moodi
          </h1>
          <p className="text-muted-foreground mb-8">
            Start your mindful journey today
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-background/50 border-border focus:border-primary transition-colors"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background/50 border-border focus:border-primary transition-colors"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-background/50 border-border focus:border-primary transition-colors"
                required
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 transition-all duration-300 hover:scale-105 cursor-pointer"
              disabled={isLoading}
            >
              {isLoading ? "Creating account..." : "Sign up"}
            </Button>
          </form>
          
          {emailSent && (
            <div className="mt-6 p-4 bg-primary/10 rounded-lg border border-primary/20">
              <p className="text-sm text-foreground/80 mb-3">
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
                className="text-primary hover:underline text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isResending ? "Resending..." : "Resend confirmation email"}
              </button>
            </div>
          )}

          <p className="text-center text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
