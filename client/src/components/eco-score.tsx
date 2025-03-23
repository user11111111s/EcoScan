import { cn } from "@/lib/utils";

interface EcoScoreProps {
  score: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function EcoScore({ score, size = 'lg', className }: EcoScoreProps) {
  const getGradientColor = (score: string) => {
    switch (score) {
      case 'A+':
      case 'A':
        return 'from-green-500 to-primary-500';
      case 'B':
        return 'from-green-400 to-primary-400';
      case 'C':
        return 'from-yellow-400 to-amber-500';
      case 'D':
        return 'from-orange-400 to-amber-600';
      case 'E':
      case 'F':
        return 'from-red-400 to-red-600';
      default:
        return 'from-green-500 to-primary-500';
    }
  };

  const getSizeClasses = (size: string) => {
    switch (size) {
      case 'sm':
        return {
          container: 'h-12 w-12',
          inner: 'h-9 w-9',
          text: 'text-lg'
        };
      case 'md':
        return {
          container: 'h-16 w-16',
          inner: 'h-12 w-12',
          text: 'text-xl'
        };
      case 'lg':
      default:
        return {
          container: 'h-24 w-24',
          inner: 'h-18 w-18',
          text: 'text-2xl'
        };
    }
  };

  const sizeClasses = getSizeClasses(size);
  const gradientColor = getGradientColor(score);

  return (
    <div 
      className={cn(
        "relative flex items-center justify-center rounded-full bg-gradient-to-r",
        gradientColor,
        sizeClasses.container,
        className
      )}
    >
      <div className="absolute bg-white dark:bg-slate-800 rounded-full" style={{width: '75%', height: '75%'}} />
      <span className={cn("z-10 font-bold", sizeClasses.text)}>{score}</span>
    </div>
  );
}
