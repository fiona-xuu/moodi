import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import mascot from "@/assets/mascot.png";
import chatbotBackground from "@/assets/chatbot-background.png";
import TextBubble from "@/components/TextBubble";
import ChatIcon from "@/components/icons/ChatIcon";
import CloseSidebarIcon from "@/components/icons/CloseSidebarIcon";

interface ChatModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Message {
  text: string;
  sender: 'user' | 'lumi';
}

const ChatModal = ({ open, onOpenChange }: ChatModalProps) => {
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const hasMessages = messages.length > 0;

  // Reset messages when modal closes
  useEffect(() => {
    if (!open) {
      setMessages([]);
      setInputValue("");
    }
  }, [open]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const messageText = inputValue.trim();
    
    // Add user message
    const userMessage: Message = { text: messageText, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");

    // Simulate Lumi response (you can replace this with actual API call later)
    setTimeout(() => {
      const lumiMessage: Message = { text: messageText, sender: 'lumi' };
      setMessages(prev => [...prev, lumiMessage]);
    }, 500);
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
              <div className="flex flex-col gap-0 mt-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-3 ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    {/* Mascot/Emoji Icon */}
                    {message.sender === 'lumi' ? (
                      <img 
                        src={mascot} 
                        alt="Lumi" 
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

                {/* Lumi character */}
                <div className="mt-20">
                  <img 
                    src={mascot} 
                    alt="Lumi" 
                    className="h-72 w-auto mx-auto"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Input Field */}
          <div className="absolute bottom-0 left-0 right-0 p-10 bg-transparent">
            <form onSubmit={handleSendMessage} className="relative">
              <Input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Lets talk about ..."
                className="w-full bg-white/90 rounded-full px-12 py-7 text-primary-accent placeholder:text-primary-accent/70 shadow-lg text-center border-none focus:ring-0 focus:outline-none !text-lg placeholder:!text-lg"
              />
              <ChatIcon className="absolute left-6 top-1/2 -translate-y-1/2 h-7 w-7 text-primary-accent pointer-events-none" />
            </form>
          </div>
        </div>
      </SheetContent>
    </Sheet>
    </>
  );
};

export default ChatModal;

