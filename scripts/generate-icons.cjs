const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function createPng(width, height, getPixel) {
  function crc32(buf) {
    let crc = -1;
    for (let i = 0; i < buf.length; i++) {
      crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xFF];
    }
    return (crc ^ -1) >>> 0;
  }
  const table = new Int32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
    table[i] = c;
  }
  function chunk(type, data) {
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0);
    const t = Buffer.from(type);
    const crcVal = crc32(Buffer.concat([t, data]));
    const crcBuf = Buffer.alloc(4); crcBuf.writeUInt32BE(crcVal, 0);
    return Buffer.concat([len, t, data, crcBuf]);
  }
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; ihdrData[9] = 6; // 8-bit RGBA
  const ihdr = chunk('IHDR', ihdrData);
  const scanlines = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    const rowOffset = y * (1 + width * 4);
    scanlines[rowOffset] = 0;
    for (let x = 0; x < width; x++) {
      const px = getPixel(x, y, width, height);
      const pxOffset = rowOffset + 1 + x * 4;
      scanlines[pxOffset] = px[0];
      scanlines[pxOffset+1] = px[1];
      scanlines[pxOffset+2] = px[2];
      scanlines[pxOffset+3] = px[3];
    }
  }
  const idat = chunk('IDAT', zlib.deflateSync(scanlines));
  const iend = chunk('IEND', Buffer.alloc(0));
  return Buffer.concat([sig, ihdr, idat, iend]);
}

// Distance to rounded rectangle
function sdRoundRect(x, y, w, h, r) {
  const dx = Math.abs(x - w / 2) - (w / 2 - r);
  const dy = Math.abs(y - h / 2) - (h / 2 - r);
  return Math.min(Math.max(dx, dy), 0) + Math.hypot(Math.max(dx, 0), Math.max(dy, 0)) - r;
}

// Shield SDF
function inShield(nx, ny) {
  // nx in [-1, 1], ny in [-1, 1]
  if (Math.abs(nx) > 0.8) return false;
  if (ny < -0.75 || ny > 0.85) return false;
  if (ny < 0) {
    return Math.abs(nx) <= 0.75;
  }
  // Bottom taper of shield
  const progress = ny; // 0 to 0.85
  const allowedW = 0.75 * Math.cos(progress * 1.5);
  return Math.abs(nx) <= allowedW;
}

// Checkmark SDF
function distToSegment(px, py, x1, y1, x2, y2) {
  const l2 = (x2 - x1) ** 2 + (y2 - y1) ** 2;
  if (l2 === 0) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + t * (x2 - x1)), py - (y1 + t * (y2 - y1)));
}

function renderIcon(size, isMaskable = false) {
  return createPng(size, size, (x, y, w, h) => {
    // Normalised coords -1 to 1
    const cx = (x / w) * 2 - 1;
    const cy = (y / h) * 2 - 1;

    // Background squircle
    const radiusRatio = isMaskable ? 0 : 0.22;
    const dBg = isMaskable ? -1 : sdRoundRect(x, y, w, h, w * radiusRatio);
    if (dBg > 1) {
      return [0, 0, 0, 0]; // Transparent outside squircle
    }

    // Background gradient: Sky Cobalt (#0284c7) to Deep Navy (#0b1329)
    const tGrad = (cx + cy + 2) / 4; // 0 to 1
    let r = Math.round(2 + tGrad * 10);
    let g = Math.round(132 * (1 - tGrad * 0.5));
    let b = Math.round(199 * (1 - tGrad * 0.4));
    let a = 255;
    if (dBg > 0) a = Math.round((1 - dBg) * 255);

    // Shield scale
    const scale = isMaskable ? 1.6 : 1.35;
    const snx = cx * scale;
    const sny = (cy + 0.05) * scale;

    const insideOuterShield = inShield(snx, sny);
    const insideInnerShield = inShield(snx * 1.15, (sny - 0.02) * 1.15);

    // Checkmark geometry
    // Check points: (-0.3, 0) -> (-0.05, 0.25) -> (0.35, -0.2)
    const d1 = distToSegment(snx, sny, -0.28, 0.02, -0.06, 0.26);
    const d2 = distToSegment(snx, sny, -0.06, 0.26, 0.32, -0.18);
    const checkDist = Math.min(d1, d2);
    const checkThickness = 0.085;

    if (checkDist <= checkThickness) {
      // Crisp white checkmark
      const checkAa = Math.min(1, Math.max(0, (checkThickness - checkDist) / 0.02));
      return [255, 255, 255, 255];
    } else if (insideOuterShield && !insideInnerShield) {
      // Glowing Cyan Shield Border
      return [56, 189, 248, 255]; // #38bdf8
    } else if (insideInnerShield) {
      // Inner shield darker core
      return [15, 23, 42, 240]; // #0f172a
    }

    return [r, g, b, a];
  });
}

const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

fs.writeFileSync(path.join(publicDir, 'icon-192.png'), renderIcon(192, false));
fs.writeFileSync(path.join(publicDir, 'icon-512.png'), renderIcon(512, false));
fs.writeFileSync(path.join(publicDir, 'icon-maskable-512.png'), renderIcon(512, true));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), renderIcon(180, false));

// Also generate crisp SVG icon
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0284c7"/>
      <stop offset="50%" stop-color="#0369a1"/>
      <stop offset="100%" stop-color="#0b1329"/>
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="16" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>
  <rect width="512" height="512" rx="112" fill="url(#bgGrad)"/>
  <g transform="translate(256, 260) scale(14)" filter="url(#glow)">
    <path d="M0 -11 C5 -11 9 -7 9 -2 C9 5 5 9 0 11 C-5 9 -9 5 -9 -2 C-9 -7 -5 -11 0 -11 Z" 
          fill="#0f172a" stroke="#38bdf8" stroke-width="1.8" stroke-linejoin="round"/>
    <path d="M-4.5 0.5 L-1.5 3.5 L5 -3" 
          fill="none" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
</svg>`;
fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent);

console.log('Successfully generated PWA icons in public/ !');
