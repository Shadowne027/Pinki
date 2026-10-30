import { useState, useEffect, useRef, useCallback } from 'react';
import { GameEngine, CHARACTERS, CANVAS_WIDTH, CANVAS_HEIGHT, GameState, InventoryItem } from './game/engine';
import { resumeAudio, playMenuSelect, playVictory, playLaugh, playMusic, stopMusic } from './game/audio';

function App() {
  const [gameState, setGameState] = useState<GameState>('menu');
  const [selectedChar, setSelectedChar] = useState(0);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [dialog, setDialog] = useState('');
  const [showInventory, setShowInventory] = useState(false);
  const [hasSave, setHasSave] = useState(false);
  const [endingPhase, setEndingPhase] = useState(0);
  const [menuFlicker, setMenuFlicker] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ type: 'start'; charId: string } | { type: 'continue' } | null>(null);
  const [musicEnabled, setMusicEnabled] = useState(true);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const joystickRef = useRef<{ active: boolean; startX: number; startY: number }>({ active: false, startX: 0, startY: 0 });
  const animRef = useRef<number>(0);

  useEffect(() => {
    const save = localStorage.getItem('pinkie_horror_save');
    setHasSave(!!save);
  }, []);

  // Menu flicker effect
  useEffect(() => {
    const interval = setInterval(() => {
      setMenuFlicker(prev => !prev);
    }, 3000 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, []);

  const createEngine = useCallback(() => {
    if (!canvasRef.current) return null;
    if (engineRef.current) {
      engineRef.current.destroy();
    }
    cancelAnimationFrame(animRef.current);

    const engine = new GameEngine(canvasRef.current);
    engineRef.current = engine;
    engine.onStateChange = (state) => {
      setGameState(state);
      if (state === 'inventory') setShowInventory(true);
      if (state === 'ending') {
        cancelAnimationFrame(animRef.current);
      }
    };
    engine.onDialog = (text) => setDialog(text);
    engine.onInventoryChange = (items) => setInventory([...items]);
    return engine;
  }, []);

  // Initialize engine when canvas becomes available after state change
  useEffect(() => {
    if (gameState === 'playing' && canvasRef.current && !engineRef.current && pendingAction) {
      const engine = createEngine();
      if (engine) {
        if (pendingAction.type === 'start') {
          engine.startGame(pendingAction.charId);
        } else if (pendingAction.type === 'continue') {
          engine.loadGame();
          engine.continueGame();
        }
        setPendingAction(null);
      }
    }
  }, [gameState, pendingAction, createEngine]);

  // Game loop
  useEffect(() => {
    if (gameState === 'playing' && canvasRef.current && engineRef.current) {
      const engine = engineRef.current;
      const loop = () => {
        engine.update();
        engine.render();
        animRef.current = requestAnimationFrame(loop);
      };
      animRef.current = requestAnimationFrame(loop);
      return () => cancelAnimationFrame(animRef.current);
    }
  }, [gameState, pendingAction]);

  // Ending sequence
  useEffect(() => {
    if (gameState === 'ending') {
      playVictory();
      const timers = [
        setTimeout(() => setEndingPhase(1), 1500),
        setTimeout(() => setEndingPhase(2), 4500),
        setTimeout(() => setEndingPhase(3), 7500),
        setTimeout(() => { playLaugh(); setEndingPhase(4); }, 10500),
        setTimeout(() => setEndingPhase(5), 14000),
        setTimeout(() => setEndingPhase(6), 17000),
      ];
      return () => timers.forEach(clearTimeout);
    }
  }, [gameState]);

  const handleStartGame = useCallback(() => {
    resumeAudio();
    playMenuSelect();
    if (musicEnabled) playMusic('menu');
    setGameState('characterSelect');
  }, [musicEnabled]);

  const handleContinue = useCallback(() => {
    resumeAudio();
    playMenuSelect();
    // Destroy any existing engine
    if (engineRef.current) {
      engineRef.current.destroy();
      engineRef.current = null;
    }
    cancelAnimationFrame(animRef.current);
    setPendingAction({ type: 'continue' });
    setGameState('playing');
  }, []);

  const handleSelectCharacter = useCallback((index: number) => {
    playMenuSelect();
    setSelectedChar(index);
  }, []);

  const handlePlay = useCallback(() => {
    resumeAudio();
    playMenuSelect();
    const char = CHARACTERS[selectedChar];
    // Destroy any existing engine
    if (engineRef.current) {
      engineRef.current.destroy();
      engineRef.current = null;
    }
    cancelAnimationFrame(animRef.current);
    setPendingAction({ type: 'start', charId: char.id });
    setGameState('playing');
  }, [selectedChar]);

  const handleBackToMenu = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.destroy();
      engineRef.current = null;
    }
    cancelAnimationFrame(animRef.current);
    setPendingAction(null);
    setGameState('menu');
    setEndingPhase(0);
    setInventory([]);
    setDialog('');
    setShowInventory(false);
    const save = localStorage.getItem('pinkie_horror_save');
    setHasSave(!!save);
    if (musicEnabled) playMusic('menu');
  }, [musicEnabled]);

  const handleNewSave = useCallback(() => {
    localStorage.removeItem('pinkie_horror_save');
    setHasSave(false);
  }, []);

  const toggleMusic = useCallback(() => {
    if (musicEnabled) {
      stopMusic();
      setMusicEnabled(false);
    } else {
      resumeAudio();
      if (gameState === 'menu') playMusic('menu');
      else if (gameState === 'playing' && engineRef.current) {
        playMusic(engineRef.current.currentLevel.musicTrack);
      }
      setMusicEnabled(true);
    }
  }, [musicEnabled, gameState]);

  // Touch controls
  const handleJoystickStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    joystickRef.current = { active: true, startX: touch.clientX, startY: touch.clientY };
  }, []);

  const handleJoystickMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (!joystickRef.current.active || !engineRef.current) return;
    const touch = e.touches[0];
    const dx = touch.clientX - joystickRef.current.startX;
    const dy = touch.clientY - joystickRef.current.startY;
    const threshold = 15;

    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > threshold) engineRef.current.setDirection('right');
      else if (dx < -threshold) engineRef.current.setDirection('left');
    } else {
      if (dy > threshold) engineRef.current.setDirection('down');
      else if (dy < -threshold) engineRef.current.setDirection('up');
    }
  }, []);

  const handleJoystickEnd = useCallback(() => {
    joystickRef.current.active = false;
    if (engineRef.current) engineRef.current.clearDirection();
  }, []);

  const handleInteract = useCallback(() => {
    resumeAudio();
    if (engineRef.current) engineRef.current.interact();
  }, []);

  const handleRun = useCallback((running: boolean) => {
    if (engineRef.current) engineRef.current.setRunning(running);
  }, []);

  const handleHide = useCallback(() => {
    if (engineRef.current) engineRef.current.toggleHide();
  }, []);

  const handleInventoryToggle = useCallback(() => {
    if (engineRef.current) {
      if (showInventory) {
        engineRef.current.state = 'playing';
        setShowInventory(false);
      } else {
        engineRef.current.toggleInventory();
        setShowInventory(true);
      }
    }
  }, [showInventory]);

  // ============ RENDER ============
  return (
    <div className="w-full h-screen bg-black flex items-center justify-center overflow-hidden select-none" style={{ fontFamily: "'Courier New', monospace" }}>
      
      {/* ===== MENU ===== */}
      {gameState === 'menu' && (
        <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden" style={{ background: 'linear-gradient(180deg, #050010 0%, #0f0020 30%, #1a0035 60%, #0a0015 100%)' }}>
          {/* Animated stars */}
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 50 }).map((_, i) => (
              <div
                key={i}
                className="absolute bg-white"
                style={{
                  width: i % 3 === 0 ? 3 : 2,
                  height: i % 3 === 0 ? 3 : 2,
                  left: `${(i * 37) % 100}%`,
                  top: `${(i * 23) % 70}%`,
                  opacity: 0.2 + (i % 5) * 0.15,
                  animation: `twinkle ${2 + (i % 4)}s infinite alternate ${(i % 7) * 0.3}s`,
                }}
              />
            ))}
          </div>

          {/* Fog effect */}
          <div className="absolute inset-0 pointer-events-none opacity-20" style={{
            background: 'radial-gradient(ellipse at 50% 80%, rgba(100, 50, 150, 0.3) 0%, transparent 70%)',
          }} />

          {/* Pixel pony silhouette - scary version */}
          <div className="mb-6 relative">
            <div className={menuFlicker ? 'opacity-60' : 'opacity-100'} style={{ transition: 'opacity 0.5s' }}>
              <svg width="140" height="120" viewBox="0 0 70 60" style={{ imageRendering: 'pixelated' }}>
                <rect x="20" y="15" width="30" height="22" fill="#FFB6C1" opacity="0.7" />
                <rect x="15" y="18" width="40" height="16" fill="#FFB6C1" opacity="0.5" />
                <rect x="22" y="5" width="26" height="16" fill="#FFB6C1" opacity="0.6" />
                <rect x="18" y="2" width="34" height="6" fill="#FF1493" opacity="0.8" />
                <rect x="14" y="5" width="8" height="14" fill="#FF1493" opacity="0.6" />
                <rect x="48" y="5" width="8" height="14" fill="#FF1493" opacity="0.6" />
                <rect x="26" y="10" width="5" height="5" fill="#FF0000" opacity="0.9" />
                <rect x="39" y="10" width="5" height="5" fill="#FF0000" opacity="0.9" />
                <rect x="27" y="11" width="3" height="3" fill="#FF4444" />
                <rect x="40" y="11" width="3" height="3" fill="#FF4444" />
                <rect x="28" y="17" width="14" height="2" fill="#8B0000" opacity="0.8" />
                <rect x="26" y="17" width="2" height="2" fill="#8B0000" opacity="0.6" />
                <rect x="42" y="17" width="2" height="2" fill="#8B0000" opacity="0.6" />
                <rect x="22" y="37" width="6" height="14" fill="#FFB6C1" opacity="0.5" />
                <rect x="42" y="37" width="6" height="14" fill="#FFB6C1" opacity="0.5" />
                <rect x="28" y="37" width="6" height="12" fill="#FFB6C1" opacity="0.5" />
                <rect x="36" y="37" width="6" height="12" fill="#FFB6C1" opacity="0.5" />
              </svg>
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-5xl font-bold text-pink-400 mb-2 tracking-widest" style={{ textShadow: '0 0 10px #ff69b4, 0 0 30px #ff1493, 0 0 60px #ff0066' }}>
              PINKIE PIE
            </h1>
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-pink-600">━━━</span>
              <h2 className="text-lg md:text-2xl text-purple-300 tracking-wider" style={{ textShadow: '0 0 8px #9b59b6' }}>
                LA ÚLTIMA FIESTA
              </h2>
              <span className="text-pink-600">━━━</span>
            </div>
            <p className="text-[10px] md:text-xs text-gray-600 tracking-widest uppercase">
              Terror psicológico en Pixel Art
            </p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-3 items-center z-10">
            <button
              onClick={handleStartGame}
              className="group px-10 py-4 bg-gradient-to-b from-pink-600 to-pink-800 hover:from-pink-500 hover:to-pink-700 text-white font-bold text-lg tracking-widest transition-all hover:scale-105 border-2 border-pink-400 relative overflow-hidden"
              style={{ boxShadow: '0 4px 0 #4a0020, 0 0 20px rgba(255,105,180,0.3)' }}
            >
              <span className="relative z-10">▶ NUEVA PARTIDA</span>
              <div className="absolute inset-0 bg-pink-400/10 group-hover:bg-pink-400/20 transition-colors" />
            </button>
            {hasSave && (
              <button
                onClick={handleContinue}
                className="px-10 py-3 bg-gradient-to-b from-purple-700 to-purple-900 hover:from-purple-600 hover:to-purple-800 text-white font-bold tracking-wider transition-all hover:scale-105 border-2 border-purple-400"
                style={{ boxShadow: '0 4px 0 #2a0040' }}
              >
                ↻ CONTINUAR
              </button>
            )}
            {hasSave && (
              <button
                onClick={handleNewSave}
                className="px-6 py-2 text-gray-500 hover:text-red-400 text-xs transition-colors"
              >
                ✕ Borrar partida guardada
              </button>
            )}
          </div>

          {/* Controls info */}
          <div className="absolute bottom-4 text-center">
            <p className="text-[10px] md:text-xs text-gray-600 mb-1">
              🎮 WASD/Flechas: Mover | E: Interactuar | Shift: Correr
            </p>
            <p className="text-[10px] md:text-xs text-gray-600">
              H: Esconderse | I: Inventario
            </p>
          </div>

          <div className="absolute top-2 right-3 flex items-center gap-2">
            <button
              onClick={toggleMusic}
              className="text-gray-500 hover:text-pink-400 text-sm transition-colors p-1"
              title={musicEnabled ? 'Silenciar música' : 'Activar música'}
            >
              {musicEnabled ? '🔊' : '🔇'}
            </button>
            <span className="text-[8px] text-gray-700">v1.0</span>
          </div>
        </div>
      )}

      {/* ===== CHARACTER SELECT ===== */}
      {gameState === 'characterSelect' && (
        <div className="w-full h-full flex flex-col items-center justify-center p-4 overflow-auto" style={{ background: 'linear-gradient(180deg, #050010 0%, #120025 50%, #050010 100%)' }}>
          <h2 className="text-xl md:text-3xl font-bold text-pink-400 mb-2 tracking-wider" style={{ textShadow: '0 0 10px #ff69b4' }}>
            SELECCIONA TU PERSONAJE
          </h2>
          <p className="text-xs text-gray-500 mb-6">Cada pony tiene habilidades únicas</p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 max-w-2xl mb-6">
            {CHARACTERS.map((char, i) => (
              <button
                key={char.id}
                onClick={() => handleSelectCharacter(i)}
                className={`p-3 md:p-4 border-2 transition-all flex flex-col items-center relative ${
                  selectedChar === i
                    ? 'border-pink-400 bg-pink-900/40 scale-105 shadow-lg shadow-pink-500/20'
                    : 'border-gray-700 bg-gray-900/40 hover:border-purple-500 hover:bg-purple-900/20'
                }`}
              >
                {selectedChar === i && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-[8px]">✓</span>
                  </div>
                )}
                <div className="w-14 h-14 md:w-16 md:h-16 mb-2 relative" style={{ imageRendering: 'pixelated' }}>
                  <svg width="100%" height="100%" viewBox="0 0 16 16">
                    <rect x="4" y="1" width="8" height="3" fill={char.maneColor} />
                    <rect x="3" y="2" width="3" height="5" fill={char.maneColor} />
                    <rect x="3" y="4" width="10" height="7" fill={char.color} />
                    <rect x="5" y="3" width="6" height="4" fill={char.color} />
                    <rect x="3" y="11" width="3" height="4" fill={char.color} />
                    <rect x="10" y="11" width="3" height="4" fill={char.color} />
                    <rect x="5" y="5" width="2" height="2" fill="white" />
                    <rect x="9" y="5" width="2" height="2" fill="white" />
                    <rect x="6" y="5" width="1" height="2" fill="#4B0082" />
                    <rect x="10" y="5" width="1" height="2" fill="#4B0082" />
                    <rect x="12" y="7" width="2" height="4" fill={char.maneColor} />
                  </svg>
                </div>
                <span className="text-xs md:text-sm font-bold text-white">{char.name}</span>
                <span className="text-[9px] md:text-[10px] text-gray-400 text-center mt-1 leading-tight hidden md:block">{char.description}</span>
              </button>
            ))}
          </div>

          <div className="text-center mb-4 p-3 bg-gray-900/50 border border-gray-700 max-w-xs">
            <p className="text-sm text-pink-300 font-bold">{CHARACTERS[selectedChar].name}</p>
            <p className="text-xs text-gray-400 mt-1">{CHARACTERS[selectedChar].description}</p>
          </div>

          <button
            onClick={handlePlay}
            className="px-12 py-4 bg-gradient-to-b from-pink-600 to-pink-800 hover:from-pink-500 hover:to-pink-700 text-white font-bold text-xl tracking-widest transition-all hover:scale-105 border-2 border-pink-400"
            style={{ boxShadow: '0 4px 0 #4a0020, 0 0 20px rgba(255,105,180,0.2)' }}
          >
            ▶ JUGAR
          </button>

          <button
            onClick={() => setGameState('menu')}
            className="mt-4 px-6 py-2 text-gray-400 hover:text-white text-sm transition-colors"
          >
            ← VOLVER AL MENÚ
          </button>
        </div>
      )}

      {/* ===== PLAYING ===== */}
      {gameState === 'playing' && (
        <div className="relative w-full h-full flex flex-col items-center justify-center bg-black">
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="border-2 border-purple-900/50"
            style={{
              imageRendering: 'pixelated',
              maxWidth: '100%',
              maxHeight: 'calc(100vh - 160px)',
              aspectRatio: `${CANVAS_WIDTH}/${CANVAS_HEIGHT}`,
            }}
          />

          {/* Mobile Controls */}
          <div className="md:hidden absolute bottom-0 left-0 right-0 p-3 flex justify-between items-end pointer-events-none">
            <div
              className="w-28 h-28 rounded-full bg-gray-800/70 border-2 border-gray-600/50 flex items-center justify-center touch-none pointer-events-auto relative"
              onTouchStart={handleJoystickStart}
              onTouchMove={handleJoystickMove}
              onTouchEnd={handleJoystickEnd}
            >
              <div className="w-10 h-10 rounded-full bg-pink-500/40 border border-pink-400/60" />
              <span className="absolute top-1 text-gray-500/60 text-[10px]">▲</span>
              <span className="absolute bottom-1 text-gray-500/60 text-[10px]">▼</span>
              <span className="absolute left-1 text-gray-500/60 text-[10px]">◄</span>
              <span className="absolute right-1 text-gray-500/60 text-[10px]">►</span>
            </div>

            <div className="flex flex-col gap-2 items-center pointer-events-auto">
              <div className="flex gap-2">
                <button
                  onTouchStart={() => handleRun(true)}
                  onTouchEnd={() => handleRun(false)}
                  className="w-11 h-11 rounded-full bg-yellow-800/70 border-2 border-yellow-500/70 text-white text-sm flex items-center justify-center active:bg-yellow-600"
                >
                  🏃
                </button>
                <button
                  onTouchStart={handleHide}
                  className="w-11 h-11 rounded-full bg-blue-800/70 border-2 border-blue-500/70 text-white text-sm flex items-center justify-center active:bg-blue-600"
                >
                  🫣
                </button>
              </div>
              <button
                onTouchStart={handleInteract}
                className="w-14 h-14 rounded-full bg-pink-700/80 border-2 border-pink-400/80 text-white font-bold flex items-center justify-center text-base active:bg-pink-500"
              >
                E
              </button>
            </div>
          </div>

          {/* Desktop controls overlay */}
          <div className="hidden md:flex absolute top-2 right-2 gap-2 z-10">
            <button
              onClick={toggleMusic}
              className="px-2 py-1.5 bg-gray-900/80 border border-gray-600 text-gray-300 text-xs hover:bg-gray-700 transition-colors"
              title={musicEnabled ? 'Silenciar' : 'Activar música'}
            >
              {musicEnabled ? '🔊' : '🔇'}
            </button>
            <button
              onClick={handleInventoryToggle}
              className="px-3 py-1.5 bg-gray-900/80 border border-gray-600 text-gray-300 text-xs hover:bg-gray-700 transition-colors"
            >
              [I] 🎒 Inventario
            </button>
            <button
              onClick={handleBackToMenu}
              className="px-3 py-1.5 bg-gray-900/80 border border-gray-600 text-gray-300 text-xs hover:bg-gray-700 transition-colors"
            >
              ✕ Menú
            </button>
          </div>

          <div className="hidden md:block absolute bottom-2 left-2">
            <p className="text-[9px] text-gray-600">WASD: Mover | E: Interactuar | Shift: Correr | H: Esconder | I: Inventario</p>
          </div>
        </div>
      )}

      {/* ===== INVENTORY OVERLAY ===== */}
      {showInventory && (
        <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-50" onClick={handleInventoryToggle}>
          <div className="bg-gray-900 border-2 border-purple-500 p-4 md:p-6 max-w-sm w-full mx-4 shadow-lg shadow-purple-500/20" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-pink-400 mb-4 text-center tracking-wider">🎒 INVENTARIO</h3>
            {inventory.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">No tienes objetos todavía.</p>
                <p className="text-gray-600 text-xs mt-2">Explora para encontrar objetos útiles.</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {inventory.map((item, i) => (
                  <div key={i} className="bg-gray-800 border border-gray-600 p-3 flex flex-col items-center hover:border-pink-500 transition-colors">
                    <span className="text-2xl mb-1">{item.icon}</span>
                    <span className="text-[9px] text-gray-300 text-center leading-tight">{item.name}</span>
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={handleInventoryToggle}
              className="mt-4 w-full py-2.5 bg-purple-700 hover:bg-purple-600 text-white text-sm font-bold tracking-wider transition-colors"
            >
              CERRAR [I]
            </button>
          </div>
        </div>
      )}

      {/* ===== ENDING ===== */}
      {gameState === 'ending' && (
        <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden" style={{
          background: endingPhase >= 1
            ? 'linear-gradient(180deg, #1a0030 0%, #3a1050 20%, #ff8844 60%, #ffcc88 85%, #ffeecc 100%)'
            : 'linear-gradient(180deg, #0a0015 0%, #1a0030 100%)'
        }}>
          <div className="absolute inset-0 bg-black transition-opacity" style={{ opacity: endingPhase === 0 ? 1 : 0, transitionDuration: '2s', pointerEvents: 'none' }} />

          {endingPhase === 0 && (
            <div className="text-center z-10">
              <p className="text-white text-lg animate-pulse">Has escapado de la fiesta...</p>
              <p className="text-gray-500 text-xs mt-4">¿O tal vez no?</p>
            </div>
          )}

          {endingPhase === 1 && (
            <div className="text-center z-10">
              <div className="mb-6">
                <svg width="240" height="140" viewBox="0 0 120 70" style={{ imageRendering: 'pixelated' }}>
                  <rect x="0" y="50" width="120" height="20" fill="#2a5a2a" />
                  <rect x="0" y="45" width="120" height="8" fill="#3a6a3a" />
                  <rect x="45" y="20" width="30" height="30" fill="#FFD700" />
                  <rect x="40" y="25" width="40" height="20" fill="#FFA500" />
                  <rect x="50" y="15" width="20" height="10" fill="#FFFF00" />
                  <rect x="8" y="35" width="14" height="18" fill="#4a3a2a" />
                  <rect x="10" y="30" width="10" height="8" fill="#6a4a3a" />
                  <rect x="12" y="40" width="4" height="6" fill="#FFD700" opacity="0.5" />
                  <rect x="95" y="33" width="16" height="20" fill="#4a3a2a" />
                  <rect x="97" y="28" width="12" height="8" fill="#6a4a3a" />
                  <rect x="100" y="38" width="4" height="6" fill="#FFD700" opacity="0.5" />
                  <rect x="30" y="38" width="4" height="15" fill="#3a2a1a" />
                  <rect x="26" y="30" width="12" height="12" fill="#1a4a1a" />
                  <rect x="80" y="36" width="4" height="17" fill="#3a2a1a" />
                  <rect x="76" y="28" width="12" height="12" fill="#1a4a1a" />
                </svg>
              </div>
              <p className="text-yellow-200 text-sm tracking-wider">Ponyville al amanecer...</p>
              <p className="text-yellow-100/60 text-xs mt-2">La pesadilla ha terminado.</p>
            </div>
          )}

          {endingPhase === 2 && (
            <div className="text-center z-10">
              <div className="mb-6" style={{ animation: 'float 3s ease-in-out infinite' }}>
                <span className="text-7xl">🎈</span>
              </div>
              <p className="text-pink-300 text-sm">Un globo rosa flota en el viento...</p>
              <p className="text-pink-400/60 text-xs mt-2">¿Estás seguro de que era solo un globo?</p>
            </div>
          )}

          {endingPhase === 3 && (
            <div className="text-center z-10">
              <p className="text-gray-400 text-xs mb-6 italic animate-pulse">
                ...Se escucha una risa lejana...
              </p>
              <div className="bg-black/50 p-6 border border-pink-500/30">
                <p className="text-2xl md:text-3xl text-pink-400 font-bold tracking-wider" style={{ textShadow: '0 0 20px #ff69b4, 0 0 40px #ff1493' }}>
                  "GRACIAS POR VENIR<br/>A MI FIESTA"
                </p>
              </div>
            </div>
          )}

          {endingPhase === 4 && (
            <div className="text-center z-10">
              <h3 className="text-xl md:text-2xl text-pink-400 mb-6 font-bold tracking-widest" style={{ textShadow: '0 0 10px #ff69b4' }}>
                ★ CRÉDITOS ★
              </h3>
              <div className="text-gray-300 text-xs space-y-3 bg-black/40 p-6 border border-gray-700 max-w-xs mx-auto">
                <p className="text-pink-300 font-bold">PINKIE PIE: LA ÚLTIMA FIESTA</p>
                <p className="text-gray-500">━━━</p>
                <p>Diseño y Programación</p>
                <p className="text-purple-300">Pixel Art Horror Engine</p>
                <p className="text-gray-500">━━━</p>
                <p>Personajes inspirados en</p>
                <p className="text-pink-300">My Little Pony: Friendship is Magic</p>
                <p className="text-gray-500">━━━</p>
                <p>Motor Gráfico: Canvas 2D</p>
                <p>Audio: Web Audio API</p>
                <p>Framework: React + Vite</p>
                <p className="text-gray-500">━━━</p>
                <p className="text-gray-500 text-[10px]">Estilo: Pixel Art Retro Horror RPG</p>
              </div>
            </div>
          )}

          {endingPhase === 5 && (
            <div className="text-center z-10">
              <p className="text-pink-400/80 text-sm mb-2">🎈 La fiesta nunca termina... 🎈</p>
              <p className="text-gray-500 text-xs mb-8">¿Vendrás a la próxima?</p>
            </div>
          )}

          {endingPhase >= 6 && (
            <div className="text-center z-10">
              <button
                onClick={handleBackToMenu}
                className="px-10 py-4 bg-gradient-to-b from-pink-600 to-pink-800 hover:from-pink-500 hover:to-pink-700 text-white font-bold text-lg tracking-widest transition-all hover:scale-105 border-2 border-pink-400"
                style={{ boxShadow: '0 4px 0 #4a0020, 0 0 20px rgba(255,105,180,0.3)' }}
              >
                ← VOLVER AL MENÚ
              </button>
            </div>
          )}

          <style>{`
            @keyframes float {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-15px); }
            }
          `}</style>
        </div>
      )}

      {/* Global animations */}
      <style>{`
        @keyframes twinkle {
          0% { opacity: 0.1; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.5); }
          100% { opacity: 0.1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

export default App;
