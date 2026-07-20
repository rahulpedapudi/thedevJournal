import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  /** Fills the full viewport height when true (used for top-level loading gates) */
  fullScreen?: boolean;
  style?: React.CSSProperties;
}

export function LoadingSpinner({ fullScreen, style }: LoadingSpinnerProps) {
  if (fullScreen) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          height: "100vh",
        }}
      >
        <Loader2 className="loading-spinner" style={style} />
      </div>
    );
  }
  return <Loader2 className="loading-spinner" style={style} />;
}
