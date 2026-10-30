// ============ PONY VISUAL SYSTEM - DETAILED PIXEL ART ============
// Sistema visual completo basado en las especificaciones de Pony Town
// Sprites de 32x32 con anatomía completa y animaciones de 4 frames

import { Character, Direction, CHARACTERS } from './engine';

// === HELPER FUNCTIONS ===
function getCharData(charId: string): Character {
  return CHARACTERS.find(c => c.id === charId) || CHARACTERS[0];
}

// === MAIN SPRITE FUNCTION ===
export function drawPonySpriteDetailed(ctx: CanvasRenderingContext2D, x: number, y: number, char: Character, dir: Direction, frame: number) {
  const s = 2; // pixel scale
  ctx.save();
  ctx.translate(x, y);

  // Animación de 4 frames
  const wf = frame % 4;
  const legOffset1 = [0, 1, 2, 1][wf];
  const legOffset2 = [2, 1, 0, 1][wf];
  const bob = [0, -1, 0, -1][wf]; // movimiento vertical sutil

  // === SHADOW (sombra en el suelo) ===
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.fillRect(6*s, 20*s, 10*s, 2*s);

  // === OUTLINE (contorno oscuro) ===
  ctx.fillStyle = char.outline;
  ctx.fillRect(5*s, (9+bob)*s, 12*s, 8*s); // cuerpo
  ctx.fillRect(6*s, (2+bob)*s, 10*s, 8*s); // cabeza

  // === BODY (cuerpo bean shape) ===
  ctx.fillStyle = char.color;
  ctx.fillRect(6*s, (10+bob)*s, 10*s, 6*s);
  ctx.fillRect(7*s, (9+bob)*s, 8*s, 8*s);
  ctx.fillRect(13*s, (10+bob)*s, 3*s, 5*s); // rump
  
  // Sombra del cuerpo
  ctx.fillStyle = char.colorShadow;
  ctx.fillRect(6*s, (14+bob)*s, 10*s, 2*s);
  ctx.fillRect(13*s, (13+bob)*s, 3*s, 2*s);

  // === TAIL (cola) ===
  drawTail(ctx, char.id, bob, s);

  // === HEAD (cabeza grande y redondeada) ===
  ctx.fillStyle = char.color;
  ctx.fillRect(7*s, (3+bob)*s, 8*s, 7*s);
  ctx.fillRect(6*s, (4+bob)*s, 10*s, 5*s);
  ctx.fillRect(8*s, (2+bob)*s, 6*s, 2*s);
  ctx.fillRect(5*s, (6+bob)*s, 3*s, 3*s); // snout
  
  // Sombra de la cabeza
  ctx.fillStyle = char.colorShadow;
  ctx.fillRect(7*s, (8+bob)*s, 8*s, 2*s);

  // === EARS (orejas puntiagudas) ===
  ctx.fillStyle = char.color;
  ctx.fillRect(8*s, (1+bob)*s, 2*s, 3*s);
  ctx.fillRect(12*s, (1+bob)*s, 2*s, 3*s);
  // Interior de orejas
  ctx.fillStyle = char.maneColor;
  ctx.fillRect(9*s, (2+bob)*s, 1*s, 1*s);
  ctx.fillRect(13*s, (2+bob)*s, 1*s, 1*s);

  // === MANE (melena voluminosa) ===
  drawMane(ctx, char.id, bob, s);

  // === EYES (ojos grandes y expresivos) ===
  if (dir !== 'up') {
    drawEyes(ctx, char.id, dir, bob, s);
  }

  // === MOUTH (boca) ===
  if (dir === 'down') {
    ctx.fillStyle = char.outline;
    ctx.fillRect(8*s, (8+bob)*s, 3*s, 1*s);
  }

  // === LEGS (patas cortas) ===
  ctx.fillStyle = char.color;
  ctx.fillRect(6*s, (16+bob)*s, 2*s, (3+legOffset1)*s);
  ctx.fillRect(8*s, (16+bob)*s, 2*s, (3+legOffset2)*s);
  ctx.fillRect(12*s, (16+bob)*s, 2*s, (3+legOffset2)*s);
  ctx.fillRect(14*s, (16+bob)*s, 2*s, (3+legOffset1)*s);

  // Hooves (pezuñas)
  ctx.fillStyle = char.id === 'applejack' ? '#A96A35' : char.outline;
  ctx.fillRect(6*s, (19+bob+legOffset1)*s, 2*s, 1*s);
  ctx.fillRect(8*s, (19+bob+legOffset2)*s, 2*s, 1*s);
  ctx.fillRect(12*s, (19+bob+legOffset2)*s, 2*s, 1*s);
  ctx.fillRect(14*s, (19+bob+legOffset1)*s, 2*s, 1*s);

  // === CUTIE MARK ===
  drawCutieMark(ctx, char.id, 10*s, (12+bob)*s, s);

  // === SPECIAL ACCESSORIES ===
  if (char.id === 'twilight') {
    // Cuerno
    ctx.fillStyle = char.color;
    ctx.fillRect(9*s, (0+bob)*s, 2*s, 3*s);
    ctx.fillRect(10*s, (-1+bob)*s, 1*s, 2*s);
  }

  ctx.restore();
}

// === TAIL DRAWING FUNCTION ===
function drawTail(ctx: CanvasRenderingContext2D, charId: string, bob: number, s: number) {
  const char = getCharData(charId);
  ctx.fillStyle = char.maneColor;
  
  if (charId === 'pinkie') {
    // Cola grande y rizada
    ctx.fillRect(14*s, (8+bob)*s, 3*s, 3*s);
    ctx.fillRect(15*s, (7+bob)*s, 3*s, 2*s);
    ctx.fillRect(16*s, (9+bob)*s, 2*s, 4*s);
    ctx.fillRect(14*s, (11+bob)*s, 2*s, 3*s);
    // Rulos
    ctx.fillStyle = char.maneLight;
    ctx.fillRect(15*s, (8+bob)*s, 1*s, 1*s);
    ctx.fillRect(16*s, (10+bob)*s, 1*s, 1*s);
  } else if (charId === 'twilight') {
    // Cola larga y ordenada
    ctx.fillRect(14*s, (8+bob)*s, 2*s, 6*s);
    ctx.fillRect(15*s, (10+bob)*s, 2*s, 5*s);
    ctx.fillRect(16*s, (12+bob)*s, 1*s, 4*s);
  } else if (charId === 'rainbow') {
    // Cola multicolor
    ctx.fillRect(14*s, (8+bob)*s, 2*s, 6*s);
    ctx.fillRect(15*s, (9+bob)*s, 2*s, 5*s);
    // Franjas arcoíris
    const colors = ['#E84A70', '#F5A64A', '#F6E65B', '#4DCC7B', '#38BCE8', '#7658C9'];
    colors.forEach((color, i) => {
      ctx.fillStyle = color;
      ctx.fillRect(14*s, (8+bob+i)*s, 2*s, 1*s);
    });
  } else if (charId === 'fluttershy') {
    // Cola larga y fluida
    ctx.fillRect(14*s, (8+bob)*s, 2*s, 7*s);
    ctx.fillRect(15*s, (10+bob)*s, 2*s, 6*s);
    ctx.fillRect(16*s, (12+bob)*s, 1*s, 4*s);
  } else if (charId === 'rarity') {
    // Cola rizada y elegante
    ctx.fillRect(14*s, (8+bob)*s, 2*s, 6*s);
    ctx.fillRect(15*s, (9+bob)*s, 2*s, 5*s);
    ctx.fillRect(16*s, (11+bob)*s, 1*s, 3*s);
    // Rizo final
    ctx.fillRect(14*s, (13+bob)*s, 2*s, 2*s);
  } else if (charId === 'applejack') {
    // Cola rubia con volumen
    ctx.fillRect(14*s, (9+bob)*s, 2*s, 4*s);
    ctx.fillRect(15*s, (10+bob)*s, 2*s, 3*s);
  }
}

// === MANE DRAWING FUNCTION ===
function drawMane(ctx: CanvasRenderingContext2D, charId: string, bob: number, s: number) {
  const char = getCharData(charId);
  ctx.fillStyle = char.maneColor;
  
  if (charId === 'pinkie') {
    // Melena muy voluminosa y rizada
    ctx.fillRect(6*s, (0+bob)*s, 10*s, 4*s);
    ctx.fillRect(5*s, (1+bob)*s, 2*s, 6*s);
    ctx.fillRect(14*s, (1+bob)*s, 2*s, 4*s);
    ctx.fillRect(5*s, (4+bob)*s, 1*s, 4*s);
    ctx.fillRect(15*s, (2+bob)*s, 1*s, 3*s);
    // Copete frontal ondulado
    ctx.fillRect(7*s, (-1+bob)*s, 3*s, 2*s);
    ctx.fillRect(11*s, (-1+bob)*s, 3*s, 2*s);
    // Mechones del cuello
    ctx.fillRect(6*s, (6+bob)*s, 2*s, 3*s);
    ctx.fillRect(14*s, (6+bob)*s, 2*s, 3*s);
    // Detalles de rulos
    ctx.fillStyle = char.maneLight;
    ctx.fillRect(7*s, (0+bob)*s, 2*s, 1*s);
    ctx.fillRect(11*s, (0+bob)*s, 2*s, 1*s);
    ctx.fillRect(5*s, (3+bob)*s, 1*s, 2*s);
    ctx.fillRect(15*s, (4+bob)*s, 1*s, 2*s);
  } else if (charId === 'twilight') {
    // Melena lisa y ordenada con franjas
    ctx.fillRect(7*s, (0+bob)*s, 8*s, 3*s);
    ctx.fillRect(6*s, (1+bob)*s, 2*s, 7*s);
    ctx.fillRect(14*s, (1+bob)*s, 2*s, 6*s);
    ctx.fillRect(15*s, (3+bob)*s, 1*s, 5*s);
    // Copete lateral
    ctx.fillRect(7*s, (2+bob)*s, 4*s, 2*s);
    // Franja rosa
    ctx.fillStyle = '#E85A9B';
    ctx.fillRect(8*s, (1+bob)*s, 1*s, 2*s);
    // Franja violeta
    ctx.fillStyle = '#8C55C7';
    ctx.fillRect(10*s, (1+bob)*s, 1*s, 2*s);
  } else if (charId === 'rainbow') {
    // Melena despeinada y puntiaguda
    ctx.fillRect(7*s, (0+bob)*s, 8*s, 3*s);
    ctx.fillRect(6*s, (1+bob)*s, 2*s, 5*s);
    ctx.fillRect(14*s, (1+bob)*s, 2*s, 4*s);
    // Púas dinámicas
    ctx.fillRect(7*s, (-1+bob)*s, 2*s, 2*s);
    ctx.fillRect(10*s, (-1+bob)*s, 2*s, 2*s);
    ctx.fillRect(13*s, (0+bob)*s, 2*s, 2*s);
    // Franjas multicolores
    const colors = ['#E84A70', '#F5A64A', '#F6E65B', '#4DCC7B', '#38BCE8', '#7658C9'];
    colors.forEach((color, i) => {
      ctx.fillStyle = color;
      ctx.fillRect((7+i)%14*s, (0+bob)*s, 1*s, 1*s);
    });
  } else if (charId === 'fluttershy') {
    // Melena larga, suave y ondulada
    ctx.fillRect(7*s, (1+bob)*s, 8*s, 2*s);
    ctx.fillRect(6*s, (2+bob)*s, 2*s, 9*s);
    ctx.fillRect(14*s, (2+bob)*s, 2*s, 7*s);
    ctx.fillRect(15*s, (4+bob)*s, 1*s, 6*s);
    ctx.fillRect(5*s, (4+bob)*s, 1*s, 5*s);
    // Copete largo que cae hacia un lado
    ctx.fillRect(6*s, (0+bob)*s, 3*s, 2*s);
    // Melena del cuello
    ctx.fillRect(7*s, (6+bob)*s, 2*s, 3*s);
  } else if (charId === 'rarity') {
    // Melena voluminosa y elegante con rizos
    ctx.fillRect(7*s, (0+bob)*s, 8*s, 3*s);
    ctx.fillRect(6*s, (1+bob)*s, 2*s, 7*s);
    ctx.fillRect(14*s, (1+bob)*s, 2*s, 6*s);
    ctx.fillRect(15*s, (4+bob)*s, 1*s, 4*s);
    // Copete cuidadosamente peinado
    ctx.fillRect(8*s, (-1+bob)*s, 4*s, 2*s);
    // Mechones curvos y rizos grandes
    ctx.fillRect(6*s, (7+bob)*s, 1*s, 2*s);
    ctx.fillRect(15*s, (6+bob)*s, 1*s, 2*s);
    ctx.fillRect(5*s, (5+bob)*s, 2*s, 2*s);
    ctx.fillRect(16*s, (5+bob)*s, 2*s, 2*s);
  } else if (charId === 'applejack') {
    // Melena rubia formada por mechones gruesos
    ctx.fillRect(7*s, (1+bob)*s, 8*s, 2*s);
    ctx.fillRect(6*s, (2+bob)*s, 2*s, 4*s);
    ctx.fillRect(14*s, (2+bob)*s, 2*s, 4*s);
    // Copete curvado
    ctx.fillRect(8*s, (0+bob)*s, 4*s, 2*s);
    // Sombrero de vaquero
    ctx.fillStyle = '#A96A35';
    ctx.fillRect(6*s, (-2+bob)*s, 10*s, 3*s);
    ctx.fillRect(8*s, (-3+bob)*s, 6*s, 2*s);
    // Sombra del sombrero
    ctx.fillStyle = '#754522';
    ctx.fillRect(6*s, (0+bob)*s, 10*s, 1*s);
    // Iluminación del sombrero
    ctx.fillStyle = '#D99A58';
    ctx.fillRect(8*s, (-2+bob)*s, 6*s, 1*s);
  }
}

// === EYES DRAWING FUNCTION ===
function drawEyes(ctx: CanvasRenderingContext2D, charId: string, dir: Direction, bob: number, s: number) {
  const char = getCharData(charId);
  
  // Esclerótica blanca (grande)
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(6*s, (4+bob)*s, 4*s, 4*s);
  ctx.fillRect(11*s, (4+bob)*s, 4*s, 4*s);
  
  // Iris
  ctx.fillStyle = char.eyeColor;
  if (dir === 'left') {
    ctx.fillRect(6*s, (5+bob)*s, 3*s, 3*s);
    ctx.fillRect(11*s, (5+bob)*s, 3*s, 3*s);
  } else if (dir === 'right') {
    ctx.fillRect(7*s, (5+bob)*s, 3*s, 3*s);
    ctx.fillRect(12*s, (5+bob)*s, 3*s, 3*s);
  } else {
    ctx.fillRect(7*s, (5+bob)*s, 2*s, 3*s);
    ctx.fillRect(12*s, (5+bob)*s, 2*s, 3*s);
  }
  
  // Pupilas oscuras
  ctx.fillStyle = '#000000';
  if (dir === 'left') {
    ctx.fillRect(6*s, (6+bob)*s, 2*s, 2*s);
    ctx.fillRect(11*s, (6+bob)*s, 2*s, 2*s);
  } else if (dir === 'right') {
    ctx.fillRect(8*s, (6+bob)*s, 2*s, 2*s);
    ctx.fillRect(13*s, (6+bob)*s, 2*s, 2*s);
  } else {
    ctx.fillRect(7*s, (6+bob)*s, 1*s, 2*s);
    ctx.fillRect(13*s, (6+bob)*s, 1*s, 2*s);
  }
  
  // Highlights (brillos)
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(7*s, (4+bob)*s, 2*s, 2*s);
  ctx.fillRect(12*s, (4+bob)*s, 2*s, 2*s);
  ctx.fillRect(9*s, (7+bob)*s, 1*s, 1*s);
  ctx.fillRect(14*s, (7+bob)*s, 1*s, 1*s);
}

// === CUTIE MARK DRAWING FUNCTION ===
function drawCutieMark(ctx: CanvasRenderingContext2D, charId: string, x: number, y: number, s: number) {
  switch (charId) {
    case 'pinkie':
      // Tres globos: rosa, amarillo y azul
      ctx.fillStyle = '#FF69B4';
      ctx.fillRect(x, y, 2*s, 3*s);
      ctx.fillStyle = '#FFFF00';
      ctx.fillRect(x+3*s, y-s, 2*s, 3*s);
      ctx.fillStyle = '#4169E1';
      ctx.fillRect(x+6*s, y, 2*s, 3*s);
      // Hilos
      ctx.fillStyle = '#888';
      ctx.fillRect(x+s, y+3*s, 1, 2*s);
      ctx.fillRect(x+4*s, y+2*s, 1, 3*s);
      ctx.fillRect(x+7*s, y+3*s, 1, 2*s);
      break;
    case 'twilight':
      // Estrella rosa de seis puntas con estrellas pequeñas
      ctx.fillStyle = '#FF69B4';
      ctx.fillRect(x+3*s, y, 2*s, s);
      ctx.fillRect(x+2*s, y+s, 4*s, s);
      ctx.fillRect(x+3*s, y+2*s, 2*s, s);
      ctx.fillRect(x+2*s, y-s, s, s);
      ctx.fillRect(x+5*s, y-s, s, s);
      // Estrellas pequeñas
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(x+s, y+s, s, s);
      ctx.fillRect(x+6*s, y+s, s, s);
      break;
    case 'rainbow':
      // Nube blanca con rayo multicolor
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(x+4*s, y-s, 3*s, 2*s);
      ctx.fillRect(x+5*s, y-2*s, 2*s, s);
      // Rayo
      ctx.fillStyle = '#E84A70';
      ctx.fillRect(x, y, 4*s, s);
      ctx.fillStyle = '#F5A64A';
      ctx.fillRect(x+s, y+s, 4*s, s);
      ctx.fillStyle = '#F6E65B';
      ctx.fillRect(x+2*s, y+2*s, 4*s, s);
      break;
    case 'fluttershy':
      // Tres mariposas rosas
      ctx.fillStyle = '#FF69B4';
      ctx.fillRect(x, y, 2*s, 3*s);
      ctx.fillRect(x+3*s, y, 2*s, 3*s);
      ctx.fillStyle = '#FFD700';
      ctx.fillRect(x+2*s, y+s, s, s);
      // Segunda mariposa
      ctx.fillStyle = '#87CEEB';
      ctx.fillRect(x+5*s, y+2*s, 2*s, 3*s);
      ctx.fillRect(x+8*s, y+2*s, 2*s, 3*s);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(x+7*s, y+3*s, s, s);
      break;
    case 'rarity':
      // Tres diamantes azules
      ctx.fillStyle = '#38BCE8';
      ctx.fillRect(x+3*s, y, 2*s, s);
      ctx.fillRect(x+2*s, y+s, 4*s, s);
      ctx.fillRect(x+3*s, y+2*s, 2*s, s);
      // Segundo diamante
      ctx.fillStyle = '#A875D8';
      ctx.fillRect(x+7*s, y-s, 2*s, s);
      ctx.fillRect(x+6*s, y, 4*s, s);
      ctx.fillRect(x+7*s, y+s, 2*s, s);
      // Brillos
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(x+s, y+s, s, s);
      ctx.fillRect(x+10*s, y, s, s);
      break;
    case 'applejack':
      // Tres manzanas rojas con hojas verdes
      ctx.fillStyle = '#FF0000';
      ctx.fillRect(x+s, y, 3*s, 3*s);
      ctx.fillRect(x, y+s, s, s);
      ctx.fillRect(x+4*s, y+s, s, s);
      // Hojas
      ctx.fillStyle = '#006400';
      ctx.fillRect(x+2*s, y-s, s, s);
      ctx.fillRect(x+3*s, y-s, s, s);
      // Segunda manzana
      ctx.fillStyle = '#FF4500';
      ctx.fillRect(x+6*s, y+s, 3*s, 3*s);
      ctx.fillRect(x+5*s, y+2*s, s, s);
      ctx.fillRect(x+9*s, y+2*s, s, s);
      ctx.fillStyle = '#006400';
      ctx.fillRect(x+7*s, y, s, s);
      ctx.fillRect(x+8*s, y, s, s);
      break;
  }
}
