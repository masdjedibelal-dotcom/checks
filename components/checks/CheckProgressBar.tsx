type CheckProgressBarProps = {
  steps: readonly string[];
  currentStep: number;
  accent: string;
};

export function CheckProgressBar({ steps, currentStep, accent }: CheckProgressBarProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "10px 16px 12px",
        background: "#ffffff",
        borderBottom: "1px solid rgba(31,41,55,0.06)",
      }}
    >
      {steps.map((label, i) => {
        const isDone = i < currentStep;
        const isActive = i === currentStep;
        const isLast = i === steps.length - 1;
        return (
          <div
            key={label}
            style={{ display: "flex", alignItems: "center", flex: isLast ? "0 0 auto" : 1, minWidth: 0 }}
          >
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", flexShrink: 0 }}>
              <div
                style={{
                  width: "22px",
                  height: "22px",
                  borderRadius: "50%",
                  border: `1.5px solid ${isDone ? accent : isActive ? accent : "rgba(31,41,55,0.15)"}`,
                  background: isDone ? accent : "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "10px",
                  fontWeight: "700",
                  color: isDone ? "#ffffff" : isActive ? accent : "#9CA3AF",
                  transition: "all 0.3s ease",
                  flexShrink: 0,
                }}
              >
                {isDone ? (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4l3 3 5-6" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  String(i + 1)
                )}
              </div>
              <div
                style={{
                  fontSize: "9px",
                  fontWeight: isActive ? "700" : "500",
                  color: isDone || isActive ? accent : "#9CA3AF",
                  whiteSpace: "nowrap",
                  letterSpacing: "0.01em",
                  transition: "all 0.3s ease",
                }}
              >
                {label}
              </div>
            </div>
            {!isLast && (
              <div
                style={{
                  flex: 1,
                  height: "1.5px",
                  background: isDone ? accent : "rgba(31,41,55,0.10)",
                  margin: "0 4px",
                  marginBottom: "14px",
                  transition: "background 0.3s ease",
                  minWidth: "8px",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
