// ============ NOTE PHOTOS - Pixel Art Images ============
// Imágenes visuales que se muestran cuando se recogen notas

import { Direction } from './engine';

export function drawNotePhoto(ctx: CanvasRenderingContext2D, noteText: string, x: number, y: number, width: number, height: number) {
  const s = 2; // pixel scale
  ctx.save();
  ctx.translate(x, y);
  
  // Fondo de la foto (papel viejo)
  ctx.fillStyle = '#F5E6D3';
  ctx.fillRect(0, 0, width, height);
  
  // Borde
  ctx.strokeStyle = '#8B7355';
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, width, height);
  
  // Sombra interior
  ctx.fillStyle = 'rgba(139, 115, 85, 0.2)';
  ctx.fillRect(2, 2, width - 4, height - 4);
  
  // Dibujar la imagen según el texto de la nota
  if (noteText.includes('FIESTA TODAVÍA NO HA TERMINADO')) {
    drawPartyPhoto(ctx, s, width, height);
  } else if (noteText.includes('risas')) {
    drawGhostLaughPhoto(ctx, s, width, height);
  } else if (noteText.includes('cupcakes')) {
    drawCupcakePhoto(ctx, s, width, height);
  } else if (noteText.includes('No mires atrás')) {
    drawShadowPhoto(ctx, s, width, height);
  } else if (noteText.includes('cabaña')) {
    drawCabinPhoto(ctx, s, width, height);
  } else if (noteText.includes('CAMBIARON')) {
    drawTransformationPhoto(ctx, s, width, height);
  } else if (noteText.includes('máquinas')) {
    drawMachinePhoto(ctx, s, width, height);
  } else if (noteText.includes('Pinkie... ya no')) {
    drawScaryPinkiePhoto(ctx, s, width, height);
  } else if (noteText.includes('fiesta eterna')) {
    drawEternalPartyPhoto(ctx, s, width, height);
  } else {
    drawGenericNotePhoto(ctx, s, width, height);
  }
  
  ctx.restore();
}

// Foto de fiesta abandonada
function drawPartyPhoto(ctx: CanvasRenderingContext2D, s: number, w: number, h: number) {
  const centerX = w / 2;
  const centerY = h / 2;
  
  // Fondo oscuro
  ctx.fillStyle = '#1a0a2e';
  ctx.fillRect(4, 4, w - 8, h - 8);
  
  // Globos flotando (centrados)
  ctx.fillStyle = '#FF69B4';
  ctx.fillRect(centerX - 40, centerY - 30, 12, 16);
  ctx.fillStyle = '#FFD700';
  ctx.fillRect(centerX - 6, centerY - 25, 12, 16);
  ctx.fillStyle = '#4169E1';
  ctx.fillRect(centerX + 28, centerY - 28, 12, 16);
  
  // Hilos de globos
  ctx.strokeStyle = '#888';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(centerX - 34, centerY - 14);
  ctx.lineTo(centerX - 34, centerY + 10);
  ctx.moveTo(centerX, centerY - 9);
  ctx.lineTo(centerX, centerY + 10);
  ctx.moveTo(centerX + 34, centerY - 12);
  ctx.lineTo(centerX + 34, centerY + 10);
  ctx.stroke();
  
  // Mesa volcada (centrada)
  ctx.fillStyle = '#8B4513';
  ctx.fillRect(centerX - 35, centerY + 15, 70, 8);
  ctx.fillRect(centerX - 30, centerY + 23, 8, 16);
  ctx.fillRect(centerX + 22, centerY + 23, 8, 16);
  
  // Texto "LA FIESTA" en el suelo (centrado)
  ctx.fillStyle = '#FF69B4';
  ctx.font = 'bold 14px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('LA FIESTA', centerX, centerY + 50);
  ctx.textAlign = 'left';
}

// Foto de risas fantasmales
function drawGhostLaughPhoto(ctx: CanvasRenderingContext2D, s: number, w: number, h: number) {
  const centerX = w / 2;
  const centerY = h / 2;
  
  // Fondo oscuro
  ctx.fillStyle = '#0a0a1e';
  ctx.fillRect(4, 4, w - 8, h - 8);
  
  // Siluetas de ponis fantasmales (centradas)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.fillRect(centerX - 45, centerY - 15, 16, 24);
  ctx.fillRect(centerX - 8, centerY - 20, 16, 28);
  ctx.fillRect(centerX + 29, centerY - 10, 16, 20);
  
  // Ojos rojos brillantes
  ctx.fillStyle = '#FF0000';
  ctx.fillRect(centerX - 41, centerY - 11, 4, 4);
  ctx.fillRect(centerX - 4, centerY - 16, 4, 4);
  ctx.fillRect(centerX + 33, centerY - 6, 4, 4);
  
  // Ondas de sonido (risas) - centradas
  ctx.strokeStyle = '#FF69B4';
  ctx.lineWidth = 1;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(centerX, centerY + 20, 16 + i * 8, 0, Math.PI, false);
    ctx.stroke();
  }
  
  // Texto "JEJEJE" (centrado)
  ctx.fillStyle = '#FF69B4';
  ctx.font = 'bold 16px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('JEJEJE', centerX, centerY + 50);
  ctx.textAlign = 'left';
}

// Foto de cupcakes con dientes
function drawCupcakePhoto(ctx: CanvasRenderingContext2D, s: number, w: number, h: number) {
  const centerX = w / 2;
  const centerY = h / 2;
  
  // Fondo de pastelería
  ctx.fillStyle = '#FFE4E1';
  ctx.fillRect(4, 4, w - 8, h - 8);
  
  // Cupcake grande (centrado)
  ctx.fillStyle = '#FF69B4';
  ctx.fillRect(centerX - 18, centerY - 20, 36, 20); // frosting
  ctx.fillStyle = '#D2691E';
  ctx.fillRect(centerX - 22, centerY, 44, 24); // base
  
  // Dientes en el cupcake
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(centerX - 14, centerY - 4, 4, 6);
  ctx.fillRect(centerX - 4, centerY - 4, 4, 6);
  ctx.fillRect(centerX + 6, centerY - 4, 4, 6);
  
  // Ojos malvados
  ctx.fillStyle = '#FF0000';
  ctx.fillRect(centerX - 10, centerY - 12, 4, 4);
  ctx.fillRect(centerX + 6, centerY - 12, 4, 4);
  
  // Texto "¿DIENTES?" (centrado)
  ctx.fillStyle = '#8B0000';
  ctx.font = 'bold 14px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('¿DIENTES?', centerX, centerY + 40);
  ctx.textAlign = 'left';
}

// Foto de sombra detrás
function drawShadowPhoto(ctx: CanvasRenderingContext2D, s: number, w: number, h: number) {
  const centerX = w / 2;
  const centerY = h / 2;
  
  // Fondo de pasillo oscuro
  ctx.fillStyle = '#0a0a1e';
  ctx.fillRect(4, 4, w - 8, h - 8);
  
  // Silueta del jugador (vista de espaldas) - centrada
  ctx.fillStyle = '#FFB6C1';
  ctx.fillRect(centerX - 12, centerY - 5, 24, 30);
  ctx.fillRect(centerX - 8, centerY - 20, 16, 16);
  
  // Sombra oscura detrás
  ctx.fillStyle = '#1a0a1a';
  ctx.fillRect(centerX - 16, centerY - 30, 32, 40);
  ctx.fillRect(centerX - 20, centerY - 20, 40, 20);
  
  // Ojos rojos en la sombra
  ctx.fillStyle = '#FF0000';
  ctx.fillRect(centerX - 8, centerY - 24, 4, 4);
  ctx.fillRect(centerX + 4, centerY - 24, 4, 4);
  
  // Flecha apuntando atrás
  ctx.strokeStyle = '#FF0000';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(centerX, centerY + 30);
  ctx.lineTo(centerX, centerY + 45);
  ctx.moveTo(centerX - 6, centerY + 39);
  ctx.lineTo(centerX, centerY + 45);
  ctx.lineTo(centerX + 6, centerY + 39);
  ctx.stroke();
  
  // Texto "NO MIRES" (centrado)
  ctx.fillStyle = '#FF0000';
  ctx.font = 'bold 14px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('NO MIRES', centerX, centerY + 60);
  ctx.textAlign = 'left';
}

// Foto de cabaña en el bosque
function drawCabinPhoto(ctx: CanvasRenderingContext2D, s: number, w: number, h: number) {
  const centerX = w / 2;
  const centerY = h / 2;
  
  // Fondo de bosque
  ctx.fillStyle = '#0a2a0a';
  ctx.fillRect(4, 4, w - 8, h - 8);
  
  // Árboles (a los lados)
  ctx.fillStyle = '#1a4a1a';
  ctx.fillRect(centerX - 60, centerY - 20, 12, 40);
  ctx.fillRect(centerX + 48, centerY - 15, 12, 34);
  
  // Cabaña (centrada)
  ctx.fillStyle = '#8B4513';
  ctx.fillRect(centerX - 20, centerY - 10, 40, 30);
  // Techo
  ctx.fillStyle = '#654321';
  ctx.beginPath();
  ctx.moveTo(centerX - 24, centerY - 10);
  ctx.lineTo(centerX, centerY - 30);
  ctx.lineTo(centerX + 24, centerY - 10);
  ctx.closePath();
  ctx.fill();
  
  // Puerta
  ctx.fillStyle = '#654321';
  ctx.fillRect(centerX - 6, centerY + 5, 12, 16);
  
  // Flecha apuntando al sur
  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(centerX, centerY + 25);
  ctx.lineTo(centerX, centerY + 45);
  ctx.moveTo(centerX - 8, centerY + 37);
  ctx.lineTo(centerX, centerY + 45);
  ctx.lineTo(centerX + 8, centerY + 37);
  ctx.stroke();
  
  // Texto "SUR ↓" (centrado)
  ctx.fillStyle = '#FFD700';
  ctx.font = 'bold 14px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('SUR ↓', centerX, centerY + 60);
  ctx.textAlign = 'left';
}

// Foto de transformación
function drawTransformationPhoto(ctx: CanvasRenderingContext2D, s: number, w: number, h: number) {
  const centerX = w / 2;
  const centerY = h / 2;
  
  // Fondo mágico
  ctx.fillStyle = '#2a0a4a';
  ctx.fillRect(4, 4, w - 8, h - 8);
  
  // Pony normal (izquierda) - centrado
  ctx.fillStyle = '#DDA0DD';
  ctx.fillRect(centerX - 50, centerY - 10, 16, 20);
  ctx.fillRect(centerX - 46, centerY - 25, 12, 16);
  
  // Flecha de transformación
  ctx.strokeStyle = '#FF69B4';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(centerX - 20, centerY);
  ctx.lineTo(centerX + 10, centerY);
  ctx.moveTo(centerX, centerY - 8);
  ctx.lineTo(centerX + 10, centerY);
  ctx.lineTo(centerX, centerY + 8);
  ctx.stroke();
  
  // Pony transformada (derecha) - oscura
  ctx.fillStyle = '#1a0a1a';
  ctx.fillRect(centerX + 24, centerY - 10, 16, 20);
  ctx.fillRect(centerX + 28, centerY - 25, 12, 16);
  
  // Ojos rojos
  ctx.fillStyle = '#FF0000';
  ctx.fillRect(centerX + 30, centerY - 21, 4, 4);
  ctx.fillRect(centerX + 36, centerY - 21, 4, 4);
  
  // Efectos mágicos
  ctx.fillStyle = '#FF69B4';
  for (let i = 0; i < 5; i++) {
    ctx.fillRect(centerX - 30 + i * 6, centerY - 35 + (i % 2) * 4, 4, 4);
  }
  
  // Texto "CAMBIARON" (centrado)
  ctx.fillStyle = '#FF69B4';
  ctx.font = 'bold 14px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('CAMBIARON', centerX, centerY + 45);
  ctx.textAlign = 'left';
}

// Foto de máquinas
function drawMachinePhoto(ctx: CanvasRenderingContext2D, s: number, w: number, h: number) {
  const centerX = w / 2;
  const centerY = h / 2;
  
  // Fondo de fábrica
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(4, 4, w - 8, h - 8);
  
  // Máquina grande (centrada)
  ctx.fillStyle = '#4a4a4a';
  ctx.fillRect(centerX - 35, centerY - 20, 70, 50);
  
  // Engranajes
  ctx.fillStyle = '#888';
  ctx.fillRect(centerX - 25, centerY - 10, 12, 12);
  ctx.fillRect(centerX + 13, centerY - 10, 12, 12);
  ctx.fillRect(centerX - 6, centerY + 8, 12, 12);
  
  // Luces
  ctx.fillStyle = '#FF0000';
  ctx.fillRect(centerX - 20, centerY + 24, 6, 6);
  ctx.fillStyle = '#00FF00';
  ctx.fillRect(centerX - 3, centerY + 24, 6, 6);
  ctx.fillStyle = '#0000FF';
  ctx.fillRect(centerX + 14, centerY + 24, 6, 6);
  
  // Tubos
  ctx.fillStyle = '#666';
  ctx.fillRect(centerX - 30, centerY - 28, 4, 16);
  ctx.fillRect(centerX + 26, centerY - 28, 4, 16);
  
  // Texto "ACTIVAR" (centrado)
  ctx.fillStyle = '#00FF00';
  ctx.font = 'bold 14px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('ACTIVAR', centerX, centerY + 50);
  ctx.textAlign = 'left';
}

// Foto de Pinkie aterradora
function drawScaryPinkiePhoto(ctx: CanvasRenderingContext2D, s: number, w: number, h: number) {
  const centerX = w / 2;
  const centerY = h / 2;
  
  // Fondo rojo oscuro
  ctx.fillStyle = '#2a0a0a';
  ctx.fillRect(4, 4, w - 8, h - 8);
  
  // Pinkie Pie corrupta (centrada)
  ctx.fillStyle = '#1a0a1a';
  ctx.fillRect(centerX - 16, centerY - 15, 32, 40);
  ctx.fillRect(centerX - 12, centerY - 30, 24, 16);
  
  // Melena oscura
  ctx.fillStyle = '#0a000a';
  ctx.fillRect(centerX - 20, centerY - 35, 40, 12);
  ctx.fillRect(centerX - 24, centerY - 25, 8, 20);
  ctx.fillRect(centerX + 16, centerY - 25, 8, 20);
  
  // Ojos rojos brillantes
  ctx.fillStyle = '#FF0000';
  ctx.fillRect(centerX - 8, centerY - 26, 6, 6);
  ctx.fillRect(centerX + 2, centerY - 26, 6, 6);
  
  // Sonrisa siniestra
  ctx.fillStyle = '#FF0000';
  ctx.fillRect(centerX - 10, centerY - 18, 20, 4);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(centerX - 8, centerY - 18, 2, 2);
  ctx.fillRect(centerX - 2, centerY - 18, 2, 2);
  ctx.fillRect(centerX + 4, centerY - 18, 2, 2);
  ctx.fillRect(centerX + 10, centerY - 18, 2, 2);
  
  // Efecto de distorsión (centrado)
  ctx.strokeStyle = '#FF0000';
  ctx.lineWidth = 2;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(centerX, centerY - 10, 24 + i * 6, 0, Math.PI * 2);
    ctx.stroke();
  }
  
  // Texto "NO ES ELLA" (centrado)
  ctx.fillStyle = '#FF0000';
  ctx.font = 'bold 14px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('NO ES ELLA', centerX, centerY + 45);
  ctx.textAlign = 'left';
}

// Foto de fiesta eterna
function drawEternalPartyPhoto(ctx: CanvasRenderingContext2D, s: number, w: number, h: number) {
  const centerX = w / 2;
  const centerY = h / 2;
  
  // Fondo mágico
  ctx.fillStyle = '#1a0a3a';
  ctx.fillRect(4, 4, w - 8, h - 8);
  
  // Ciclo infinito (símbolo) - centrado
  ctx.strokeStyle = '#FF69B4';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(centerX - 12, centerY - 10, 12, 0, Math.PI, false);
  ctx.arc(centerX + 12, centerY - 10, 12, Math.PI, 0, false);
  ctx.stroke();
  
  // Globos en las esquinas (centrados)
  ctx.fillStyle = '#FF69B4';
  ctx.fillRect(centerX - 50, centerY - 35, 8, 12);
  ctx.fillStyle = '#FFD700';
  ctx.fillRect(centerX + 42, centerY - 35, 8, 12);
  ctx.fillStyle = '#4169E1';
  ctx.fillRect(centerX - 50, centerY + 25, 8, 12);
  ctx.fillStyle = '#00FF00';
  ctx.fillRect(centerX + 42, centerY + 25, 8, 12);
  
  // Estrellas mágicas (centradas)
  ctx.fillStyle = '#FFFFFF';
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const x = centerX + Math.cos(angle) * 30;
    const y = centerY - 10 + Math.sin(angle) * 30;
    ctx.fillRect(x - 2, y - 2, 4, 4);
  }
  
  // Texto "∞ ETERNA" (centrado)
  ctx.fillStyle = '#FF69B4';
  ctx.font = 'bold 14px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('∞ ETERNA', centerX, centerY + 50);
  ctx.textAlign = 'left';
}

// Foto genérica
function drawGenericNotePhoto(ctx: CanvasRenderingContext2D, s: number, w: number, h: number) {
  // Fondo neutro
  ctx.fillStyle = '#2a2a3e';
  ctx.fillRect(4, 4, w - 8, h - 8);
  
  // Símbolo de nota
  ctx.fillStyle = '#FFD700';
  ctx.fillRect(20, 15, 10, 12);
  ctx.fillRect(22, 12, 6, 4);
  
  // Líneas de texto
  ctx.fillStyle = '#888';
  ctx.fillRect(15, 32, 20, 2);
  ctx.fillRect(15, 36, 16, 2);
  ctx.fillRect(15, 40, 18, 2);
  
  // Signo de interrogación
  ctx.fillStyle = '#FF69B4';
  ctx.font = 'bold 14px monospace';
  ctx.fillText('?', 23, 52);
}
