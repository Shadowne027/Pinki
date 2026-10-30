// ============ PONY VISUAL SYSTEM - DETAILED PIXEL ART ============
// Sistema visual completo basado en las especificaciones de Pony Town
// Sprites de 32x32 con anatomía completa y animaciones de 4 frames

import { Character, Direction, CHARACTERS } from './engine';

// === HELPER FUNCTIONS ===
function getCharData(charId: string): Character {
  return CHARACTERS.find(c => c.id === charId) || CHARACTERS[0];
}

// === MAIN SPRITE FUNCTION - VISTA LATERAL RPG ===
export function drawPonySpriteDetailed(ctx: CanvasRenderingContext2D, x: number, y: number, char: Character, dir: Direction, frame: number) {
  const s = 2; // pixel scale
  ctx.save();
  ctx.translate(x, y);

  // Animación de 4 frames
  const wf = frame % 4;
  const legFront1 = [0, 1, 0, -1][wf]; // pata delantera izquierda
  const legFront2 = [0, -1, 0, 1][wf]; // pata delantera derecha
  const legBack1 = [0, -1, 0, 1][wf]; // pata trasera izquierda
  const legBack2 = [0, 1, 0, -1][wf]; // pata trasera derecha
  const bob = [0, -1, 0, -1][wf]; // movimiento vertical sutil

  // === SHADOW (sombra en el suelo) ===
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fillRect(4*s, 22*s, 14*s, 2*s);

  // Determinar si miramos hacia la izquierda o derecha
  const facingRight = dir === 'right' || (dir === 'down' && frame % 8 < 4);
  
  if (facingRight) {
    ctx.translate(22*s, 0);
    ctx.scale(-1, 1);
  }

  // === TAIL (cola - detrás del cuerpo) ===
  drawTailSide(ctx, char.id, bob, s);

  // === BACK LEGS (patas traseras - detrás) ===
  ctx.fillStyle = char.colorShadow; // más oscuras por estar detrás
  // Pata trasera izquierda (más atrás)
  ctx.fillRect(13*s, (16+bob)*s, 2*s, (4+legBack1)*s);
  // Pata trasera derecha
  ctx.fillRect(15*s, (16+bob)*s, 2*s, (4+legBack2)*s);
  
  // Pezuñas traseras
  ctx.fillStyle = char.id === 'applejack' ? '#754522' : '#1a0a20';
  ctx.fillRect(13*s, (20+bob+legBack1)*s, 2*s, 1*s);
  ctx.fillRect(15*s, (20+bob+legBack2)*s, 2*s, 1*s);

  // === BODY (cuerpo horizontal - vista lateral) ===
  ctx.fillStyle = char.outline;
  ctx.fillRect(5*s, (10+bob)*s, 13*s, 7*s); // contorno
  
  ctx.fillStyle = char.color;
  ctx.fillRect(6*s, (11+bob)*s, 11*s, 5*s); // cuerpo principal
  ctx.fillRect(7*s, (10+bob)*s, 9*s, 6*s); // parte superior
  ctx.fillRect(15*s, (11+bob)*s, 2*s, 4*s); // rump
  
  // Sombra del vientre
  ctx.fillStyle = char.colorShadow;
  ctx.fillRect(6*s, (15+bob)*s, 11*s, 1*s);

  // === FRONT LEGS (patas delanteras - delante) ===
  ctx.fillStyle = char.color;
  // Pata delantera izquierda
  ctx.fillRect(6*s, (16+bob)*s, 2*s, (4+legFront1)*s);
  // Pata delantera derecha
  ctx.fillRect(8*s, (16+bob)*s, 2*s, (4+legFront2)*s);
  
  // Pezuñas delanteras
  ctx.fillStyle = char.id === 'applejack' ? '#A96A35' : char.outline;
  ctx.fillRect(6*s, (20+bob+legFront1)*s, 2*s, 1*s);
  ctx.fillRect(8*s, (20+bob+legFront2)*s, 2*s, 1*s);

  // === NECK (cuello) ===
  ctx.fillStyle = char.color;
  ctx.fillRect(5*s, (8+bob)*s, 4*s, 4*s);

  // === HEAD (cabeza grande - vista lateral) ===
  ctx.fillStyle = char.outline;
  ctx.fillRect(2*s, (3+bob)*s, 8*s, 7*s); // contorno
  
  ctx.fillStyle = char.color;
  ctx.fillRect(3*s, (4+bob)*s, 6*s, 5*s); // cabeza principal
  ctx.fillRect(4*s, (3+bob)*s, 5*s, 2*s); // parte superior
  ctx.fillRect(2*s, (6+bob)*s, 3*s, 3*s); // hocico
  
  // Sombra de la cabeza
  ctx.fillStyle = char.colorShadow;
  ctx.fillRect(3*s, (8+bob)*s, 6*s, 1*s);

  // === EARS (orejas) ===
  ctx.fillStyle = char.color;
  ctx.fillRect(4*s, (1+bob)*s, 2*s, 3*s);
  ctx.fillRect(7*s, (1+bob)*s, 2*s, 3*s);
  // Interior de orejas
  ctx.fillStyle = char.maneShadow;
  ctx.fillRect(5*s, (2+bob)*s, 1*s, 1*s);
  ctx.fillRect(8*s, (2+bob)*s, 1*s, 1*s);

  // === MANE (melena - vista lateral) ===
  drawManeSide(ctx, char.id, bob, s);

  // === EYES (ojo grande - vista lateral, solo uno visible) ===
  if (dir !== 'up') {
    // Esclerótica
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(3*s, (5+bob)*s, 3*s, 3*s);
    
    // Iris
    ctx.fillStyle = char.eyeColor;
    ctx.fillRect(3*s, (5+bob)*s, 2*s, 3*s);
    
    // Pupila
    ctx.fillStyle = '#000000';
    ctx.fillRect(3*s, (6+bob)*s, 1*s, 2*s);
    
    // Brillo
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(4*s, (5+bob)*s, 1*s, 1*s);
  }

  // === MOUTH (boca) ===
  ctx.fillStyle = char.outline;
  ctx.fillRect(2*s, (8+bob)*s, 2*s, 1*s);

  // === CUTIE MARK (en el costado del cuerpo) ===
  drawCutieMark(ctx, char.id, 11*s, (12+bob)*s, s);

  // === SPECIAL ACCESSORIES ===
  if (char.id === 'twilight') {
    // Cuerno
    ctx.fillStyle = char.color;
    ctx.fillRect(5*s, (0+bob)*s, 2*s, 3*s);
    ctx.fillRect(6*s, (-1+bob)*s, 1*s, 2*s);
    ctx.fillStyle = char.colorLight;
    ctx.fillRect(6*s, (0+bob)*s, 1*s, 1*s);
  }

  // Restaurar si hicimos flip
  if (facingRight) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  ctx.restore();
}

// === TAIL DRAWING FUNCTION - VISTA LATERAL ===
function drawTailSide(ctx: CanvasRenderingContext2D, charId: string, bob: number, s: number) {
  const char = getCharData(charId);
  ctx.fillStyle = char.maneColor;
  
  if (charId === 'pinkie') {
    // Cola grande y rizada - vista lateral
    ctx.fillRect(16*s, (10+bob)*s, 3*s, 4*s);
    ctx.fillRect(17*s, (9+bob)*s, 2*s, 3*s);
    ctx.fillRect(18*s, (11+bob)*s, 1*s, 3*s);
    // Rulos
    ctx.fillStyle = char.maneLight;
    ctx.fillRect(17*s, (10+bob)*s, 1*s, 1*s);
    ctx.fillRect(18*s, (12+bob)*s, 1*s, 1*s);
  } else if (charId === 'twilight') {
    // Cola larga y ordenada - vista lateral
    ctx.fillRect(16*s, (10+bob)*s, 2*s, 7*s);
    ctx.fillRect(17*s, (12+bob)*s, 1*s, 5*s);
  } else if (charId === 'rainbow') {
    // Cola multicolor - vista lateral
    ctx.fillRect(16*s, (10+bob)*s, 2*s, 6*s);
    // Franjas arcoíris
    const colors = ['#E84A70', '#F5A64A', '#F6E65B', '#4DCC7B', '#38BCE8', '#7658C9'];
    colors.forEach((color, i) => {
      ctx.fillStyle = color;
      ctx.fillRect(16*s, (10+bob+i)*s, 2*s, 1*s);
    });
  } else if (charId === 'fluttershy') {
    // Cola larga y fluida - vista lateral
    ctx.fillRect(16*s, (10+bob)*s, 2*s, 8*s);
    ctx.fillRect(17*s, (12+bob)*s, 1*s, 6*s);
  } else if (charId === 'rarity') {
    // Cola rizada y elegante - vista lateral
    ctx.fillRect(16*s, (10+bob)*s, 2*s, 6*s);
    ctx.fillRect(17*s, (11+bob)*s, 1*s, 4*s);
    // Rizo final
    ctx.fillRect(16*s, (15+bob)*s, 2*s, 2*s);
  } else if (charId === 'applejack') {
    // Cola rubia con volumen - vista lateral
    ctx.fillRect(16*s, (11+bob)*s, 2*s, 4*s);
    ctx.fillRect(17*s, (12+bob)*s, 1*s, 3*s);
  }
}

// === TAIL DRAWING FUNCTION - VISTA FRONTAL (para compatibilidad) ===
function drawTail(ctx: CanvasRenderingContext2D, charId: string, bob: number, s: number) {
  drawTailSide(ctx, charId, bob, s);
}

// === MANE DRAWING FUNCTION - VISTA LATERAL ===
function drawManeSide(ctx: CanvasRenderingContext2D, charId: string, bob: number, s: number) {
  const char = getCharData(charId);
  ctx.fillStyle = char.maneColor;
  
  if (charId === 'pinkie') {
    // Melena muy voluminosa y rizada - vista lateral
    ctx.fillRect(3*s, (1+bob)*s, 6*s, 4*s);
    ctx.fillRect(2*s, (2+bob)*s, 2*s, 5*s);
    ctx.fillRect(8*s, (2+bob)*s, 2*s, 4*s);
    // Copete frontal
    ctx.fillRect(3*s, (0+bob)*s, 4*s, 2*s);
    // Mechones del cuello
    ctx.fillRect(4*s, (6+bob)*s, 3*s, 3*s);
    // Detalles de rulos
    ctx.fillStyle = char.maneLight;
    ctx.fillRect(4*s, (1+bob)*s, 2*s, 1*s);
    ctx.fillRect(7*s, (2+bob)*s, 1*s, 1*s);
  } else if (charId === 'twilight') {
    // Melena lisa y ordenada con franjas - vista lateral
    ctx.fillRect(3*s, (1+bob)*s, 6*s, 3*s);
    ctx.fillRect(2*s, (2+bob)*s, 2*s, 6*s);
    ctx.fillRect(8*s, (2+bob)*s, 2*s, 5*s);
    // Copete lateral
    ctx.fillRect(3*s, (2+bob)*s, 3*s, 2*s);
    // Franja rosa
    ctx.fillStyle = '#E85A9B';
    ctx.fillRect(4*s, (2+bob)*s, 1*s, 2*s);
    // Franja violeta
    ctx.fillStyle = '#8C55C7';
    ctx.fillRect(6*s, (2+bob)*s, 1*s, 2*s);
  } else if (charId === 'rainbow') {
    // Melena despeinada y puntiaguda - vista lateral
    ctx.fillRect(3*s, (1+bob)*s, 6*s, 3*s);
    ctx.fillRect(2*s, (2+bob)*s, 2*s, 4*s);
    ctx.fillRect(8*s, (2+bob)*s, 2*s, 3*s);
    // Púas dinámicas
    ctx.fillRect(4*s, (0+bob)*s, 2*s, 2*s);
    ctx.fillRect(6*s, (0+bob)*s, 2*s, 2*s);
    // Franjas multicolores
    const colors = ['#E84A70', '#F5A64A', '#F6E65B', '#4DCC7B', '#38BCE8'];
    colors.forEach((color, i) => {
      ctx.fillStyle = color;
      ctx.fillRect((3+i)*s, (1+bob)*s, 1*s, 1*s);
    });
  } else if (charId === 'fluttershy') {
    // Melena larga, suave y ondulada - vista lateral
    ctx.fillRect(3*s, (2+bob)*s, 6*s, 2*s);
    ctx.fillRect(2*s, (3+bob)*s, 2*s, 7*s);
    ctx.fillRect(8*s, (3+bob)*s, 2*s, 5*s);
    // Copete largo
    ctx.fillRect(3*s, (1+bob)*s, 3*s, 2*s);
    // Melena del cuello
    ctx.fillRect(4*s, (7+bob)*s, 2*s, 2*s);
  } else if (charId === 'rarity') {
    // Melena voluminosa y elegante con rizos - vista lateral
    ctx.fillRect(3*s, (1+bob)*s, 6*s, 3*s);
    ctx.fillRect(2*s, (2+bob)*s, 2*s, 6*s);
    ctx.fillRect(8*s, (2+bob)*s, 2*s, 5*s);
    // Copete cuidadosamente peinado
    ctx.fillRect(4*s, (0+bob)*s, 4*s, 2*s);
    // Rizos
    ctx.fillRect(2*s, (7+bob)*s, 1*s, 2*s);
    ctx.fillRect(9*s, (6+bob)*s, 1*s, 2*s);
  } else if (charId === 'applejack') {
    // Melena rubia formada por mechones gruesos - vista lateral
    ctx.fillRect(3*s, (2+bob)*s, 6*s, 2*s);
    ctx.fillRect(2*s, (3+bob)*s, 2*s, 3*s);
    ctx.fillRect(8*s, (3+bob)*s, 2*s, 3*s);
    // Copete curvado
    ctx.fillRect(4*s, (1+bob)*s, 3*s, 2*s);
    // Sombrero de vaquero
    ctx.fillStyle = '#A96A35';
    ctx.fillRect(2*s, (-1+bob)*s, 8*s, 3*s);
    ctx.fillRect(4*s, (-2+bob)*s, 5*s, 2*s);
    // Sombra del sombrero
    ctx.fillStyle = '#754522';
    ctx.fillRect(2*s, (1+bob)*s, 8*s, 1*s);
    // Iluminación del sombrero
    ctx.fillStyle = '#D99A58';
    ctx.fillRect(4*s, (-1+bob)*s, 5*s, 1*s);
  }
}

// === MANE DRAWING FUNCTION - COMPATIBILIDAD ===
function drawMane(ctx: CanvasRenderingContext2D, charId: string, bob: number, s: number) {
  drawManeSide(ctx, charId, bob, s);
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
