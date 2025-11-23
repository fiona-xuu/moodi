import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Justification {
  score: number;
  justification: string;
}

interface ScanSummaryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  summary: {
    overall_health: Justification;
    hunger: Justification;
    stress_level: Justification;
    energy_level: Justification;
    sleep_quality: Justification;
  } | null;
}

const statDisplayName = {
  overall_health: "Overall Health",
  hunger: "Hunger",
  stress_level: "Stress Balance",
  energy_level: "Energy Level",
  sleep_quality: "Sleep Quality",
};

const displayOrder: Array<keyof ScanSummaryModalProps["summary"]> = [
  "overall_health",
  "hunger",
  "energy_level",
  "stress_level",
  "sleep_quality",
];

const ScanSummaryModal = ({ open, onOpenChange, summary }: ScanSummaryModalProps) => {
  if (!summary) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Scan Complete!</AlertDialogTitle>
          <AlertDialogDescription>
            Here's a summary of your recent scan:
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="text-sm space-y-2">
          {displayOrder.map((key) => {
            const value = summary[key];
            if (!value) return null;
            const displayName = statDisplayName[key] || key;
            return (
              <div key={key}>
                <span className="font-semibold">{displayName}:</span> {value.score}/100 - <span className="italic">{value.justification}</span>
              </div>
            );
          })}
        </div>
        <AlertDialogFooter>
          <AlertDialogAction onClick={() => onOpenChange(false)}>Got it!</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ScanSummaryModal;