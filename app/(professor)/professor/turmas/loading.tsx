import { Skeleton, SkeletonCard } from '@/components/ui/skeleton'

export default function ProfessorTurmasLoading() {
  return (
    <div className="p-6 lg:p-8">
      <div className="space-y-2 mb-8">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-4 w-44" />
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  )
}
