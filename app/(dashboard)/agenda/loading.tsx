import Skeleton from "@/components/ui/Skeleton";

function SkeletonTurnoCard() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 flex gap-5 shadow-sm">
      {/* Hora */}
      <div className="flex-shrink-0 flex items-center justify-center w-16">
        <Skeleton className="w-14 h-9" />
      </div>

      {/* Datos del paciente */}
      <div className="flex-1 space-y-2 py-1">
        <Skeleton variant="text" className="w-48 h-4" />
        <Skeleton variant="text" className="w-64 h-3" />
        <Skeleton variant="text" className="w-40 h-3" />
      </div>

      {/* Badge + botones */}
      <div className="flex-shrink-0 flex flex-col items-end gap-2 py-1">
        <Skeleton className="w-28 h-6 rounded-full" />
        <Skeleton className="w-36 h-8 rounded-lg" />
        <Skeleton className="w-36 h-8 rounded-lg" />
      </div>
    </div>
  );
}

export default function AgendaLoading() {
  return (
    <div className="space-y-6">
      {/* Header: título + tabs + navegación */}
      <div className="space-y-4">
        <Skeleton variant="text" className="w-28 h-7" />
        <div className="flex items-center justify-between">
          {/* Tabs */}
          <div className="flex gap-2">
            <Skeleton className="w-16 h-9 rounded-lg" />
            <Skeleton className="w-28 h-9 rounded-lg" />
          </div>
          {/* Flechas + fecha */}
          <div className="flex items-center gap-2">
            <Skeleton className="w-9 h-9 rounded-lg" />
            <Skeleton variant="text" className="w-40 h-5" />
            <Skeleton className="w-9 h-9 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Contador de turnos */}
      <Skeleton variant="text" className="w-72 h-4" />

      {/* Cards de turnos */}
      <div className="space-y-3">
        <SkeletonTurnoCard />
        <SkeletonTurnoCard />
        <SkeletonTurnoCard />
        <SkeletonTurnoCard />
      </div>
    </div>
  );
}
