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
    <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] p-6 flex items-center justify-between">
      <div>
        <p className="text-sm text-[#64748B] font-medium">{title}</p>
        <p className="text-3xl font-bold text-[#1E293B] mt-1">{value}</p>
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
        {icon}
      </div>
    </div>
  );
}
