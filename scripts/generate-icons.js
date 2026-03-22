/**
 * 아이콘 생성 스크립트
 * 기존 icon-512.png에서 모든 필요 사이즈를 생성합니다.
 *
 * 사용법:
 *   npm install sharp --save-dev
 *   node scripts/generate-icons.js
 */

const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const ICONS_DIR = path.join(__dirname, "..", "public", "icons");
const SOURCE = path.join(ICONS_DIR, "icon-512.png");

// 일반 아이콘 사이즈
const STANDARD_SIZES = [48, 72, 96, 128, 144, 192, 384, 512];

// Maskable 아이콘 사이즈 (10% 패딩 추가)
const MASKABLE_SIZES = [192, 512];

async function generateStandardIcons() {
  for (const size of STANDARD_SIZES) {
    const output = path.join(ICONS_DIR, `icon-${size}.png`);
    
    // 512는 원본 파일이므로 스킵
    if (size === 512) {
      console.log(`⏭️  icon-512.png is the source file, skipping`);
      continue;
    }

    await sharp(SOURCE)
      .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(output);

    console.log(`✅ icon-${size}.png (${size}x${size})`);
  }
}

async function generateMaskableIcons() {
  for (const size of MASKABLE_SIZES) {
    const output = path.join(ICONS_DIR, `maskable-${size}.png`);

    // Maskable 아이콘: 아이콘 영역은 80%, 나머지 20%는 안전 영역(패딩)
    const iconSize = Math.round(size * 0.8);
    const padding = Math.round((size - iconSize) / 2);

    // 원본을 iconSize로 리사이즈 
    const resizedIcon = await sharp(SOURCE)
      .resize(iconSize, iconSize, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();

    // 배경색(#F472B6 → 분홍) 위에 아이콘을 중앙 배치
    await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 244, g: 114, b: 182, alpha: 255 }, // #F472B6
      },
    })
      .composite([
        {
          input: resizedIcon,
          top: padding,
          left: padding,
        },
      ])
      .png()
      .toFile(output);

    console.log(`✅ maskable-${size}.png (${size}x${size}, with safe zone)`);
  }
}

async function main() {
  if (!fs.existsSync(SOURCE)) {
    console.error(`❌ Source icon not found: ${SOURCE}`);
    console.error(`   Please place a 512x512 PNG icon at public/icons/icon-512.png`);
    process.exit(1);
  }

  console.log("🎨 Generating app icons from icon-512.png...\n");

  await generateStandardIcons();
  console.log("");
  await generateMaskableIcons();

  console.log("\n🎉 All icons generated successfully!");
  console.log(`   Output: ${ICONS_DIR}`);
}

main().catch((err) => {
  console.error("❌ Error generating icons:", err);
  process.exit(1);
});
