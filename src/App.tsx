import { useState, useEffect, useRef, useCallback } from 'react';
import { GameEngine, CHARACTERS, CANVAS_WIDTH, CANVAS_HEIGHT, GameState, InventoryItem } from './game/engine';
import { resumeAudio, playMenuSelect, playVictory, playLaugh, playMusic, stopMusic, setMusicEnabled, playMagicReveal, playCelebration } from './game/audio';

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
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

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
    if ((gameState === 'playing' || gameState === 'inventory') && canvasRef.current && engineRef.current) {
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
    } else if (gameState === 'secretEnding') {
      playMagicReveal();
      const timers = [
        setTimeout(() => setEndingPhase(0), 500),
        setTimeout(() => { playMagicReveal(); setEndingPhase(1); }, 3000),
        setTimeout(() => setEndingPhase(2), 7000),
        setTimeout(() => { playCelebration(); setEndingPhase(3); }, 11000),
        setTimeout(() => setEndingPhase(4), 15000),
        setTimeout(() => { playCelebration(); setEndingPhase(5); }, 19000),
        setTimeout(() => { playMagicReveal(); setEndingPhase(6); }, 25000),
        setTimeout(() => setEndingPhase(7), 35000),
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

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      // Entrar a pantalla completa
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if ((elem as any).webkitRequestFullscreen) {
        (elem as any).webkitRequestFullscreen();
      } else if ((elem as any).msRequestFullscreen) {
        (elem as any).msRequestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      // Salir de pantalla completa
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
      }
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleMusic = useCallback(() => {
    const newState = !musicEnabled;
    setMusicEnabled(newState);
    if (newState) {
      resumeAudio();
      if (gameState === 'menu') playMusic('menu');
      else if (gameState === 'playing' && engineRef.current) {
        playMusic(engineRef.current.currentLevel.musicTrack);
      }
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
        setGameState('playing');
        setShowInventory(false);
        setSelectedItem(null);
      } else {
        engineRef.current.toggleInventory();
        setShowInventory(true);
      }
    }
  }, [showInventory]);

  // ============ RENDER ============
  return (
    <div className="w-full h-screen bg-black flex items-center justify-center overflow-hidden select-none" style={{ fontFamily: "'Courier New', monospace" }}>
      
      {/* Botón de pantalla completa - Flotante */}
      <button
        onClick={toggleFullscreen}
        className="fixed top-[0.4cm] left-[0.4cm] z-[9999] bg-gradient-to-br from-purple-900/90 to-pink-900/90 hover:from-purple-800 hover:to-pink-800 text-white px-4 py-2.5 rounded-xl border-2 border-pink-400/60 transition-all hover:scale-110 active:scale-95 text-sm font-bold flex items-center gap-2 shadow-xl shadow-pink-500/30 backdrop-blur-sm"
        title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
        style={{
          animation: 'pulse-glow 2s ease-in-out infinite',
        }}
      >
        {isFullscreen ? (
          <>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>
            </svg>
            <span className="hidden md:inline">Salir</span>
          </>
        ) : (
          <>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
            </svg>
            <span className="hidden md:inline">Pantalla Completa</span>
          </>
        )}
      </button>

      <style>{`
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(236, 72, 153, 0.3), 0 0 40px rgba(168, 85, 247, 0.2);
          }
          50% {
            box-shadow: 0 0 30px rgba(236, 72, 153, 0.5), 0 0 60px rgba(168, 85, 247, 0.3);
          }
        }
      `}</style>

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
              <svg width="160" height="140" viewBox="0 0 20 20" style={{ imageRendering: 'pixelated' }}>
                {/* Body outline */}
                <rect x="5" y="9" width="12" height="8" fill="#000000" opacity="0.8" />
                {/* Head outline */}
                <rect x="6" y="2" width="10" height="8" fill="#000000" opacity="0.8" />
                
                {/* Body (bean shape) */}
                <rect x="6" y="10" width="10" height="6" fill="#FFB6C1" opacity="0.7" />
                <rect x="7" y="9" width="8" height="8" fill="#FFB6C1" opacity="0.6" />
                <rect x="13" y="10" width="3" height="5" fill="#FFB6C1" opacity="0.6" />
                
                {/* Tail (wild, corrupted) */}
                <rect x="14" y="8" width="3" height="3" fill="#FF1493" opacity="0.8" />
                <rect x="15" y="7" width="3" height="2" fill="#FF1493" opacity="0.7" />
                <rect x="16" y="9" width="2" height="4" fill="#FF1493" opacity="0.6" />
                <rect x="14" y="11" width="2" height="3" fill="#FF1493" opacity="0.6" />
                
                {/* Head */}
                <rect x="7" y="3" width="8" height="7" fill="#FFB6C1" opacity="0.6" />
                <rect x="6" y="4" width="10" height="5" fill="#FFB6C1" opacity="0.6" />
                <rect x="8" y="2" width="6" height="2" fill="#FFB6C1" opacity="0.6" />
                <rect x="5" y="6" width="3" height="3" fill="#FFB6C1" opacity="0.6" />
                
                {/* Ears */}
                <rect x="8" y="1" width="2" height="3" fill="#FFB6C1" opacity="0.6" />
                <rect x="12" y="1" width="2" height="3" fill="#FFB6C1" opacity="0.6" />
                
                {/* Mane (wild, corrupted Pinkie) */}
                <rect x="6" y="0" width="10" height="4" fill="#FF1493" opacity="0.8" />
                <rect x="5" y="1" width="2" height="6" fill="#FF1493" opacity="0.7" />
                <rect x="14" y="1" width="2" height="4" fill="#FF1493" opacity="0.7" />
                <rect x="5" y="4" width="1" height="4" fill="#FF1493" opacity="0.6" />
                <rect x="15" y="2" width="1" height="3" fill="#FF1493" opacity="0.6" />
                
                {/* Glowing red eyes (HUGE) */}
                <rect x="6" y="4" width="4" height="4" fill="#FF0000" opacity="0.9" />
                <rect x="11" y="4" width="4" height="4" fill="#FF0000" opacity="0.9" />
                <rect x="7" y="5" width="2" height="2" fill="#000000" opacity="0.9" />
                <rect x="12" y="5" width="2" height="2" fill="#000000" opacity="0.9" />
                
                {/* Creepy wide smile */}
                <rect x="7" y="8" width="6" height="1" fill="#8B0000" opacity="0.9" />
                <rect x="8" y="8" width="1" height="1" fill="#FFFFFF" opacity="0.9" />
                <rect x="10" y="8" width="1" height="1" fill="#FFFFFF" opacity="0.9" />
                <rect x="12" y="8" width="1" height="1" fill="#FFFFFF" opacity="0.9" />
                
                {/* Legs */}
                <rect x="6" y="16" width="2" height="3" fill="#FFB6C1" opacity="0.5" />
                <rect x="8" y="16" width="2" height="3" fill="#FFB6C1" opacity="0.5" />
                <rect x="12" y="16" width="2" height="3" fill="#FFB6C1" opacity="0.5" />
                <rect x="14" y="16" width="2" height="3" fill="#FFB6C1" opacity="0.5" />
                <rect x="6" y="19" width="2" height="1" fill="#000000" opacity="0.7" />
                <rect x="8" y="19" width="2" height="1" fill="#000000" opacity="0.7" />
                <rect x="12" y="19" width="2" height="1" fill="#000000" opacity="0.7" />
                <rect x="14" y="19" width="2" height="1" fill="#000000" opacity="0.7" />
              </svg>
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-pink-400 mb-3 tracking-widest" style={{ textShadow: '0 0 10px #ff69b4, 0 0 30px #ff1493, 0 0 60px #ff0066' }}>
              PINKIE PIE
            </h1>
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="text-pink-600">━━━</span>
              <h2 className="text-xl md:text-2xl text-purple-300 tracking-wider" style={{ textShadow: '0 0 8px #9b59b6' }}>
                LA ÚLTIMA FIESTA
              </h2>
              <span className="text-pink-600">━━━</span>
            </div>

          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-4 items-center z-10 px-4">
            <button
              onClick={handleStartGame}
              className="group px-12 py-5 bg-gradient-to-b from-pink-600 to-pink-800 hover:from-pink-500 hover:to-pink-700 text-white font-bold text-xl tracking-widest transition-all hover:scale-105 border-2 border-pink-400 relative overflow-hidden w-full max-w-sm"
              style={{ boxShadow: '0 4px 0 #4a0020, 0 0 20px rgba(255,105,180,0.3)' }}
            >
              <span className="relative z-10">▶ NUEVA PARTIDA</span>
              <div className="absolute inset-0 bg-pink-400/10 group-hover:bg-pink-400/20 transition-colors" />
            </button>
            {hasSave && (
              <button
                onClick={handleContinue}
                className="px-12 py-4 bg-gradient-to-b from-purple-700 to-purple-900 hover:from-purple-600 hover:to-purple-800 text-white font-bold text-lg tracking-wider transition-all hover:scale-105 border-2 border-purple-400 w-full max-w-sm"
                style={{ boxShadow: '0 4px 0 #2a0040' }}
              >
                ↻ CONTINUAR
              </button>
            )}
            {hasSave && (
              <button
                onClick={handleNewSave}
                className="px-8 py-3 text-gray-500 hover:text-red-400 text-sm transition-colors"
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
          <h2 className="text-2xl md:text-3xl font-bold text-pink-400 mb-3 tracking-wider" style={{ textShadow: '0 0 10px #ff69b4' }}>
            SELECCIONA TU PERSONAJE
          </h2>
          <p className="text-sm text-gray-500 mb-8">Cada pony tiene habilidades únicas</p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5 max-w-3xl mb-8 px-2">
            {CHARACTERS.map((char, i) => (
              <button
                key={char.id}
                onClick={() => handleSelectCharacter(i)}
                className={`p-4 md:p-5 border-2 transition-all flex flex-col items-center relative ${
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
                <div className="w-20 h-20 md:w-24 md:h-24 mb-3 relative" style={{ imageRendering: 'pixelated' }}>
                  <svg width="100%" height="100%" viewBox="0 0 20 20">
                    {/* Body outline */}
                    <rect x="5" y="9" width="12" height="8" fill={char.outline} />
                    {/* Head outline */}
                    <rect x="6" y="2" width="10" height="8" fill={char.outline} />
                    
                    {/* Body (bean shape) */}
                    <rect x="6" y="10" width="10" height="6" fill={char.color} />
                    <rect x="7" y="9" width="8" height="8" fill={char.color} />
                    <rect x="13" y="10" width="3" height="5" fill={char.color} />
                    {/* Body shadow */}
                    <rect x="6" y="14" width="10" height="2" fill={char.colorShadow} />
                    
                    {/* Tail */}
                    <rect x="14" y="8" width="3" height="3" fill={char.maneColor} />
                    <rect x="15" y="7" width="3" height="2" fill={char.maneColor} />
                    <rect x="16" y="9" width="2" height="4" fill={char.maneColor} />
                    <rect x="15" y="8" width="1" height="1" fill={char.maneLight} />
                    
                    {/* Head */}
                    <rect x="7" y="3" width="8" height="7" fill={char.color} />
                    <rect x="6" y="4" width="10" height="5" fill={char.color} />
                    <rect x="8" y="2" width="6" height="2" fill={char.color} />
                    <rect x="5" y="6" width="3" height="3" fill={char.color} />
                    {/* Head shadow */}
                    <rect x="7" y="8" width="8" height="2" fill={char.colorShadow} />
                    
                    {/* Ears */}
                    <rect x="8" y="1" width="2" height="3" fill={char.color} />
                    <rect x="12" y="1" width="2" height="3" fill={char.color} />
                    <rect x="9" y="2" width="1" height="1" fill={char.maneColor} />
                    <rect x="13" y="2" width="1" height="1" fill={char.maneColor} />
                    
                    {/* Mane */}
                    <rect x="6" y="0" width="10" height="4" fill={char.maneColor} />
                    <rect x="5" y="1" width="2" height="6" fill={char.maneColor} />
                    <rect x="14" y="1" width="2" height="4" fill={char.maneColor} />
                    <rect x="7" y="0" width="2" height="1" fill={char.maneLight} />
                    <rect x="11" y="0" width="2" height="1" fill={char.maneLight} />
                    
                    {/* Eyes (HUGE - Pony Town style) */}
                    <rect x="6" y="4" width="4" height="4" fill="white" />
                    <rect x="11" y="4" width="4" height="4" fill="white" />
                    <rect x="6" y="5" width="3" height="3" fill={char.eyeColor} />
                    <rect x="11" y="5" width="3" height="3" fill={char.eyeColor} />
                    <rect x="6" y="6" width="2" height="2" fill="#000" />
                    <rect x="11" y="6" width="2" height="2" fill="#000" />
                    <rect x="7" y="4" width="2" height="2" fill="white" />
                    <rect x="12" y="4" width="2" height="2" fill="white" />
                    
                    {/* Legs */}
                    <rect x="6" y="16" width="2" height="3" fill={char.color} />
                    <rect x="8" y="16" width="2" height="3" fill={char.color} />
                    <rect x="12" y="16" width="2" height="3" fill={char.color} />
                    <rect x="14" y="16" width="2" height="3" fill={char.color} />
                    <rect x="6" y="19" width="2" height="1" fill={char.outline} />
                    <rect x="8" y="19" width="2" height="1" fill={char.outline} />
                    <rect x="12" y="19" width="2" height="1" fill={char.outline} />
                    <rect x="14" y="19" width="2" height="1" fill={char.outline} />
                  </svg>
                </div>
                <span className="text-sm md:text-base font-bold text-white">{char.name}</span>
                <span className="text-xs md:text-sm text-gray-400 text-center mt-2 leading-tight">{char.description}</span>
              </button>
            ))}
          </div>

          <div className="text-center mb-4 p-3 bg-gray-900/50 border border-gray-700 max-w-xs">
            <p className="text-sm text-pink-300 font-bold">{CHARACTERS[selectedChar].name}</p>
            <p className="text-xs text-gray-400 mt-1">{CHARACTERS[selectedChar].description}</p>
            <div className="mt-2 pt-2 border-t border-gray-700">
              <p className="text-[10px] text-purple-400">
                Habilidad: {
                  CHARACTERS[selectedChar].ability === 'detect' ? '🔍 Detectar objetos ocultos' :
                  CHARACTERS[selectedChar].ability === 'puzzle' ? '🧩 Resolver acertijos rápido' :
                  CHARACTERS[selectedChar].ability === 'speed' ? '⚡ Velocidad mejorada' :
                  CHARACTERS[selectedChar].ability === 'stealth' ? '👻 Sigilo aumentado' :
                  CHARACTERS[selectedChar].ability === 'find' ? '💎 Encontrar secretos' :
                  '🛡️ Resistencia a persecuciones'
                }
              </p>
            </div>
          </div>

          <button
            onClick={handlePlay}
            className="px-14 py-5 bg-gradient-to-b from-pink-600 to-pink-800 hover:from-pink-500 hover:to-pink-700 text-white font-bold text-2xl tracking-widest transition-all hover:scale-105 border-2 border-pink-400"
            style={{ boxShadow: '0 4px 0 #4a0020, 0 0 20px rgba(255,105,180,0.2)' }}
          >
            ▶ JUGAR
          </button>

          <button
            onClick={() => setGameState('menu')}
            className="mt-5 px-8 py-3 text-gray-400 hover:text-white text-base transition-colors"
          >
            ← VOLVER AL MENÚ
          </button>
        </div>
      )}

      {/* ===== PLAYING ===== */}
      {(gameState === 'playing' || gameState === 'inventory') && (
        <div className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden p-[0.4cm]">
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="border-2 border-purple-900/50 md:border-purple-900/50 md:max-w-full md:max-h-full"
            style={{
              imageRendering: 'pixelated',
              width: 'calc(100vw - 0.8cm)',
              height: 'calc(100vh - 0.8cm)',
              maxWidth: 'calc(100vw - 0.8cm)',
              maxHeight: 'calc(100vh - 0.8cm)',
              objectFit: 'contain',
            }}
          />

          {/* Mobile Controls - Overlay on canvas */}
          <div className="md:hidden absolute bottom-[0.4cm] left-[0.4cm] right-[0.4cm] flex justify-between items-end pointer-events-none z-20">
            <div
              className="w-32 h-32 rounded-full bg-black/40 backdrop-blur-sm border-2 border-gray-600/40 flex items-center justify-center touch-none pointer-events-auto relative"
              onTouchStart={handleJoystickStart}
              onTouchMove={handleJoystickMove}
              onTouchEnd={handleJoystickEnd}
            >
              <div className="w-10 h-10 rounded-full bg-pink-500/60 border-2 border-pink-400/70" />
              <span className="absolute top-1 text-gray-300/90 text-xs">▲</span>
              <span className="absolute bottom-1 text-gray-300/90 text-xs">▼</span>
              <span className="absolute left-1 text-gray-300/90 text-xs">◄</span>
              <span className="absolute right-1 text-gray-300/90 text-xs">►</span>
            </div>

            <div className="flex flex-col gap-2 items-center pointer-events-auto">
              <div className="flex gap-2">
                <button
                  onTouchStart={() => handleRun(true)}
                  onTouchEnd={() => handleRun(false)}
                  className="w-12 h-12 rounded-full bg-yellow-800/70 backdrop-blur-sm border-2 border-yellow-500/70 text-white text-lg flex items-center justify-center active:bg-yellow-600 active:scale-95 transition-transform"
                >
                  🏃
                </button>
                <button
                  onTouchStart={handleHide}
                  className="w-12 h-12 rounded-full bg-blue-800/70 backdrop-blur-sm border-2 border-blue-500/70 text-white text-lg flex items-center justify-center active:bg-blue-600 active:scale-95 transition-transform"
                >
                  🫣
                </button>
                <button
                  onTouchStart={handleInventoryToggle}
                  className="w-12 h-12 rounded-full bg-purple-800/70 backdrop-blur-sm border-2 border-purple-500/70 text-white text-lg flex items-center justify-center active:bg-purple-600 active:scale-95 transition-transform"
                >
                  🎒
                </button>
              </div>
              <button
                onTouchStart={handleInteract}
                className="w-14 h-14 rounded-full bg-pink-700/80 backdrop-blur-sm border-2 border-pink-400/80 text-white font-bold flex items-center justify-center text-lg active:bg-pink-500 active:scale-95 transition-transform shadow-lg shadow-pink-500/40"
              >
                E
              </button>
            </div>
          </div>

          {/* Top controls overlay */}
          <div className="absolute top-[0.4cm] right-[0.4cm] gap-2 z-10 flex">
            <button
              onClick={toggleMusic}
              className="px-2 py-1.5 bg-gray-900/80 border border-gray-600 text-gray-300 text-xs hover:bg-gray-700 transition-colors"
              title={musicEnabled ? 'Silenciar' : 'Activar música'}
            >
              {musicEnabled ? '🔊' : '🔇'}
            </button>
            <button
              onClick={handleBackToMenu}
              className="px-3 py-1.5 bg-gray-900/80 border border-gray-600 text-gray-300 text-xs hover:bg-gray-700 transition-colors"
            >
              ✕ Menú
            </button>
          </div>

          <div className="hidden md:block absolute bottom-[0.4cm] left-[0.4cm]">
            <p className="text-[9px] text-gray-600">WASD: Mover | E: Interactuar | Shift: Correr | H: Esconder | I: Inventario</p>
          </div>
        </div>
      )}

      {/* ===== INVENTORY OVERLAY ===== */}
      {showInventory && !selectedItem && (
        <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-50" onClick={handleInventoryToggle}>
          <div className="bg-gray-900 border-2 border-purple-500 p-4 md:p-6 max-w-sm w-full mx-4 shadow-lg shadow-purple-500/20" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl md:text-2xl font-bold text-pink-400 mb-5 text-center tracking-wider">🎒 INVENTARIO</h3>
            {inventory.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-500 text-base">No tienes objetos todavía.</p>
                <p className="text-gray-600 text-sm mt-3">Explora para encontrar objetos útiles.</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {inventory.map((item, i) => (
                  <button 
                    key={i} 
                    onClick={() => setSelectedItem(item)}
                    className="bg-gray-800 border border-gray-600 p-4 flex flex-col items-center hover:border-pink-500 transition-colors cursor-pointer active:scale-95"
                  >
                    <span className="text-4xl mb-2">{item.icon}</span>
                    <span className="text-xs text-gray-300 text-center leading-tight">{item.name}</span>
                    <span className="text-xs text-pink-400 mt-2 font-bold">Ver</span>
                  </button>
                ))}
              </div>
            )}
            <button
              onClick={handleInventoryToggle}
              className="mt-5 w-full py-3 bg-purple-700 hover:bg-purple-600 text-white text-base font-bold tracking-wider transition-colors"
            >
              CERRAR [I]
            </button>
          </div>
        </div>
      )}

      {/* ===== ITEM VIEWER ===== */}
      {showInventory && selectedItem && (
        <div className="absolute inset-0 bg-black/95 flex items-center justify-center z-50 p-4" onClick={() => setSelectedItem(null)}>
          <div className="bg-gray-900 border-2 border-pink-500 p-6 max-w-md w-full shadow-lg shadow-pink-500/30" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-pink-400 mb-4 text-center">{selectedItem.icon} {selectedItem.name}</h3>
            
            {/* Photo Viewer */}
            {selectedItem.id.startsWith('photo_') && (
              <div className="bg-gray-800 p-4 border border-gray-600">
                <div className="aspect-square bg-gradient-to-br from-pink-900/50 to-purple-900/50 flex items-center justify-center mb-3">
                  <svg width="200" height="200" viewBox="0 0 20 20" style={{ imageRendering: 'pixelated' }}>
                    {/* Fragmento de foto pixelado */}
                    <rect x="2" y="2" width="16" height="16" fill="#2a1a3a" />
                    <rect x="3" y="3" width="14" height="14" fill="#3a2a4a" />
                    {/* Siluetas de ponis */}
                    <rect x="5" y="8" width="3" height="4" fill="#FFB6C1" opacity="0.7" />
                    <rect x="9" y="7" width="3" height="5" fill="#DDA0DD" opacity="0.7" />
                    <rect x="13" y="8" width="3" height="4" fill="#87CEEB" opacity="0.7" />
                    {/* Texto misterioso */}
                    <rect x="4" y="14" width="12" height="1" fill="#666" />
                    <rect x="6" y="16" width="8" height="1" fill="#666" />
                  </svg>
                </div>
                <p className="text-gray-300 text-sm text-center">
                  {selectedItem.id === 'photo_1' && 'Un fragmento de foto muestra a las ponis reunidas. Sus expresiones parecen... forzadas.'}
                  {selectedItem.id === 'photo_2' && 'Otro fragmento. Las ponis están en Sugarcube Corner, pero algo está mal con sus sombras.'}
                  {selectedItem.id === 'photo_3' && 'El último fragmento muestra una fiesta vacía. Solo queda una sombra rosa en el centro.'}
                </p>
              </div>
            )}

            {/* Diary Viewer */}
            {selectedItem.id === 'diary' && (
              <div className="bg-amber-900/30 p-4 border border-amber-700">
                <div className="bg-amber-50 p-3 mb-3 text-gray-800 font-serif text-sm leading-relaxed" style={{ fontFamily: 'serif' }}>
                  <p className="mb-2 italic">"Día 1: La fiesta fue un éxito... al principio."</p>
                  <p className="mb-2">"Pinkie Pie quería que todas nos quedáramos para siempre. Pensé que era solo su entusiasmo habitual."</p>
                  <p className="mb-2 italic">"Día 3: Algo cambió. Las máquinas de la fábrica... están haciendo algo con nosotras."</p>
                  <p className="mb-2">"No podemos irnos. Pinkie no nos deja. Su sonrisa... ya no es natural."</p>
                  <p className="italic text-red-700">"Si encuentras esto, activa las máquinas. Es la única forma de detenerla. Pero ten cuidado... ella siempre está observando."</p>
                </div>
                <p className="text-amber-300 text-xs text-center">- Diario de Twilight Sparkle</p>
              </div>
            )}

            {/* Map Viewer */}
            {selectedItem.id === 'map' && (
              <div className="bg-gray-800 p-4 border border-gray-600">
                <div className="aspect-square bg-gradient-to-br from-green-900/30 to-blue-900/30 flex items-center justify-center mb-3 relative">
                  <svg width="200" height="200" viewBox="0 0 20 20" style={{ imageRendering: 'pixelated' }}>
                    {/* Mapa de Ponyville */}
                    <rect x="1" y="1" width="18" height="18" fill="#2a4a2a" />
                    {/* Caminos */}
                    <rect x="9" y="2" width="2" height="16" fill="#8B7355" />
                    <rect x="2" y="9" width="16" height="2" fill="#8B7355" />
                    {/* Edificios */}
                    <rect x="3" y="3" width="3" height="3" fill="#654321" />
                    <rect x="14" y="3" width="3" height="3" fill="#FFB6C1" />
                    <rect x="3" y="14" width="3" height="3" fill="#654321" />
                    <rect x="14" y="14" width="3" height="3" fill="#DDA0DD" />
                    {/* Bosque */}
                    <rect x="16" y="8" width="3" height="4" fill="#0a3a0a" />
                    {/* Castillo */}
                    <rect x="1" y="1" width="4" height="4" fill="#4B0082" />
                  </svg>
                </div>
                <p className="text-gray-300 text-sm text-center">
                  Un mapa de Ponyville. Puedes ver las casas abandonadas, el bosque Everfree al este, y el castillo de Twilight al noroeste.
                </p>
              </div>
            )}

            {/* Crystal Viewer */}
            {selectedItem.id === 'crystal' && (
              <div className="bg-gray-800 p-4 border border-gray-600">
                <div className="aspect-square bg-gradient-to-br from-purple-900/50 to-blue-900/50 flex items-center justify-center mb-3">
                  <svg width="150" height="150" viewBox="0 0 20 20" style={{ imageRendering: 'pixelated' }}>
                    {/* Cristal mágico */}
                    <rect x="8" y="4" width="4" height="12" fill="#9B59B6" />
                    <rect x="7" y="6" width="6" height="8" fill="#8E44AD" />
                    <rect x="9" y="3" width="2" height="2" fill="#D2B4DE" />
                    <rect x="9" y="15" width="2" height="2" fill="#D2B4DE" />
                    {/* Brillo */}
                    <rect x="10" y="5" width="1" height="2" fill="#FFFFFF" opacity="0.8" />
                  </svg>
                </div>
                <p className="text-gray-300 text-sm text-center">
                  Un cristal mágico que pulsa con energía. Parece reaccionar a la presencia de las gemas coleccionables.
                </p>
              </div>
            )}

            {/* Truth Viewer */}
            {selectedItem.id === 'truth' && (
              <div className="bg-gray-800 p-4 border border-pink-600">
                <div className="aspect-square bg-gradient-to-br from-pink-900/50 to-red-900/50 flex items-center justify-center mb-3">
                  <div className="text-6xl animate-pulse">💫</div>
                </div>
                <p className="text-pink-300 text-sm text-center font-bold mb-2">
                  LA VERDAD
                </p>
                <p className="text-gray-300 text-sm text-center">
                  Pinkie Pie no quería una fiesta normal. Quería una fiesta ETERNA. Usó las máquinas de la fábrica para atrapar a sus amigas en un ciclo infinito de celebración. Solo reuniendo las seis gemas puedes liberarlas y revelar al verdadero responsable: Milo, quien manipuló a Pinkie desde las sombras.
                </p>
              </div>
            )}

            {/* Gem Viewer */}
            {selectedItem.id.startsWith('gem_') && (
              <div className="bg-gray-800 p-4 border border-gray-600">
                <div className="aspect-square bg-gradient-to-br from-gray-900 to-black flex items-center justify-center mb-3">
                  <svg width="150" height="150" viewBox="0 0 20 20" style={{ imageRendering: 'pixelated' }}>
                    {/* Gema */}
                    <rect x="7" y="5" width="6" height="10" fill={
                      selectedItem.id === 'gem_1' ? '#FF69B4' :
                      selectedItem.id === 'gem_2' ? '#4169E1' :
                      selectedItem.id === 'gem_3' ? '#2ECC71' :
                      selectedItem.id === 'gem_4' ? '#9B59B6' :
                      selectedItem.id === 'gem_5' ? '#F1C40F' : '#E74C3C'
                    } />
                    <rect x="6" y="7" width="8" height="6" fill={
                      selectedItem.id === 'gem_1' ? '#FF1493' :
                      selectedItem.id === 'gem_2' ? '#0000CD' :
                      selectedItem.id === 'gem_3' ? '#27AE60' :
                      selectedItem.id === 'gem_4' ? '#8E44AD' :
                      selectedItem.id === 'gem_5' ? '#F39C12' : '#C0392B'
                    } />
                    {/* Brillo */}
                    <rect x="8" y="6" width="2" height="2" fill="#FFFFFF" opacity="0.7" />
                  </svg>
                </div>
                <p className="text-gray-300 text-sm text-center">
                  {selectedItem.id === 'gem_1' && 'Gema Rosa - Encontrada en Ponyville Abandonado. Representa la amistad.'}
                  {selectedItem.id === 'gem_2' && 'Gema Azul - Encontrada en Sugarcube Corner. Representa la alegría.'}
                  {selectedItem.id === 'gem_3' && 'Gema Verde - Encontrada en el Bosque Everfree. Representa la bondad.'}
                  {selectedItem.id === 'gem_4' && 'Gema Violeta - Encontrada en el Castillo de Twilight. Representa la magia.'}
                  {selectedItem.id === 'gem_5' && 'Gema Amarilla - Encontrada en la Fábrica de Fiestas. Representa la honestidad.'}
                  {selectedItem.id === 'gem_6' && 'Gema Roja - Encontrada en La Última Fiesta. Representa la lealtad.'}
                </p>
                <p className="text-pink-400 text-xs text-center mt-2">
                  Una de las seis gemas necesarias para desbloquear el final secreto.
                </p>
              </div>
            )}

            {/* Key Viewer */}
            {(selectedItem.id === 'key_sugarcube' || selectedItem.id === 'key_castle') && (
              <div className="bg-gray-800 p-4 border border-gray-600">
                <div className="aspect-square bg-gradient-to-br from-yellow-900/30 to-amber-900/30 flex items-center justify-center mb-3">
                  <svg width="150" height="150" viewBox="0 0 20 20" style={{ imageRendering: 'pixelated' }}>
                    {/* Llave */}
                    <rect x="6" y="4" width="8" height="8" fill="#FFD700" />
                    <rect x="7" y="5" width="6" height="6" fill="#FFA500" />
                    <rect x="9" y="12" width="2" height="6" fill="#FFD700" />
                    <rect x="11" y="14" width="2" height="2" fill="#FFD700" />
                    <rect x="11" y="16" width="2" height="2" fill="#FFD700" />
                    {/* Brillo */}
                    <rect x="8" y="6" width="2" height="2" fill="#FFFFFF" opacity="0.6" />
                  </svg>
                </div>
                <p className="text-gray-300 text-sm text-center">
                  {selectedItem.id === 'key_sugarcube' && 'Llave de Sugarcube Corner. Abre la puerta de la pastelería abandonada.'}
                  {selectedItem.id === 'key_castle' && 'Llave del Castillo de Twilight. Abre la puerta del castillo al final del Bosque Everfree.'}
                </p>
              </div>
            )}

            {/* Generic Item Viewer */}
            {!selectedItem.id.startsWith('photo_') && 
             selectedItem.id !== 'diary' && 
             selectedItem.id !== 'map' && 
             selectedItem.id !== 'crystal' && 
             selectedItem.id !== 'truth' && 
             !selectedItem.id.startsWith('gem_') &&
             selectedItem.id !== 'key_sugarcube' &&
             selectedItem.id !== 'key_castle' && (
              <div className="bg-gray-800 p-4 border border-gray-600">
                <div className="aspect-square bg-gradient-to-br from-gray-900/50 to-purple-900/50 flex items-center justify-center mb-3">
                  <div className="text-8xl">{selectedItem.icon}</div>
                </div>
                <p className="text-gray-300 text-sm text-center">
                  {selectedItem.name}
                </p>
              </div>
            )}

            <button
              onClick={() => setSelectedItem(null)}
              className="mt-4 w-full py-2.5 bg-pink-700 hover:bg-pink-600 text-white text-sm font-bold tracking-wider transition-colors"
            >
              CERRAR
            </button>
          </div>
        </div>
      )}

      {/* ===== SECRET ENDING - CELEBRACIÓN 10 MESES ===== */}
      {gameState === 'secretEnding' && (
        <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden" style={{ 
          background: 'linear-gradient(180deg, #1a0030 0%, #2a0050 30%, #ff69b4 70%, #ffb6c1 100%)' 
        }}>
          {/* Animación de gemas brillando */}
          <div className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 30 }).map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: 4 + (i % 3) * 2,
                  height: 4 + (i % 3) * 2,
                  left: `${(i * 37) % 100}%`,
                  top: `${(i * 23) % 100}%`,
                  backgroundColor: ['#FF69B4', '#4169E1', '#2ECC71', '#9B59B6', '#F1C40F', '#E74C3C'][i % 6],
                  opacity: 0.6 + Math.sin(Date.now() * 0.001 + i) * 0.4,
                  animation: `twinkle ${1 + (i % 3)}s infinite alternate`,
                  boxShadow: `0 0 10px ${['#FF69B4', '#4169E1', '#2ECC71', '#9B59B6', '#F1C40F', '#E74C3C'][i % 6]}`,
                }}
              />
            ))}
          </div>

          {endingPhase === 0 && (
            <div className="text-center z-10">
              <p className="text-white text-lg mb-4">Las seis gemas brillan intensamente...</p>
              <p className="text-pink-300 text-sm animate-pulse">Una puerta secreta se abre...</p>
            </div>
          )}

          {endingPhase === 1 && (
            <div className="text-center z-10">
              <p className="text-white text-lg mb-4">Una sombra aparece en la habitación...</p>
              <div className="mb-6">
                <svg width="120" height="100" viewBox="0 0 20 20" style={{ imageRendering: 'pixelated' }}>
                  {/* Milo */}
                  <rect x="5" y="9" width="12" height="8" fill="#000000" />
                  <rect x="6" y="2" width="10" height="8" fill="#000000" />
                  <rect x="6" y="10" width="10" height="6" fill="#1a0a1a" />
                  <rect x="7" y="3" width="8" height="7" fill="#1a0a1a" />
                  <rect x="9" y="-1" width="2" height="4" fill="#2a0a2a" />
                  <rect x="6" y="0" width="10" height="4" fill="#0a000a" />
                  <rect x="6" y="4" width="4" height="4" fill="#FF0000" />
                  <rect x="11" y="4" width="4" height="4" fill="#FF0000" />
                </svg>
              </div>
              <p className="text-purple-300 text-sm italic">"Soy Milo, y orquesté todo esto..."</p>
            </div>
          )}

          {endingPhase === 2 && (
            <div className="text-center z-10">
              <p className="text-white text-lg mb-4">"Quería crear la fiesta perfecta..."</p>
              <p className="text-pink-300 text-sm">"Una fiesta que nunca terminara. Pero necesitaba a alguien especial."</p>
              <p className="text-purple-300 text-sm mt-4 italic">"Alguien que entendiera el verdadero significado de la celebración."</p>
            </div>
          )}

          {endingPhase === 3 && (
            <div className="text-center z-10">
              <p className="text-white text-lg mb-6">La habitación comienza a transformarse...</p>
              <div className="flex justify-center gap-2 mb-4">
                {['🎈', '🎁', '🎂', '🎊', '✨'].map((emoji, i) => (
                  <span key={i} className="text-4xl animate-bounce" style={{ animationDelay: `${i * 0.1}s` }}>
                    {emoji}
                  </span>
                ))}
              </div>
              <p className="text-pink-400 text-sm animate-pulse">¡Luces, globos y decoración aparecen por todas partes!</p>
            </div>
          )}

          {endingPhase === 4 && (
            <div className="text-center z-10">
              <p className="text-white text-lg mb-6">Los personajes entran uno por uno...</p>
              <div className="flex flex-wrap justify-center gap-3 mb-4">
                {CHARACTERS.map((char, i) => (
                  <div key={char.id} className="animate-bounce" style={{ animationDelay: `${i * 0.2}s` }}>
                    <svg width="40" height="40" viewBox="0 0 20 20" style={{ imageRendering: 'pixelated' }}>
                      <rect x="5" y="9" width="12" height="8" fill="#000000" />
                      <rect x="6" y="2" width="10" height="8" fill="#000000" />
                      <rect x="6" y="10" width="10" height="6" fill={char.color} />
                      <rect x="7" y="3" width="8" height="7" fill={char.color} />
                      <rect x="6" y="0" width="10" height="4" fill={char.maneColor} />
                      <rect x="6" y="4" width="4" height="4" fill="white" />
                      <rect x="11" y="4" width="4" height="4" fill="white" />
                      <rect x="7" y="5" width="2" height="2" fill={char.eyeColor} />
                      <rect x="12" y="5" width="2" height="2" fill={char.eyeColor} />
                    </svg>
                  </div>
                ))}
              </div>
              <p className="text-pink-300 text-sm">Pinkie Pie, Twilight, Rainbow Dash, Fluttershy, Rarity y Applejack...</p>
              <p className="text-purple-300 text-sm">...y Milo, todos reunidos para una celebración especial.</p>
            </div>
          )}

          {endingPhase === 5 && (
            <div className="text-center z-10 bg-black/60 p-8 rounded-lg border-4 border-pink-500">
              <div className="mb-6">
                <span className="text-6xl">💖</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-pink-400 mb-4 animate-pulse" style={{ textShadow: '0 0 20px #ff69b4, 0 0 40px #ff1493' }}>
                ¡FELICES 10 MESES!
              </h2>
              <p className="text-xl text-white mb-4">¡10 MESES DE AVENTURAS, ALEGRÍA Y AMOR!</p>
              <p className="text-lg text-pink-300">¡QUE SIGAN MUCHAS MÁS AVENTURAS JUNTOS!</p>
              <div className="mt-6 flex justify-center gap-2">
                {['💎', '💎', '💎', '💎', '💎', '💎'].map((gem, i) => (
                  <span key={i} className="text-3xl animate-bounce" style={{ 
                    animationDelay: `${i * 0.1}s`,
                    color: ['#FF69B4', '#4169E1', '#2ECC71', '#9B59B6', '#F1C40F', '#E74C3C'][i]
                  }}>
                    {gem}
                  </span>
                ))}
              </div>
            </div>
          )}

          {endingPhase === 6 && (
            <div className="text-center z-10 bg-gradient-to-br from-pink-900/80 to-purple-900/80 p-10 rounded-2xl border-4 border-pink-400 shadow-2xl shadow-pink-500/50 max-w-2xl">
              <div className="mb-6 flex justify-center gap-3">
                <span className="text-5xl animate-pulse">🥹</span>
                <span className="text-5xl animate-pulse" style={{ animationDelay: '0.2s' }}>💕</span>
                <span className="text-5xl animate-pulse" style={{ animationDelay: '0.4s' }}>💕</span>
                <span className="text-5xl animate-pulse" style={{ animationDelay: '0.6s' }}>💕</span>
              </div>
              <p className="text-2xl text-white mb-6 leading-relaxed font-light">
                Te amo, gracias por estar conmigo.
              </p>
              <p className="text-2xl text-pink-300 mb-6 leading-relaxed font-light">
                De verdad que te amo, mi.. Pinkie Pie.
              </p>
              <p className="text-xl text-purple-200 mb-8 leading-relaxed italic">
                Juntos tendremos una fiesta eterna, donde nos amaremos eternamente.
              </p>
              <div className="flex justify-center gap-2">
                <span className="text-6xl animate-bounce">🥹</span>
                <span className="text-6xl animate-bounce" style={{ animationDelay: '0.1s' }}>💕</span>
                <span className="text-6xl animate-bounce" style={{ animationDelay: '0.2s' }}>💕</span>
                <span className="text-6xl animate-bounce" style={{ animationDelay: '0.3s' }}>💕</span>
              </div>
            </div>
          )}

          {endingPhase >= 7 && (
            <div className="text-center z-10">
              <p className="text-pink-400 text-lg mb-4">¡GRACIAS POR COMPARTIR ESTA AVENTURA!</p>
              <p className="text-white text-sm mb-6">Una sorpresa especial para ti, con todo mi amor 💕</p>
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

      {/* ===== ENDING NORMAL ===== */}
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
