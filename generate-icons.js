#!/usr/bin/env node

/**
 * Generate PNG icons from the SVG design
 * Creates 180x180, 192x192, and 512x512 PNG icons with:
 * - Dark blue background (#0a0a2e)
 * - Rounded corners
 * - Beer emoji (🍻) centered
 */

const fs = require('fs');
const path = require('path');

// Try to use canvas if available, otherwise use a simpler approach
let createCanvas, loadImage;
try {
  const Canvas = require('canvas');
  createCanvas = Canvas.createCanvas;
  loadImage = Canvas.loadImage;
} catch (err) {
  console.log('Canvas module not available, will use alternative method');
}

const ICON_SIZES = [
  { size: 180, radius: 26, emoji_size: 90 },
  { size: 192, radius: 28, emoji_size: 96 },
  { size: 512, radius: 72, emoji_size: 256 }
];

const BACKGROUND_COLOR = '#0a0a2e';
const EMOJI = '🍻';

async function generateIcon(size, radius, emojiSize) {
  if (!createCanvas) {
    throw new Error('Canvas module is required. Install with: npm install canvas');
  }

  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Draw rounded rectangle background
  ctx.fillStyle = BACKGROUND_COLOR;
  ctx.beginPath();
  ctx.moveTo(radius, 0);
  ctx.lineTo(size - radius, 0);
  ctx.quadraticCurveTo(size, 0, size, radius);
  ctx.lineTo(size, size - radius);
  ctx.quadraticCurveTo(size, size, size - radius, size);
  ctx.lineTo(radius, size);
  ctx.quadraticCurveTo(0, size, 0, size - radius);
  ctx.lineTo(0, radius);
  ctx.quadraticCurveTo(0, 0, radius, 0);
  ctx.closePath();
  ctx.fill();

  // Draw emoji in center
  ctx.font = `${emojiSize}px Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(EMOJI, size / 2, size / 2);

  return canvas;
}

async function generateAllIcons() {
  const iconsDir = path.join(__dirname, 'icons');
  
  // Ensure icons directory exists
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  for (const { size, radius, emoji_size } of ICON_SIZES) {
    try {
      console.log(`Generating ${size}x${size} PNG icon...`);
      const canvas = await generateIcon(size, radius, emoji_size);
      const buffer = canvas.toBuffer('image/png');
      const filename = path.join(iconsDir, `icon-${size}.png`);
      fs.writeFileSync(filename, buffer);
      console.log(`✓ Created ${filename}`);
    } catch (err) {
      console.error(`✗ Failed to create ${size}x${size} icon:`, err.message);
      throw err;
    }
  }

  console.log('\n✓ All PNG icons generated successfully!');
}

// Run the generator
if (require.main === module) {
  generateAllIcons().catch(err => {
    console.error('Error generating icons:', err);
    process.exit(1);
  });
}

module.exports = { generateAllIcons };
