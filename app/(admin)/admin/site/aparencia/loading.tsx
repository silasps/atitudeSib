import { Skeleton, SkeletonFormField } from '@/components/ui/skeleton'

export default function AparenciaLoading() {
  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      <div className="space-y-2 mb-8">
        <Skeleton className="h-7 w-36" />
        <Skeleton className="h-4 w-60" />
      </div>

      <div className="space-y-8">
        {/* Templates */}
        <div className="space-y-3">
          <Skeleton className="h-5 w-24" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="border-2 border-gray-200 rounded-xl p-4 space-y-2 text-center">
                <Skeleton className="h-7 w-7 mx-auto" />
                <Skeleton className="h-3 w-16 mx-auto" />
              </div>
            ))}
          </div>
        </div>

        {/* Paleta */}
        <div className="space-y-3">
          <Skeleton className="h-5 w-28" />
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-full rounded-lg" />
            ))}
          </div>
        </div>

        <SkeletonFormField />
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>
    </div>
  )
}
