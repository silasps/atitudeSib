import { Skeleton } from '@/components/ui/skeleton'

export default function ConfiguracoesLoading() {
  return (
    <div className="p-6 lg:p-8 max-w-2xl">
      <div className="space-y-2 mb-8">
        <Skeleton className="h-7 w-36" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-100">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="px-6 py-4 flex justify-between items-center">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-36" />
          </div>
        ))}
      </div>
    </div>
  )
}
