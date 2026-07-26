import fs from "fs";
import path from "path";
import { imageSize } from "image-size";

/**
 * Drop-in gallery: any image dropped into /public/gallery shows up here,
 * sorted by filename. Prefix files like 01-, 02- to control order.
 */

const GALLERY_DIR = path.join(process.cwd(), "public", "gallery");
const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

export interface GalleryImage {
  src: string;
  width: number;
  height: number;
  alt: string;
}

function humanize(filename: string): string {
  const base = filename
    .replace(/\.[^.]+$/, "")
    .replace(/^\d+[-_]?/, "")
    .replace(/[-_]+/g, " ")
    .trim();
  if (!base) return "Apex Racing Simulator";
  return base.replace(/\b\w/g, (c) => c.toUpperCase());
}

export function getGalleryImages(): GalleryImage[] {
  if (!fs.existsSync(GALLERY_DIR)) return [];

  const files = fs
    .readdirSync(GALLERY_DIR)
    .filter((f) => IMAGE_EXT.has(path.extname(f).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  const images: GalleryImage[] = [];
  for (const file of files) {
    try {
      const buffer = fs.readFileSync(path.join(GALLERY_DIR, file));
      const { width, height } = imageSize(buffer);
      if (!width || !height) continue;
      images.push({ src: `/gallery/${file}`, width, height, alt: humanize(file) });
    } catch {
      continue;
    }
  }
  return images;
}
