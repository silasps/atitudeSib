import { Skeleton, SkeletonFormField } from '@/components/ui/skeleton'

export default function ChamadaLoading() {
  return (
    <div className="p-6 lg:p-8 max-w-2xl">
      <div className="mb-6 space-y-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-7 w-28" />
        <Skeleton className="h-4 w-56" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4 mb-6">
        <SkeletonFormField />
        <div className="grid grid-cols-2 gap-3">
          <SkeletonFormField />
          <SkeletonFormField />
        </div>
        <SkeletonFormField />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100 last:border-0">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-7 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
