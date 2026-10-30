// Game Engine - Pixel Art Horror Game - Enhanced Version
import { playStep, playPickup, playDoor, playScare, playLaugh, startAmbientLoop, stopAmbientLoop } from './audio';

// ============ TYPES ============
export type GameState = 'menu' | 'characterSelect' | 'playing' | 'inventory' | 'dialog' | 'ending' | 'gameover';
export type Direction = 'up' | 'down' | 'left' | 'right';

export interface Entity {
  x: number;
  y: number;
  type: string;
  active: boolean;
  data?: any;
}

export interface Level {
  id: number;
  name: string;
  width: number;
  height: number;
  tiles: number[][];
  entities: Entity[];
  exits: { x: number; y: number; targetLevel: number; targetX: number; targetY: number }[];
  objectives: string[];
  bgColor: string;
  darkLevel: number;
  ambientSound?: string;
}

export interface Character {
  id: string;
  name: string;
  color: string;
  maneColor: string;
  description: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  icon: string;
  description: string;
}

// ============ CONSTANTS ============
export const TILE_SIZE = 32;
export const VIEWPORT_TILES_X = 15;
export const VIEWPORT_TILES_Y = 11;
export const CANVAS_WIDTH = VIEWPORT_TILES_X * TILE_SIZE;
export const CANVAS_HEIGHT = VIEWPORT_TILES_Y * TILE_SIZE;

// Tile types
export const TILE = {
  FLOOR: 0,
  WALL: 1,
  DOOR: 2,
  ITEM: 3,
  HIDE: 4,
  EXIT: 5,
  DARK_FLOOR: 6,
  GRASS: 7,
  TREE: 8,
  WATER: 9,
  PATH: 10,
  MACHINE: 11,
  SWITCH: 12,
  BALLOON: 13,
  TABLE: 14,
  BOOKSHELF: 15,
  CARPET: 16,
  CANDLES: 17,
  CRACK: 18,
};

// ============ CHARACTERS ============
export const CHARACTERS: Character[] = [
  { id: 'pinkie', name: 'Pinkie Pie', color: '#FFB6C1', maneColor: '#FF69B4', description: 'Fiesta y diversión. Conoce cada rincón de Ponyville.' },
  { id: 'twilight', name: 'Twilight Sparkle', color: '#DDA0DD', maneColor: '#9B59B6', description: 'Inteligente y lógica. Resuelve acertijos con facilidad.' },
  { id: 'rainbow', name: 'Rainbow Dash', color: '#87CEEB', maneColor: '#FF6347', description: 'Rápida y valiente. Puede esquivar el peligro.' },
  { id: 'fluttershy', name: 'Fluttershy', color: '#FFFACD', maneColor: '#FFB6C1', description: 'Amable y sigilosa. Los enemigos la detectan menos.' },
  { id: 'rarity', name: 'Rarity', color: '#F0F0F0', maneColor: '#7B68EE', description: 'Elegante y observadora. Encuentra objetos ocultos.' },
  { id: 'applejack', name: 'Applejack', color: '#FFA500', maneColor: '#FFD700', description: 'Fuerte y resistente. Soporta más persecuciones.' },
];

// ============ LEVEL GENERATION ============
function createLevel1(): Level {
  const w = 22, h = 18;
  const tiles: number[][] = [];
  for (let y = 0; y < h; y++) {
    tiles[y] = [];
    for (let x = 0; x < w; x++) {
      if (y === 0 || y === h - 1 || x === 0 || x === w - 1) tiles[y][x] = TILE.WALL;
      // Streets (paths)
      else if (x === 7 || x === 8) tiles[y][x] = TILE.PATH;
      else if (y === 9 || y === 10) tiles[y][x] = TILE.PATH;
      // Houses
      else if (y >= 2 && y <= 5 && x >= 2 && x <= 5) {
        if (y === 2 || y === 5 || x === 2 || x === 5) tiles[y][x] = TILE.WALL;
        else if (y === 5 && x === 3) tiles[y][x] = TILE.DOOR;
        else tiles[y][x] = TILE.DARK_FLOOR;
      }
      else if (y >= 2 && y <= 5 && x >= 10 && x <= 14) {
        if (y === 2 || y === 5 || x === 10 || x === 14) tiles[y][x] = TILE.WALL;
        else if (y === 5 && x === 12) tiles[y][x] = TILE.DOOR;
        else tiles[y][x] = TILE.DARK_FLOOR;
      }
      else if (y >= 12 && y <= 16 && x >= 2 && x <= 5) {
        if (y === 12 || y === 16 || x === 2 || x === 5) tiles[y][x] = TILE.WALL;
        else if (y === 12 && x === 4) tiles[y][x] = TILE.DOOR;
        else tiles[y][x] = TILE.DARK_FLOOR;
      }
      else if (y >= 12 && y <= 16 && x >= 10 && x <= 15) {
        if (y === 12 || y === 16 || x === 10 || x === 15) tiles[y][x] = TILE.WALL;
        else if (y === 12 && x === 12) tiles[y][x] = TILE.DOOR;
        else tiles[y][x] = TILE.DARK_FLOOR;
      }
      // Candles on streets
      else if ((x === 7 || x === 8) && (y === 4 || y === 14)) tiles[y][x] = TILE.CANDLES;
      // Cracks
      else if (x === 16 && y === 7) tiles[y][x] = TILE.CRACK;
      else tiles[y][x] = TILE.DARK_FLOOR;
    }
  }
  // Exit to Sugarcube Corner
  tiles[3][20] = TILE.DOOR;
  tiles[3][21] = TILE.DARK_FLOOR;

  return {
    id: 1,
    name: 'PONYVILLE ABANDONADO',
    width: w, height: h, tiles,
    entities: [
      { x: 3, y: 3, type: 'item', active: true, data: { itemId: 'key_sugarcube', name: 'Llave Sugarcube', icon: '🔑' } },
      { x: 12, y: 14, type: 'note', active: true, data: { text: 'LA FIESTA TODAVÍA NO HA TERMINADO' } },
      { x: 4, y: 14, type: 'note', active: true, data: { text: 'Escuché risas... pero no había nadie. Algo está muy mal.' } },
      { x: 12, y: 3, type: 'hide', active: true },
      { x: 4, y: 10, type: 'hide', active: true },
      { x: 16, y: 15, type: 'hide', active: true },
      { x: 20, y: 3, type: 'exit', active: true, data: { targetLevel: 2, targetX: 1, targetY: 1 } },
      { x: 15, y: 5, type: 'scare', active: true, data: { triggered: false } },
      { x: 6, y: 13, type: 'scare', active: true, data: { triggered: false } },
      { x: 18, y: 9, type: 'item', active: true, data: { itemId: 'map', name: 'Mapa de Ponyville', icon: '🗺️' } },
    ],
    exits: [{ x: 20, y: 3, targetLevel: 2, targetX: 1, targetY: 1 }],
    objectives: ['Encontrar la llave de Sugarcube Corner', 'Explorar las calles oscuras'],
    bgColor: '#0d0520',
    darkLevel: 0.75,
  };
}

function createLevel2(): Level {
  const w = 20, h = 16;
  const tiles: number[][] = [];
  for (let y = 0; y < h; y++) {
    tiles[y] = [];
    for (let x = 0; x < w; x++) {
      if (y === 0 || y === h - 1 || x === 0 || x === w - 1) tiles[y][x] = TILE.WALL;
      // Rooms
      else if (y === 5 && x > 2 && x < 17) {
        tiles[y][x] = (x === 5 || x === 10 || x === 14) ? TILE.DOOR : TILE.WALL;
      }
      else if (y === 10 && x > 2 && x < 17) {
        tiles[y][x] = (x === 4 || x === 9 || x === 13 || x === 16) ? TILE.DOOR : TILE.WALL;
      }
      // Tables and decorations
      else if (y === 3 && x === 7) tiles[y][x] = TILE.TABLE;
      else if (y === 3 && x === 12) tiles[y][x] = TILE.BALLOON;
      else if (y === 7 && x === 6) tiles[y][x] = TILE.TABLE;
      else if (y === 7 && x === 11) tiles[y][x] = TILE.CANDLES;
      else if (y === 7 && x === 15) tiles[y][x] = TILE.BALLOON;
      else if (y === 12 && x === 5) tiles[y][x] = TILE.TABLE;
      else if (y === 12 && x === 10) tiles[y][x] = TILE.CANDLES;
      else if (y === 13 && x === 14) tiles[y][x] = TILE.BALLOON;
      else if (y === 2 && x === 3) tiles[y][x] = TILE.CARPET;
      else if (y === 8 && x === 7) tiles[y][x] = TILE.CARPET;
      else tiles[y][x] = TILE.FLOOR;
    }
  }

  return {
    id: 2,
    name: 'SUGARCUBE CORNER',
    width: w, height: h, tiles,
    entities: [
      { x: 7, y: 2, type: 'item', active: true, data: { itemId: 'photo_1', name: 'Fragmento Foto 1', icon: '📷' } },
      { x: 14, y: 7, type: 'item', active: true, data: { itemId: 'photo_2', name: 'Fragmento Foto 2', icon: '📷' } },
      { x: 5, y: 13, type: 'item', active: true, data: { itemId: 'photo_3', name: 'Fragmento Foto 3', icon: '📷' } },
      { x: 16, y: 3, type: 'hide', active: true },
      { x: 3, y: 8, type: 'hide', active: true },
      { x: 11, y: 13, type: 'hide', active: true },
      { x: 18, y: 1, type: 'exit', active: true, data: { targetLevel: 3, targetX: 1, targetY: 8 } },
      { x: 10, y: 4, type: 'scare', active: true, data: { triggered: false } },
      { x: 6, y: 8, type: 'scare', active: true, data: { triggered: false } },
      { x: 8, y: 7, type: 'note', active: true, data: { text: 'Las cupcakes tienen... ¿dientes? ¡No mires mucho tiempo!' } },
      { x: 15, y: 12, type: 'enemy', active: true, data: { speed: 0.5, range: 5 } },
    ],
    exits: [{ x: 18, y: 1, targetLevel: 3, targetX: 1, targetY: 8 }],
    objectives: ['Encontrar los 3 fragmentos de la fotografía', 'Explorar la pastelería abandonada'],
    bgColor: '#1a0d30',
    darkLevel: 0.65,
  };
}

function createLevel3(): Level {
  const w = 24, h = 20;
  const tiles: number[][] = [];
  for (let y = 0; y < h; y++) {
    tiles[y] = [];
    for (let x = 0; x < w; x++) {
      if (y === 0 || y === h - 1 || x === 0 || x === w - 1) tiles[y][x] = TILE.TREE;
      else if (Math.random() < 0.12 && !(x < 5 && y < 5) && !(x > 17 && y > 14)) tiles[y][x] = TILE.TREE;
      else if ((x === 11 || x === 12) && y > 2 && y < h - 2) tiles[y][x] = TILE.PATH;
      else if (y === 10 && x > 3 && x < 20) tiles[y][x] = TILE.PATH;
      else if (x === 5 && y > 4 && y < 9) tiles[y][x] = TILE.WATER;
      else if (x === 6 && y > 4 && y < 9) tiles[y][x] = TILE.WATER;
      else if (x === 18 && y === 5) tiles[y][x] = TILE.TREE;
      else tiles[y][x] = TILE.GRASS;
    }
  }
  // Cabin
  for (let y = 15; y < 18; y++) for (let x = 18; x < 22; x++) {
    if (y === 15 || y === 17 || x === 18 || x === 21) tiles[y][x] = TILE.WALL;
    else tiles[y][x] = TILE.FLOOR;
  }
  tiles[17][19] = TILE.DOOR;
  tiles[17][20] = TILE.DOOR;

  return {
    id: 3,
    name: 'BOSQUE EVERFREE',
    width: w, height: h, tiles,
    entities: [
      { x: 19, y: 16, type: 'item', active: true, data: { itemId: 'key_castle', name: 'Llave del Castillo', icon: '🗝️' } },
      { x: 9, y: 5, type: 'hide', active: true },
      { x: 15, y: 12, type: 'hide', active: true },
      { x: 4, y: 15, type: 'hide', active: true },
      { x: 22, y: 1, type: 'exit', active: true, data: { targetLevel: 4, targetX: 1, targetY: 1 } },
      { x: 13, y: 7, type: 'chaser', active: true, data: { speed: 1.0, active: false } },
      { x: 8, y: 14, type: 'scare', active: true, data: { triggered: false } },
      { x: 16, y: 4, type: 'scare', active: true, data: { triggered: false } },
      { x: 11, y: 10, type: 'note', active: true, data: { text: 'No mires atrás. Ella está justo detrás de ti.' } },
    ],
    exits: [{ x: 22, y: 1, targetLevel: 4, targetX: 1, targetY: 1 }],
    objectives: ['Encontrar la cabaña', 'Conseguir la llave', '¡Escapar de la criatura!'],
    bgColor: '#050f05',
    darkLevel: 0.85,
  };
}

function createLevel4(): Level {
  const w = 22, h = 18;
  const tiles: number[][] = [];
  for (let y = 0; y < h; y++) {
    tiles[y] = [];
    for (let x = 0; x < w; x++) {
      if (y === 0 || y === h - 1 || x === 0 || x === w - 1) tiles[y][x] = TILE.WALL;
      // Library shelves
      else if (y === 4 && x > 2 && x < 19) {
        tiles[y][x] = (x === 5 || x === 10 || x === 15) ? TILE.DOOR : TILE.BOOKSHELF;
      }
      else if (y === 9 && x > 2 && x < 19) {
        tiles[y][x] = (x === 4 || x === 9 || x === 14 || x === 18) ? TILE.DOOR : TILE.BOOKSHELF;
      }
      else if (y === 13 && x > 3 && x < 18) {
        tiles[y][x] = (x === 7 || x === 12) ? TILE.DOOR : TILE.BOOKSHELF;
      }
      // Tables with documents
      else if (y === 2 && x === 10) tiles[y][x] = TILE.TABLE;
      else if (y === 6 && x === 7) tiles[y][x] = TILE.TABLE;
      else if (y === 6 && x === 14) tiles[y][x] = TILE.CANDLES;
      else if (y === 11 && x === 5) tiles[y][x] = TILE.TABLE;
      else if (y === 11 && x === 16) tiles[y][x] = TILE.TABLE;
      else if (y === 15 && x === 10) tiles[y][x] = TILE.CARPET;
      else if (y === 7 && x === 3) tiles[y][x] = TILE.CARPET;
      else tiles[y][x] = TILE.FLOOR;
    }
  }

  return {
    id: 4,
    name: 'CASTILLO DE TWILIGHT',
    width: w, height: h, tiles,
    entities: [
      { x: 10, y: 2, type: 'item', active: true, data: { itemId: 'diary', name: 'Diario de Twilight', icon: '📖' } },
      { x: 7, y: 6, type: 'note', active: true, data: { text: 'Ellas no se fueron... ellas CAMBIARON. La fábrica las transformó.' } },
      { x: 16, y: 11, type: 'note', active: true, data: { text: 'Si encuentras la fábrica, activa las máquinas. Es la única forma de detenerla.' } },
      { x: 5, y: 11, type: 'note', active: true, data: { text: 'Pinkie... ya no es Pinkie. Su sonrisa no es natural.' } },
      { x: 3, y: 2, type: 'hide', active: true },
      { x: 18, y: 6, type: 'hide', active: true },
      { x: 8, y: 15, type: 'hide', active: true },
      { x: 20, y: 16, type: 'exit', active: true, data: { targetLevel: 5, targetX: 1, targetY: 1 } },
      { x: 14, y: 7, type: 'scare', active: true, data: { triggered: false } },
      { x: 6, y: 12, type: 'scare', active: true, data: { triggered: false } },
      { x: 11, y: 6, type: 'item', active: true, data: { itemId: 'crystal', name: 'Cristal Mágico', icon: '💎' } },
    ],
    exits: [{ x: 20, y: 16, targetLevel: 5, targetX: 1, targetY: 1 }],
    objectives: ['Descubrir qué ocurrió durante la fiesta', 'Leer el diario de Twilight'],
    bgColor: '#120830',
    darkLevel: 0.6,
  };
}

function createLevel5(): Level {
  const w = 26, h = 20;
  const tiles: number[][] = [];
  for (let y = 0; y < h; y++) {
    tiles[y] = [];
    for (let x = 0; x < w; x++) {
      if (y === 0 || y === h - 1 || x === 0 || x === w - 1) tiles[y][x] = TILE.WALL;
      // Machine rows
      else if (y === 5 && x > 2 && x < 23) {
        tiles[y][x] = (x === 5 || x === 11 || x === 17 || x === 22) ? TILE.DOOR : TILE.MACHINE;
      }
      else if (y === 10 && x > 2 && x < 23) {
        tiles[y][x] = (x === 4 || x === 9 || x === 15 || x === 20) ? TILE.DOOR : TILE.MACHINE;
      }
      else if (y === 15 && x > 2 && x < 23) {
        tiles[y][x] = (x === 6 || x === 12 || x === 18) ? TILE.DOOR : TILE.MACHINE;
      }
      // Vertical walls
      else if ((x === 8 || x === 16) && y > 0 && y < h - 1) {
        tiles[y][x] = (y === 3 || y === 7 || y === 12 || y === 17) ? TILE.PATH : TILE.WALL;
      }
      else tiles[y][x] = TILE.FLOOR;
    }
  }

  return {
    id: 5,
    name: 'FÁBRICA DE FIESTAS',
    width: w, height: h, tiles,
    entities: [
      { x: 5, y: 3, type: 'switch', active: true, data: { activated: false, id: 'sw1' } },
      { x: 13, y: 8, type: 'switch', active: true, data: { activated: false, id: 'sw2' } },
      { x: 21, y: 17, type: 'switch', active: true, data: { activated: false, id: 'sw3' } },
      { x: 3, y: 7, type: 'hide', active: true },
      { x: 22, y: 3, type: 'hide', active: true },
      { x: 10, y: 13, type: 'hide', active: true },
      { x: 18, y: 12, type: 'hide', active: true },
      { x: 24, y: 1, type: 'exit', active: true, data: { targetLevel: 6, targetX: 1, targetY: 1 } },
      { x: 13, y: 3, type: 'pinkie_chase', active: true, data: { speed: 1.3, active: false } },
      { x: 7, y: 16, type: 'scare', active: true, data: { triggered: false } },
      { x: 19, y: 7, type: 'scare', active: true, data: { triggered: false } },
      { x: 4, y: 12, type: 'note', active: true, data: { text: 'Las máquinas crean la fiesta eterna. Pinkie es parte de ellas ahora.' } },
    ],
    exits: [{ x: 24, y: 1, targetLevel: 6, targetX: 1, targetY: 1 }],
    objectives: ['Activar los 3 interruptores', '¡Escapar de Pinkie Pie!'],
    bgColor: '#1a0510',
    darkLevel: 0.7,
  };
}

function createLevel6(): Level {
  const w = 22, h = 18;
  const tiles: number[][] = [];
  for (let y = 0; y < h; y++) {
    tiles[y] = [];
    for (let x = 0; x < w; x++) {
      if (y === 0 || y === h - 1 || x === 0 || x === w - 1) tiles[y][x] = TILE.WALL;
      // Party tables
      else if (y === 4 && x > 3 && x < 18) {
        tiles[y][x] = (x === 6 || x === 10 || x === 14) ? TILE.FLOOR : TILE.TABLE;
      }
      else if (y === 8 && x > 2 && x < 19) {
        tiles[y][x] = (x === 5 || x === 9 || x === 13 || x === 17) ? TILE.FLOOR : TILE.TABLE;
      }
      else if (y === 12 && x > 4 && x < 17) {
        tiles[y][x] = (x === 7 || x === 11 || x === 15) ? TILE.FLOOR : TILE.TABLE;
      }
      // Decorations
      else if (y === 2 && x === 5) tiles[y][x] = TILE.BALLOON;
      else if (y === 2 && x === 16) tiles[y][x] = TILE.BALLOON;
      else if (y === 6 && x === 3) tiles[y][x] = TILE.BALLOON;
      else if (y === 6 && x === 18) tiles[y][x] = TILE.CANDLES;
      else if (y === 10 && x === 4) tiles[y][x] = TILE.CANDLES;
      else if (y === 10 && x === 17) tiles[y][x] = TILE.BALLOON;
      else if (y === 14 && x === 8) tiles[y][x] = TILE.BALLOON;
      else if (y === 14 && x === 13) tiles[y][x] = TILE.CANDLES;
      else if (y === 7 && x === 11) tiles[y][x] = TILE.CARPET;
      else if (y === 11 && x === 7) tiles[y][x] = TILE.CARPET;
      else tiles[y][x] = TILE.FLOOR;
    }
  }

  return {
    id: 6,
    name: 'LA ÚLTIMA FIESTA',
    width: w, height: h, tiles,
    entities: [
      { x: 11, y: 9, type: 'final_boss', active: true, data: { phase: 1, defeated: false } },
      { x: 5, y: 2, type: 'item', active: true, data: { itemId: 'truth', name: 'La Verdad', icon: '💫' } },
      { x: 17, y: 15, type: 'hide', active: true },
      { x: 3, y: 15, type: 'hide', active: true },
      { x: 19, y: 15, type: 'exit', active: true, data: { targetLevel: 7, targetX: 1, targetY: 1 } },
      { x: 8, y: 6, type: 'scare', active: true, data: { triggered: false } },
      { x: 14, y: 13, type: 'scare', active: true, data: { triggered: false } },
    ],
    exits: [{ x: 19, y: 15, targetLevel: 7, targetX: 1, targetY: 1 }],
    objectives: ['Enfrentar a Pinkie Pie', 'Descubrir la verdad', 'Escapar de la fiesta'],
    bgColor: '#100020',
    darkLevel: 0.5,
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

// ============ PIXEL ART DRAWING ============
export function drawPonySprite(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, maneColor: string, dir: Direction = 'down', frame: number = 0) {
  const s = 2;
  ctx.save();
  ctx.translate(x, y);

  // Body
  ctx.fillStyle = color;
  ctx.fillRect(4 * s, 5 * s, 8 * s, 7 * s);
  ctx.fillRect(3 * s, 6 * s, 10 * s, 5 * s);

  // Head
  ctx.fillRect(5 * s, 2 * s, 6 * s, 5 * s);
  ctx.fillRect(4 * s, 3 * s, 8 * s, 3 * s);

  // Ears
  ctx.fillRect(5 * s, 1 * s, 2 * s, 2 * s);
  ctx.fillRect(9 * s, 1 * s, 2 * s, 2 * s);

  // Mane
  ctx.fillStyle = maneColor;
  ctx.fillRect(4 * s, 1 * s, 8 * s, 2 * s);
  ctx.fillRect(3 * s, 2 * s, 2 * s, 4 * s);
  if (frame % 2 === 0) {
    ctx.fillRect(11 * s, 2 * s, 2 * s, 3 * s);
  } else {
    ctx.fillRect(11 * s, 3 * s, 2 * s, 2 * s);
  }

  // Eyes
  ctx.fillStyle = '#FFFFFF';
  if (dir === 'down' || dir === 'left') {
    ctx.fillRect(6 * s, 4 * s, 2 * s, 2 * s);
    ctx.fillStyle = '#4B0082';
    ctx.fillRect(6 * s, 4 * s, 1 * s, 2 * s);
  }
  if (dir === 'down' || dir === 'right') {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(9 * s, 4 * s, 2 * s, 2 * s);
    ctx.fillStyle = '#4B0082';
    ctx.fillRect(10 * s, 4 * s, 1 * s, 2 * s);
  }
  if (dir === 'up') {
    // No eyes visible from behind
  }

  // Legs (animated)
  ctx.fillStyle = color;
  const legOffset = frame % 2 === 0 ? 0 : 1;
  ctx.fillRect(4 * s, 12 * s, 2 * s, (3 + legOffset) * s);
  ctx.fillRect(10 * s, 12 * s, 2 * s, (4 - legOffset) * s);
  ctx.fillRect(6 * s, 12 * s, 2 * s, (4 - legOffset) * s);
  ctx.fillRect(8 * s, 12 * s, 2 * s, (3 + legOffset) * s);

  // Hooves
  ctx.fillStyle = '#333';
  ctx.fillRect(4 * s, (15 + legOffset) * s, 2 * s, 1 * s);
  ctx.fillRect(10 * s, (15 - legOffset + 1) * s, 2 * s, 1 * s);

  // Tail
  ctx.fillStyle = maneColor;
  ctx.fillRect(12 * s, 7 * s, 2 * s, 4 * s);
  ctx.fillRect(13 * s, 8 * s, 2 * s, 3 * s);

  // Cutie mark (small)
  ctx.fillStyle = maneColor;
  ctx.fillRect(8 * s, 8 * s, 2 * s, 2 * s);

  ctx.restore();
}

export function drawScaryPony(ctx: CanvasRenderingContext2D, x: number, y: number, frame: number) {
  const s = 2;
  ctx.save();
  ctx.translate(x, y);

  // Dark body
  ctx.fillStyle = '#1a0a1a';
  ctx.fillRect(3 * s, 4 * s, 10 * s, 8 * s);
  ctx.fillRect(2 * s, 5 * s, 12 * s, 6 * s);

  // Head
  ctx.fillRect(4 * s, 1 * s, 8 * s, 5 * s);
  ctx.fillRect(3 * s, 2 * s, 10 * s, 3 * s);

  // Glowing red eyes
  const eyeGlow = frame % 6 < 3 ? '#FF0000' : '#CC0000';
  ctx.fillStyle = eyeGlow;
  ctx.fillRect(5 * s, 3 * s, 2 * s, 2 * s);
  ctx.fillRect(9 * s, 3 * s, 2 * s, 2 * s);
  // Eye glow effect
  ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
  ctx.fillRect(4 * s, 2 * s, 4 * s, 4 * s);
  ctx.fillRect(8 * s, 2 * s, 4 * s, 4 * s);

  // Creepy wide smile
  ctx.fillStyle = '#FF0000';
  ctx.fillRect(5 * s, 5 * s, 6 * s, 1 * s);
  ctx.fillRect(4 * s, 5 * s, 1 * s, 1 * s);
  ctx.fillRect(11 * s, 5 * s, 1 * s, 1 * s);
  // Teeth
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(6 * s, 5 * s, 1 * s, 1 * s);
  ctx.fillRect(8 * s, 5 * s, 1 * s, 1 * s);
  ctx.fillRect(10 * s, 5 * s, 1 * s, 1 * s);

  // Dark mane
  ctx.fillStyle = '#0a000a';
  ctx.fillRect(3 * s, 0, 10 * s, 2 * s);
  ctx.fillRect(2 * s, 1 * s, 2 * s, 6 * s);
  ctx.fillRect(12 * s, 1 * s, 2 * s, 6 * s);

  // Legs
  ctx.fillStyle = '#1a0a1a';
  ctx.fillRect(4 * s, 12 * s, 2 * s, 4 * s);
  ctx.fillRect(10 * s, 12 * s, 2 * s, 4 * s);
  ctx.fillRect(6 * s, 12 * s, 2 * s, 3 * s);
  ctx.fillRect(8 * s, 12 * s, 2 * s, 3 * s);

  // Shadow underneath
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(2 * s, 15 * s, 12 * s, 1 * s);

  ctx.restore();
}

export function drawBossPony(ctx: CanvasRenderingContext2D, x: number, y: number, frame: number, phase: number) {
  const s = 2;
  ctx.save();
  ctx.translate(x, y);

  // Larger, more imposing
  const scale = phase === 2 ? 1.2 : 1;
  ctx.scale(scale, scale);

  // Body - darker
  ctx.fillStyle = phase === 2 ? '#0a000a' : '#2a0a2a';
  ctx.fillRect(2 * s, 4 * s, 12 * s, 9 * s);
  ctx.fillRect(1 * s, 5 * s, 14 * s, 7 * s);

  // Head
  ctx.fillRect(3 * s, 0, 10 * s, 6 * s);
  ctx.fillRect(2 * s, 1 * s, 12 * s, 4 * s);

  // Eyes - bigger, more menacing
  ctx.fillStyle = phase === 2 ? '#FF0000' : '#CC0000';
  ctx.fillRect(4 * s, 2 * s, 3 * s, 3 * s);
  ctx.fillRect(9 * s, 2 * s, 3 * s, 3 * s);

  // Pupils
  ctx.fillStyle = '#000';
  ctx.fillRect(5 * s, 3 * s, 1 * s, 1 * s);
  ctx.fillRect(10 * s, 3 * s, 1 * s, 1 * s);

  // Wide grin
  ctx.fillStyle = '#FF0000';
  ctx.fillRect(4 * s, 5 * s, 8 * s, 2 * s);
  ctx.fillStyle = '#FFF';
  for (let i = 0; i < 4; i++) {
    ctx.fillRect((5 + i * 2) * s, 5 * s, 1 * s, 1 * s);
  }

  // Mane - wild
  ctx.fillStyle = '#FF1493';
  ctx.fillRect(2 * s, -1 * s, 12 * s, 3 * s);
  ctx.fillRect(0, 0, 3 * s, 7 * s);
  ctx.fillRect(13 * s, 0, 3 * s, 7 * s);
  if (frame % 4 < 2) {
    ctx.fillRect(1 * s, -2 * s, 4 * s, 2 * s);
    ctx.fillRect(11 * s, -2 * s, 4 * s, 2 * s);
  }

  // Legs
  ctx.fillStyle = phase === 2 ? '#0a000a' : '#2a0a2a';
  ctx.fillRect(3 * s, 13 * s, 3 * s, 4 * s);
  ctx.fillRect(10 * s, 13 * s, 3 * s, 4 * s);

  // Aura effect in phase 2
  if (phase === 2 && frame % 8 < 4) {
    ctx.fillStyle = 'rgba(255, 0, 100, 0.2)';
    ctx.fillRect(-2 * s, -2 * s, 20 * s, 20 * s);
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
      ctx.fillRect(x + 2, y + 2, 4, 4);
      ctx.fillRect(x + 18, y + 22, 4, 4);
      ctx.fillRect(x + 10, y + 14, 3, 3);
      break;
    case TILE.DARK_FLOOR:
      ctx.fillStyle = '#120825';
      ctx.fillRect(x, y, s, s);
      ctx.fillStyle = '#1a0e30';
      ctx.fillRect(x + 6, y + 8, 3, 3);
      ctx.fillRect(x + 20, y + 20, 2, 2);
      break;
    case TILE.WALL:
      ctx.fillStyle = '#1a1030';
      ctx.fillRect(x, y, s, s);
      ctx.fillStyle = '#2a1a40';
      ctx.fillRect(x + 2, y + 2, s - 4, s - 4);
      ctx.fillStyle = '#120820';
      ctx.fillRect(x, y, s, 2);
      ctx.fillRect(x, y + s - 2, s, 2);
      ctx.fillRect(x, y, 2, s);
      ctx.fillRect(x + s - 2, y, 2, s);
      // Brick pattern
      ctx.fillStyle = '#1a1030';
      ctx.fillRect(x + s/2, y + 2, 1, s/2 - 2);
      ctx.fillRect(x + 2, y + s/2, s - 4, 1);
      break;
    case TILE.DOOR:
      ctx.fillStyle = '#3a2010';
      ctx.fillRect(x, y, s, s);
      ctx.fillStyle = '#6a4020';
      ctx.fillRect(x + 4, y + 2, s - 8, s - 4);
      ctx.fillStyle = '#8a5a30';
      ctx.fillRect(x + 6, y + 4, s - 12, s - 8);
      // Door knob
      ctx.fillStyle = '#FFD700';
      ctx.fillRect(x + s - 10, y + s / 2 - 2, 4, 4);
      ctx.fillStyle = '#FFF8DC';
      ctx.fillRect(x + s - 9, y + s / 2 - 1, 2, 2);
      break;
    case TILE.GRASS:
      ctx.fillStyle = '#081808';
      ctx.fillRect(x, y, s, s);
      ctx.fillStyle = '#102810';
      for (let i = 0; i < 5; i++) {
        const gx = x + (i * 7) % s;
        const gy = y + 18 + (i * 3) % 8;
        ctx.fillRect(gx, gy, 2, 6);
        ctx.fillRect(gx + 1, gy - 2, 1, 4);
      }
      break;
    case TILE.TREE:
      ctx.fillStyle = '#050f05';
      ctx.fillRect(x, y, s, s);
      // Trunk
      ctx.fillStyle = '#2a1a0a';
      ctx.fillRect(x + 12, y + 16, 8, 16);
      ctx.fillStyle = '#3a2a1a';
      ctx.fillRect(x + 14, y + 18, 4, 14);
      // Canopy
      ctx.fillStyle = '#0a2a0a';
      ctx.fillRect(x + 2, y + 2, 28, 18);
      ctx.fillStyle = '#0d350d';
      ctx.fillRect(x + 6, y + 4, 20, 12);
      ctx.fillStyle = '#082008';
      ctx.fillRect(x + 10, y + 6, 12, 8);
      break;
    case TILE.WATER:
      ctx.fillStyle = '#050520';
      ctx.fillRect(x, y, s, s);
      const waterFrame = frame % 8;
      ctx.fillStyle = waterFrame < 4 ? '#0a0a40' : '#080830';
      ctx.fillRect(x + 2, y + 6, 14, 4);
      ctx.fillRect(x + 10, y + 18, 14, 4);
      ctx.fillStyle = '#1010aa';
      ctx.fillRect(x + 4 + waterFrame, y + 8, 3, 1);
      break;
    case TILE.PATH:
      ctx.fillStyle = '#2a1a0a';
      ctx.fillRect(x, y, s, s);
      ctx.fillStyle = '#3a2a1a';
      ctx.fillRect(x + 2, y + 2, 8, 8);
      ctx.fillRect(x + 16, y + 16, 10, 10);
      ctx.fillStyle = '#4a3a2a';
      ctx.fillRect(x + 4, y + 4, 4, 4);
      break;
    case TILE.TABLE:
      ctx.fillStyle = '#2d1f45';
      ctx.fillRect(x, y, s, s);
      ctx.fillStyle = '#5a3a1a';
      ctx.fillRect(x + 4, y + 10, s - 8, s - 14);
      ctx.fillStyle = '#7a5a2a';
      ctx.fillRect(x + 2, y + 8, s - 4, 4);
      ctx.fillStyle = '#6a4a2a';
      ctx.fillRect(x + 6, y + 12, 2, s - 14);
      ctx.fillRect(x + s - 8, y + 12, 2, s - 14);
      break;
    case TILE.BOOKSHELF:
      ctx.fillStyle = '#2a1a0a';
      ctx.fillRect(x, y, s, s);
      ctx.fillStyle = '#4a2a0a';
      ctx.fillRect(x + 2, y + 2, s - 4, s - 4);
      const bookColors = ['#8B0000', '#00008B', '#006400', '#8B8B00', '#4B0082'];
      for (let i = 0; i < 5; i++) {
        ctx.fillStyle = bookColors[i];
        ctx.fillRect(x + 3 + i * 5, y + 3, 4, s - 6);
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(x + 4 + i * 5, y + 10, 2, 2);
      }
      break;
    case TILE.MACHINE:
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(x, y, s, s);
      ctx.fillStyle = '#3a3a3a';
      ctx.fillRect(x + 2, y + 2, s - 4, s - 4);
      ctx.fillStyle = '#2a2a2a';
      ctx.fillRect(x + 4, y + 4, s - 8, s - 8);
      // Lights
      ctx.fillStyle = frame % 8 < 4 ? '#FF0000' : '#00FF00';
      ctx.fillRect(x + 6, y + 6, 4, 4);
      ctx.fillStyle = frame % 6 < 3 ? '#0000FF' : '#FFFF00';
      ctx.fillRect(x + 18, y + 6, 4, 4);
      // Pipes
      ctx.fillStyle = '#555';
      ctx.fillRect(x + 12, y + 2, 3, s - 4);
      break;
    case TILE.BALLOON:
      ctx.fillStyle = '#2d1f45';
      ctx.fillRect(x, y, s, s);
      const balloonBob = Math.sin(frame * 0.3) * 2;
      ctx.fillStyle = '#FF69B4';
      ctx.fillRect(x + 10, y + 4 + balloonBob, 12, 14);
      ctx.fillStyle = '#FF1493';
      ctx.fillRect(x + 12, y + 6 + balloonBob, 8, 10);
      ctx.fillStyle = '#FFB6C1';
      ctx.fillRect(x + 14, y + 8 + balloonBob, 3, 3);
      // String
      ctx.fillStyle = '#888';
      ctx.fillRect(x + 15, y + 18 + balloonBob, 1, 12 - balloonBob);
      break;
    case TILE.CANDLES:
      ctx.fillStyle = '#2d1f45';
      ctx.fillRect(x, y, s, s);
      // Candle
      ctx.fillStyle = '#FFFACD';
      ctx.fillRect(x + 13, y + 14, 6, 14);
      ctx.fillStyle = '#FFE4B5';
      ctx.fillRect(x + 14, y + 16, 4, 12);
      // Flame
      const flicker = frame % 6 < 3;
      ctx.fillStyle = flicker ? '#FFD700' : '#FFA500';
      ctx.fillRect(x + 14, y + 10, 4, 4);
      ctx.fillStyle = '#FF4500';
      ctx.fillRect(x + 15, y + 8, 2, 3);
      // Glow
      ctx.fillStyle = 'rgba(255, 200, 0, 0.1)';
      ctx.fillRect(x + 4, y + 4, 24, 24);
      break;
    case TILE.CARPET:
      ctx.fillStyle = '#2d1f45';
      ctx.fillRect(x, y, s, s);
      ctx.fillStyle = '#4a1a3a';
      ctx.fillRect(x + 2, y + 2, s - 4, s - 4);
      ctx.fillStyle = '#6a2a4a';
      ctx.fillRect(x + 4, y + 4, s - 8, s - 8);
      ctx.fillStyle = '#8a3a5a';
      ctx.fillRect(x + 8, y + 8, s - 16, s - 16);
      break;
    case TILE.CRACK:
      ctx.fillStyle = '#120825';
      ctx.fillRect(x, y, s, s);
      ctx.fillStyle = '#000';
      ctx.fillRect(x + 8, y + 4, 2, 8);
      ctx.fillRect(x + 10, y + 10, 2, 6);
      ctx.fillRect(x + 6, y + 12, 4, 2);
      ctx.fillRect(x + 12, y + 14, 4, 2);
      break;
    default:
      ctx.fillStyle = '#0a0515';
      ctx.fillRect(x, y, s, s);
  }
}

// ============ GAME ENGINE CLASS ============
export class GameEngine {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  state: GameState = 'menu';
  currentLevel: Level;
  playerX: number = 3;
  playerY: number = 3;
  playerDir: Direction = 'down';
  playerFrame: number = 0;
  playerMoving: boolean = false;
  characterId: string = 'pinkie';
  inventory: InventoryItem[] = [];
  dialogText: string = '';
  showDialog: boolean = false;
  dialogTimer: number = 0;
  frame: number = 0;
  keys: Set<string> = new Set();
  lastMove: number = 0;
  moveDelay: number = 150;
  isRunning: boolean = false;
  isHiding: boolean = false;
  chaserActive: boolean = false;
  chaserX: number = 0;
  chaserY: number = 0;
  chaserSpeed: number = 1;
  pinkieChaseActive: boolean = false;
  pinkieChaseX: number = 0;
  pinkieChaseY: number = 0;
  bossActive: boolean = false;
  bossX: number = 0;
  bossY: number = 0;
  bossPhase: number = 1;
  scareTriggered: Set<string> = new Set();
  switchesActivated: number = 0;
  photosFound: number = 0;
  gameComplete: boolean = false;
  stepCounter: number = 0;
  onStateChange?: (state: GameState) => void;
  onDialog?: (text: string) => void;
  onInventoryChange?: (items: InventoryItem[]) => void;
  fogParticles: { x: number; y: number; vx: number; vy: number; alpha: number; size: number }[] = [];
  screenShake: number = 0;
  flashTimer: number = 0;
  flashColor: string = 'rgba(255, 0, 0, 0.5)';
  ambientTimer: number = 0;
  heartbeatTimer: number = 0;
  dangerLevel: number = 0;
  messages: { text: string; timer: number }[] = [];
  levelIntroShown: boolean = false;

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
    for (let i = 0; i < 25; i++) {
      this.fogParticles.push({
        x: Math.random() * CANVAS_WIDTH,
        y: Math.random() * CANVAS_HEIGHT,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.2,
        alpha: Math.random() * 0.2 + 0.05,
        size: 20 + Math.random() * 40,
      });
    }
  }

  setupInput() {
    const keyHandler = (e: KeyboardEvent, down: boolean) => {
      const key = e.key.toLowerCase();
      if (down) {
        this.keys.add(key);
        if (key === 'shift') this.isRunning = true;
        if (key === 'e' && down) this.interact();
        if (key === 'h' && down) this.toggleHide();
        if (key === 'i' && down) this.toggleInventory();
      } else {
        this.keys.delete(key);
        if (key === 'shift') this.isRunning = false;
      }
    };
    window.addEventListener('keydown', (e) => keyHandler(e, true));
    window.addEventListener('keyup', (e) => keyHandler(e, false));
  }

  setDirection(dir: Direction) {
    this.keys.clear();
    switch (dir) {
      case 'up': this.keys.add('w'); break;
      case 'down': this.keys.add('s'); break;
      case 'left': this.keys.add('a'); break;
      case 'right': this.keys.add('d'); break;
    }
  }

  clearDirection() {
    this.keys.clear();
  }

  setRunning(running: boolean) {
    this.isRunning = running;
  }

  interact() {
    if (this.state !== 'playing') return;
    if (this.isHiding) return;

    const checkX = this.playerX + (this.playerDir === 'right' ? 1 : this.playerDir === 'left' ? -1 : 0);
    const checkY = this.playerY + (this.playerDir === 'down' ? 1 : this.playerDir === 'up' ? -1 : 0);

    // Check entities at target position
    for (const entity of this.currentLevel.entities) {
      if (!entity.active) continue;
      if ((entity.x === checkX && entity.y === checkY) || (entity.x === this.playerX && entity.y === this.playerY)) {
        this.handleEntityInteraction(entity);
        return;
      }
    }

    // Check for adjacent exits
    for (const exit of this.currentLevel.exits) {
      if ((exit.x === checkX && exit.y === checkY) || (Math.abs(exit.x - this.playerX) <= 1 && Math.abs(exit.y - this.playerY) <= 1)) {
        this.transitionToLevel(exit.targetLevel, exit.targetX, exit.targetY);
        return;
      }
    }

    // Check door tile
    const tile = this.currentLevel.tiles[this.playerY]?.[this.playerX];
    const facingTile = this.currentLevel.tiles[checkY]?.[checkX];
    if (facingTile === TILE.DOOR) {
      playDoor();
    }
  }

  handleEntityInteraction(entity: Entity) {
    switch (entity.type) {
      case 'item':
        if (entity.data) {
          this.inventory.push({
            id: entity.data.itemId,
            name: entity.data.name,
            icon: entity.data.icon,
            description: entity.data.name,
          });
          if (entity.data.itemId?.startsWith('photo_')) this.photosFound++;
          entity.active = false;
          playPickup();
          this.addMessage(`¡Obtuviste: ${entity.data.name}!`);

          // Special items trigger story
          if (entity.data.itemId === 'diary') {
            setTimeout(() => this.addMessage('Las otras ponis... fueron absorbidas por la fiesta.'), 2000);
          }
          if (entity.data.itemId === 'truth') {
            setTimeout(() => this.addMessage('La verdad: Pinkie Pie quería amigos para siempre. Literalmente.'), 2000);
            this.bossPhase = 2;
            this.dangerLevel = 3;
          }
          this.onInventoryChange?.(this.inventory);
        }
        break;
      case 'note':
        if (entity.data) {
          this.addMessage(entity.data.text);
          entity.active = false;
        }
        break;
      case 'switch':
        if (entity.data && !entity.data.activated) {
          entity.data.activated = true;
          entity.active = false;
          this.switchesActivated++;
          playPickup();
          this.addMessage(`⚡ Interruptor activado (${this.switchesActivated}/3)`);
          if (this.switchesActivated >= 3) {
            setTimeout(() => this.addMessage('¡Todas las máquinas activadas! ¡La salida está abierta!'), 1500);
            this.screenShake = 20;
          }
        }
        break;
      case 'hide':
        this.toggleHide();
        break;
      case 'scare':
        if (entity.data && !entity.data.triggered) {
          entity.data.triggered = true;
          this.triggerScare();
        }
        break;
      case 'final_boss':
        if (entity.data && !entity.data.defeated) {
          if (this.inventory.find(i => i.id === 'truth')) {
            entity.data.defeated = true;
            this.addMessage('Has descubierto la verdad. Pinkie se desvanece...');
            this.screenShake = 30;
            this.flashTimer = 30;
            this.flashColor = 'rgba(255, 105, 180, 0.5)';
            this.bossActive = false;
            setTimeout(() => this.addMessage('La salida está abierta. ¡Corre!'), 3000);
          } else {
            this.addMessage('Pinkie Pie te bloquea el paso. Necesitas descubrir la verdad primero.');
            this.bossActive = true;
            this.bossX = entity.x;
            this.bossY = entity.y;
          }
        }
        break;
    }
  }

  triggerScare() {
    playScare();
    this.screenShake = 12;
    this.flashTimer = 10;
    this.flashColor = 'rgba(255, 0, 0, 0.4)';
    const scares = [
      '¡Algo se movió en la oscuridad!',
      'Una risa distorsionada resuena...',
      '¿Eso fue... una sombra con ojos rojos?',
      'El aire se vuelve helado...',
      'Escuchas pasos... pero no hay nadie.',
      '¡Una pony te observa desde el rincón!',
      'Las paredes parecen... respirar.',
      '¿Por qué los globos se mueven solos?',
    ];
    this.addMessage(scares[Math.floor(Math.random() * scares.length)]);
  }

  addMessage(text: string) {
    this.dialogText = text;
    this.showDialog = true;
    this.dialogTimer = 180; // frames
    this.onDialog?.(text);
  }

  toggleHide() {
    const nearbyHide = this.currentLevel.entities.find(
      e => e.type === 'hide' && e.active && Math.abs(e.x - this.playerX) <= 1 && Math.abs(e.y - this.playerY) <= 1
    );
    if (nearbyHide) {
      this.isHiding = !this.isHiding;
      if (this.isHiding) {
        this.addMessage('🫣 Te escondes... (presiona H para salir)');
      } else {
        this.addMessage('Sales de tu escondite.');
      }
    }
  }

  toggleInventory() {
    if (this.state === 'playing') {
      this.state = 'inventory';
    } else if (this.state === 'inventory') {
      this.state = 'playing';
    }
    this.onStateChange?.(this.state);
  }

  transitionToLevel(levelId: number, targetX: number, targetY: number) {
    if (levelId === 7) {
      this.state = 'ending';
      this.gameComplete = true;
      this.onStateChange?.('ending');
      stopAmbientLoop();
      this.saveGame();
      return;
    }

    // Check requirements
    if (this.currentLevel.id === 1) {
      if (!this.inventory.find(i => i.id === 'key_sugarcube')) {
        this.addMessage('Necesitas la llave de Sugarcube Corner.');
        return;
      }
    }
    if (this.currentLevel.id === 3) {
      if (!this.inventory.find(i => i.id === 'key_castle')) {
        this.addMessage('Necesitas la llave del Castillo.');
        return;
      }
    }
    if (this.currentLevel.id === 5 && this.switchesActivated < 3) {
      this.addMessage('Necesitas activar los 3 interruptores primero.');
      return;
    }

    playDoor();
    this.currentLevel = getLevel(levelId);
    this.playerX = targetX;
    this.playerY = targetY;
    this.chaserActive = false;
    this.pinkieChaseActive = false;
    this.bossActive = false;
    this.isHiding = false;
    this.levelIntroShown = false;
    this.initFog();
    this.saveGame();

    const levelNames: Record<number, string> = {
      1: '📍 Ponyville Abandonado',
      2: '📍 Sugarcube Corner',
      3: '📍 Bosque Everfree',
      4: '📍 Castillo de Twilight',
      5: '📍 Fábrica de Fiestas',
      6: '📍 La Última Fiesta',
    };
    this.addMessage(levelNames[levelId] || 'Nivel desconocido');

    // Level-specific events
    setTimeout(() => {
      switch (levelId) {
        case 1:
          this.addMessage('Pinkie Pie recibe una invitación misteriosa...');
          setTimeout(() => this.addMessage('Ponyville está... ¿vacío?'), 4000);
          break;
        case 2:
          this.addMessage('La pastelería está destrozada. Globos flotan sin aire.');
          break;
        case 3:
          this.addMessage('El Bosque Everfree... los árboles susurran.');
          setTimeout(() => {
            this.addMessage('¡Escuchas pasos detrás de ti! ¡CORRE!');
            this.activateChaser();
          }, 6000);
          break;
        case 4:
          this.addMessage('La biblioteca de Twilight... los libros están esparcidos.');
          break;
        case 5:
          this.addMessage('La fábrica... las máquinas aún funcionan.');
          setTimeout(() => {
            playLaugh();
            this.addMessage('¡Pinkie Pie aparece! ¡HUYE!');
            this.activatePinkieChase();
          }, 8000);
          break;
        case 6:
          this.addMessage('La última fiesta... todo está preparado.');
          setTimeout(() => this.addMessage('Pinkie Pie espera en el centro. Debes descubrir la verdad.'), 3000);
          break;
      }
    }, 2000);

    startAmbientLoop();
  }

  activateChaser() {
    this.chaserActive = true;
    this.chaserX = 18;
    this.chaserY = 12;
    this.chaserSpeed = 1.0;
    this.dangerLevel = 2;
  }

  activatePinkieChase() {
    this.pinkieChaseActive = true;
    this.pinkieChaseX = 5;
    this.pinkieChaseY = 5;
    this.dangerLevel = 3;
  }

  update() {
    this.frame++;

    if (this.state !== 'playing') return;

    // Dialog timer
    if (this.showDialog) {
      this.dialogTimer--;
      if (this.dialogTimer <= 0) {
        this.showDialog = false;
        this.onDialog?.('');
      }
      return; // Pause game during dialog
    }

    const now = Date.now();
    const delay = this.isRunning ? 80 : this.moveDelay;

    if (now - this.lastMove > delay) {
      let dx = 0, dy = 0;
      if (this.keys.has('w') || this.keys.has('arrowup')) { dy = -1; this.playerDir = 'up'; }
      else if (this.keys.has('s') || this.keys.has('arrowdown')) { dy = 1; this.playerDir = 'down'; }
      else if (this.keys.has('a') || this.keys.has('arrowleft')) { dx = -1; this.playerDir = 'left'; }
      else if (this.keys.has('d') || this.keys.has('arrowright')) { dx = 1; this.playerDir = 'right'; }

      if ((dx !== 0 || dy !== 0) && !this.isHiding) {
        const newX = this.playerX + dx;
        const newY = this.playerY + dy;

        if (this.canMoveTo(newX, newY)) {
          this.playerX = newX;
          this.playerY = newY;
          this.playerMoving = true;
          this.playerFrame++;
          this.lastMove = now;
          this.stepCounter++;

          if (this.stepCounter % 5 === 0) playStep();
          this.checkAutoPickup();
          this.checkExits();
        }
      } else {
        this.playerMoving = false;
      }
    }

    // Update enemies
    if (this.chaserActive && this.frame % 10 === 0) this.moveChaser();
    if (this.pinkieChaseActive && this.frame % 7 === 0) this.movePinkieChaser();
    if (this.bossActive && this.frame % 12 === 0) this.moveBoss();

    // Update fog
    this.updateFog();

    // Screen shake decay
    if (this.screenShake > 0) this.screenShake *= 0.9;
    if (this.screenShake < 0.5) this.screenShake = 0;
    if (this.flashTimer > 0) this.flashTimer--;

    // Random ambient events
    this.ambientTimer++;
    if (this.ambientTimer > 400 + Math.random() * 200) {
      this.ambientTimer = 0;
      if (Math.random() < 0.25) {
        playLaugh();
      }
    }

    // Heartbeat when danger
    if (this.dangerLevel > 0) {
      this.heartbeatTimer++;
      if (this.heartbeatTimer > (60 / this.dangerLevel)) {
        this.heartbeatTimer = 0;
      }
    }
  }

  canMoveTo(x: number, y: number): boolean {
    if (x < 0 || y < 0 || x >= this.currentLevel.width || y >= this.currentLevel.height) return false;
    const tile = this.currentLevel.tiles[y]?.[x];
    if (tile === undefined) return false;
    if (tile === TILE.WALL || tile === TILE.TREE || tile === TILE.WATER || tile === TILE.MACHINE || tile === TILE.BOOKSHELF || tile === TILE.TABLE) return false;
    return true;
  }

  checkAutoPickup() {
    for (const entity of this.currentLevel.entities) {
      if (!entity.active) continue;
      if (entity.x === this.playerX && entity.y === this.playerY) {
        if (entity.type === 'item' || entity.type === 'note') {
          this.handleEntityInteraction(entity);
        }
      }
    }
  }

  checkExits() {
    for (const exit of this.currentLevel.exits) {
      if (exit.x === this.playerX && exit.y === this.playerY) {
        this.transitionToLevel(exit.targetLevel, exit.targetX, exit.targetY);
      }
    }
  }

  moveChaser() {
    if (this.isHiding) return;
    const dx = this.playerX - this.chaserX;
    const dy = this.playerY - this.chaserY;
    if (Math.abs(dx) > Math.abs(dy)) {
      const nx = this.chaserX + Math.sign(dx);
      if (this.canMoveTo(nx, this.chaserY)) this.chaserX = nx;
      else {
        const ny = this.chaserY + Math.sign(dy);
        if (this.canMoveTo(this.chaserX, ny)) this.chaserY = ny;
      }
    } else {
      const ny = this.chaserY + Math.sign(dy);
      if (this.canMoveTo(this.chaserX, ny)) this.chaserY = ny;
      else {
        const nx = this.chaserX + Math.sign(dx);
        if (this.canMoveTo(nx, this.chaserY)) this.chaserX = nx;
      }
    }

    if (Math.abs(this.playerX - this.chaserX) <= 1 && Math.abs(this.playerY - this.chaserY) <= 1) {
      playScare();
      this.screenShake = 15;
      this.flashTimer = 15;
      this.addMessage('¡La criatura te alcanza! Logras escapar por poco...');
      this.playerX = Math.max(1, this.playerX - 4);
      this.playerY = Math.max(1, this.playerY - 4);
      this.chaserX = 20;
      this.chaserY = 16;
    }
  }

  movePinkieChaser() {
    if (this.isHiding) return;
    const dx = this.playerX - this.pinkieChaseX;
    const dy = this.playerY - this.pinkieChaseY;
    if (Math.abs(dx) > Math.abs(dy)) {
      const nx = this.pinkieChaseX + Math.sign(dx);
      if (this.canMoveTo(nx, this.pinkieChaseY)) this.pinkieChaseX = nx;
    } else {
      const ny = this.pinkieChaseY + Math.sign(dy);
      if (this.canMoveTo(this.pinkieChaseX, ny)) this.pinkieChaseY = ny;
    }

    if (Math.abs(this.playerX - this.pinkieChaseX) <= 1 && Math.abs(this.playerY - this.pinkieChaseY) <= 1) {
      playScare();
      this.screenShake = 20;
      this.flashTimer = 20;
      this.addMessage('¡Pinkie Pie te alcanza! ¡Pero logras zafarte!');
      this.playerX = Math.max(1, this.playerX - 5);
      this.playerY = Math.max(1, this.playerY - 5);
      this.pinkieChaseX = 1;
      this.pinkieChaseY = 1;
    }
  }

  moveBoss() {
    if (this.isHiding) return;
    const dx = this.playerX - this.bossX;
    const dy = this.playerY - this.bossY;
    if (this.frame % 3 === 0) {
      if (Math.abs(dx) > Math.abs(dy)) {
        const nx = this.bossX + Math.sign(dx);
        if (this.canMoveTo(nx, this.bossY)) this.bossX = nx;
      } else {
        const ny = this.bossY + Math.sign(dy);
        if (this.canMoveTo(this.bossX, ny)) this.bossY = ny;
      }
    }

    if (Math.abs(this.playerX - this.bossX) <= 1 && Math.abs(this.playerY - this.bossY) <= 1) {
      playScare();
      this.screenShake = 10;
      this.playerX = Math.max(1, this.playerX - 3);
      this.playerY = Math.max(1, this.playerY - 3);
      this.addMessage('¡Pinkie Pie te persigue! ¡Encuentra la verdad!');
    }
  }

  updateFog() {
    for (const p of this.fogParticles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < -p.size) p.x = CANVAS_WIDTH;
      if (p.x > CANVAS_WIDTH + p.size) p.x = -p.size;
      if (p.y < -p.size) p.y = CANVAS_HEIGHT;
      if (p.y > CANVAS_HEIGHT + p.size) p.y = -p.size;
      p.alpha = 0.05 + Math.sin(this.frame * 0.01 + p.x * 0.01) * 0.08;
    }
  }

  render() {
    const ctx = this.ctx;
    ctx.imageSmoothingEnabled = false;

    // Clear with level background
    ctx.fillStyle = this.currentLevel.bgColor;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Screen shake
    let shakeX = 0, shakeY = 0;
    if (this.screenShake > 0) {
      shakeX = (Math.random() - 0.5) * this.screenShake;
      shakeY = (Math.random() - 0.5) * this.screenShake;
    }
    ctx.save();
    ctx.translate(Math.round(shakeX), Math.round(shakeY));

    // Camera (smooth follow)
    const targetCamX = this.playerX * TILE_SIZE - CANVAS_WIDTH / 2 + TILE_SIZE / 2;
    const targetCamY = this.playerY * TILE_SIZE - CANVAS_HEIGHT / 2 + TILE_SIZE / 2;
    const camX = Math.max(0, Math.min(targetCamX, this.currentLevel.width * TILE_SIZE - CANVAS_WIDTH));
    const camY = Math.max(0, Math.min(targetCamY, this.currentLevel.height * TILE_SIZE - CANVAS_HEIGHT));

    ctx.save();
    ctx.translate(-Math.round(camX), -Math.round(camY));

    // Draw tiles
    const startTileX = Math.max(0, Math.floor(camX / TILE_SIZE) - 1);
    const startTileY = Math.max(0, Math.floor(camY / TILE_SIZE) - 1);
    const endTileX = Math.min(startTileX + VIEWPORT_TILES_X + 3, this.currentLevel.width);
    const endTileY = Math.min(startTileY + VIEWPORT_TILES_Y + 3, this.currentLevel.height);

    for (let y = startTileY; y < endTileY; y++) {
      for (let x = startTileX; x < endTileX; x++) {
        const tile = this.currentLevel.tiles[y]?.[x] ?? 0;
        drawTile(ctx, tile, x * TILE_SIZE, y * TILE_SIZE, this.frame);
      }
    }

    // Draw entities
    for (const entity of this.currentLevel.entities) {
      if (!entity.active && entity.type !== 'scare') continue;
      const ex = entity.x * TILE_SIZE;
      const ey = entity.y * TILE_SIZE;

      switch (entity.type) {
        case 'item':
          // Sparkle effect
          ctx.fillStyle = '#FFD700';
          ctx.fillRect(ex + 8, ey + 8, 16, 16);
          ctx.fillStyle = '#FFF8DC';
          ctx.fillRect(ex + 10, ey + 10, 12, 12);
          ctx.fillStyle = '#FFD700';
          ctx.fillRect(ex + 12, ey + 12, 8, 8);
          // Sparkle
          if (this.frame % 20 < 10) {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(ex + 6, ey + 4, 3, 3);
            ctx.fillRect(ex + 22, ey + 12, 2, 2);
          }
          break;
        case 'note':
          ctx.fillStyle = '#FFFFF0';
          ctx.fillRect(ex + 6, ey + 8, 20, 18);
          ctx.fillStyle = '#F5F5DC';
          ctx.fillRect(ex + 8, ey + 10, 16, 14);
          ctx.fillStyle = '#333';
          ctx.fillRect(ex + 10, ey + 13, 12, 1);
          ctx.fillRect(ex + 10, ey + 16, 8, 1);
          ctx.fillRect(ex + 10, ey + 19, 10, 1);
          break;
        case 'hide':
          ctx.fillStyle = 'rgba(80, 80, 180, 0.15)';
          ctx.fillRect(ex + 2, ey + 2, TILE_SIZE - 4, TILE_SIZE - 4);
          ctx.strokeStyle = 'rgba(100, 100, 200, 0.3)';
          ctx.lineWidth = 1;
          ctx.strokeRect(ex + 3, ey + 3, TILE_SIZE - 6, TILE_SIZE - 6);
          break;
        case 'switch':
          ctx.fillStyle = entity.data?.activated ? '#00CC00' : '#CC0000';
          ctx.fillRect(ex + 8, ey + 8, 16, 16);
          ctx.fillStyle = entity.data?.activated ? '#00FF00' : '#FF0000';
          ctx.fillRect(ex + 10, ey + 10, 12, 12);
          if (!entity.data?.activated && this.frame % 30 < 15) {
            ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
            ctx.fillRect(ex + 4, ey + 4, 24, 24);
          }
          break;
        case 'exit':
          const exitGlow = Math.sin(this.frame * 0.1) * 0.3 + 0.7;
          ctx.fillStyle = `rgba(60, 60, 255, ${exitGlow * 0.5})`;
          ctx.fillRect(ex + 2, ey + 2, TILE_SIZE - 4, TILE_SIZE - 4);
          ctx.fillStyle = `rgba(100, 100, 255, ${exitGlow})`;
          ctx.fillRect(ex + 6, ey + 6, TILE_SIZE - 12, TILE_SIZE - 12);
          ctx.fillStyle = '#FFF';
          ctx.font = '7px monospace';
          ctx.fillText('EXIT', ex + 6, ey + 18);
          break;
        case 'final_boss':
          if (!entity.data?.defeated) {
            drawBossPony(ctx, ex - 4, ey - 4, this.frame, this.bossPhase);
          }
          break;
      }
    }

    // Draw chaser monster
    if (this.chaserActive && !this.isHiding) {
      drawScaryPony(ctx, this.chaserX * TILE_SIZE - 2, this.chaserY * TILE_SIZE - 2, this.frame);
    }

    // Draw Pinkie chase
    if (this.pinkieChaseActive && !this.isHiding) {
      drawScaryPony(ctx, this.pinkieChaseX * TILE_SIZE - 2, this.pinkieChaseY * TILE_SIZE - 2, this.frame);
    }

    // Draw boss
    if (this.bossActive && !this.isHiding) {
      drawBossPony(ctx, this.bossX * TILE_SIZE - 4, this.bossY * TILE_SIZE - 4, this.frame, this.bossPhase);
    }

    // Draw player
    if (!this.isHiding) {
      const char = CHARACTERS.find(c => c.id === this.characterId) || CHARACTERS[0];
      drawPonySprite(
        ctx,
        this.playerX * TILE_SIZE - 2,
        this.playerY * TILE_SIZE - 2,
        char.color,
        char.maneColor,
        this.playerDir,
        this.playerMoving ? this.playerFrame : 0
      );
    } else {
      // Hiding visual
      ctx.fillStyle = 'rgba(50, 50, 150, 0.3)';
      ctx.fillRect(this.playerX * TILE_SIZE + 4, this.playerY * TILE_SIZE + 4, TILE_SIZE - 8, TILE_SIZE - 8);
    }

    ctx.restore(); // camera

    // Fog overlay
    for (const p of this.fogParticles) {
      ctx.fillStyle = `rgba(80, 40, 120, ${Math.max(0, p.alpha)})`;
      ctx.fillRect(p.x, p.y, p.size, p.size * 0.7);
    }

    // Darkness/visibility circle
    const gradient = ctx.createRadialGradient(
      CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 40,
      CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 180
    );
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(0.7, `rgba(0,0,0,${this.currentLevel.darkLevel * 0.5})`);
    gradient.addColorStop(1, `rgba(0,0,0,${this.currentLevel.darkLevel})`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Flash effect
    if (this.flashTimer > 0) {
      ctx.fillStyle = this.flashColor.replace(/[\d.]+\)$/, `${this.flashTimer / 30})`);
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }

    // Vignette
    const vignette = ctx.createRadialGradient(
      CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_WIDTH * 0.3,
      CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, CANVAS_WIDTH * 0.7
    );
    vignette.addColorStop(0, 'rgba(0,0,0,0)');
    vignette.addColorStop(1, 'rgba(0,0,0,0.4)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.restore(); // shake

    // HUD
    this.renderHUD(ctx);
  }

  renderHUD(ctx: CanvasRenderingContext2D) {
    // Top bar
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, 22);
    ctx.fillStyle = '#FFB6C1';
    ctx.font = 'bold 10px monospace';
    ctx.fillText(`📍 ${this.currentLevel.name}`, 6, 14);

    // Inventory count
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(CANVAS_WIDTH - 55, 2, 52, 18);
    ctx.fillStyle = '#FFD700';
    ctx.font = '9px monospace';
    ctx.fillText(`🎒 ${this.inventory.length}`, CANVAS_WIDTH - 50, 14);

    // Bottom bar - objective
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, CANVAS_HEIGHT - 18, CANVAS_WIDTH, 18);
    ctx.fillStyle = '#999';
    ctx.font = '9px monospace';
    if (this.currentLevel.objectives.length > 0) {
      const obj = this.currentLevel.objectives[0];
      ctx.fillText(`🎯 ${obj}`, 6, CANVAS_HEIGHT - 5);
    }

    // Hiding overlay
    if (this.isHiding) {
      ctx.fillStyle = 'rgba(0, 0, 50, 0.6)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 14px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('🫣 ESCONDIDO', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 5);
      ctx.font = '9px monospace';
      ctx.fillStyle = '#AAA';
      ctx.fillText('Presiona H para salir', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 12);
      ctx.textAlign = 'left';
    }

    // Dialog box
    if (this.showDialog && this.dialogText) {
      const boxH = 50;
      const boxY = CANVAS_HEIGHT - 70;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
      ctx.fillRect(15, boxY, CANVAS_WIDTH - 30, boxH);
      ctx.strokeStyle = '#FF69B4';
      ctx.lineWidth = 2;
      ctx.strokeRect(15, boxY, CANVAS_WIDTH - 30, boxH);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';

      // Word wrap
      const maxWidth = CANVAS_WIDTH - 50;
      const words = this.dialogText.split(' ');
      let line = '';
      let lineY = boxY + 18;
      for (const word of words) {
        const testLine = line + word + ' ';
        if (ctx.measureText(testLine).width > maxWidth) {
          ctx.fillText(line.trim(), CANVAS_WIDTH / 2, lineY);
          line = word + ' ';
          lineY += 13;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line.trim(), CANVAS_WIDTH / 2, lineY);
      ctx.textAlign = 'left';
    }

    // Danger indicator
    if (this.dangerLevel > 0 && (this.chaserActive || this.pinkieChaseActive || this.bossActive)) {
      ctx.fillStyle = this.frame % 20 < 10 ? 'rgba(255, 0, 0, 0.3)' : 'rgba(255, 0, 0, 0.1)';
      ctx.fillRect(0, 0, 4, CANVAS_HEIGHT);
      ctx.fillRect(CANVAS_WIDTH - 4, 0, 4, CANVAS_HEIGHT);
    }
  }

  saveGame() {
    const saveData = {
      characterId: this.characterId,
      currentLevelId: this.currentLevel.id,
      playerX: this.playerX,
      playerY: this.playerY,
      inventory: this.inventory,
      switchesActivated: this.switchesActivated,
      photosFound: this.photosFound,
    };
    localStorage.setItem('pinkie_horror_save', JSON.stringify(saveData));
  }

  loadGame(): boolean {
    const data = localStorage.getItem('pinkie_horror_save');
    if (data) {
      try {
        const save = JSON.parse(data);
        this.characterId = save.characterId;
        this.currentLevel = getLevel(save.currentLevelId);
        this.playerX = save.playerX;
        this.playerY = save.playerY;
        this.inventory = save.inventory || [];
        this.switchesActivated = save.switchesActivated || 0;
        this.photosFound = save.photosFound || 0;
        this.initFog();
        return true;
      } catch (e) { /* ignore */ }
    }
    return false;
  }

  startGame(characterId: string) {
    this.characterId = characterId;
    this.currentLevel = getLevel(1);
    this.playerX = 9;
    this.playerY = 9;
    this.inventory = [];
    this.switchesActivated = 0;
    this.photosFound = 0;
    this.state = 'playing';
    this.chaserActive = false;
    this.pinkieChaseActive = false;
    this.bossActive = false;
    this.isHiding = false;
    this.dangerLevel = 0;
    this.initFog();
    this.onStateChange?.('playing');
    startAmbientLoop();

    setTimeout(() => this.addMessage('Pinkie Pie recibe una invitación misteriosa para una fiesta...'), 500);
    setTimeout(() => this.addMessage('Al llegar, Ponyville está completamente vacío.'), 4000);
    setTimeout(() => this.addMessage('Encuentra la llave de Sugarcube Corner para continuar.'), 7000);
  }

  continueGame() {
    this.state = 'playing';
    this.onStateChange?.('playing');
    startAmbientLoop();
  }

  returnToMenu() {
    this.state = 'menu';
    stopAmbientLoop();
    this.onStateChange?.('menu');
  }

  destroy() {
    stopAmbientLoop();
  }
}
