"use client";

interface CircularProgressBarProps {
  percentage: number;
  size: number;
  strokeWidth: number;
  circleColor: string;
  label?: string;
}

export const CircularProgressBar = ({
  percentage,
  size,
  strokeWidth,
  circleColor,
  label,
}: CircularProgressBarProps) => {
  // Calculate the radius
  const radius = (size - strokeWidth) / 2;

  // Calculate the circumference
  const circumference = radius * 2 * Math.PI;

  // Calculate the dash offset based on the percentage
  const dashOffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background circle */}
        <circle
          className="stroke-muted-foreground/20"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Progress circle */}
        <circle
          className="transition-all duration-300 ease-in-out"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
          stroke={circleColor}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
        />
      </svg>

      {/* Percentage text */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center text-center"
        style={{ fontSize: size * 0.2 }}
      >
        <span className="font-bold">{percentage}%</span>
        {label && (
          <span className="text-xs text-muted-foreground">{label}</span>
        )}
      </div>
    </div>
  );
};
