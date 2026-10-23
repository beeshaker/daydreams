/**
 * Generates the static social-share (Open Graph) cards in public/og/, the
 * app icons (app/icon.png, app/apple-icon.png), and the home page photos in
 * public/home/ (from the client's full-size shoot in images/, which isn't
 * committed — only the resized webp outputs are).
 * The outputs are committed; re-run with `npx tsx scripts/generate-seo-images.ts`
 * after changing a source photo or the copy below. Text is rendered by sharp
 * through SVG with system fonts, so the exact face may vary by machine.
 */
import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const W = 1200;
const H = 630;
const LOGO = "public/branding/logo.png";

function escape(text: string) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function textSvg(lines: { text: string; size: number; weight: number; color: string; y: number }[], x: number) {
  const tspans = lines
    .map(
      (l) =>
        `<text x="${x}" y="${l.y}" font-family="Noto Sans, DejaVu Sans, sans-serif" font-size="${l.size}" font-weight="${l.weight}" fill="${l.color}">${escape(l.text)}</text>`,
    )
    .join("");
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${tspans}</svg>`);
}

async function circularLogo(size: number) {
  const mask = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}"/></svg>`,
  );
  return sharp(LOGO).resize(size, size).composite([{ input: mask, blend: "dest-in" }]).png().toBuffer();
}

async function sharedCard() {
  await sharp({ create: { width: W, height: H, channels: 3, background: "#ffffff" } })
    .composite([
      { input: await circularLogo(470), left: 60, top: 80 },
      {
        input: textSvg(
          [
            { text: "A daycare and a gym,", size: 50, weight: 700, color: "#1a1a1a", y: 250 },
            { text: "under one roof.", size: 50, weight: 700, color: "#7443a3", y: 315 },
            { text: "Daydreams & Dumbbells · Nairobi", size: 28, weight: 500, color: "#555555", y: 390 },
          ],
          580,
        ),
      },
    ])
    .png()
    .toFile("public/og/daydreams-and-dumbbells.png");
}

async function daydreamsCard() {
  const photo = await sharp("public/daydreams-hero-poster.webp").resize(W, H, { fit: "cover" }).toBuffer();
  const scrim = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#1a1a1a" stop-opacity=".9"/><stop offset=".6" stop-color="#1a1a1a" stop-opacity=".15"/><stop offset="1" stop-color="#1a1a1a" stop-opacity="0"/></linearGradient></defs><rect width="${W}" height="${H}" fill="url(#g)"/></svg>`,
  );
  await sharp(photo)
    .composite([
      { input: scrim },
      { input: await circularLogo(120), left: 1040, top: 40 },
      {
        input: textSvg(
          [
            { text: "Daydreams", size: 72, weight: 800, color: "#ffffff", y: 500 },
            { text: "Daycare & early learning in Nairobi", size: 34, weight: 500, color: "#c8b9d6", y: 560 },
          ],
          60,
        ),
      },
    ])
    .png()
    .toFile("public/og/daydreams.png");
}

async function dumbbellsCard() {
  // The poster is portrait; crop the band with the lifter in it.
  const photo = await sharp("public/dumbbells-premium/assets/hero-snatch-poster.webp")
    .extract({ left: 0, top: 820, width: 1080, height: 1080 })
    .resize(H, H)
    .toBuffer();
  await sharp({ create: { width: W, height: H, channels: 3, background: "#0b0908" } })
    .composite([
      { input: photo, left: W - H, top: 0 },
      // Fades the photo's left edge into the panel so there's no hard seam.
      {
        input: Buffer.from(
          `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="${H}"><defs><linearGradient id="f"><stop offset="0" stop-color="#0b0908"/><stop offset="1" stop-color="#0b0908" stop-opacity="0"/></linearGradient></defs><rect width="240" height="${H}" fill="url(#f)"/></svg>`,
        ),
        left: W - H,
        top: 0,
      },
      { input: await circularLogo(110), left: 60, top: 60 },
      {
        input: textSvg(
          [
            { text: "DUMBBELLS", size: 76, weight: 800, color: "#f5efe7", y: 360 },
            { text: "Gym, spin & strength classes", size: 34, weight: 500, color: "#b3a89d", y: 420 },
            { text: "in Nairobi", size: 34, weight: 500, color: "#b3a89d", y: 465 },
            { text: "Your journey starts now.", size: 30, weight: 700, color: "#c4214b", y: 545 },
          ],
          60,
        ),
      },
    ])
    .png()
    .toFile("public/og/dumbbells.png");
}

async function icons() {
  await sharp(LOGO).resize(512, 512).png().toFile("app/icon.png");
  await sharp(LOGO).resize(180, 180).png().toFile("app/apple-icon.png");
}

/** [source in images/, output name, width, height] — cropped to fill. */
const HOME_PHOTOS: [string, string, number, number][] = [
  ["DSC06266 edit.jpg.jpeg", "hero-daydreams", 1600, 1067],
  ["DSC06283 edit.jpg.jpeg", "hero-daydreams-2", 1600, 1067],
  ["DSC06271 edit.jpg.jpeg", "hero-daydreams-3", 1600, 1067],
  ["DSC06256 edit.jpg.jpeg", "hero-daydreams-4", 1600, 1067],
  ["DSC06304 edit.jpg.jpeg", "hero-dumbbells", 1600, 1067],
  ["DSC06311 edit.jpg.jpeg", "hero-dumbbells-2", 1600, 1067],
  ["DSC06300 edit.jpg.jpeg", "cafe-wide", 1600, 900],
  ["DSC06291 edit.jpg.jpeg", "building-day", 960, 1200],
  ["DSC06300 edit.jpg.jpeg", "cafe-terrace", 960, 1200],
  ["DSC06330 edit.jpg.jpeg", "building-night", 1200, 800],
  ["DSC06283 edit.jpg.jpeg", "tile-kids", 800, 600],
  ["DSC06311 edit.jpg.jpeg", "tile-gym", 800, 600],
  ["DSC06300 edit.jpg.jpeg", "tile-cafe", 800, 600],
  ["DSC06271 edit.jpg.jpeg", "tile-events", 800, 600],
];

async function homePhotos() {
  await mkdir("public/home", { recursive: true });
  await Promise.all(
    HOME_PHOTOS.map(([source, name, width, height]) =>
      sharp(`images/${source}`).resize(width, height, { fit: "cover" }).webp({ quality: 78 }).toFile(`public/home/${name}.webp`),
    ),
  );
}

async function main() {
  await mkdir("public/og", { recursive: true });
  await Promise.all([sharedCard(), daydreamsCard(), dumbbellsCard(), icons(), homePhotos()]);
  console.log("Wrote public/og/*.png, public/home/*.webp, app/icon.png, app/apple-icon.png");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
