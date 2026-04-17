import Link from "next/link";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color?: "blue" | "red" | "green" | "amber";
  href?: string;
}

const colorMap = {
  blue: {
    border: "border-l-primary-600",
    iconBg: "bg-primary-50 text-primary-600",
  },
  red: {
    border: "border-l-danger-500",
    iconBg: "bg-danger-50 text-danger-500",
  },
  green: {
    border: "border-l-success-500",
    iconBg: "bg-success-50 text-success-600",
  },
  amber: {
    border: "border-l-warning-500",
    iconBg: "bg-warning-50 text-warning-600",
  },
};

function CardContent({ title, value, icon, color = "blue" }: MetricCardProps) {
  const c = colorMap[color];
  return (
    <div
      className={cn(
        "bg-surface rounded-[var(--radius-lg)] shadow-xs border border-border border-l-4 p-4 md:p-5",
        "flex items-center justify-between",
        "hover:shadow-md transition-shadow duration-200",
        c.border
      )}
    >
      <div className="min-w-0">
        <p className="text-xs md:text-sm text-text-muted font-medium truncate">
          {title}
        </p>
        <p className="text-2xl md:text-3xl font-bold text-text-primary mt-1">
          {value}
        </p>
      </div>
      <div
        className={cn(
          "w-10 h-10 md:w-11 md:h-11 rounded-[var(--radius-md)] flex items-center justify-center flex-shrink-0",
          c.iconBg
        )}
      >
        {icon}
      </div>
    </div>
  );
}

export default function MetricCard(props: MetricCardProps) {
  if (props.href) {
    return (
      <Link href={props.href} className="block focus-ring rounded-[var(--radius-lg)]">
        <CardContent {...props} />
      </Link>
    );
  }
  return <CardContent {...props} />;
}
