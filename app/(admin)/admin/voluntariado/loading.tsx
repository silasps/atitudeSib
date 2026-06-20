import { Skeleton } from '@/components/ui/skeleton'

export default function VoluntariadoLoading() {
  return (
    <div className="p-6 lg:p-8">
      <div className="space-y-2 mb-8">
        <Skeleton className="h-7 w-36" />
        <Skeleton className="h-4 w-56" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-gray-50 border border-gray-200 rounded-xl p-6 flex items-start gap-4">
            <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-7 w-10" />
              </div>
              <Skeleton className="h-3.5 w-40" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
