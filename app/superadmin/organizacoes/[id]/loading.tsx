export default function Loading() {
  return (
    <div className="p-8 max-w-4xl animate-pulse">
      <div className="h-4 w-40 bg-white/10 rounded mb-6" />
      <div className="h-8 w-64 bg-white/10 rounded mb-2" />
      <div className="h-4 w-32 bg-white/10 rounded mb-8" />
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[1,2,3].map(i => <div key={i} className="h-20 bg-white/5 rounded-xl" />)}
      </div>
      <div className="h-40 bg-white/5 rounded-xl mb-6" />
      <div className="h-32 bg-white/5 rounded-xl" />
    </div>
  )
}
