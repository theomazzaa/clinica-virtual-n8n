import Link from "next/link";

interface MetricCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color?: "blue" | "red" | "green" | "amber";
  href?: string;
}

const colorMap = {
  blue: {
    border: "border-l-[#2563EB]",
    iconBg: "bg-[#EFF6FF] text-[#2563EB]",
  },
  red: {
    border: "border-l-[#EF4444]",
    iconBg: "bg-[#FEF2F2] text-[#EF4444]",
  },
  green: {
    border: "border-l-[#22C55E]",
    iconBg: "bg-[#F0FDF4] text-[#22C55E]",
  },
  amber: {
    border: "border-l-[#F59E0B]",
    iconBg: "bg-[#FFFBEB] text-[#F59E0B]",
  },
};

function CardContent({ title, value, icon, color = "blue" }: MetricCardProps) {
  const c = colorMap[color];
  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-[#E2E8F0] border-l-4 ${c.border} p-4 md:p-6 flex items-center justify-between hover:shadow-md transition-shadow duration-200`}
    >
      <div className="min-w-0">
        <p className="text-xs md:text-sm text-[#64748B] font-medium truncate">{title}</p>
        <p className="text-2xl md:text-3xl font-bold text-[#1E293B] mt-1">{value}</p>
      </div>
      <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${c.iconBg}`}>
        {icon}
      </div>
    </div>
  );
}

export default function MetricCard(props: MetricCardProps) {
  if (props.href) {
    return (
      <Link href={props.href} className="block">
        <CardContent {...props} />
      </Link>
    );
  }
  return <CardContent {...props} />;
}
