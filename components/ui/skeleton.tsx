import { cn } from '@/lib/utils'

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={cn('animate-pulse rounded-md bg-gray-200', className)} />
  )
}

export function SkeletonText({ className }: { className?: string }) {
  return <Skeleton className={cn('h-4 w-full', className)} />
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('bg-white border border-gray-200 rounded-xl p-5 space-y-3', className)}>
      <div className="flex items-start justify-between">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-3 w-1/3" />
    </div>
  )
}

export function SkeletonStatCard({ className }: { className?: string }) {
  return (
    <div className={cn('bg-gray-50 rounded-xl p-5 border border-gray-100 space-y-3', className)}>
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-8 w-16" />
    </div>
  )
}

export function SkeletonListItem({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-4 px-4 py-3.5 border-b border-gray-100 last:border-0', className)}>
      <Skeleton className="h-9 w-9 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
      </div>
      <Skeleton className="h-5 w-16 rounded-full" />
    </div>
  )
}

export function SkeletonTableRow({ cols = 4 }: { cols?: number }) {
  return (
    <tr className="border-b border-gray-100">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3.5">
          <Skeleton className={`h-4 ${i === 0 ? 'w-36' : 'w-20'}`} />
        </td>
      ))}
    </tr>
  )
}

export function SkeletonPageHeader({ hasButton = true }: { hasButton?: boolean }) {
  return (
    <div className="flex items-start justify-between mb-6 gap-3">
      <div className="space-y-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-28" />
      </div>
      {hasButton && <Skeleton className="h-9 w-28 rounded-lg shrink-0" />}
    </div>
  )
}

export function SkeletonFormField() {
  return (
    <div className="space-y-1.5">
      <Skeleton className="h-3.5 w-24" />
      <Skeleton className="h-10 w-full rounded-lg" />
    </div>
  )
}
