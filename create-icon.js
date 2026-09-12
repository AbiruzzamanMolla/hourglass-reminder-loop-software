const fs = require('fs');
const path = require('path');

// 256x256 ICO generator for Hourglass
function createHourglassIco256() {
  const size = 256;
  const rawData = Buffer.alloc(size * size * 4);

  const mid = size / 2; // 128

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;

      // Outer wooden top and bottom bars
      const isTopBar = y >= 16 && y <= 36 && x >= 32 && x <= 224;
      const isBottomBar = y >= 220 && y <= 240 && x >= 32 && x <= 224;
      
      // Side pillars
      const isLeftPillar = x >= 28 && x <= 38 && y >= 36 && y <= 220;
      const isRightPillar = x >= 218 && x <= 228 && y >= 36 && y <= 220;

      // Upper cone
      const distFromTop = y - 36;
      const coneHalfWidthTop = Math.max(0, 80 - distFromTop * 0.85);
      const isUpperCone = y > 36 && y <= 128 && x >= (mid - coneHalfWidthTop) && x <= (mid + coneHalfWidthTop);

      // Lower cone
      const distFromNeck = y - 128;
      const coneHalfWidthBottom = Math.max(0, distFromNeck * 0.85);
      const isLowerCone = y > 128 && y < 220 && x >= (mid - coneHalfWidthBottom) && x <= (mid + coneHalfWidthBottom);

      if (isTopBar || isBottomBar) {
        rawData[idx] = 217;     // R
        rawData[idx + 1] = 119; // G
        rawData[idx + 2] = 6;   // B
        rawData[idx + 3] = 255; // A
      } else if (isLeftPillar || isRightPillar) {
        rawData[idx] = 180;     // R
        rawData[idx + 1] = 83;  // G
        rawData[idx + 2] = 9;   // B
        rawData[idx + 3] = 255; // A
      } else if (isUpperCone || isLowerCone) {
        // Sand gradient
        rawData[idx] = 252;     // R
        rawData[idx + 1] = 211; // G
        rawData[idx + 2] = 77;  // B
        rawData[idx + 3] = 245; // A
      } else {
        rawData[idx] = 0;
        rawData[idx + 1] = 0;
        rawData[idx + 2] = 0;
        rawData[idx + 3] = 0;
      }
    }
  }

  // BMP Info Header (40 bytes)
  const bih = Buffer.alloc(40);
  bih.writeUInt32LE(40, 0);       // header size
  bih.writeInt32LE(size, 4);       // width
  bih.writeInt32LE(size * 2, 8);   // height (double height for ICO XOR+AND mask)
  bih.writeUInt16LE(1, 12);        // planes
  bih.writeUInt16LE(32, 14);       // bpp
  bih.writeUInt32LE(0, 16);        // compression
  bih.writeUInt32LE(size * size * 4, 20); // image size
  bih.writeInt32LE(0, 24);         // x per meter
  bih.writeInt32LE(0, 28);         // y per meter
  bih.writeUInt32LE(0, 32);        // colors
  bih.writeUInt32LE(0, 36);        // important colors

  // AND mask (1 bit per pixel, 32-bit row aligned)
  const maskRowBytes = Math.ceil(size / 32) * 4;
  const andMask = Buffer.alloc(maskRowBytes * size, 0);

  // Convert RGBA to BGRA upside down for BMP
  const bmpPixels = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const srcIdx = (y * size + x) * 4;
      const dstY = size - 1 - y;
      const dstIdx = (dstY * size + x) * 4;
      bmpPixels[dstIdx] = rawData[srcIdx + 2];     // B
      bmpPixels[dstIdx + 1] = rawData[srcIdx + 1]; // G
      bmpPixels[dstIdx + 2] = rawData[srcIdx];     // R
      bmpPixels[dstIdx + 3] = rawData[srcIdx + 3]; // A
    }
  }

  const imageBuffer = Buffer.concat([bih, bmpPixels, andMask]);

  // ICONDIR header (6 bytes)
  const iconDir = Buffer.alloc(6);
  iconDir.writeUInt16LE(0, 0); // reserved
  iconDir.writeUInt16LE(1, 2); // type 1 = ICO
  iconDir.writeUInt16LE(1, 4); // count 1 image

  // ICONDIRENTRY (16 bytes)
  const iconEntry = Buffer.alloc(16);
  iconEntry.writeUInt8(0, 0); // 0 means 256 in ICO spec
  iconEntry.writeUInt8(0, 1); // 0 means 256 in ICO spec
  iconEntry.writeUInt8(0, 2); // color count
  iconEntry.writeUInt8(0, 3); // reserved
  iconEntry.writeUInt16LE(1, 4); // planes
  iconEntry.writeUInt16LE(32, 6); // bpp
  iconEntry.writeUInt32LE(imageBuffer.length, 8); // bytes in resource
  iconEntry.writeUInt32LE(6 + 16, 12); // offset

  const icoBuffer = Buffer.concat([iconDir, iconEntry, imageBuffer]);
  fs.writeFileSync(path.join(__dirname, 'icon.ico'), icoBuffer);
  console.log('256x256 icon.ico generated successfully');
}

createHourglassIco256();
