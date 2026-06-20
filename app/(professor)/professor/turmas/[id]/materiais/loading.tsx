import { Skeleton } from '@/components/ui/skeleton'

export default function MateriaisLoading() {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 space-y-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-start gap-4 p-4 bg-white border border-gray-200 rounded-xl">
            <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-64" />
            </div>
            <Skeleton className="h-4 w-12" />
          </div>
        ))}
      </div>
    </div>
  )
}
