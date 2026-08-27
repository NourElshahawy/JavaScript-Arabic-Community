import Image from "next/image";

export function PostImages({ images }) {
  if (!images?.length) return null;

  return (
    <div className="post__images" data-count={Math.min(images.length, 4)}>
      {images.slice(0, 4).map((src, i) => (
        <div key={src} style={{ position: "relative", aspectRatio: images.length === 1 ? "16 / 9" : "1", minHeight: 120 }}>
          <Image src={src} alt="" fill sizes="(max-width: 640px) 100vw, 600px" style={{ objectFit: "cover", borderRadius: "var(--radius-md)" }} />
        </div>
      ))}
    </div>
  );
}
