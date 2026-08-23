export function Skeleton({ width, height = 14, radius, className = "", style = {} }) {
  return (
    <span
      className={`skeleton ${className}`.trim()}
      style={{ width, height, borderRadius: radius, display: "block", ...style }}
    />
  );
}

export function PostSkeleton() {
  return (
    <div className="skeleton-post">
      <div className="skeleton-post__header">
        <Skeleton width={40} height={40} radius={999} />
        <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
          <Skeleton width="30%" height={12} />
          <Skeleton width="20%" height={10} />
        </div>
      </div>
      <Skeleton width="90%" height={12} />
      <Skeleton width="70%" height={12} />
    </div>
  );
}

export function FeedSkeleton({ count = 4 }) {
  return (
    <div>
      {Array.from({ length: count }).map((_, i) => (
        <PostSkeleton key={i} />
      ))}
    </div>
  );
}
