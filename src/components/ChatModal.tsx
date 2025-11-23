import { sendChatMessage } from "@/lib/api";
import { useState, useEffect, useRef } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import mascot from "@/assets/mascots/mascot-wave.png";
import chatbotBackground from "@/assets/chatbot-background.png";
import TextBubble from "@/components/TextBubble";
import ChatIcon from "@/components/icons/ChatIcon";
import CloseSidebarIcon from "@/components/icons/CloseSidebarIcon";
import { ImagePlus, X as CloseIcon } from "lucide-react";

interface ChatModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatsUpdate: () => void;
}

interface Message {
  text: string;
  sender: 'user' | 'moodi';
  imageName?: string;
}

const ChatModal = ({ open, onOpenChange, onStatsUpdate }: ChatModalProps) => {
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const hasMessages = messages.length > 0;
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Reset messages when modal closes
  useEffect(() => {
    if (!open) {
      setMessages([]);
      setInputValue("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setSelectedImage(null);
    }
  }, [open]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  const clearSelectedImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputValue.trim() && !selectedImage) || isLoading) return;

    const messageText = inputValue.trim();

    // Add user message
    const userMessage: Message = { 
      text: messageText || (selectedImage ? "Sent an image" : ""),
      sender: 'user',
      imageName: selectedImage?.name,
    };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue("");
    setIsLoading(true);

    try {
      const history = newMessages.slice(0, -1).map(msg => ({
        role: msg.sender === 'user' ? 'user' : ('model' as 'user' | 'model'),
        parts: [{ text: msg.text }]
      }));

      const response = await sendChatMessage(messageText, history, selectedImage || undefined);

      if (response.reply) {
        const moodiMessage: Message = { text: response.reply, sender: 'moodi' };
        setMessages(prev => [...prev, moodiMessage]);
        onStatsUpdate(); // Fetch the latest stats
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      // Optionally, add an error message to the chat
      const errorMessage: Message = { text: "Sorry, I'm having trouble connecting. Please try again later.", sender: 'moodi' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      clearSelectedImage();
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage(e);
    }
  };

  return (
    <>
      <style>{`
        [data-radix-dialog-overlay],
        [data-state][data-radix-dialog-overlay],
        [data-radix-dialog-overlay][data-state],
        .fixed.inset-0.z-50.bg-black,
        .fixed.inset-0.z-50[class*="bg-black"] {
          display: none !important;
          opacity: 0 !important;
          visibility: hidden !important;
          pointer-events: none !important;
          background: transparent !important;
          background-color: transparent !important;
        }
        [data-radix-dialog-content] {
          background: transparent !important;
          background-color: transparent !important;
          box-shadow: none !important;
        }
      `}</style>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent 
        side="right" 
        className="w-full sm:max-w-md p-0 overflow-hidden border-none [&>button]:hidden m-8 !bg-transparent rounded-[30px]"
        style={{
          backgroundImage: `url(${chatbotBackground})`,
          backgroundSize: '150%',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          height: 'calc(100vh - 4rem)',
          backgroundColor: 'transparent !important'
        }}
      >

        {/* Content */}
        <div className="relative h-full flex flex-col">
          {/* Header */}
          <SheetHeader className="px-6 pt-8 pb-4 items-center justify-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => onOpenChange(false)}
                className="text-primary-accent hover:opacity-80 transition-opacity absolute left-8 top-7"
              >
                <CloseSidebarIcon className="h-6 w-6" />
              </button>
              {hasMessages ? (
                <SheetTitle className="text-4xl font-light text-primary-accent mt-6" style={{ fontFamily: 'Mansalva, cursive' }}>
                  <span className="text-primary-accent/90">chat with</span> <span className="text-primary-accent font-bold">lumi</span>
                </SheetTitle>
              ) : (
                <div className="flex flex-col items-center mt-6">
                  <SheetTitle className="text-5xl font-light text-primary-accent" style={{ fontFamily: 'Mansalva, cursive' }}>
                    meet <span className="text-primary-accent font-bold text-6xl">lumi</span> !
                  </SheetTitle>
                  <p className="text-primary-accent text-2xl inder-text mt-2">moodi's personal assistant</p>
                </div>
              )}
            </div>
          </SheetHeader>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col px-6 pb-24 relative overflow-y-auto">
            {hasMessages ? (
              /* Chat Messages */
              <div className="flex flex-col gap-3 mt-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-3 ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    {/* Mascot/Emoji Icon */}
                    {message.sender === 'moodi' ? (
                      <img 
                        src={mascot} 
                        alt="Moodi" 
                        className="w-10 h-10 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center text-2xl">
                        😊
                      </div>
                    )}
                    
                    {/* Message Bubble */}
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-3 shadow-md ${
                        message.sender === 'user'
                          ? 'bg-white/90 text-primary-accent'
                          : 'bg-white/90 text-primary-accent'
                      }`}
                    >
                      <p className="text-sm inder-text">{message.text}</p>
                      {message.imageName && (
                        <p className="text-xs text-primary-accent/70 mt-1">
                          📷 Uploaded: {message.imageName}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Initial View - Mascot and Text Bubble */
              <div className="flex-1 flex flex-col items-center justify-center relative">
                {/* Text Bubble */}
                <div className="absolute top-14 right-20 w-56 h-40">
                  <TextBubble className="text-primary-accent text-xl">how can I help?</TextBubble>
                </div>

                {/* Moodi character */}
                <div className="mt-32">
                  <img 
                    src={mascot} 
                    alt="Moodi" 
                    className="h-72 w-auto mx-auto animate-bounce-gentle"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Input Field */}
          <div className="absolute bottom-0 left-0 right-0 p-10 bg-transparent">
            <form onSubmit={handleSendMessage} className="relative space-y-3">
              <div className="flex items-center gap-3 justify-between px-2">
                <label className="inline-flex items-center gap-2 text-primary-accent/80 text-sm cursor-pointer">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                  <span className="flex items-center gap-1">
                    <ImagePlus className="h-4 w-4" />
                    Attach photo
                  </span>
                </label>
                {selectedImage && (
                  <div className="flex items-center gap-2 bg-white/70 px-3 py-1 rounded-full text-xs text-primary-accent">
                    <span>{selectedImage.name}</span>
                    <button type="button" onClick={clearSelectedImage} className="hover:opacity-80">
                      <CloseIcon className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
              <Input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Tell Lumi what you need..."
                className="w-full bg-white/90 rounded-full px-12 py-7 text-primary-accent placeholder:text-primary-accent/70 shadow-lg text-center border-none focus:ring-0 focus:outline-none !text-lg placeholder:!text-lg"
              />
              <ChatIcon className="absolute left-12 top-[65%] -translate-y-1/2 h-7 w-7 text-primary-accent pointer-events-none" />
            </form>
          </div>
        </div>
      </SheetContent>
    </Sheet>
    </>
  );
};

export default ChatModal;

