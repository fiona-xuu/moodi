import { useState } from "react";
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

const ChatModal = ({ open, onOpenChange }: ChatModalProps) => {
  const [inputValue, setInputValue] = useState("");

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
              <SheetTitle className="text-5xl font-light text-primary-accent mt-6" style={{ fontFamily: 'Mansalva, cursive' }}>
                meet <span className="text-primary-accent font-bold text-6xl">lumi</span> !
              </SheetTitle>
            </div>
            <p className="text-primary-accent text-2xl inder-text">moodi's personal assistant</p>
          </SheetHeader>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col items-center justify-center px-6 pb-24 relative">
            {/* Text Bubble */}
            <div className="absolute top-8 right-20 w-56 h-40">
              <TextBubble className="text-primary-accent text-xl">how can I help?</TextBubble>
            </div>

            {/* Lumi character */}
            <div className="mt-28">
              <img 
                src={mascot} 
                alt="Lumi" 
                className="h-64 w-auto mx-auto"
              />
            </div>
          </div>

          {/* Input Field */}
          <div className="absolute bottom-0 left-0 right-0 p-10 bg-transparent">
            <div className="relative">
              <Input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Lets talk about ..."
                className="w-full bg-white/90 rounded-full px-12 py-6 text-primary-accent placeholder:text-primary-accent shadow-lg text-center border-none focus:ring-0 focus:outline-none !text-lg placeholder:!text-lg"
              />
              <ChatIcon className="absolute left-5 top-1/2 -translate-y-1/2 h-7 w-7 text-primary-accent pointer-events-none" />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
    </>
  );
};

export default ChatModal;

