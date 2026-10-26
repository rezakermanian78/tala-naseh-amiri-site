/** Placeholder shown while the first API fetch is in flight. Sized like the real content
 *  so nothing jumps when it arrives. */
export function SkeletonLine({ className = '' }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`block animate-pulse rounded-full bg-blush-deep motion-reduce:animate-none ${className}`}
    />
  )
}

export function SkeletonText({ lines = 3, className = '' }: { lines?: number; className?: string }) {
  return (
    <span aria-hidden="true" className={`block space-y-3 ${className}`}>
      {Array.from({ length: lines }, (_, i) => (
        <SkeletonLine key={i} className={`h-4 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`} />
      ))}
    </span>
  )
}

export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`card ${className}`}>
      <SkeletonLine className="h-6 w-1/2" />
      <SkeletonText lines={3} className="mt-5" />
    </div>
  )
}
