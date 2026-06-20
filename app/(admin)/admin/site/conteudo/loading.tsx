import { Skeleton, SkeletonFormField } from '@/components/ui/skeleton'

export default function ConteudoLoading() {
  return (
    <div className="p-6 lg:p-8 max-w-2xl">
      <div className="space-y-2 mb-8">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-60" />
      </div>
      <div className="space-y-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonFormField key={i} />
        ))}
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>
    </div>
  )
}
