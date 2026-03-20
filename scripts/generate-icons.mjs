/**
 * Generate PWA icon PNGs from SVG.
 *
 * Usage: node scripts/generate-icons.mjs
 *
 * If you don't have sharp installed, you can manually create 192x192 and 512x512
 * PNG icons and place them in public/icons/ as icon-192.png and icon-512.png.
 *
 * Alternatively, use any online SVG-to-PNG converter with public/icons/icon.svg.
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');
const iconsDir = resolve(rootDir, 'public/icons');

async function generateIcons() {
  try {
    const sharp = (await import('sharp')).default;
    const svgPath = resolve(iconsDir, 'icon.svg');
    const svgBuffer = readFileSync(svgPath);

    const sizes = [192, 512];
    for (const size of sizes) {
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(resolve(iconsDir, `icon-${size}.png`));
      console.log(`Generated icon-${size}.png`);
    }
    console.log('Done! Icons generated in public/icons/');
  } catch (err) {
    if (err.code === 'ERR_MODULE_NOT_FOUND' || err.code === 'MODULE_NOT_FOUND') {
      console.log('sharp not installed. Creating minimal placeholder PNGs...');
      createPlaceholderPngs();
    } else {
      throw err;
    }
  }
}

function createPlaceholderPngs() {
  // Create a minimal valid 1x1 pink PNG as placeholder
  // Users should replace these with proper icons
  const sizes = [192, 512];
  for (const size of sizes) {
    const outPath = resolve(iconsDir, `icon-${size}.png`);
    if (!existsSync(outPath)) {
      // Minimal PNG: 1x1 pixel pink (#F472B6)
      const png = Buffer.from(
        '89504e47' + '0d0a1a0a' + // PNG signature
        '0000000d' + '49484452' + '00000001' + '00000001' + '08020000009001' + '2e00' + // IHDR
        '0000000c' + '49444154' + '08d763f86de85a0000' + '00030001' + 'b48a433b' + // IDAT
        '0000000049454e44ae426082', // IEND
        'hex'
      );
      writeFileSync(outPath, png);
      console.log(`Created placeholder ${outPath} — replace with a proper ${size}x${size} PNG`);
    }
  }
}

generateIcons();
