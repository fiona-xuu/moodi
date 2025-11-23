import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

interface ScanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ScanModal = ({ open, onOpenChange }: ScanModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!bg-primary-background/95 border-none rounded-lg p-8 max-w-lg [&>button.absolute.right-4.top-4]:hidden">
        <DialogClose className="absolute right-6 top-6 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-0 disabled:pointer-events-none z-50">
          <X className="h-5 w-5 text-primary-accent" />
          <span className="sr-only">Close</span>
        </DialogClose>
        <DialogHeader className="mb-4">
          <DialogTitle className="text-4xl font-bold text-primary-accent inder-text mb-3">
            How to Scan
          </DialogTitle>
          <div className="h-px bg-primary-accent/40 w-full"></div>
        </DialogHeader>

        <div className="space-y-6 inder-text mb-4">
          <div className="flex gap-4 items-start">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-accent/20 flex items-center justify-center">
              <span className="text-primary-accent font-bold text-lg">1</span>
            </div>
            <div>
              <h3 className="text-primary-accent text-xl font-semibold mb-1">Launch the Mobile Application</h3>
              <p className="text-primary-accent/80 text-base">
                Open the moodi app on your mobile device to begin the scanning process.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-accent/20 flex items-center justify-center">
              <span className="text-primary-accent font-bold text-lg">2</span>
            </div>
            <div>
              <h3 className="text-primary-accent text-xl font-semibold mb-1">Record Facial Analysis</h3>
              <p className="text-primary-accent/80 text-base">
                Position your face within the camera frame and record for 20 seconds to capture comprehensive biometric data.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-accent/20 flex items-center justify-center">
              <span className="text-primary-accent font-bold text-lg">3</span>
            </div>
            <div>
              <h3 className="text-primary-accent text-xl font-semibold mb-1">Wait for Data Processing</h3>
              <p className="text-primary-accent/80 text-base">
                Allow the system to process and analyze your recorded data. Your vitals will be updated automatically once processing is complete.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ScanModal;

