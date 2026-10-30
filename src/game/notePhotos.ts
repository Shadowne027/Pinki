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
  // Fondo oscuro
  ctx.fillStyle = '#1a0a2e';
  ctx.fillRect(4, 4, w - 8, h - 8);
  
  // Globos flotando
  ctx.fillStyle = '#FF69B4';
  ctx.fillRect(12, 8, 6, 8);
  ctx.fillStyle = '#FFD700';
  ctx.fillRect(24, 12, 6, 8);
  ctx.fillStyle = '#4169E1';
  ctx.fillRect(36, 10, 6, 8);
  
  // Hilos de globos
  ctx.strokeStyle = '#888';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(15, 16);
  ctx.lineTo(15, 30);
  ctx.moveTo(27, 20);
  ctx.lineTo(27, 30);
  ctx.moveTo(39, 18);
  ctx.lineTo(39, 30);
  ctx.stroke();
  
  // Mesa volcada
  ctx.fillStyle = '#8B4513';
  ctx.fillRect(10, 32, 30, 4);
  ctx.fillRect(12, 36, 4, 8);
  ctx.fillRect(34, 36, 4, 8);
  
  // Texto "LA FIESTA" en el suelo
  ctx.fillStyle = '#FF69B4';
  ctx.font = '8px monospace';
  ctx.fillText('LA FIESTA', 14, 50);
}

// Foto de risas fantasmales
function drawGhostLaughPhoto(ctx: CanvasRenderingContext2D, s: number, w: number, h: number) {
  // Fondo oscuro
  ctx.fillStyle = '#0a0a1e';
  ctx.fillRect(4, 4, w - 8, h - 8);
  
  // Siluetas de ponis fantasmales
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.fillRect(10, 20, 8, 12);
  ctx.fillRect(24, 18, 8, 14);
  ctx.fillRect(38, 22, 8, 10);
  
  // Ojos rojos brillantes
  ctx.fillStyle = '#FF0000';
  ctx.fillRect(12, 22, 2, 2);
  ctx.fillRect(26, 20, 2, 2);
  ctx.fillRect(40, 24, 2, 2);
  
  // Ondas de sonido (risas)
  ctx.strokeStyle = '#FF69B4';
  ctx.lineWidth = 1;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(25, 35, 8 + i * 4, 0, Math.PI, false);
    ctx.stroke();
  }
  
  // Texto "JEJEJE"
  ctx.fillStyle = '#FF69B4';
  ctx.font = 'bold 10px monospace';
  ctx.fillText('JEJEJE', 15, 52);
}

// Foto de cupcakes con dientes
function drawCupcakePhoto(ctx: CanvasRenderingContext2D, s: number, w: number, h: number) {
  // Fondo de pastelería
  ctx.fillStyle = '#FFE4E1';
  ctx.fillRect(4, 4, w - 8, h - 8);
  
  // Cupcake grande
  ctx.fillStyle = '#FF69B4';
  ctx.fillRect(18, 20, 14, 10); // frosting
  ctx.fillStyle = '#D2691E';
  ctx.fillRect(16, 30, 18, 12); // base
  
  // Dientes en el cupcake
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(20, 28, 2, 3);
  ctx.fillRect(24, 28, 2, 3);
  ctx.fillRect(28, 28, 2, 3);
  
  // Ojos malvados
  ctx.fillStyle = '#FF0000';
  ctx.fillRect(22, 24, 2, 2);
  ctx.fillRect(26, 24, 2, 2);
  
  // Texto "¿DIENTES?"
  ctx.fillStyle = '#8B0000';
  ctx.font = 'bold 9px monospace';
  ctx.fillText('¿DIENTES?', 14, 52);
}

// Foto de sombra detrás
function drawShadowPhoto(ctx: CanvasRenderingContext2D, s: number, w: number, h: number) {
  // Fondo de pasillo oscuro
  ctx.fillStyle = '#0a0a1e';
  ctx.fillRect(4, 4, w - 8, h - 8);
  
  // Silueta del jugador (vista de espaldas)
  ctx.fillStyle = '#FFB6C1';
  ctx.fillRect(20, 25, 10, 15);
  ctx.fillRect(22, 20, 6, 8);
  
  // Sombra oscura detrás
  ctx.fillStyle = '#1a0a1a';
  ctx.fillRect(18, 15, 14, 20);
  ctx.fillRect(16, 20, 18, 10);
  
  // Ojos rojos en la sombra
  ctx.fillStyle = '#FF0000';
  ctx.fillRect(22, 18, 2, 2);
  ctx.fillRect(26, 18, 2, 2);
  
  // Flecha apuntando atrás
  ctx.strokeStyle = '#FF0000';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(25, 40);
  ctx.lineTo(25, 48);
  ctx.moveTo(22, 45);
  ctx.lineTo(25, 48);
  ctx.lineTo(28, 45);
  ctx.stroke();
  
  // Texto "NO MIRES"
  ctx.fillStyle = '#FF0000';
  ctx.font = 'bold 9px monospace';
  ctx.fillText('NO MIRES', 13, 56);
}

// Foto de cabaña en el bosque
function drawCabinPhoto(ctx: CanvasRenderingContext2D, s: number, w: number, h: number) {
  // Fondo de bosque
  ctx.fillStyle = '#0a2a0a';
  ctx.fillRect(4, 4, w - 8, h - 8);
  
  // Árboles
  ctx.fillStyle = '#1a4a1a';
  ctx.fillRect(8, 15, 6, 20);
  ctx.fillRect(36, 18, 6, 17);
  
  // Cabaña
  ctx.fillStyle = '#8B4513';
  ctx.fillRect(18, 25, 14, 15);
  // Techo
  ctx.fillStyle = '#654321';
  ctx.beginPath();
  ctx.moveTo(16, 25);
  ctx.lineTo(25, 18);
  ctx.lineTo(34, 25);
  ctx.closePath();
  ctx.fill();
  
  // Puerta
  ctx.fillStyle = '#654321';
  ctx.fillRect(23, 32, 4, 8);
  
  // Flecha apuntando al sur
  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(25, 42);
  ctx.lineTo(25, 50);
  ctx.moveTo(22, 47);
  ctx.lineTo(25, 50);
  ctx.lineTo(28, 47);
  ctx.stroke();
  
  // Texto "SUR ↓"
  ctx.fillStyle = '#FFD700';
  ctx.font = 'bold 9px monospace';
  ctx.fillText('SUR ↓', 18, 58);
}

// Foto de transformación
function drawTransformationPhoto(ctx: CanvasRenderingContext2D, s: number, w: number, h: number) {
  // Fondo mágico
  ctx.fillStyle = '#2a0a4a';
  ctx.fillRect(4, 4, w - 8, h - 8);
  
  // Pony normal (izquierda)
  ctx.fillStyle = '#DDA0DD';
  ctx.fillRect(8, 20, 8, 10);
  ctx.fillRect(10, 15, 6, 8);
  
  // Flecha de transformación
  ctx.strokeStyle = '#FF69B4';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(20, 25);
  ctx.lineTo(28, 25);
  ctx.moveTo(25, 22);
  ctx.lineTo(28, 25);
  ctx.lineTo(25, 28);
  ctx.stroke();
  
  // Pony transformada (derecha) - oscura
  ctx.fillStyle = '#1a0a1a';
  ctx.fillRect(32, 20, 8, 10);
  ctx.fillRect(34, 15, 6, 8);
  
  // Ojos rojos
  ctx.fillStyle = '#FF0000';
  ctx.fillRect(35, 17, 2, 2);
  ctx.fillRect(38, 17, 2, 2);
  
  // Efectos mágicos
  ctx.fillStyle = '#FF69B4';
  for (let i = 0; i < 5; i++) {
    ctx.fillRect(15 + i * 3, 10 + (i % 2) * 2, 2, 2);
  }
  
  // Texto "CAMBIARON"
  ctx.fillStyle = '#FF69B4';
  ctx.font = 'bold 8px monospace';
  ctx.fillText('CAMBIARON', 12, 52);
}

// Foto de máquinas
function drawMachinePhoto(ctx: CanvasRenderingContext2D, s: number, w: number, h: number) {
  // Fondo de fábrica
  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(4, 4, w - 8, h - 8);
  
  // Máquina grande
  ctx.fillStyle = '#4a4a4a';
  ctx.fillRect(12, 15, 26, 25);
  
  // Engranajes
  ctx.fillStyle = '#888';
  ctx.fillRect(16, 20, 6, 6);
  ctx.fillRect(28, 20, 6, 6);
  ctx.fillRect(22, 28, 6, 6);
  
  // Luces
  ctx.fillStyle = '#FF0000';
  ctx.fillRect(18, 32, 3, 3);
  ctx.fillStyle = '#00FF00';
  ctx.fillRect(24, 32, 3, 3);
  ctx.fillStyle = '#0000FF';
  ctx.fillRect(30, 32, 3, 3);
  
  // Tubos
  ctx.fillStyle = '#666';
  ctx.fillRect(14, 12, 2, 8);
  ctx.fillRect(34, 12, 2, 8);
  
  // Texto "ACTIVAR"
  ctx.fillStyle = '#00FF00';
  ctx.font = 'bold 9px monospace';
  ctx.fillText('ACTIVAR', 15, 52);
}

// Foto de Pinkie aterradora
function drawScaryPinkiePhoto(ctx: CanvasRenderingContext2D, s: number, w: number, h: number) {
  // Fondo rojo oscuro
  ctx.fillStyle = '#2a0a0a';
  ctx.fillRect(4, 4, w - 8, h - 8);
  
  // Pinkie Pie corrupta
  ctx.fillStyle = '#1a0a1a';
  ctx.fillRect(18, 15, 14, 20);
  ctx.fillRect(20, 10, 10, 8);
  
  // Melena oscura
  ctx.fillStyle = '#0a000a';
  ctx.fillRect(16, 8, 18, 6);
  ctx.fillRect(14, 12, 4, 10);
  ctx.fillRect(32, 12, 4, 10);
  
  // Ojos rojos brillantes
  ctx.fillStyle = '#FF0000';
  ctx.fillRect(22, 12, 3, 3);
  ctx.fillRect(27, 12, 3, 3);
  
  // Sonrisa siniestra
  ctx.fillStyle = '#FF0000';
  ctx.fillRect(21, 16, 8, 2);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(22, 16, 1, 1);
  ctx.fillRect(24, 16, 1, 1);
  ctx.fillRect(26, 16, 1, 1);
  ctx.fillRect(28, 16, 1, 1);
  
  // Efecto de distorsión
  ctx.strokeStyle = '#FF0000';
  ctx.lineWidth = 1;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(25, 25, 12 + i * 3, 0, Math.PI * 2);
    ctx.stroke();
  }
  
  // Texto "NO ES ELLA"
  ctx.fillStyle = '#FF0000';
  ctx.font = 'bold 8px monospace';
  ctx.fillText('NO ES ELLA', 12, 52);
}

// Foto de fiesta eterna
function drawEternalPartyPhoto(ctx: CanvasRenderingContext2D, s: number, w: number, h: number) {
  // Fondo mágico
  ctx.fillStyle = '#1a0a3a';
  ctx.fillRect(4, 4, w - 8, h - 8);
  
  // Ciclo infinito (símbolo)
  ctx.strokeStyle = '#FF69B4';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(20, 25, 6, 0, Math.PI, false);
  ctx.arc(30, 25, 6, Math.PI, 0, false);
  ctx.stroke();
  
  // Globos en循环
  ctx.fillStyle = '#FF69B4';
  ctx.fillRect(10, 10, 4, 6);
  ctx.fillStyle = '#FFD700';
  ctx.fillRect(36, 10, 4, 6);
  ctx.fillStyle = '#4169E1';
  ctx.fillRect(10, 35, 4, 6);
  ctx.fillStyle = '#00FF00';
  ctx.fillRect(36, 35, 4, 6);
  
  // Estrellas mágicas
  ctx.fillStyle = '#FFFFFF';
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const x = 25 + Math.cos(angle) * 15;
    const y = 25 + Math.sin(angle) * 15;
    ctx.fillRect(x, y, 2, 2);
  }
  
  // Texto "∞ ETERNA"
  ctx.fillStyle = '#FF69B4';
  ctx.font = 'bold 9px monospace';
  ctx.fillText('∞ ETERNA', 14, 52);
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
