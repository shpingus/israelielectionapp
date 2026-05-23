import QRCode from 'qrcode';

// Text wrapping helper supporting LTR/RTL and canvas bounds
function wrapCanvasText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  let lines = [];

  for (let n = 0; n < words.length; n++) {
    let testLine = line + words[n] + ' ';
    let metrics = ctx.measureText(testLine);
    let testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      lines.push(line);
      line = words[n] + ' ';
    } else {
      line = testLine;
    }
  }
  lines.push(line);

  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i].trim(), x, y + (i * lineHeight));
  }
  return lines.length * lineHeight;
}

// Helper to pre-wrap text and get list of wrapped lines
function getWrappedLines(ctx, text, maxWidth) {
  if (!text) return [];
  const words = text.trim().split(/\s+/);
  let line = '';
  let lines = [];

  for (let n = 0; n < words.length; n++) {
    let testLine = line + words[n] + ' ';
    let metrics = ctx.measureText(testLine);
    let testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      lines.push(line.trim());
      line = words[n] + ' ';
    } else {
      line = testLine;
    }
  }
  lines.push(line.trim());
  return lines;
}

/**
 * Draws the Neo-Brutalist results sharing card on the canvas.
 * Target dimensions: 1080 x 1920 px (Instagram Story standard 9:16).
 */
export async function generateShareCanvas(canvas, { partyName, leaderName, score, description, accentColor }, isRtl, t, numberFont = 'Cinzel') {
  const ctx = canvas.getContext('2d');
  
  // Clear Canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.direction = isRtl ? 'rtl' : 'ltr';

  // 1. Draw Cream Background
  ctx.fillStyle = '#F8F7F3';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 2. Draw Dot Grid Pattern
  ctx.fillStyle = '#121212';
  for (let x = 30; x < canvas.width; x += 48) {
    for (let y = 30; y < canvas.height; y += 48) {
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Draw Top Banner (Neo-Brutalist White Banner with Bottom Border)
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, 100);
  ctx.strokeStyle = '#121212';
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.moveTo(0, 100);
  ctx.lineTo(canvas.width, 100);
  ctx.stroke();

  ctx.fillStyle = '#121212';
  ctx.font = '700 30px "Space Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const brandingText = isRtl ? "בחירות 2026 // סקר עמדות" : "ELECTIONS 2026 // SURVEY";
  ctx.fillText(brandingText.toUpperCase(), 540, 50);

  // 3. Measure party and leader names dynamically to adjust card height
  ctx.font = '400 70px "Suez One", Georgia, serif';
  const partyLines = getWrappedLines(ctx, partyName, 680);
  const partyLineHeight = isRtl ? 74 : 70;
  const partyTextHeight = partyLines.length * partyLineHeight;

  ctx.font = '700 36px "Space Mono", monospace';
  const leaderLabelStr = `${t('leader')}: ${leaderName}`;
  const leaderLines = getWrappedLines(ctx, leaderLabelStr, 680);
  const leaderLineHeight = 42;
  const leaderTextHeight = leaderLines.length * leaderLineHeight;

  // whiteSectionHeight: 30px top padding + party name + 12px gap + leader + 30px bottom padding
  const whiteSectionHeight = 30 + partyTextHeight + 12 + leaderTextHeight + 30;
  const totalCardHeight = 160 + whiteSectionHeight;
  const alignmentCardBottom = 240 + totalCardHeight;

  const shadowOffsetX = isRtl ? 20 : -20;
  
  // Solid Offset Shadows
  ctx.fillStyle = '#121212';
  ctx.fillRect(140 + shadowOffsetX, 240 + 20, 760, totalCardHeight);
  
  // Content block border & background
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = '#121212';
  ctx.lineWidth = 12;
  ctx.fillRect(140, 240, 760, totalCardHeight);
  ctx.strokeRect(140, 240, 760, totalCardHeight);

  // 4. Stance percentage Badge in accent block
  ctx.fillStyle = '#00E5FF';
  ctx.fillRect(140, 240, 760, 160);
  ctx.strokeRect(140, 240, 760, 160);

  // Draw score text (rendered entirely in the chosen display font, made slightly smaller)
  ctx.fillStyle = '#121212';
  ctx.font = isRtl ? '800 110px "Heebo", sans-serif' : '800 110px "Outfit", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${score}%`, 520, 315);

  // Draw Best Match label (under score)
  ctx.font = '700 24px "Space Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText(t('stanceAlignment').toUpperCase(), 520, 375);

  // 5. Party Name & Leader in white section
  ctx.fillStyle = '#121212';
  ctx.font = '400 70px "Suez One", Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  let currentTextY = 240 + 160 + 30; // Y = 430 (top padding is 30px)
  for (let i = 0; i < partyLines.length; i++) {
    ctx.fillText(partyLines[i], 520, currentTextY + (i * partyLineHeight));
  }
  currentTextY += partyTextHeight + 12; // gap is 12px

  // Leader
  ctx.font = '700 36px "Space Mono", monospace';
  ctx.fillStyle = '#121212';
  ctx.globalAlpha = 0.7;
  ctx.textBaseline = 'top';
  for (let i = 0; i < leaderLines.length; i++) {
    ctx.fillText(leaderLines[i], 520, currentTextY + (i * leaderLineHeight));
  }
  ctx.globalAlpha = 1.0;

  // 6. Platform Description Card
  // Measure platform description height dynamically
  ctx.font = isRtl ? '500 38px "Heebo", sans-serif' : '500 38px "Outfit", sans-serif';
  const descLines = getWrappedLines(ctx, description, 680);
  const lineHeight = 54;
  const textHeight = descLines.length * lineHeight;
  
  // Padding: 80px (title banner) + 40px top gap + textHeight + 40px bottom gap
  const cardHeight = 80 + 40 + textHeight + 40; 
  const cardY = alignmentCardBottom + 120;

  // Draw shadow for description card
  ctx.fillStyle = '#121212';
  ctx.fillRect(140 + shadowOffsetX, cardY + 20, 760, cardHeight);

  // Draw white card for description
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = '#121212';
  ctx.lineWidth = 12;
  ctx.fillRect(140, cardY, 760, cardHeight);
  ctx.strokeRect(140, cardY, 760, cardHeight);

  // Draw category title label banner
  ctx.fillStyle = accentColor || '#121212';
  ctx.fillRect(140, cardY, 760, 80);
  ctx.strokeStyle = '#121212';
  ctx.strokeRect(140, cardY, 760, 80);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '700 28px "Space Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(t('yourBestMatch'), 520, cardY + 40);

  // Platform content text
  ctx.fillStyle = '#121212';
  ctx.font = isRtl ? '500 38px "Heebo", sans-serif' : '500 38px "Outfit", sans-serif';
  ctx.textAlign = isRtl ? 'right' : 'left';
  ctx.textBaseline = 'top';
  
  const descX = isRtl ? 840 : 200;
  const textStartY = cardY + 80 + 40;
  
  for (let i = 0; i < descLines.length; i++) {
    ctx.fillText(descLines[i], descX, textStartY + (i * lineHeight));
  }

  // 7. Footer: Centered QR Code Generation & expanded layout
  const qrSize = 280;
  const qrX = 540 - (qrSize / 2);
  const bottomOfDescription = cardY + cardHeight;
  const qrY = bottomOfDescription + ((1800 - bottomOfDescription - qrSize) / 2);

  try {
    const qrCanvas = document.createElement('canvas');
    await QRCode.toCanvas(qrCanvas, 'https://elections.ruppin.dev', {
      margin: 1,
      width: qrSize,
      color: {
        dark: '#121212',
        light: '#FFFFFF'
      }
    });

    // Draw Neo-Brutalist offset shadow for the QR code
    ctx.fillStyle = '#121212';
    ctx.fillRect(qrX + 16, qrY + 16, qrSize, qrSize);

    // Draw the QR container box
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#121212';
    ctx.lineWidth = 10;
    ctx.fillRect(qrX, qrY, qrSize, qrSize);
    ctx.strokeRect(qrX, qrY, qrSize, qrSize);

    // Draw the QR canvas over it, inset slightly
    ctx.drawImage(qrCanvas, qrX + 10, qrY + 10, qrSize - 20, qrSize - 20);
  } catch (err) {
    console.error("Failed to generate QR Code", err);
    // Draw visual mockup of a QR code as fallback with Neo-Brutalist shadow
    ctx.fillStyle = '#121212';
    ctx.fillRect(qrX + 16, qrY + 16, qrSize, qrSize);

    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#121212';
    ctx.lineWidth = 10;
    ctx.fillRect(qrX, qrY, qrSize, qrSize);
    ctx.strokeRect(qrX, qrY, qrSize, qrSize);
    
    ctx.fillStyle = '#121212';
    ctx.fillRect(qrX + 30, qrY + 30, 80, 80);
    ctx.fillRect(qrX + qrSize - 110, qrY + 30, 80, 80);
    ctx.fillRect(qrX + 30, qrY + qrSize - 110, 80, 80);
    ctx.fillRect(qrX + 110, qrY + 110, 60, 60);
  }

  // 8. White bottom banner matching site aesthetic
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 1800, canvas.width, 120);
  ctx.strokeStyle = '#121212';
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.moveTo(0, 1800);
  ctx.lineTo(canvas.width, 1800);
  ctx.stroke();

  // Draw clickable-style footer link (RTL-aware positioning, without https://)
  ctx.direction = 'ltr'; // Override direction for manual LTR layout construction
  ctx.font = '700 26px "Space Mono", monospace';
  ctx.textBaseline = 'middle';
  
  const link = "elections.ruppin.dev";
  let parts = [];
  
  if (isRtl) {
    // RTL: English Link on Left, Hebrew text on Right
    parts = [
      { text: link, color: '#2979FF', underline: true },
      { text: " // ", color: '#121212', underline: false },
      { text: "גלו איפה אתם עומדים", color: '#121212', underline: false }
    ];
  } else {
    // LTR: English text on Left, English Link on Right
    parts = [
      { text: "FIND OUT WHERE YOU STAND // ", color: '#121212', underline: false },
      { text: link, color: '#2979FF', underline: true }
    ];
  }
  
  // Calculate total width
  let totalWidth = 0;
  for (const part of parts) {
    part.width = ctx.measureText(part.text).width;
    totalWidth += part.width;
  }
  
  const startX = 540 - (totalWidth / 2);
  let currentX = startX;
  
  // Draw each part sequentially from left to right
  ctx.textAlign = 'left';
  for (const part of parts) {
    ctx.fillStyle = part.color;
    ctx.fillText(part.text, currentX, 1860);
    if (part.underline) {
      ctx.strokeStyle = part.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(currentX, 1878);
      ctx.lineTo(currentX + part.width, 1878);
      ctx.stroke();
    }
    currentX += part.width;
  }
}
