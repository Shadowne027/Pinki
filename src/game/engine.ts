// Game Engine - Pixel Art Horror Game
import { playStep, playPickup, playDoor, playScare, playLaugh, playMusic, stopMusic, playHeartbeat } from './audio';

export type GameState = 'menu' | 'characterSelect' | 'playing' | 'inventory' | 'ending' | 'gameover';
export type Direction = 'up' | 'down' | 'left' | 'right';

export interface Entity { x: number; y: number; type: string; active: boolean; data?: any; }
export interface Level {
  id: number; name: string; width: number; height: number; tiles: number[][];
  entities: Entity[];
  exits: { x: number; y: number; targetLevel: number; targetX: number; targetY: number }[];
  objectives: string[]; bgColor: string; darkLevel: number; musicTrack: string;
}
export interface Character { id: string; name: string; color: string; maneColor: string; eyeColor: string; description: string; }
export interface InventoryItem { id: string; name: string; icon: string; }

export const TILE_SIZE = 32;
export const VIEWPORT_TILES_X = 15;
export const VIEWPORT_TILES_Y = 11;
export const CANVAS_WIDTH = VIEWPORT_TILES_X * TILE_SIZE;
export const CANVAS_HEIGHT = VIEWPORT_TILES_Y * TILE_SIZE;

export const TILE = {
  FLOOR: 0, WALL: 1, DOOR: 2, DARK_FLOOR: 6, GRASS: 7, TREE: 8,
  WATER: 9, PATH: 10, MACHINE: 11, BALLOON: 13, TABLE: 14,
  BOOKSHELF: 15, CARPET: 16, CANDLES: 17,
};

export const CHARACTERS: Character[] = [
  { id: 'pinkie', name: 'Pinkie Pie', color: '#FFB6C1', maneColor: '#FF1493', eyeColor: '#4169E1', description: 'Fiesta y diversión. Conoce cada rincón de Ponyville.' },
  { id: 'twilight', name: 'Twilight Sparkle', color: '#DDA0DD', maneColor: '#4B0082', eyeColor: '#9B59B6', description: 'Inteligente y lógica. Resuelve acertijos con facilidad.' },
  { id: 'rainbow', name: 'Rainbow Dash', color: '#87CEEB', maneColor: '#FF0000', eyeColor: '#E74C3C', description: 'Rápida y valiente. Puede esquivar el peligro.' },
  { id: 'fluttershy', name: 'Fluttershy', color: '#FFFACD', maneColor: '#FFB6C1', eyeColor: '#2ECC71', description: 'Amable y sigilosa. Los enemigos la detectan menos.' },
  { id: 'rarity', name: 'Rarity', color: '#F5F5F5', maneColor: '#4B0082', eyeColor: '#3498DB', description: 'Elegante y observadora. Encuentra objetos ocultos.' },
  { id: 'applejack', name: 'Applejack', color: '#FFA500', maneColor: '#DAA520', eyeColor: '#27AE60', description: 'Fuerte y resistente. Soporta más persecuciones.' },
];

// ============ LEVEL HELPERS ============
function fillGrid(w: number, h: number, tile: number): number[][] {
  const g: number[][] = [];
  for (let y = 0; y < h; y++) { g[y] = []; for (let x = 0; x < w; x++) g[y][x] = tile; }
  return g;
}

function makeBox(t: number[][], x1: number, y1: number, x2: number, y2: number, wall: number, floor: number, doorX?: number, doorY?: number) {
  for (let y = y1; y <= y2; y++) for (let x = x1; x <= x2; x++) {
    if (y === y1 || y === y2 || x === x1 || x === x2) t[y][x] = wall;
    else t[y][x] = floor;
  }
  if (doorX !== undefined && doorY !== undefined) t[doorY][doorX] = TILE.DOOR;
}

// ============ LEVEL 1: Ponyville Abandonado ============
function createLevel1(): Level {
  const w = 20, h = 16;
  const t = fillGrid(w, h, TILE.DARK_FLOOR);
  for (let x = 0; x < w; x++) { t[0][x] = TILE.WALL; t[h-1][x] = TILE.WALL; }
  for (let y = 0; y < h; y++) { t[y][0] = TILE.WALL; t[y][w-1] = TILE.WALL; }
  // Streets
  for (let x = 1; x < w-1; x++) { t[7][x] = TILE.PATH; t[8][x] = TILE.PATH; }
  for (let y = 1; y < h-1; y++) { t[y][9] = TILE.PATH; t[y][10] = TILE.PATH; }
  // Houses
  makeBox(t, 2, 2, 5, 5, TILE.WALL, TILE.DARK_FLOOR, 3, 5);
  makeBox(t, 13, 2, 16, 5, TILE.WALL, TILE.DARK_FLOOR, 14, 5);
  makeBox(t, 2, 10, 5, 13, TILE.WALL, TILE.DARK_FLOOR, 3, 10);
  makeBox(t, 13, 10, 16, 13, TILE.WALL, TILE.DARK_FLOOR, 14, 10);
  t[7][4] = TILE.CANDLES; t[7][15] = TILE.CANDLES;
  // Exit to Level 2 (right side)
  t[7][w-1] = TILE.DOOR;
  // Return exit from Level 2 (left side)
  t[7][0] = TILE.DOOR;

  return {
    id: 1, name: 'PONYVILLE ABANDONADO', width: w, height: h, tiles: t,
    entities: [
      { x: 3, y: 6, type: 'item', active: true, data: { itemId: 'key_sugarcube', name: 'Llave Sugarcube', icon: '🔑' } },
      { x: 14, y: 12, type: 'note', active: true, data: { text: 'LA FIESTA TODAVÍA NO HA TERMINADO' } },
      { x: 4, y: 11, type: 'note', active: true, data: { text: 'Escuché risas... pero no había nadie.' } },
      { x: 7, y: 3, type: 'hide', active: true },
      { x: 12, y: 12, type: 'hide', active: true },
      { x: 17, y: 7, type: 'hide', active: true },
      { x: 14, y: 4, type: 'scare', active: true, data: { triggered: false } },
      { x: 5, y: 12, type: 'scare', active: true, data: { triggered: false } },
      { x: 15, y: 3, type: 'item', active: true, data: { itemId: 'map', name: 'Mapa de Ponyville', icon: '🗺️' } },
    ],
    exits: [
      { x: w-1, y: 7, targetLevel: 2, targetX: 1, targetY: 7 },
      { x: 0, y: 7, targetLevel: 6, targetX: 18, targetY: 7 }, // return from final
    ],
    objectives: ['Encontrar la llave de Sugarcube Corner'],
    bgColor: '#0d0520', darkLevel: 0.75, musicTrack: 'exploration',
  };
}

// ============ LEVEL 2: Sugarcube Corner ============
function createLevel2(): Level {
  const w = 18, h = 14;
  const t = fillGrid(w, h, TILE.FLOOR);
  for (let x = 0; x < w; x++) { t[0][x] = TILE.WALL; t[h-1][x] = TILE.WALL; }
  for (let y = 0; y < h; y++) { t[y][0] = TILE.WALL; t[y][w-1] = TILE.WALL; }
  // Room dividers
  for (let x = 1; x < w-1; x++) {
    t[4][x] = (x === 4 || x === 9 || x === 14) ? TILE.DOOR : TILE.WALL;
    t[9][x] = (x === 3 || x === 8 || x === 13) ? TILE.DOOR : TILE.WALL;
  }
  t[2][6] = TILE.TABLE; t[2][12] = TILE.BALLOON;
  t[6][5] = TILE.TABLE; t[6][11] = TILE.CANDLES; t[6][15] = TILE.BALLOON;
  t[11][4] = TILE.TABLE; t[11][10] = TILE.CANDLES; t[12][14] = TILE.BALLOON;
  // Exit to Level 3 (right)
  t[7][w-1] = TILE.DOOR;
  // Return to Level 1 (left)
  t[7][0] = TILE.DOOR;

  return {
    id: 2, name: 'SUGARCUBE CORNER', width: w, height: h, tiles: t,
    entities: [
      { x: 6, y: 2, type: 'item', active: true, data: { itemId: 'photo_1', name: 'Fragmento Foto 1', icon: '📷' } },
      { x: 13, y: 6, type: 'item', active: true, data: { itemId: 'photo_2', name: 'Fragmento Foto 2', icon: '📷' } },
      { x: 5, y: 11, type: 'item', active: true, data: { itemId: 'photo_3', name: 'Fragmento Foto 3', icon: '📷' } },
      { x: 15, y: 2, type: 'hide', active: true },
      { x: 2, y: 6, type: 'hide', active: true },
      { x: 10, y: 11, type: 'hide', active: true },
      { x: 9, y: 3, type: 'scare', active: true, data: { triggered: false } },
      { x: 5, y: 7, type: 'scare', active: true, data: { triggered: false } },
      { x: 7, y: 6, type: 'note', active: true, data: { text: 'Las cupcakes tienen... ¿dientes?' } },
    ],
    exits: [
      { x: w-1, y: 7, targetLevel: 3, targetX: 1, targetY: 9 },
      { x: 0, y: 7, targetLevel: 1, targetX: 18, targetY: 7 },
    ],
    objectives: ['Encontrar los 3 fragmentos de la fotografía'],
    bgColor: '#1a0d30', darkLevel: 0.65, musicTrack: 'creepy',
  };
}

// ============ LEVEL 3: Bosque Everfree ============
function createLevel3(): Level {
  const w = 24, h = 20;
  const t = fillGrid(w, h, TILE.GRASS);
  for (let x = 0; x < w; x++) { t[0][x] = TILE.TREE; t[h-1][x] = TILE.TREE; }
  for (let y = 0; y < h; y++) { t[y][0] = TILE.TREE; t[y][w-1] = TILE.TREE; }
  // Main paths
  for (let y = 1; y < h-1; y++) { t[y][10] = TILE.PATH; t[y][11] = TILE.PATH; }
  for (let x = 1; x < w-1; x++) { t[9][x] = TILE.PATH; }
  // Path to cabin
  for (let x = 11; x <= 17; x++) t[14][x] = TILE.PATH;
  for (let y = 9; y <= 14; y++) t[y][17] = TILE.PATH;
  // Path to exit
  for (let x = 11; x <= 19; x++) t[3][x] = TILE.PATH;
  // Some trees (not on paths)
  const trees = [[3,3],[5,5],[15,3],[4,12],[7,14],[14,6],[3,7],[6,4]];
  trees.forEach(([x,y]) => { if (t[y][x] === TILE.GRASS) t[y][x] = TILE.TREE; });
  // Water
  t[5][4] = TILE.WATER; t[6][4] = TILE.WATER; t[7][4] = TILE.WATER;
  t[5][5] = TILE.WATER; t[6][5] = TILE.WATER;
  // BIG cabin (4x4 interior)
  for (let y = 12; y <= 17; y++) for (let x = 15; x <= 20; x++) {
    if (y === 12 || y === 17 || x === 15 || x === 20) t[y][x] = TILE.WALL;
    else t[y][x] = TILE.FLOOR;
  }
  t[17][17] = TILE.DOOR; // entrance
  t[17][14] = TILE.PATH; t[17][15] = TILE.PATH; t[17][16] = TILE.PATH;
  // Exit to Level 4
  t[2][20] = TILE.PATH; t[1][20] = TILE.PATH;
  // Return to Level 2
  t[9][0] = TILE.PATH;

  return {
    id: 3, name: 'BOSQUE EVERFREE', width: w, height: h, tiles: t,
    entities: [
      // Key deep inside the BIG cabin, safe from chaser
      { x: 17, y: 14, type: 'item', active: true, data: { itemId: 'key_castle', name: 'Llave del Castillo', icon: '🗝️' } },
      { x: 8, y: 5, type: 'hide', active: true },
      { x: 14, y: 11, type: 'hide', active: true },
      { x: 3, y: 14, type: 'hide', active: true },
      { x: 19, y: 1, type: 'exit', active: true, data: { targetLevel: 4, targetX: 1, targetY: 1 } },
      { x: 13, y: 7, type: 'chaser', active: true, data: { speed: 1.0, active: false } },
      { x: 7, y: 13, type: 'scare', active: true, data: { triggered: false } },
      { x: 15, y: 5, type: 'scare', active: true, data: { triggered: false } },
      { x: 10, y: 9, type: 'note', active: true, data: { text: 'No mires atrás. Ella está justo detrás de ti.' } },
      { x: 17, y: 13, type: 'note', active: true, data: { text: 'La cabaña está al sur... corre hacia allí.' } },
    ],
    exits: [
      { x: 20, y: 1, targetLevel: 4, targetX: 1, targetY: 1 },
      { x: 0, y: 9, targetLevel: 2, targetX: 16, targetY: 7 },
    ],
    objectives: ['Encontrar la cabaña y conseguir la llave'],
    bgColor: '#050f05', darkLevel: 0.85, musicTrack: 'forest',
  };
}

// ============ LEVEL 4: Castillo de Twilight ============
function createLevel4(): Level {
  const w = 20, h = 16;
  const t = fillGrid(w, h, TILE.FLOOR);
  for (let x = 0; x < w; x++) { t[0][x] = TILE.WALL; t[h-1][x] = TILE.WALL; }
  for (let y = 0; y < h; y++) { t[y][0] = TILE.WALL; t[y][w-1] = TILE.WALL; }
  for (let x = 1; x < w-1; x++) {
    t[4][x] = (x === 4 || x === 9 || x === 14) ? TILE.DOOR : TILE.BOOKSHELF;
    t[8][x] = (x === 3 || x === 8 || x === 13 || x === 17) ? TILE.DOOR : TILE.BOOKSHELF;
    t[12][x] = (x === 6 || x === 11 || x === 16) ? TILE.DOOR : TILE.BOOKSHELF;
  }
  t[2][14] = TILE.TABLE; t[6][6] = TILE.TABLE; t[6][15] = TILE.CANDLES;
  t[10][4] = TILE.TABLE; t[10][16] = TILE.TABLE;
  // Exit to Level 5 (right)
  t[h-2][w-1] = TILE.DOOR;
  // Return to Level 3 (left)
  t[1][0] = TILE.DOOR;

  return {
    id: 4, name: 'CASTILLO DE TWILIGHT', width: w, height: h, tiles: t,
    entities: [
      { x: 13, y: 2, type: 'item', active: true, data: { itemId: 'diary', name: 'Diario de Twilight', icon: '📖' } },
      { x: 6, y: 6, type: 'note', active: true, data: { text: 'Ellas no se fueron... CAMBIARON. La fábrica las transformó.' } },
      { x: 15, y: 10, type: 'note', active: true, data: { text: 'Activa las máquinas en la fábrica.' } },
      { x: 5, y: 10, type: 'note', active: true, data: { text: 'Pinkie... ya no es Pinkie.' } },
      { x: 10, y: 6, type: 'item', active: true, data: { itemId: 'crystal', name: 'Cristal Mágico', icon: '💎' } },
      { x: 2, y: 2, type: 'hide', active: true },
      { x: 17, y: 6, type: 'hide', active: true },
      { x: 7, y: 14, type: 'hide', active: true },
      { x: 13, y: 6, type: 'scare', active: true, data: { triggered: false } },
      { x: 5, y: 11, type: 'scare', active: true, data: { triggered: false } },
    ],
    exits: [
      { x: w-1, y: h-2, targetLevel: 5, targetX: 1, targetY: 1 },
      { x: 0, y: 1, targetLevel: 3, targetX: 19, targetY: 2 },
    ],
    objectives: ['Descubrir qué ocurrió durante la fiesta'],
    bgColor: '#120830', darkLevel: 0.6, musicTrack: 'mystery',
  };
}

// ============ LEVEL 5: Fábrica de Fiestas ============
function createLevel5(): Level {
  const w = 24, h = 18;
  const t = fillGrid(w, h, TILE.FLOOR);
  for (let x = 0; x < w; x++) { t[0][x] = TILE.WALL; t[h-1][x] = TILE.WALL; }
  for (let y = 0; y < h; y++) { t[y][0] = TILE.WALL; t[y][w-1] = TILE.WALL; }
  for (let x = 1; x < w-1; x++) {
    t[5][x] = (x === 4 || x === 10 || x === 16 || x === 21) ? TILE.DOOR : TILE.MACHINE;
    t[9][x] = (x === 3 || x === 8 || x === 14 || x === 19) ? TILE.DOOR : TILE.MACHINE;
    t[13][x] = (x === 5 || x === 11 || x === 17) ? TILE.DOOR : TILE.MACHINE;
  }
  for (let y = 1; y < h-1; y++) {
    if (y === 1 || y === 3 || y === 7 || y === 11 || y === 15 || y === 16) {
      t[y][7] = TILE.PATH; t[y][15] = TILE.PATH;
    } else {
      t[y][7] = TILE.WALL; t[y][15] = TILE.WALL;
    }
  }
  t[1][21] = TILE.FLOOR; t[1][22] = TILE.FLOOR;
  // Exit to Level 6 (top-right)
  t[1][w-2] = TILE.DOOR;
  // Return to Level 4 (bottom-left)
  t[h-2][0] = TILE.DOOR;

  return {
    id: 5, name: 'FÁBRICA DE FIESTAS', width: w, height: h, tiles: t,
    entities: [
      { x: 4, y: 3, type: 'switch', active: true, data: { activated: false, id: 'sw1' } },
      { x: 12, y: 7, type: 'switch', active: true, data: { activated: false, id: 'sw2' } },
      { x: 20, y: 15, type: 'switch', active: true, data: { activated: false, id: 'sw3' } },
      { x: 2, y: 7, type: 'hide', active: true },
      { x: 21, y: 3, type: 'hide', active: true },
      { x: 9, y: 11, type: 'hide', active: true },
      { x: 17, y: 11, type: 'hide', active: true },
      { x: 12, y: 3, type: 'pinkie_chase', active: true, data: { speed: 1.3, active: false } },
      { x: 6, y: 15, type: 'scare', active: true, data: { triggered: false } },
      { x: 18, y: 7, type: 'scare', active: true, data: { triggered: false } },
      { x: 3, y: 11, type: 'note', active: true, data: { text: 'Las máquinas crean la fiesta eterna.' } },
    ],
    exits: [
      { x: w-2, y: 1, targetLevel: 6, targetX: 1, targetY: 1 },
      { x: 0, y: h-2, targetLevel: 4, targetX: 18, targetY: 13 },
    ],
    objectives: ['Activar los 3 interruptores'],
    bgColor: '#1a0510', darkLevel: 0.7, musicTrack: 'industrial',
  };
}

// ============ LEVEL 6: La Última Fiesta ============
function createLevel6(): Level {
  const w = 20, h = 16;
  const t = fillGrid(w, h, TILE.FLOOR);
  for (let x = 0; x < w; x++) { t[0][x] = TILE.WALL; t[h-1][x] = TILE.WALL; }
  for (let y = 0; y < h; y++) { t[y][0] = TILE.WALL; t[y][w-1] = TILE.WALL; }
  for (let x = 3; x < w-3; x++) {
    if (x !== 5 && x !== 9 && x !== 13) t[4][x] = TILE.TABLE;
    if (x !== 4 && x !== 8 && x !== 12 && x !== 16) t[8][x] = TILE.TABLE;
    if (x !== 6 && x !== 10 && x !== 14) t[12][x] = TILE.TABLE;
  }
  t[2][4] = TILE.BALLOON; t[2][15] = TILE.BALLOON;
  t[6][2] = TILE.BALLOON; t[6][17] = TILE.CANDLES;
  t[10][3] = TILE.CANDLES; t[10][16] = TILE.BALLOON;
  t[14][7] = TILE.BALLOON; t[14][12] = TILE.CANDLES;
  // Exit to ending (bottom-right)
  t[h-2][w-2] = TILE.DOOR;
  // Return to Level 1 (left)
  t[7][0] = TILE.DOOR;

  return {
    id: 6, name: 'LA ÚLTIMA FIESTA', width: w, height: h, tiles: t,
    entities: [
      { x: 10, y: 8, type: 'final_boss', active: true, data: { phase: 1, defeated: false } },
      { x: 4, y: 2, type: 'item', active: true, data: { itemId: 'truth', name: 'La Verdad', icon: '💫' } },
      { x: 16, y: 14, type: 'hide', active: true },
      { x: 2, y: 14, type: 'hide', active: true },
      { x: 7, y: 6, type: 'scare', active: true, data: { triggered: false } },
      { x: 13, y: 11, type: 'scare', active: true, data: { triggered: false } },
    ],
    exits: [
      { x: w-2, y: h-2, targetLevel: 7, targetX: 1, targetY: 1 },
      { x: 0, y: 7, targetLevel: 1, targetX: 1, targetY: 7 },
    ],
    objectives: ['Descubrir la verdad', 'Escapar de la fiesta'],
    bgColor: '#100020', darkLevel: 0.5, musicTrack: 'finalBoss',
  };
}

export function getLevel(id: number): Level {
  switch (id) {
    case 1: return createLevel1();
    case 2: return createLevel2();
    case 3: return createLevel3();
    case 4: return createLevel4();
    case 5: return createLevel5();
    case 6: return createLevel6();
    default: return createLevel1();
  }
}

// ============ PONY SPRITES - Detailed MLP Style ============
export function drawPonySprite(ctx: CanvasRenderingContext2D, x: number, y: number, char: Character, dir: Direction, frame: number) {
  const s = 2; // pixel scale
  ctx.save();
  ctx.translate(x, y);

  // Body (rounder, more proportional)
  ctx.fillStyle = char.color;
  ctx.fillRect(5*s, 8*s, 10*s, 8*s);
  ctx.fillRect(4*s, 9*s, 12*s, 6*s);
  ctx.fillRect(6*s, 7*s, 8*s, 2*s);
  
  // Neck
  ctx.fillRect(7*s, 6*s, 6*s, 3*s);

  // Head (larger, more expressive)
  ctx.fillRect(6*s, 2*s, 8*s, 6*s);
  ctx.fillRect(5*s, 3*s, 10*s, 4*s);
  ctx.fillRect(7*s, 1*s, 6*s, 2*s);

  // Snout
  ctx.fillStyle = char.color;
  ctx.fillRect(12*s, 4*s, 3*s, 3*s);
  ctx.fillStyle = '#FFB6C1';
  ctx.fillRect(13*s, 5*s, 1*s, 1*s);

  // Ears (pointed)
  ctx.fillStyle = char.color;
  ctx.fillRect(6*s, 0, 2*s, 3*s);
  ctx.fillRect(12*s, 0, 2*s, 3*s);
  ctx.fillStyle = char.maneColor;
  ctx.fillRect(7*s, 1*s, 1*s, 1*s);
  ctx.fillRect(13*s, 1*s, 1*s, 1*s);

  // Mane (unique per character, more detailed)
  ctx.fillStyle = char.maneColor;
  if (char.id === 'pinkie') {
    // Voluminous curly mane
    ctx.fillRect(4*s, 0, 12*s, 4*s);
    ctx.fillRect(3*s, 1*s, 2*s, 6*s);
    ctx.fillRect(14*s, 1*s, 2*s, 5*s);
    ctx.fillRect(2*s, 2*s, 2*s, 4*s);
    ctx.fillRect(15*s, 2*s, 1*s, 4*s);
    ctx.fillRect(3*s, 5*s, 1*s, 3*s);
    // Curls
    ctx.fillRect(4*s, 0, 1*s, 1*s);
    ctx.fillRect(7*s, 0, 1*s, 1*s);
    ctx.fillRect(10*s, 0, 1*s, 1*s);
    ctx.fillRect(13*s, 0, 1*s, 1*s);
  } else if (char.id === 'twilight') {
    // Straight mane with bang
    ctx.fillRect(5*s, 0, 10*s, 3*s);
    ctx.fillRect(4*s, 1*s, 2*s, 7*s);
    ctx.fillRect(13*s, 2*s, 2*s, 6*s);
    ctx.fillRect(14*s, 4*s, 1*s, 5*s);
    // Bang
    ctx.fillRect(6*s, 1*s, 4*s, 2*s);
  } else if (char.id === 'rainbow') {
    // Spiky colorful mane
    ctx.fillRect(5*s, 0, 10*s, 2*s);
    ctx.fillRect(4*s, 1*s, 2*s, 5*s);
    ctx.fillRect(13*s, 1*s, 3*s, 4*s);
    // Rainbow stripes
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(5*s, 0, 2*s, 1*s);
    ctx.fillStyle = '#FFA500';
    ctx.fillRect(7*s, 0, 2*s, 1*s);
    ctx.fillStyle = '#FFFF00';
    ctx.fillRect(9*s, 0, 2*s, 1*s);
    ctx.fillStyle = '#00FF00';
    ctx.fillRect(11*s, 0, 2*s, 1*s);
    ctx.fillStyle = '#0000FF';
    ctx.fillRect(13*s, 0, 2*s, 1*s);
  } else if (char.id === 'fluttershy') {
    // Long flowing mane
    ctx.fillRect(5*s, 1*s, 10*s, 2*s);
    ctx.fillRect(4*s, 2*s, 2*s, 10*s);
    ctx.fillRect(13*s, 2*s, 2*s, 8*s);
    ctx.fillRect(14*s, 5*s, 1*s, 6*s);
    ctx.fillRect(3*s, 4*s, 1*s, 6*s);
  } else if (char.id === 'rarity') {
    // Elegant curled mane
    ctx.fillRect(5*s, 0, 10*s, 3*s);
    ctx.fillRect(4*s, 1*s, 2*s, 6*s);
    ctx.fillRect(13*s, 1*s, 2*s, 6*s);
    ctx.fillRect(14*s, 4*s, 1*s, 4*s);
    // Curls
    ctx.fillRect(4*s, 6*s, 1*s, 2*s);
    ctx.fillRect(14*s, 6*s, 1*s, 2*s);
  } else if (char.id === 'applejack') {
    // Short mane
    ctx.fillRect(5*s, 1*s, 10*s, 2*s);
    ctx.fillRect(4*s, 2*s, 2*s, 4*s);
    ctx.fillRect(13*s, 2*s, 2*s, 4*s);
    // Hat
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(4*s, -1*s, 12*s, 3*s);
    ctx.fillRect(6*s, -2*s, 8*s, 2*s);
    ctx.fillStyle = '#A0522D';
    ctx.fillRect(5*s, 0, 10*s, 1*s);
  }

  // Eyes (large, expressive, anime-style)
  if (dir !== 'up') {
    // Eye whites
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(7*s, 3*s, 3*s, 3*s);
    ctx.fillRect(11*s, 3*s, 3*s, 3*s);
    
    // Iris
    ctx.fillStyle = char.eyeColor;
    if (dir === 'left') {
      ctx.fillRect(7*s, 4*s, 2*s, 2*s);
      ctx.fillRect(11*s, 4*s, 2*s, 2*s);
    } else if (dir === 'right') {
      ctx.fillRect(8*s, 4*s, 2*s, 2*s);
      ctx.fillRect(12*s, 4*s, 2*s, 2*s);
    } else {
      ctx.fillRect(8*s, 4*s, 2*s, 2*s);
      ctx.fillRect(12*s, 4*s, 2*s, 2*s);
    }
    
    // Pupils
    ctx.fillStyle = '#000000';
    if (dir === 'left') {
      ctx.fillRect(7*s, 4*s, 1*s, 2*s);
      ctx.fillRect(11*s, 4*s, 1*s, 2*s);
    } else if (dir === 'right') {
      ctx.fillRect(9*s, 4*s, 1*s, 2*s);
      ctx.fillRect(13*s, 4*s, 1*s, 2*s);
    } else {
      ctx.fillRect(8*s, 5*s, 1*s, 1*s);
      ctx.fillRect(12*s, 5*s, 1*s, 1*s);
    }
    
    // Eye highlights
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(8*s, 3*s, 1*s, 1*s);
    ctx.fillRect(12*s, 3*s, 1*s, 1*s);
  }

  // Legs (thicker, more proportional)
  ctx.fillStyle = char.color;
  const lo = frame % 2 === 0 ? 0 : 1;
  // Front legs
  ctx.fillRect(5*s, 16*s, 3*s, (4+lo)*s);
  ctx.fillRect(12*s, 16*s, 3*s, (5-lo)*s);
  // Back legs
  ctx.fillRect(7*s, 16*s, 3*s, (5-lo)*s);
  ctx.fillRect(10*s, 16*s, 3*s, (4+lo)*s);

  // Hooves
  ctx.fillStyle = char.id === 'applejack' ? '#8B4513' : '#333';
  ctx.fillRect(5*s, (20+lo)*s, 3*s, 1*s);
  ctx.fillRect(12*s, (21-lo)*s, 3*s, 1*s);
  ctx.fillRect(7*s, (21-lo)*s, 3*s, 1*s);
  ctx.fillRect(10*s, (20+lo)*s, 3*s, 1*s);

  // Tail (longer, more detailed)
  ctx.fillStyle = char.maneColor;
  ctx.fillRect(14*s, 10*s, 2*s, 5*s);
  ctx.fillRect(15*s, 11*s, 2*s, 4*s);
  ctx.fillRect(16*s, 12*s, 1*s, 3*s);

  // CUTIE MARK (on the flank)
  drawCutieMark(ctx, char.id, 10*s, 10*s, s);

  ctx.restore();
}

function drawCutieMark(ctx: CanvasRenderingContext2D, charId: string, x: number, y: number, s: number) {
  switch (charId) {
    case 'pinkie':
      // Balloons
      ctx.fillStyle = '#FF0000';
      ctx.fillRect(x, y, 2*s, 3*s);
      ctx.fillStyle = '#0000FF';
      ctx.fillRect(x+3*s, y-s, 2*s, 3*s);
      ctx.fillStyle = '#FFFF00';
      ctx.fillRect(x+6*s, y, 2*s, 3*s);
      // Strings
      ctx.fillStyle = '#888';
      ctx.fillRect(x+s, y+3*s, 1, 2*s);
      ctx.fillRect(x+4*s, y+2*s, 1, 3*s);
      ctx.fillRect(x+7*s, y+3*s, 1, 2*s);
      break;
    case 'twilight':
      // Star (larger)
      ctx.fillStyle = '#FFD700';
      ctx.fillRect(x+3*s, y, 2*s, s);
      ctx.fillRect(x+2*s, y+s, 4*s, s);
      ctx.fillRect(x+3*s, y+2*s, 2*s, s);
      ctx.fillRect(x+2*s, y-s, s, s);
      ctx.fillRect(x+5*s, y-s, s, s);
      // Sparkle
      ctx.fillRect(x+s, y+s, s, s);
      ctx.fillRect(x+6*s, y+s, s, s);
      break;
    case 'rainbow':
      // Lightning bolt with rainbow
      ctx.fillStyle = '#FF0000';
      ctx.fillRect(x, y, 4*s, s);
      ctx.fillStyle = '#FFA500';
      ctx.fillRect(x+s, y+s, 4*s, s);
      ctx.fillStyle = '#FFFF00';
      ctx.fillRect(x+2*s, y+2*s, 4*s, s);
      // Cloud
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(x+4*s, y-s, 3*s, 2*s);
      ctx.fillRect(x+5*s, y-2*s, 2*s, s);
      break;
    case 'fluttershy':
      // Butterflies (larger, more detailed)
      ctx.fillStyle = '#FF69B4';
      ctx.fillRect(x, y, 2*s, 3*s);
      ctx.fillRect(x+3*s, y, 2*s, 3*s);
      ctx.fillStyle = '#FFD700';
      ctx.fillRect(x+2*s, y+s, s, s);
      // Second butterfly
      ctx.fillStyle = '#87CEEB';
      ctx.fillRect(x+5*s, y+2*s, 2*s, 3*s);
      ctx.fillRect(x+8*s, y+2*s, 2*s, 3*s);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(x+7*s, y+3*s, s, s);
      break;
    case 'rarity':
      // Diamonds (larger, more detailed)
      ctx.fillStyle = '#87CEEB';
      ctx.fillRect(x+3*s, y, 2*s, s);
      ctx.fillRect(x+2*s, y+s, 4*s, s);
      ctx.fillRect(x+3*s, y+2*s, 2*s, s);
      // Second diamond
      ctx.fillStyle = '#E6E6FA';
      ctx.fillRect(x+7*s, y-s, 2*s, s);
      ctx.fillRect(x+6*s, y, 4*s, s);
      ctx.fillRect(x+7*s, y+s, 2*s, s);
      // Sparkles
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(x+s, y+s, s, s);
      ctx.fillRect(x+10*s, y, s, s);
      break;
    case 'applejack':
      // Apples (larger, more detailed)
      ctx.fillStyle = '#FF0000';
      ctx.fillRect(x+s, y, 3*s, 3*s);
      ctx.fillRect(x, y+s, s, s);
      ctx.fillRect(x+4*s, y+s, s, s);
      // Stem and leaf
      ctx.fillStyle = '#006400';
      ctx.fillRect(x+2*s, y-s, s, s);
      ctx.fillRect(x+3*s, y-s, s, s);
      // Second apple
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

export function drawScaryPony(ctx: CanvasRenderingContext2D, x: number, y: number, frame: number) {
  const s = 2;
  ctx.save();
  ctx.translate(x, y);
  
  // Body (darker, corrupted)
  ctx.fillStyle = '#1a0a1a';
  ctx.fillRect(5*s, 8*s, 10*s, 8*s);
  ctx.fillRect(4*s, 9*s, 12*s, 6*s);
  ctx.fillRect(6*s, 7*s, 8*s, 2*s);
  
  // Neck
  ctx.fillRect(7*s, 6*s, 6*s, 3*s);

  // Head
  ctx.fillRect(6*s, 2*s, 8*s, 6*s);
  ctx.fillRect(5*s, 3*s, 10*s, 4*s);
  ctx.fillRect(7*s, 1*s, 6*s, 2*s);

  // Ears (pointed, menacing)
  ctx.fillRect(6*s, 0, 2*s, 3*s);
  ctx.fillRect(12*s, 0, 2*s, 3*s);

  // Glowing red eyes (large, menacing)
  ctx.fillStyle = frame % 6 < 3 ? '#FF0000' : '#CC0000';
  ctx.fillRect(7*s, 3*s, 3*s, 3*s);
  ctx.fillRect(11*s, 3*s, 3*s, 3*s);
  
  // Eye glow effect
  ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
  ctx.fillRect(6*s, 2*s, 5*s, 5*s);
  ctx.fillRect(10*s, 2*s, 5*s, 5*s);

  // Creepy wide smile with teeth
  ctx.fillStyle = '#FF0000';
  ctx.fillRect(6*s, 6*s, 8*s, 2*s);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(7*s, 6*s, 1*s, 1*s);
  ctx.fillRect(9*s, 6*s, 1*s, 1*s);
  ctx.fillRect(11*s, 6*s, 1*s, 1*s);
  ctx.fillRect(13*s, 6*s, 1*s, 1*s);

  // Dark mane (wild, corrupted)
  ctx.fillStyle = '#0a000a';
  ctx.fillRect(4*s, 0, 12*s, 3*s);
  ctx.fillRect(3*s, 1*s, 2*s, 7*s);
  ctx.fillRect(14*s, 1*s, 2*s, 7*s);
  ctx.fillRect(2*s, 2*s, 2*s, 5*s);
  ctx.fillRect(15*s, 2*s, 1*s, 5*s);

  // Legs
  ctx.fillStyle = '#1a0a1a';
  ctx.fillRect(5*s, 16*s, 3*s, 5*s);
  ctx.fillRect(12*s, 16*s, 3*s, 5*s);
  ctx.fillRect(7*s, 16*s, 3*s, 4*s);
  ctx.fillRect(10*s, 16*s, 3*s, 4*s);

  // Tail (wild)
  ctx.fillStyle = '#0a000a';
  ctx.fillRect(14*s, 10*s, 3*s, 6*s);
  ctx.fillRect(16*s, 11*s, 2*s, 5*s);

  ctx.restore();
}

export function drawBossPony(ctx: CanvasRenderingContext2D, x: number, y: number, frame: number, phase: number) {
  const s = 2;
  ctx.save();
  ctx.translate(x, y);
  const sc = phase === 2 ? 1.3 : 1.1;
  ctx.scale(sc, sc);
  
  // Body (larger, more menacing)
  ctx.fillStyle = phase === 2 ? '#0a000a' : '#2a0a2a';
  ctx.fillRect(5*s, 8*s, 12*s, 10*s);
  ctx.fillRect(4*s, 9*s, 14*s, 8*s);
  ctx.fillRect(6*s, 7*s, 10*s, 2*s);
  
  // Neck
  ctx.fillRect(7*s, 6*s, 8*s, 3*s);

  // Head (larger)
  ctx.fillRect(6*s, 1*s, 10*s, 7*s);
  ctx.fillRect(5*s, 2*s, 12*s, 5*s);
  ctx.fillRect(7*s, 0, 8*s, 2*s);

  // Ears
  ctx.fillRect(6*s, -1*s, 2*s, 3*s);
  ctx.fillRect(14*s, -1*s, 2*s, 3*s);

  // Glowing red eyes (very large, menacing)
  ctx.fillStyle = '#FF0000';
  ctx.fillRect(7*s, 2*s, 4*s, 4*s);
  ctx.fillRect(12*s, 2*s, 4*s, 4*s);
  
  // Pupils
  ctx.fillStyle = '#000';
  ctx.fillRect(8*s, 3*s, 2*s, 2*s);
  ctx.fillRect(13*s, 3*s, 2*s, 2*s);
  
  // Eye glow
  ctx.fillStyle = 'rgba(255, 0, 0, 0.4)';
  ctx.fillRect(6*s, 1*s, 6*s, 6*s);
  ctx.fillRect(11*s, 1*s, 6*s, 6*s);

  // Creepy wide smile
  ctx.fillStyle = '#FF0000';
  ctx.fillRect(7*s, 6*s, 10*s, 2*s);
  ctx.fillStyle = '#FFFFFF';
  for (let i = 0; i < 5; i++) ctx.fillRect((7+i*2)*s, 6*s, 1*s, 1*s);

  // Wild mane (Pinkie Pie corrupted)
  ctx.fillStyle = '#FF1493';
  ctx.fillRect(4*s, -1*s, 14*s, 4*s);
  ctx.fillRect(3*s, 0, 3*s, 8*s);
  ctx.fillRect(16*s, 0, 3*s, 8*s);
  ctx.fillRect(2*s, 1*s, 2*s, 6*s);
  ctx.fillRect(18*s, 1*s, 1*s, 6*s);
  
  // Dark mane in phase 2
  if (phase === 2) {
    ctx.fillStyle = '#0a000a';
    ctx.fillRect(4*s, -1*s, 14*s, 4*s);
    ctx.fillRect(3*s, 0, 3*s, 8*s);
    ctx.fillRect(16*s, 0, 3*s, 8*s);
  }

  // Legs
  ctx.fillStyle = phase === 2 ? '#0a000a' : '#2a0a2a';
  ctx.fillRect(5*s, 18*s, 3*s, 5*s);
  ctx.fillRect(14*s, 18*s, 3*s, 5*s);
  ctx.fillRect(8*s, 18*s, 3*s, 4*s);
  ctx.fillRect(11*s, 18*s, 3*s, 4*s);

  // Tail (wild)
  ctx.fillStyle = phase === 2 ? '#0a000a' : '#FF1493';
  ctx.fillRect(16*s, 10*s, 3*s, 7*s);
  ctx.fillRect(18*s, 11*s, 2*s, 6*s);

  // Aura effect in phase 2
  if (phase === 2 && frame % 8 < 4) {
    ctx.fillStyle = 'rgba(255, 0, 100, 0.3)';
    ctx.fillRect(-2*s, -2*s, 24*s, 26*s);
  }

  ctx.restore();
}

export function drawTile(ctx: CanvasRenderingContext2D, tileType: number, x: number, y: number, frame: number) {
  const s = TILE_SIZE;
  switch (tileType) {
    case TILE.FLOOR:
      ctx.fillStyle = '#2d1f45';
      ctx.fillRect(x, y, s, s);
      ctx.fillStyle = '#362552';
      ctx.fillRect(x+2, y+2, 4, 4);
      ctx.fillRect(x+18, y+22, 4, 4);
      break;
    case TILE.DARK_FLOOR:
      ctx.fillStyle = '#120825';
      ctx.fillRect(x, y, s, s);
      ctx.fillStyle = '#1a0e30';
      ctx.fillRect(x+6, y+8, 3, 3);
      break;
    case TILE.WALL:
      ctx.fillStyle = '#1a1030';
      ctx.fillRect(x, y, s, s);
      ctx.fillStyle = '#2a1a40';
      ctx.fillRect(x+2, y+2, s-4, s-4);
      ctx.fillStyle = '#120820';
      ctx.fillRect(x, y, s, 2);
      ctx.fillRect(x, y+s-2, s, 2);
      break;
    case TILE.DOOR:
      ctx.fillStyle = '#3a2010';
      ctx.fillRect(x, y, s, s);
      ctx.fillStyle = '#6a4020';
      ctx.fillRect(x+4, y+2, s-8, s-4);
      ctx.fillStyle = '#FFD700';
      ctx.fillRect(x+s-10, y+s/2-2, 4, 4);
      break;
    case TILE.GRASS:
      ctx.fillStyle = '#081808';
      ctx.fillRect(x, y, s, s);
      ctx.fillStyle = '#102810';
      for (let i = 0; i < 4; i++) ctx.fillRect(x+(i*8)%s, y+18+(i*3)%8, 2, 6);
      break;
    case TILE.TREE:
      ctx.fillStyle = '#050f05';
      ctx.fillRect(x, y, s, s);
      ctx.fillStyle = '#2a1a0a';
      ctx.fillRect(x+12, y+16, 8, 16);
      ctx.fillStyle = '#0a2a0a';
      ctx.fillRect(x+2, y+2, 28, 18);
      ctx.fillStyle = '#0d350d';
      ctx.fillRect(x+6, y+4, 20, 12);
      break;
    case TILE.WATER:
      ctx.fillStyle = '#050520';
      ctx.fillRect(x, y, s, s);
      ctx.fillStyle = frame%8<4?'#0a0a40':'#080830';
      ctx.fillRect(x+2, y+6, 14, 4);
      ctx.fillRect(x+10, y+18, 14, 4);
      break;
    case TILE.PATH:
      ctx.fillStyle = '#2a1a0a';
      ctx.fillRect(x, y, s, s);
      ctx.fillStyle = '#3a2a1a';
      ctx.fillRect(x+2, y+2, 8, 8);
      ctx.fillRect(x+16, y+16, 10, 10);
      break;
    case TILE.TABLE:
      ctx.fillStyle = '#2d1f45';
      ctx.fillRect(x, y, s, s);
      ctx.fillStyle = '#5a3a1a';
      ctx.fillRect(x+4, y+10, s-8, s-14);
      ctx.fillStyle = '#7a5a2a';
      ctx.fillRect(x+2, y+8, s-4, 4);
      break;
    case TILE.BOOKSHELF:
      ctx.fillStyle = '#2a1a0a';
      ctx.fillRect(x, y, s, s);
      ctx.fillStyle = '#4a2a0a';
      ctx.fillRect(x+2, y+2, s-4, s-4);
      const bc = ['#8B0000','#00008B','#006400','#8B8B00','#4B0082'];
      for (let i = 0; i < 5; i++) { ctx.fillStyle = bc[i]; ctx.fillRect(x+3+i*5, y+3, 4, s-6); }
      break;
    case TILE.MACHINE:
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(x, y, s, s);
      ctx.fillStyle = '#3a3a3a';
      ctx.fillRect(x+2, y+2, s-4, s-4);
      ctx.fillStyle = frame%8<4?'#FF0000':'#00FF00';
      ctx.fillRect(x+6, y+6, 4, 4);
      ctx.fillStyle = frame%6<3?'#0000FF':'#FFFF00';
      ctx.fillRect(x+18, y+6, 4, 4);
      break;
    case TILE.BALLOON:
      ctx.fillStyle = '#2d1f45';
      ctx.fillRect(x, y, s, s);
      const bb = Math.sin(frame*0.3)*2;
      ctx.fillStyle = '#FF69B4';
      ctx.fillRect(x+10, y+4+bb, 12, 14);
      ctx.fillStyle = '#FF1493';
      ctx.fillRect(x+12, y+6+bb, 8, 10);
      ctx.fillStyle = '#888';
      ctx.fillRect(x+15, y+18+bb, 1, 12-bb);
      break;
    case TILE.CANDLES:
      ctx.fillStyle = '#2d1f45';
      ctx.fillRect(x, y, s, s);
      ctx.fillStyle = '#FFFACD';
      ctx.fillRect(x+13, y+14, 6, 14);
      ctx.fillStyle = frame%6<3?'#FFD700':'#FFA500';
      ctx.fillRect(x+14, y+10, 4, 4);
      ctx.fillStyle = '#FF4500';
      ctx.fillRect(x+15, y+8, 2, 3);
      break;
    case TILE.CARPET:
      ctx.fillStyle = '#2d1f45';
      ctx.fillRect(x, y, s, s);
      ctx.fillStyle = '#4a1a3a';
      ctx.fillRect(x+2, y+2, s-4, s-4);
      ctx.fillStyle = '#6a2a4a';
      ctx.fillRect(x+4, y+4, s-8, s-8);
      break;
    default:
      ctx.fillStyle = '#0a0515';
      ctx.fillRect(x, y, s, s);
  }
}

// ============ GAME ENGINE ============
export class GameEngine {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  state: GameState = 'menu';
  currentLevel: Level;
  playerX = 3; playerY = 3;
  playerDir: Direction = 'down';
  playerFrame = 0; playerMoving = false;
  characterId = 'pinkie';
  inventory: InventoryItem[] = [];
  dialogText = ''; showDialog = false; dialogTimer = 0;
  frame = 0;
  keys = new Set<string>();
  lastMove = 0; moveDelay = 150;
  isRunning = false; isHiding = false;
  chaserActive = false; chaserX = 0; chaserY = 0;
  pinkieChaseActive = false; pinkieChaseX = 0; pinkieChaseY = 0;
  bossActive = false; bossX = 0; bossY = 0; bossPhase = 1;
  switchesActivated = 0; photosFound = 0;
  gameComplete = false; stepCounter = 0;
  onStateChange?: (state: GameState) => void;
  onDialog?: (text: string) => void;
  onInventoryChange?: (items: InventoryItem[]) => void;
  fogParticles: {x:number;y:number;vx:number;vy:number;alpha:number;size:number}[] = [];
  screenShake = 0; flashTimer = 0; flashColor = 'rgba(255,0,0,0.5)';
  ambientTimer = 0; heartbeatTimer = 0; dangerLevel = 0;
  currentMusicTrack = '';
  chaserDelay = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.ctx.imageSmoothingEnabled = false;
    this.currentLevel = getLevel(1);
    this.initFog();
    this.setupInput();
  }

  initFog() {
    this.fogParticles = [];
    for (let i = 0; i < 20; i++) {
      this.fogParticles.push({
        x: Math.random()*CANVAS_WIDTH, y: Math.random()*CANVAS_HEIGHT,
        vx: (Math.random()-0.5)*0.4, vy: (Math.random()-0.5)*0.2,
        alpha: Math.random()*0.15+0.05, size: 20+Math.random()*40,
      });
    }
  }

  setupInput() {
    const kh = (e: KeyboardEvent, down: boolean) => {
      const k = e.key.toLowerCase();
      if (down) {
        this.keys.add(k);
        if (k === 'shift') this.isRunning = true;
        if (k === 'e') this.interact();
        if (k === 'h') this.toggleHide();
        if (k === 'i') this.toggleInventory();
      } else {
        this.keys.delete(k);
        if (k === 'shift') this.isRunning = false;
      }
    };
    window.addEventListener('keydown', e => kh(e, true));
    window.addEventListener('keyup', e => kh(e, false));
  }

  setDirection(dir: Direction) {
    this.keys.clear();
    const m: Record<Direction,string> = {up:'w',down:'s',left:'a',right:'d'};
    this.keys.add(m[dir]);
  }
  clearDirection() { this.keys.clear(); }
  setRunning(r: boolean) { this.isRunning = r; }

  interact() {
    if (this.state !== 'playing' || this.isHiding) return;
    const cx = this.playerX + (this.playerDir==='right'?1:this.playerDir==='left'?-1:0);
    const cy = this.playerY + (this.playerDir==='down'?1:this.playerDir==='up'?-1:0);

    for (const e of this.currentLevel.entities) {
      if (!e.active) continue;
      if ((e.x===cx&&e.y===cy)||(e.x===this.playerX&&e.y===this.playerY)) {
        this.handleEntity(e); return;
      }
    }
    for (const ex of this.currentLevel.exits) {
      if ((ex.x===cx&&ex.y===cy)||(Math.abs(ex.x-this.playerX)<=1&&Math.abs(ex.y-this.playerY)<=1)) {
        this.transitionToLevel(ex.targetLevel, ex.targetX, ex.targetY); return;
      }
    }
    const ft = this.currentLevel.tiles[cy]?.[cx];
    if (ft === TILE.DOOR) playDoor();
  }

  handleEntity(entity: Entity) {
    switch (entity.type) {
      case 'item':
        if (entity.data) {
          this.inventory.push({ id: entity.data.itemId, name: entity.data.name, icon: entity.data.icon });
          if (entity.data.itemId?.startsWith('photo_')) this.photosFound++;
          entity.active = false;
          playPickup();
          this.addMessage(`¡Obtuviste: ${entity.data.name}!`);
          if (entity.data.itemId === 'diary') setTimeout(() => this.addMessage('Las otras ponis... fueron absorbidas.'), 2000);
          if (entity.data.itemId === 'truth') {
            setTimeout(() => this.addMessage('Pinkie quería amigos para siempre. Literalmente.'), 2000);
            this.bossPhase = 2; this.dangerLevel = 3;
          }
          this.onInventoryChange?.(this.inventory);
        }
        break;
      case 'note':
        if (entity.data) { this.addMessage(entity.data.text); entity.active = false; }
        break;
      case 'switch':
        if (entity.data && !entity.data.activated) {
          entity.data.activated = true; entity.active = false;
          this.switchesActivated++;
          playPickup();
          this.addMessage(`⚡ Interruptor (${this.switchesActivated}/3)`);
          if (this.switchesActivated >= 3) {
            setTimeout(() => this.addMessage('¡Máquinas activadas! ¡La salida está abierta!'), 1500);
            this.screenShake = 20;
          }
        }
        break;
      case 'hide': this.toggleHide(); break;
      case 'scare':
        if (entity.data && !entity.data.triggered) { entity.data.triggered = true; this.triggerScare(); }
        break;
      case 'final_boss':
        if (entity.data && !entity.data.defeated) {
          if (this.inventory.find(i => i.id === 'truth')) {
            entity.data.defeated = true;
            this.addMessage('Has descubierto la verdad. Pinkie se desvanece...');
            this.screenShake = 30; this.flashTimer = 30;
            this.flashColor = 'rgba(255,105,180,0.5)';
            this.bossActive = false;
            setTimeout(() => this.addMessage('¡La salida está abierta! ¡Corre!'), 3000);
          } else {
            this.addMessage('Pinkie te bloquea. Necesitas la verdad primero.');
            this.bossActive = true; this.bossX = entity.x; this.bossY = entity.y;
          }
        }
        break;
    }
  }

  triggerScare() {
    playScare();
    this.screenShake = 12; this.flashTimer = 10;
    this.flashColor = 'rgba(255,0,0,0.4)';
    const s = ['¡Algo se movió!','Una risa distorsionada...','¿Una sombra con ojos rojos?','El aire se vuelve helado...','Pasos... pero no hay nadie.','¡Una pony te observa!','Las paredes respiran...'];
    this.addMessage(s[Math.floor(Math.random()*s.length)]);
  }

  addMessage(text: string) {
    this.dialogText = text; this.showDialog = true; this.dialogTimer = 180;
    this.onDialog?.(text);
  }

  toggleHide() {
    const h = this.currentLevel.entities.find(e => e.type==='hide' && e.active && Math.abs(e.x-this.playerX)<=1 && Math.abs(e.y-this.playerY)<=1);
    if (h) {
      this.isHiding = !this.isHiding;
      this.addMessage(this.isHiding ? '🫣 Escondido... (H para salir)' : 'Sales del escondite.');
    }
  }

  toggleInventory() {
    if (this.state === 'playing') { this.state = 'inventory'; }
    else if (this.state === 'inventory') { this.state = 'playing'; }
    this.onStateChange?.(this.state);
  }

  transitionToLevel(levelId: number, tx: number, ty: number) {
    if (levelId === 7) {
      this.state = 'ending'; this.gameComplete = true;
      this.onStateChange?.('ending');
      stopMusic(); this.saveGame();
      return;
    }
    // Check requirements
    if (this.currentLevel.id === 1 && !this.inventory.find(i => i.id === 'key_sugarcube')) {
      this.addMessage('Necesitas la llave de Sugarcube Corner.'); return;
    }
    if (this.currentLevel.id === 3 && !this.inventory.find(i => i.id === 'key_castle')) {
      this.addMessage('Necesitas la llave del Castillo.'); return;
    }
    if (this.currentLevel.id === 5 && this.switchesActivated < 3) {
      this.addMessage('Activa los 3 interruptores primero.'); return;
    }

    playDoor();
    this.currentLevel = getLevel(levelId);
    this.playerX = tx; this.playerY = ty;
    this.chaserActive = false; this.pinkieChaseActive = false;
    this.bossActive = false; this.isHiding = false;
    this.chaserDelay = 0;
    this.initFog(); this.saveGame();

    this.currentMusicTrack = this.currentLevel.musicTrack;
    playMusic(this.currentLevel.musicTrack);

    const names: Record<number,string> = {1:'📍 Ponyville',2:'📍 Sugarcube Corner',3:'📍 Bosque Everfree',4:'📍 Castillo de Twilight',5:'📍 Fábrica de Fiestas',6:'📍 La Última Fiesta'};
    this.addMessage(names[levelId] || 'Nivel');

    // Level-specific events
    if (levelId === 3) {
      // Delay chaser activation significantly
      this.chaserDelay = 600; // ~10 seconds at 60fps
    }
    if (levelId === 5) {
      setTimeout(() => { playLaugh(); this.addMessage('¡Pinkie aparece! ¡HUYE!'); this.activatePinkieChase(); playMusic('chase'); }, 8000);
    }
  }

  activateChaser() { this.chaserActive = true; this.chaserX = 18; this.chaserY = 14; this.dangerLevel = 2; }
  activatePinkieChase() { this.pinkieChaseActive = true; this.pinkieChaseX = 5; this.pinkieChaseY = 5; this.dangerLevel = 3; }

  update() {
    this.frame++;
    if (this.state !== 'playing') return;
    if (this.showDialog) {
      this.dialogTimer--;
      if (this.dialogTimer <= 0) { this.showDialog = false; this.onDialog?.(''); }
      return;
    }

    // Chaser delay countdown
    if (this.chaserDelay > 0) {
      this.chaserDelay--;
      if (this.chaserDelay === 300) {
        this.addMessage('Escuchas pasos detrás de ti... ¡CORRE!');
      }
      if (this.chaserDelay === 0) {
        this.activateChaser();
        playMusic('chase');
      }
    }

    const now = Date.now();
    const delay = this.isRunning ? 80 : this.moveDelay;
    if (now - this.lastMove > delay) {
      let dx=0, dy=0;
      if (this.keys.has('w')||this.keys.has('arrowup')) { dy=-1; this.playerDir='up'; }
      else if (this.keys.has('s')||this.keys.has('arrowdown')) { dy=1; this.playerDir='down'; }
      else if (this.keys.has('a')||this.keys.has('arrowleft')) { dx=-1; this.playerDir='left'; }
      else if (this.keys.has('d')||this.keys.has('arrowright')) { dx=1; this.playerDir='right'; }

      if ((dx||dy) && !this.isHiding) {
        const nx=this.playerX+dx, ny=this.playerY+dy;
        if (this.canMoveTo(nx,ny)) {
          this.playerX=nx; this.playerY=ny;
          this.playerMoving=true; this.playerFrame++;
          this.lastMove=now; this.stepCounter++;
          if (this.stepCounter%5===0) playStep();
          this.checkAutoPickup(); this.checkExits();
        }
      } else this.playerMoving=false;
    }

    if (this.chaserActive && this.frame%10===0) this.moveChaser();
    if (this.pinkieChaseActive && this.frame%7===0) this.movePinkieChaser();
    if (this.bossActive && this.frame%12===0) this.moveBoss();
    this.updateFog();
    if (this.screenShake > 0) { this.screenShake *= 0.9; if (this.screenShake < 0.5) this.screenShake = 0; }
    if (this.flashTimer > 0) this.flashTimer--;

    this.ambientTimer++;
    if (this.ambientTimer > 500 + Math.random()*300) {
      this.ambientTimer = 0;
      if (Math.random() < 0.2) playLaugh();
    }

    if (this.dangerLevel > 0 && (this.chaserActive || this.pinkieChaseActive)) {
      this.heartbeatTimer++;
      if (this.heartbeatTimer > Math.floor(40/this.dangerLevel)) {
        this.heartbeatTimer = 0;
        playHeartbeat();
      }
    }
  }

  canMoveTo(x: number, y: number): boolean {
    if (x<0||y<0||x>=this.currentLevel.width||y>=this.currentLevel.height) return false;
    const tile = this.currentLevel.tiles[y]?.[x];
    if (tile===undefined) return false;
    return tile!==TILE.WALL && tile!==TILE.TREE && tile!==TILE.WATER && tile!==TILE.MACHINE && tile!==TILE.BOOKSHELF && tile!==TILE.TABLE;
  }

  checkAutoPickup() {
    for (const e of this.currentLevel.entities) {
      if (!e.active) continue;
      if (e.x===this.playerX && e.y===this.playerY && (e.type==='item'||e.type==='note')) this.handleEntity(e);
    }
  }

  checkExits() {
    for (const ex of this.currentLevel.exits) {
      if (ex.x===this.playerX && ex.y===this.playerY) this.transitionToLevel(ex.targetLevel, ex.targetX, ex.targetY);
    }
  }

  moveChaser() {
    if (this.isHiding) return;
    const dx=this.playerX-this.chaserX, dy=this.playerY-this.chaserY;
    if (Math.abs(dx)>Math.abs(dy)) { const nx=this.chaserX+Math.sign(dx); if (this.canMoveTo(nx,this.chaserY)) this.chaserX=nx; }
    else { const ny=this.chaserY+Math.sign(dy); if (this.canMoveTo(this.chaserX,ny)) this.chaserY=ny; }
    if (Math.abs(this.playerX-this.chaserX)<=1 && Math.abs(this.playerY-this.chaserY)<=1) {
      playScare(); this.screenShake=15; this.flashTimer=15;
      this.addMessage('¡La criatura te alcanza! Escapas por poco...');
      this.playerX=Math.max(1,this.playerX-4); this.playerY=Math.max(1,this.playerY-4);
      this.chaserX=18; this.chaserY=14;
    }
  }

  movePinkieChaser() {
    if (this.isHiding) return;
    const dx=this.playerX-this.pinkieChaseX, dy=this.playerY-this.pinkieChaseY;
    if (Math.abs(dx)>Math.abs(dy)) { const nx=this.pinkieChaseX+Math.sign(dx); if (this.canMoveTo(nx,this.pinkieChaseY)) this.pinkieChaseX=nx; }
    else { const ny=this.pinkieChaseY+Math.sign(dy); if (this.canMoveTo(this.pinkieChaseX,ny)) this.pinkieChaseY=ny; }
    if (Math.abs(this.playerX-this.pinkieChaseX)<=1 && Math.abs(this.playerY-this.pinkieChaseY)<=1) {
      playScare(); this.screenShake=20; this.flashTimer=20;
      this.addMessage('¡Pinkie te alcanza! ¡Pero te zafas!');
      this.playerX=Math.max(1,this.playerX-5); this.playerY=Math.max(1,this.playerY-5);
      this.pinkieChaseX=1; this.pinkieChaseY=1;
    }
  }

  moveBoss() {
    if (this.isHiding) return;
    const dx=this.playerX-this.bossX, dy=this.playerY-this.bossY;
    if (this.frame%3===0) {
      if (Math.abs(dx)>Math.abs(dy)) { const nx=this.bossX+Math.sign(dx); if (this.canMoveTo(nx,this.bossY)) this.bossX=nx; }
      else { const ny=this.bossY+Math.sign(dy); if (this.canMoveTo(this.bossX,ny)) this.bossY=ny; }
    }
    if (Math.abs(this.playerX-this.bossX)<=1 && Math.abs(this.playerY-this.bossY)<=1) {
      playScare(); this.screenShake=10;
      this.playerX=Math.max(1,this.playerX-3); this.playerY=Math.max(1,this.playerY-3);
      this.addMessage('¡Pinkie te persigue! ¡Encuentra la verdad!');
    }
  }

  updateFog() {
    for (const p of this.fogParticles) {
      p.x+=p.vx; p.y+=p.vy;
      if (p.x<-p.size) p.x=CANVAS_WIDTH;
      if (p.x>CANVAS_WIDTH+p.size) p.x=-p.size;
      if (p.y<-p.size) p.y=CANVAS_HEIGHT;
      if (p.y>CANVAS_HEIGHT+p.size) p.y=-p.size;
      p.alpha = 0.05+Math.sin(this.frame*0.01+p.x*0.01)*0.08;
    }
  }

  render() {
    const ctx = this.ctx;
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = this.currentLevel.bgColor;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    let sx=0, sy=0;
    if (this.screenShake>0) { sx=(Math.random()-0.5)*this.screenShake; sy=(Math.random()-0.5)*this.screenShake; }
    ctx.save();
    ctx.translate(Math.round(sx), Math.round(sy));

    const camX = Math.max(0, Math.min(this.playerX*TILE_SIZE-CANVAS_WIDTH/2+TILE_SIZE/2, this.currentLevel.width*TILE_SIZE-CANVAS_WIDTH));
    const camY = Math.max(0, Math.min(this.playerY*TILE_SIZE-CANVAS_HEIGHT/2+TILE_SIZE/2, this.currentLevel.height*TILE_SIZE-CANVAS_HEIGHT));
    ctx.save();
    ctx.translate(-Math.round(camX), -Math.round(camY));

    const stx=Math.max(0,Math.floor(camX/TILE_SIZE)-1), sty=Math.max(0,Math.floor(camY/TILE_SIZE)-1);
    const etx=Math.min(stx+VIEWPORT_TILES_X+3, this.currentLevel.width), ety=Math.min(sty+VIEWPORT_TILES_Y+3, this.currentLevel.height);
    for (let y=sty;y<ety;y++) for (let x=stx;x<etx;x++) drawTile(ctx, this.currentLevel.tiles[y]?.[x]??0, x*TILE_SIZE, y*TILE_SIZE, this.frame);

    // Entities
    for (const e of this.currentLevel.entities) {
      if (!e.active && e.type!=='scare') continue;
      const ex=e.x*TILE_SIZE, ey=e.y*TILE_SIZE;
      switch(e.type) {
        case 'item':
          ctx.fillStyle='#FFD700'; ctx.fillRect(ex+8,ey+8,16,16);
          ctx.fillStyle='#FFF8DC'; ctx.fillRect(ex+10,ey+10,12,12);
          if (this.frame%20<10) { ctx.fillStyle='#FFF'; ctx.fillRect(ex+6,ey+4,3,3); }
          break;
        case 'note':
          ctx.fillStyle='#FFFFF0'; ctx.fillRect(ex+6,ey+8,20,18);
          ctx.fillStyle='#333'; ctx.fillRect(ex+10,ey+13,12,1); ctx.fillRect(ex+10,ey+16,8,1);
          break;
        case 'hide':
          ctx.fillStyle='rgba(80,80,180,0.15)'; ctx.fillRect(ex+2,ey+2,TILE_SIZE-4,TILE_SIZE-4);
          break;
        case 'switch':
          ctx.fillStyle=e.data?.activated?'#00CC00':'#CC0000';
          ctx.fillRect(ex+8,ey+8,16,16);
          ctx.fillStyle=e.data?.activated?'#00FF00':'#FF0000';
          ctx.fillRect(ex+10,ey+10,12,12);
          break;
        case 'exit':
          const eg=Math.sin(this.frame*0.1)*0.3+0.7;
          ctx.fillStyle=`rgba(60,60,255,${eg*0.5})`; ctx.fillRect(ex+2,ey+2,TILE_SIZE-4,TILE_SIZE-4);
          ctx.fillStyle=`rgba(100,100,255,${eg})`; ctx.fillRect(ex+6,ey+6,TILE_SIZE-12,TILE_SIZE-12);
          break;
        case 'final_boss':
          if (!e.data?.defeated) drawBossPony(ctx, ex-4, ey-4, this.frame, this.bossPhase);
          break;
      }
    }

    // Enemies
    if (this.chaserActive && !this.isHiding) drawScaryPony(ctx, this.chaserX*TILE_SIZE-4, this.chaserY*TILE_SIZE-8, this.frame);
    if (this.pinkieChaseActive && !this.isHiding) drawScaryPony(ctx, this.pinkieChaseX*TILE_SIZE-4, this.pinkieChaseY*TILE_SIZE-8, this.frame);
    if (this.bossActive && !this.isHiding) drawBossPony(ctx, this.bossX*TILE_SIZE-8, this.bossY*TILE_SIZE-12, this.frame, this.bossPhase);

    // Player
    if (!this.isHiding) {
      const c = CHARACTERS.find(ch=>ch.id===this.characterId)||CHARACTERS[0];
      drawPonySprite(ctx, this.playerX*TILE_SIZE-6, this.playerY*TILE_SIZE-10, c, this.playerDir, this.playerMoving?this.playerFrame:0);
    } else {
      ctx.fillStyle='rgba(50,50,150,0.3)';
      ctx.fillRect(this.playerX*TILE_SIZE+4, this.playerY*TILE_SIZE+4, TILE_SIZE-8, TILE_SIZE-8);
    }

    ctx.restore();

    for (const p of this.fogParticles) {
      ctx.fillStyle=`rgba(80,40,120,${Math.max(0,p.alpha)})`;
      ctx.fillRect(p.x, p.y, p.size, p.size*0.7);
    }

    const grad = ctx.createRadialGradient(CANVAS_WIDTH/2,CANVAS_HEIGHT/2,40,CANVAS_WIDTH/2,CANVAS_HEIGHT/2,180);
    grad.addColorStop(0,'rgba(0,0,0,0)');
    grad.addColorStop(0.7,`rgba(0,0,0,${this.currentLevel.darkLevel*0.5})`);
    grad.addColorStop(1,`rgba(0,0,0,${this.currentLevel.darkLevel})`);
    ctx.fillStyle=grad; ctx.fillRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);

    if (this.flashTimer>0) {
      ctx.fillStyle=this.flashColor.replace(/[\d.]+\)$/,`${this.flashTimer/30})`);
      ctx.fillRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
    }

    const vig = ctx.createRadialGradient(CANVAS_WIDTH/2,CANVAS_HEIGHT/2,CANVAS_WIDTH*0.3,CANVAS_WIDTH/2,CANVAS_HEIGHT/2,CANVAS_WIDTH*0.7);
    vig.addColorStop(0,'rgba(0,0,0,0)'); vig.addColorStop(1,'rgba(0,0,0,0.4)');
    ctx.fillStyle=vig; ctx.fillRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);

    ctx.restore();
    this.renderHUD(ctx);
  }

  renderHUD(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle='rgba(0,0,0,0.8)'; ctx.fillRect(0,0,CANVAS_WIDTH,22);
    ctx.fillStyle='#FFB6C1'; ctx.font='bold 10px monospace';
    ctx.fillText(`📍 ${this.currentLevel.name}`, 6, 14);
    ctx.fillStyle='rgba(0,0,0,0.7)'; ctx.fillRect(CANVAS_WIDTH-55,2,52,18);
    ctx.fillStyle='#FFD700'; ctx.font='9px monospace';
    ctx.fillText(`🎒 ${this.inventory.length}`, CANVAS_WIDTH-50, 14);
    ctx.fillStyle='rgba(0,0,0,0.7)'; ctx.fillRect(0,CANVAS_HEIGHT-18,CANVAS_WIDTH,18);
    ctx.fillStyle='#999'; ctx.font='9px monospace';
    if (this.currentLevel.objectives[0]) ctx.fillText(`🎯 ${this.currentLevel.objectives[0]}`, 6, CANVAS_HEIGHT-5);

    if (this.isHiding) {
      ctx.fillStyle='rgba(0,0,50,0.6)'; ctx.fillRect(0,0,CANVAS_WIDTH,CANVAS_HEIGHT);
      ctx.fillStyle='#FFF'; ctx.font='bold 14px monospace'; ctx.textAlign='center';
      ctx.fillText('🫣 ESCONDIDO', CANVAS_WIDTH/2, CANVAS_HEIGHT/2-5);
      ctx.font='9px monospace'; ctx.fillStyle='#AAA';
      ctx.fillText('Presiona H para salir', CANVAS_WIDTH/2, CANVAS_HEIGHT/2+12);
      ctx.textAlign='left';
    }

    if (this.showDialog && this.dialogText) {
      const bH=50, bY=CANVAS_HEIGHT-70;
      ctx.fillStyle='rgba(0,0,0,0.9)'; ctx.fillRect(15,bY,CANVAS_WIDTH-30,bH);
      ctx.strokeStyle='#FF69B4'; ctx.lineWidth=2; ctx.strokeRect(15,bY,CANVAS_WIDTH-30,bH);
      ctx.fillStyle='#FFF'; ctx.font='10px monospace'; ctx.textAlign='center';
      const words=this.dialogText.split(' '); let line='', lineY=bY+18;
      for (const w of words) {
        const tl=line+w+' ';
        if (ctx.measureText(tl).width>CANVAS_WIDTH-50) { ctx.fillText(line.trim(),CANVAS_WIDTH/2,lineY); line=w+' '; lineY+=13; }
        else line=tl;
      }
      ctx.fillText(line.trim(), CANVAS_WIDTH/2, lineY);
      ctx.textAlign='left';
    }

    if (this.dangerLevel>0 && (this.chaserActive||this.pinkieChaseActive||this.bossActive)) {
      ctx.fillStyle=this.frame%20<10?'rgba(255,0,0,0.3)':'rgba(255,0,0,0.1)';
      ctx.fillRect(0,0,4,CANVAS_HEIGHT); ctx.fillRect(CANVAS_WIDTH-4,0,4,CANVAS_HEIGHT);
    }
  }

  saveGame() {
    localStorage.setItem('pinkie_horror_save', JSON.stringify({
      characterId: this.characterId, currentLevelId: this.currentLevel.id,
      playerX: this.playerX, playerY: this.playerY,
      inventory: this.inventory, switchesActivated: this.switchesActivated,
      photosFound: this.photosFound,
    }));
  }

  loadGame(): boolean {
    const d = localStorage.getItem('pinkie_horror_save');
    if (d) {
      try {
        const s = JSON.parse(d);
        this.characterId = s.characterId;
        this.currentLevel = getLevel(s.currentLevelId);
        this.playerX = s.playerX; this.playerY = s.playerY;
        this.inventory = s.inventory || [];
        this.switchesActivated = s.switchesActivated || 0;
        this.photosFound = s.photosFound || 0;
        this.currentMusicTrack = this.currentLevel.musicTrack;
        this.initFog();
        return true;
      } catch(e) {}
    }
    return false;
  }

  startGame(characterId: string) {
    this.characterId = characterId;
    this.currentLevel = getLevel(1);
    this.playerX = 9; this.playerY = 7;
    this.inventory = []; this.switchesActivated = 0; this.photosFound = 0;
    this.state = 'playing';
    this.chaserActive = false; this.pinkieChaseActive = false;
    this.bossActive = false; this.isHiding = false; this.dangerLevel = 0;
    this.chaserDelay = 0;
    this.initFog();
    this.onStateChange?.('playing');
    this.currentMusicTrack = 'exploration';
    playMusic('exploration');
    setTimeout(() => this.addMessage('Pinkie recibe una invitación misteriosa...'), 500);
    setTimeout(() => this.addMessage('💡 Camina sobre los objetos para recogerlos.'), 3500);
    setTimeout(() => this.addMessage('🔑 La llave está cerca de la casa rosa.'), 6000);
  }

  continueGame() {
    this.state = 'playing';
    this.onStateChange?.('playing');
    this.currentMusicTrack = this.currentLevel.musicTrack;
    playMusic(this.currentLevel.musicTrack);
  }

  returnToMenu() { this.state = 'menu'; stopMusic(); this.onStateChange?.('menu'); }
  destroy() { stopMusic(); }
}
