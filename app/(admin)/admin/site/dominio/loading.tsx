import { Skeleton, SkeletonFormField } from '@/components/ui/skeleton'

export default function DominioLoading() {
  return (
    <div className="p-6 lg:p-8 max-w-2xl">
      <div className="space-y-2 mb-8">
        <Skeleton className="h-7 w-36" />
        <Skeleton className="h-4 w-60" />
      </div>
      <div className="space-y-6">
        <SkeletonFormField />
        <Skeleton className="h-28 w-full rounded-xl" />
        <Skeleton className="h-10 w-36 rounded-lg" />
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
