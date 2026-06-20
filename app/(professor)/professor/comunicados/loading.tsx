import { Skeleton } from '@/components/ui/skeleton'

export default function ComunicadosLoading() {
  return (
    <div className="p-6 lg:p-8">
      <div className="space-y-2 mb-8">
        <Skeleton className="h-7 w-36" />
        <Skeleton className="h-4 w-52" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-5 bg-white border border-gray-200 rounded-xl">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-3.5 w-64" />
                <div className="flex gap-3 pt-1">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <Skeleton className="h-6 w-20 rounded-full shrink-0" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
