import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  /** Fills the full viewport height when true (used for top-level loading gates) */
  fullScreen?: boolean;
  style?: React.CSSProperties;
}

export function LoadingSpinner({ fullScreen, style }: LoadingSpinnerProps) {
  if (fullScreen) {
    return (
      <div className="flex justify-center items-center w-full h-screen">
        <Loader2 className="animate-spin text-text-primary h-4 w-4 shrink-0" style={style} />
      </div>
    );
  }
  return <Loader2 className="animate-spin text-text-primary h-4 w-4 shrink-0" style={style} />;
}
