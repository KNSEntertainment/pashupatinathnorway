import { Progress } from "@/components/ui/progress";

interface CauseProgressBarProps {
  currentAmount: number;
  goalAmount: number;
  donationCount: number;
  showPercentage?: boolean;
  showDonationCount?: boolean;
  className?: string;
}

export default function CauseProgressBar({ 
  currentAmount, 
  goalAmount, 
  donationCount, 
  showPercentage = true,
  showDonationCount = true,
  className = ""
}: CauseProgressBarProps) {
  const progressPercentage = goalAmount > 0 ? Math.min((currentAmount / goalAmount) * 100, 100) : 0;
  
  // Norwegian currency formatter
  const formatNOK = (amount: number) => {
    return new Intl.NumberFormat('nb-NO', {
      style: 'currency',
      currency: 'NOK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex justify-between text-sm">
        <span>Progress:</span>
        <span className="font-semibold">
          {formatNOK(currentAmount)} / {formatNOK(goalAmount)}
        </span>
      </div>
      <Progress value={progressPercentage} className="h-3" />
      <div className="flex justify-between text-sm text-gray-500">
        {showPercentage && <span>{progressPercentage.toFixed(1)}%</span>}
        {showDonationCount && <span>{donationCount} donations</span>}
      </div>
    </div>
  );
}
