import Image from "next/image";
import { getGalleryImages } from "@/lib/gallery";
import Reveal from "./Reveal";

export default function Gallery() {
  const images = getGalleryImages();
  if (images.length === 0) return null;

  return (
    <section id="gallery" className="relative bg-surface py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <Reveal className="max-w-xl">
          <p className="text-accent-2 text-xs tracking-[0.4em] uppercase mb-4">Inside the garage</p>
          <h2 className="text-display text-4xl md:text-5xl uppercase text-ink leading-[0.95]">
            The simulators, live
          </h2>
        </Reveal>

        <div className="mt-12 columns-2 md:columns-3 gap-4 space-y-4">
          {images.map((img, i) => (
            <Reveal key={img.src} delay={Math.min(i * 0.05, 0.3)} className="break-inside-avoid">
              <div className="relative overflow-hidden rounded-lg border border-line">
                <Image
                  src={img.src}
                  alt={img.alt}
                  width={img.width}
                  height={img.height}
                  className="w-full h-auto"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
