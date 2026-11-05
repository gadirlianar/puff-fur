// =============================================================================
// PHOTO BOOTH POLAROID SNAPSHOT ENGINE FOR MOCHI-PUFF
// =============================================================================
// Captures the current WebGL canvas frame, composites it into an aesthetic,
// high-resolution polaroid card with creature name, timestamp & watermark,
// and triggers an instant PNG download with screen flash and shutter audio.

import { playShutterSound } from './audioSynth.js';

/**
 * Triggers a camera flash visual effect across the screen.
 */
function triggerScreenFlash() {
  const flash = document.createElement('div');
  flash.className = 'snapshot-flash-overlay';
  document.body.appendChild(flash);

  // Force reflow
  flash.getBoundingClientRect();
  flash.classList.add('fade-out');

  setTimeout(() => {
    if (flash.parentElement) {
      flash.parentElement.removeChild(flash);
    }
  }, 450);
}

/**
 * Takes an instant polaroid photo of the creature.
 * 
 * @param {import('three').WebGLRenderer} renderer 
 * @param {import('three').Scene} scene 
 * @param {import('three').Camera} camera 
 * @param {string} [creatureName='Mochi-Puff']
 * @returns {Promise<string>} PNG Data URL
 */
export async function capturePolaroidSnapshot(renderer, scene, camera, creatureName = 'Mochi-Puff') {
  // 1. Play realistic mechanical camera click sound & trigger screen flash
  playShutterSound();
  triggerScreenFlash();

  // 2. Render fresh frame immediately to ensure canvas buffer is valid
  renderer.render(scene, camera);

  const glCanvas = renderer.domElement;
  const glWidth = glCanvas.width;
  const glHeight = glCanvas.height;

  // 3. Create high-resolution polaroid card canvas
  const cardCanvas = document.createElement('canvas');
  const cardWidth = 1000;
  const cardHeight = 1240;
  cardCanvas.width = cardWidth;
  cardCanvas.height = cardHeight;
  const ctx = cardCanvas.getContext('2d');
  if (!ctx) return '';

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // 4. Draw Polaroid Paper Card (soft warm white with subtle gradient and inner border)
  const bgGrad = ctx.createLinearGradient(0, 0, cardWidth, cardHeight);
  bgGrad.addColorStop(0, '#ffffff');
  bgGrad.addColorStop(0.5, '#fafaf7');
  bgGrad.addColorStop(1, '#f3f3ee');
  ctx.fillStyle = bgGrad;

  // Rounded card corners
  const radius = 24;
  ctx.beginPath();
  ctx.moveTo(radius, 0);
  ctx.lineTo(cardWidth - radius, 0);
  ctx.quadraticCurveTo(cardWidth, 0, cardWidth, radius);
  ctx.lineTo(cardWidth, cardHeight - radius);
  ctx.quadraticCurveTo(cardWidth, cardHeight, cardWidth - radius, cardHeight);
  ctx.lineTo(radius, cardHeight);
  ctx.quadraticCurveTo(0, cardHeight, 0, cardHeight - radius);
  ctx.lineTo(0, radius);
  ctx.quadraticCurveTo(0, 0, radius, 0);
  ctx.closePath();
  ctx.fill();

  // Subtle outer edge stroke
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
  ctx.stroke();

  // 5. Draw Photo Area (Centered square frame)
  const photoMargin = 52;
  const photoSize = cardWidth - photoMargin * 2; // 896 x 896
  const photoX = photoMargin;
  const photoY = photoMargin;

  // Clip photo with slight 8px rounded corners
  ctx.save();
  const photoRadius = 10;
  ctx.beginPath();
  ctx.moveTo(photoX + photoRadius, photoY);
  ctx.lineTo(photoX + photoSize - photoRadius, photoY);
  ctx.quadraticCurveTo(photoX + photoSize, photoY, photoX + photoSize, photoY + photoRadius);
  ctx.lineTo(photoX + photoSize, photoY + photoSize - photoRadius);
  ctx.quadraticCurveTo(photoX + photoSize, photoY + photoSize, photoX + photoSize - photoRadius, photoY + photoSize);
  ctx.lineTo(photoX + photoRadius, photoY + photoSize);
  ctx.quadraticCurveTo(photoX, photoY + photoSize, photoX, photoY + photoSize - photoRadius);
  ctx.lineTo(photoX, photoY + photoRadius);
  ctx.quadraticCurveTo(photoX, photoY, photoX + photoRadius, photoY);
  ctx.closePath();
  ctx.clip();

  // Draw deep studio cyclorama backdrop in case of transparent renderer background
  const photoBgGrad = ctx.createRadialGradient(
    photoX + photoSize * 0.5, photoY + photoSize * 0.42, 10,
    photoX + photoSize * 0.5, photoY + photoSize * 0.5, photoSize * 0.72
  );
  photoBgGrad.addColorStop(0, '#161928');
  photoBgGrad.addColorStop(0.55, '#0c0e18');
  photoBgGrad.addColorStop(1, '#05060a');
  ctx.fillStyle = photoBgGrad;
  ctx.fillRect(photoX, photoY, photoSize, photoSize);

  // Crop WebGL canvas centered
  const cropSize = Math.min(glWidth, glHeight);
  const srcX = Math.max(0, (glWidth - cropSize) * 0.5);
  const srcY = Math.max(0, (glHeight - cropSize) * 0.5);

  ctx.drawImage(
    glCanvas,
    srcX, srcY, cropSize, cropSize,
    photoX, photoY, photoSize, photoSize
  );

  // Subtle vignette / inner shadow over photo
  const photoVignette = ctx.createRadialGradient(
    photoX + photoSize * 0.5, photoY + photoSize * 0.5, photoSize * 0.35,
    photoX + photoSize * 0.5, photoY + photoSize * 0.5, photoSize * 0.72
  );
  photoVignette.addColorStop(0, 'rgba(0, 0, 0, 0.0)');
  photoVignette.addColorStop(1, 'rgba(0, 0, 0, 0.22)');
  ctx.fillStyle = photoVignette;
  ctx.fillRect(photoX, photoY, photoSize, photoSize);

  ctx.restore();

  // Inset border around photo
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.12)';
  ctx.strokeRect(photoX, photoY, photoSize, photoSize);

  // 6. Polaroid Bottom Caption & Typography
  const captionY = photoY + photoSize + 68;

  // Title: Creature Name with dynamic auto-scaling
  const safeName = (creatureName || 'Mochi-Puff').trim();
  const displayName = safeName.startsWith('✦') ? safeName : `✦ ${safeName}`;

  let fontSize = 42;
  ctx.font = `600 ${fontSize}px "Google Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  ctx.textAlign = 'left';
  while (ctx.measureText(displayName).width > photoSize - 30 && fontSize > 22) {
    fontSize -= 2;
    ctx.font = `600 ${fontSize}px "Google Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
  }
  ctx.fillStyle = '#181b24';
  ctx.fillText(displayName, photoX + 6, captionY);

  // Date and Description
  const today = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  ctx.fillStyle = '#6b7280';
  ctx.font = '500 20px "Google Sans Text", -apple-system, BlinkMacSystemFont, sans-serif';
  ctx.fillText(`Captured on ${today} · 3D GPU Fur`, photoX + 8, captionY + 42);

  // Watermark stamp on bottom right
  ctx.textAlign = 'right';
  ctx.fillStyle = '#9ca3af';
  ctx.font = '600 19px "Google Sans Text", sans-serif';
  ctx.fillText('🐾 Mochi-Puff · Anar Gadirli', photoX + photoSize - 6, captionY + 42);

  // 7. Generate Data URL and Trigger PNG Download
  const dataUrl = cardCanvas.toDataURL('image/png');
  const cleanName = safeName.toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '') || 'mochi-puff';
  const filename = `${cleanName}-polaroid.png`;

  const downloadLink = document.createElement('a');
  downloadLink.download = filename;
  downloadLink.href = dataUrl;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);

  return dataUrl;
}
