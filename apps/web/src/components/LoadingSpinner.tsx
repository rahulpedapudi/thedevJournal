import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  /** Fills the full viewport height when true (used for top-level loading gates) */
  fullScreen?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export function LoadingSpinner({
  fullScreen,
  style,
  className,
}: LoadingSpinnerProps) {
  const spinnerClass = `animate-spin text-text-primary ${
    className || "h-4 w-4"
  } shrink-0`;
  if (fullScreen) {
    return (
      <div className="flex justify-center items-center w-full h-screen">
        <Loader2 className={spinnerClass} style={style} />
      </div>
    );
  }
  return <Loader2 className={spinnerClass} style={style} />;
}
