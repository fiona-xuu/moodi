import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, X} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { authStorage, authAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import GradientButton from "./GradientButton";

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SettingsModal = ({ open, onOpenChange }: SettingsModalProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [username, setUsername] = useState<string>("guest");
  const [email, setEmail] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [originalUsername, setOriginalUsername] = useState<string>("guest");
  const [originalEmail, setOriginalEmail] = useState<string>("");
  const [originalPhoneNumber, setOriginalPhoneNumber] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = authStorage.getUser();
        if (storedUser?.username && storedUser.username !== "guest") {
          setUsername(storedUser.username);
          setOriginalUsername(storedUser.username);
          setEmail(storedUser.email || "");
          setOriginalEmail(storedUser.email || "");
          setIsLoggedIn(true);
          return;
        }

        const user = await authAPI.getProfile();
        if (user?.username && user.username !== "guest") {
          setUsername(user.username);
          setOriginalUsername(user.username);
          setEmail(user.email || "");
          setOriginalEmail(user.email || "");
          setIsLoggedIn(true);
          authStorage.setUser(user);
        } else {
          setIsLoggedIn(false);
          setUsername("guest");
          setOriginalUsername("guest");
          setEmail("");
          setOriginalEmail("");
        }
      } catch (error) {
        setIsLoggedIn(false);
        setUsername("guest");
        setOriginalUsername("guest");
        setEmail("");
        setOriginalEmail("");
      }
    };

    if (open) {
      loadUser();
      setIsEditing(false);
    }
  }, [open]);

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      setIsLoggedIn(false);
      setUsername("guest");
      setEmail("");
      setPhoneNumber("");
      onOpenChange(false);
      toast({
        title: "Logged out successfully",
        description: "You have been logged out. See you soon!",
      });
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: "Logout failed",
        description: "Unable to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleLogin = () => {
    onOpenChange(false);
    navigate("/login");
  };

  const handleEdit = () => {
    setIsEditing(true);
    setOriginalUsername(username);
    setOriginalPhoneNumber(phoneNumber);
  };

  const handleSave = async () => {
    if (!isLoggedIn) return;

    setIsSaving(true);
    try {
      await authAPI.updateProfile(username, email, phoneNumber);
      setIsEditing(false);
      // Reload user data to get updated info
      const user = await authAPI.getProfile();
      if (user) {
        setUsername(user.username);
        setEmail(user.email || "");
        setOriginalEmail(user.email || "");
        authStorage.setUser(user);
      }
    } catch (error) {
      console.error("Save error:", error);
      // Reset to original values on error
      setUsername(originalUsername);
      setEmail(originalEmail);
      setPhoneNumber(originalPhoneNumber);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setUsername(originalUsername);
    setEmail(originalEmail);
    setPhoneNumber(originalPhoneNumber);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!bg-primary-background/95 border-none rounded-lg p-8 max-w-lg [&>button.absolute.right-4.top-4]:hidden">
        <DialogClose className="absolute right-6 top-6 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-0 disabled:pointer-events-none z-50">
          <X className="h-5 w-5 text-primary-accent" />
          <span className="sr-only">Close</span>
        </DialogClose>
        <DialogHeader className="mb-3">
          <DialogTitle className="text-4xl font-bold text-primary-accent inder-text mb-3">
            Settings
          </DialogTitle>
          <div className="h-px bg-primary-accent/40 w-full-"></div>
        </DialogHeader>

        {/* Profile Summary */}
        <div className="flex items-center gap-5 mb-3">
          <div className="w-16 h-16 rounded-lg bg-white flex items-center justify-center border border-[#CFCEDB]">
            <Pencil className="w-6 h-6 text-gray-600" />
          </div>
          <div className="flex flex-col inder-text">
            <span className="text-primary-accent text-xl font-bold">{username}</span>
            {isLoggedIn && email && (
              <span className="text-primary-accent/80 text-md">{email}</span>
            )}
          </div>
        </div>

        {/* Username Field */}
        <div className="mb-2 inder-text">
          <label className="block text-primary-accent text-lg font-medium mb-2">
            Username
          </label>
          <div className="relative">
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              readOnly={!isEditing}
              placeholder="add a username ..."
              className="bg-white border-[#CFCEDB] text-primary-accent/80 pr-10"
            />
            {isEditing ? (
              <button
                onClick={handleCancel}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-accent hover:opacity-70 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleEdit}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-primary-accent transition-colors cursor-pointer"
              >
                <Pencil className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Email Field - Only show if logged in */}
        {isLoggedIn && (
          <div className="mb-2 inder-text">
            <label className="block text-primary-accent text-lg font-medium mb-2">
              Email
            </label>
            <div className="relative">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                readOnly={!isEditing}
                placeholder="add an email ..."
                className="bg-white border-[#CFCEDB] text-primary-accent/80 pr-10"
              />
              {isEditing ? (
                <button
                  onClick={handleCancel}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-accent hover:opacity-70 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleEdit}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-primary-accent transition-colors cursor-pointer"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Phone Number Field - Only show if logged in */}
        {isLoggedIn && (
          <div className="mb-3 inder-text">
            <label className="block text-primary-accent text-lg font-medium mb-2">
              Phone Number
            </label>
            <div className="relative">
              <Input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                readOnly={!isEditing}
                placeholder="add a phone number ..."
                className="bg-white border-[#CFCEDB] text-primary-accent/80 pr-10"
              />
              {isEditing ? (
                <button
                  onClick={handleCancel}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-accent hover:opacity-70 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleEdit}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-primary-accent transition-colors cursor-pointer"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        <div className="h-px bg-primary-accent/40 w-full"></div>

        {/* Save/Logout/Login Button */}
        <GradientButton
          onClick={isEditing ? handleSave : (isLoggedIn ? handleLogout : handleLogin)}
          disabled={isSaving}
          className="w-full inder-text text-xl font-bold py-3 rounded-lg shadow-md hover:scale-105 transition-all duration-300 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? "saving..." : isEditing ? "save" : isLoggedIn ? "logout" : "login"}
        </GradientButton>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsModal;

