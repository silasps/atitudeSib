import { Skeleton, SkeletonCard } from '@/components/ui/skeleton'

export default function ProfessorHomeLoading() {
  return (
    <div className="p-6 lg:p-8">
      <div className="space-y-2 mb-8">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-36" />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  )
}
