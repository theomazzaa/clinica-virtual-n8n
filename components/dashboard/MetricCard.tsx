interface MetricCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color?: "blue" | "red" | "green" | "gray";
}

const colorMap = {
  blue: "bg-[#EFF6FF] text-[#2563EB]",
  red: "bg-[#FEF2F2] text-[#EF4444]",
  green: "bg-[#F0FDF4] text-[#22C55E]",
  gray: "bg-[#F8FAFC] text-[#64748B]",
};

export default function MetricCard({
  title,
  value,
  icon,
  color = "blue",
}: MetricCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-4 md:p-6 flex items-center justify-between">
      <div className="min-w-0">
        <p className="text-xs md:text-sm text-[#64748B] font-medium truncate">{title}</p>
        <p className="text-2xl md:text-3xl font-bold text-[#1E293B] mt-1">{value}</p>
      </div>
      <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${colorMap[color]}`}>
        {icon}
      </div>
    </div>
  );
}
