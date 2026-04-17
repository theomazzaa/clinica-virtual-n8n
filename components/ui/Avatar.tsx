import { cn, getAvatarColor } from "@/lib/utils";

interface AvatarProps {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
} as const;

export default function Avatar({ name, size = "md", className }: AvatarProps) {
  const initial = name ? name[0].toUpperCase() : "?";
  const [bg, text] = getAvatarColor(name);

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-bold flex-shrink-0",
        sizeClasses[size],
        bg,
        text,
        className
      )}
      aria-label={name}
    >
      {initial}
    </div>
  );
}
