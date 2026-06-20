import { SkeletonPageHeader, SkeletonStatCard } from '@/components/ui/skeleton'

export default function AdminDashboardLoading() {
  return (
    <div className="p-6 lg:p-8">
      <SkeletonPageHeader hasButton={false} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonStatCard key={i} />
        ))}
      </div>
    </div>
  )
}
