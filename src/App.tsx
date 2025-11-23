import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { authStorage } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Dashboard wrapper to handle email confirmation
const DashboardWithConfirmation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      // Check if there's a hash fragment (Supabase puts tokens in hash)
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const type = hashParams.get('type');
      const error = hashParams.get('error');
      const errorDescription = hashParams.get('error_description');

      // Handle errors from Supabase (e.g., expired OTP)
      if (error) {
        let errorMessage = 'Email verification failed.';
        if (error === 'access_denied' && errorDescription) {
          if (errorDescription.includes('expired')) {
            errorMessage = 'The email verification link has expired. Please request a new confirmation email.';
          } else if (errorDescription.includes('invalid')) {
            errorMessage = 'The email verification link is invalid. Please request a new confirmation email.';
          } else {
            errorMessage = decodeURIComponent(errorDescription.replace(/\+/g, ' '));
          }
        }
        
        toast({
          title: "Verification failed",
          description: errorMessage,
          variant: "destructive",
        });
        
        // Clear the hash and redirect to signup
        window.history.replaceState(null, '', '/signup');
        navigate("/signup");
        return;
      }

      if (accessToken && type === 'signup') {
        try {
          // Supabase automatically handles the session from the hash
          // Get the session
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            throw sessionError;
          }

          if (session?.user) {
            // Create profile in profiles table (only after email confirmation)
            const username = session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'User';
            
            const { data: existingProfile } = await supabase
              .from('profiles')
              .select('username')
              .eq('id', session.user.id)
              .maybeSingle();

            // Only create profile if it doesn't exist
            if (!existingProfile) {
              const { error: profileError } = await supabase
                .from('profiles')
                .insert([
                  {
                    id: session.user.id,
                    username: username,
                  },
                ]);

              if (profileError) {
                console.error('Profile creation error:', profileError);
                throw new Error('Unable to create your profile. Please try again.');
              }
            }

            // Get the created profile
            const { data: profile } = await supabase
              .from('profiles')
              .select('username')
              .eq('id', session.user.id)
              .single();

            // Store user data
            const userData = {
              id: session.user.id,
              username: profile?.username || username,
              email: session.user.email || '',
            };
            authStorage.setUser(userData);
            
            if (session.access_token) {
              authStorage.setToken(session.access_token);
            }

            toast({
              title: "Email confirmed!",
              description: "Your account has been verified. Welcome to moodi!",
            });

            // Clear the hash from URL
            window.history.replaceState(null, '', '/dashboard');
          }
        } catch (error) {
          toast({
            title: "Confirmation failed",
            description: error instanceof Error ? error.message : "Unable to confirm your email. Please try again.",
            variant: "destructive",
          });
          navigate("/signup");
        }
      }
    };

    handleEmailConfirmation();
  }, [navigate, toast]);

  return <Dashboard />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<DashboardWithConfirmation />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
