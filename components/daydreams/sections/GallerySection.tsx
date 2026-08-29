import Image from "next/image";
import type { GalleryImage } from "@/lib/daydreams/types";

/** Renders a real photo when one exists; falls back to a labeled color swatch otherwise. */
export function GallerySection({ gallery }: { gallery: GalleryImage[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {gallery.map((image) => (
        <figure key={image.id} className="group relative aspect-square overflow-hidden rounded-xl">
          {image.src ? (
            <>
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(min-width: 640px) 33vw, 50vw"
                className="object-cover transition-transform duration-500 ease-out motion-safe:group-hover:scale-105"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-2">
                <figcaption className="text-xs font-semibold text-white">{image.category}</figcaption>
              </div>
            </>
          ) : (
            <div
              className="flex h-full w-full items-center justify-center text-sm font-semibold text-white"
              style={{ backgroundColor: image.accentColor }}
              role="img"
              aria-label={image.alt}
            >
              {image.category}
            </div>
          )}
        </figure>
      ))}
    </div>
  );
}
