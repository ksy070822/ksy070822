
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { RoleType, GameState, Item, DialogueEvent, Position } from './types';
import { ROLES_INFO, SCENARIO, ITEMS } from './constants';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    role: null,
    stage: 0,
    chaosGauge: 30,
    riskGauge: 10,
    inventory: [],
    isGameOver: false,
    history: ["장애대응 마스터 킹덤에 오신 것을 환영합니다."],
    playerPosition: { x: 50, y: 50 },
    interactingWith: null
  });

  const [currentChoiceFeedback, setCurrentChoiceFeedback] = useState<string | null>(null);
  const [characterImageUrl, setCharacterImageUrl] = useState<string | null>(null);
  const [roleImages, setRoleImages] = useState<Record<string, string>>({});
  const [allyImages, setAllyImages] = useState<Record<string, string>>({});
  const [isGeneratingAssets, setIsGeneratingAssets] = useState(false);
  const [mapImageUrl, setMapImageUrl] = useState<string | null>(null);
  const [showItemAlert, setShowItemAlert] = useState<Item | null>(null);

  const [isMoving, setIsMoving] = useState(false);
  const [facingDirection, setFacingDirection] = useState<'left' | 'right'>('right');
  const [dustParticles, setDustParticles] = useState<{ id: number, x: number, y: number }[]>([]);
  const dustIdRef = useRef(0);

  const aiRef = useRef(new GoogleGenAI({ apiKey: process.env.API_KEY }));

  // Generate role icons for the selection screen
  useEffect(() => {
    if (gameState.role) return;
    
    const generateRoleIcons = async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const roles = Object.keys(ROLES_INFO) as RoleType[];
      const newRoleImages: Record<string, string> = {};
      
      for (const role of roles) {
        try {
          const res = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [{ text: (ROLES_INFO as any)[role].visualPrompt }] },
          });
          for (const part of res.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
              newRoleImages[role] = `data:image/png;base64,${part.inlineData.data}`;
              break;
            }
          }
        } catch (e) { console.error(e); }
      }
      setRoleImages(newRoleImages);
    };

    generateRoleIcons();
  }, [gameState.role]);

  const generateAssets = async (role: RoleType) => {
    setIsGeneratingAssets(true);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const roleInfo = (ROLES_INFO as any)[role];
      
      // 1. Player Character (If not already in roleImages)
      if (!roleImages[role]) {
        const charRes = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: { parts: [{ text: roleInfo.visualPrompt }] },
        });
        for (const part of charRes.candidates?.[0]?.content?.parts || []) {
          if (part.inlineData) {
            setCharacterImageUrl(`data:image/png;base64,${part.inlineData.data}`);
            break;
          }
        }
      } else {
        setCharacterImageUrl(roleImages[role]);
      }

      // 2. Allies
      const allyPrompts = [
        { id: 'cx', prompt: "Chibi pixel art RPG villager soldier wearing heavy silver armor, holding a spear, high detail fantasy sprite, transparent background" },
        { id: 'sage', prompt: "Chibi pixel art RPG old wizard with a long white beard, wearing celestial blue robes, high detail fantasy sprite, transparent background" },
        { id: 'biz', prompt: "Chibi pixel art RPG king in golden crown and red velvet robes, holding a scepter, high detail fantasy sprite, transparent background" },
        { id: 'infra', prompt: "Chibi pixel art RPG giant golem made of iron and gears, high detail fantasy sprite, transparent background" }
      ];

      const newAllyImages: Record<string, string> = {};
      for (const item of allyPrompts) {
        const allyRes = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: { parts: [{ text: item.prompt }] },
        });
        for (const part of allyRes.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                newAllyImages[item.id] = `data:image/png;base64,${part.inlineData.data}`;
                break;
            }
        }
      }
      setAllyImages(newAllyImages);

      // 3. Map
      const mapPrompt = "Top-down high-detail 2D pixel art RPG village, traditional Korean Hanok architecture with glowing magical tech elements, yellow and black Kakao T style banners, lush environments, high quality";
      const mapRes = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: mapPrompt }] },
      });
      for (const part of mapRes.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          setMapImageUrl(`data:image/png;base64,${part.inlineData.data}`);
          break;
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsGeneratingAssets(false);
    }
  };

  const handleRoleSelect = (selectedRole: RoleType) => {
    const roleInfo = (ROLES_INFO as any)[selectedRole];
    setGameState(prev => ({ 
      ...prev, 
      role: selectedRole, 
      stage: 1,
      inventory: [roleInfo.baseItem]
    }));
    generateAssets(selectedRole);
  };

  // Movement Logic
  useEffect(() => {
    if (!gameState.role || gameState.isGameOver || currentChoiceFeedback || isGeneratingAssets) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState.interactingWith && (e.key === 'Escape' || e.key === 'x')) {
        setGameState(prev => ({ ...prev, interactingWith: null }));
        return;
      }

      const moveKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 's', 'a', 'd'];
      const key = e.key.toLowerCase();
      if (!moveKeys.includes(key)) return;

      setIsMoving(true);
      const step = 2.0;
      
      setGameState(prev => {
        let { x, y } = prev.playerPosition;
        if (key === 'arrowup' || key === 'w') y = Math.max(5, y - step);
        if (key === 'arrowdown' || key === 's') y = Math.min(95, y + step);
        if (key === 'arrowleft' || key === 'a') { x = Math.max(5, x - step); setFacingDirection('left'); }
        if (key === 'arrowright' || key === 'd') { x = Math.min(95, x + step); setFacingDirection('right'); }

        const currentStep = SCENARIO.find(s => s.id === prev.stage);
        const events = currentStep?.events[prev.role!] || [];
        let newlyInteracting: DialogueEvent | null = null;
        
        for (const event of events) {
          const dx = x - event.pos.x;
          const dy = y - event.pos.y;
          if (Math.sqrt(dx*dx + dy*dy) < 8) {
            newlyInteracting = event;
            break;
          }
        }

        return { ...prev, playerPosition: { x, y }, interactingWith: newlyInteracting };
      });
    };

    const handleKeyUp = () => setIsMoving(false);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState.role, gameState.isGameOver, currentChoiceFeedback, gameState.stage, gameState.interactingWith, isGeneratingAssets]);

  const handleChoiceSelect = (choice: any) => {
    const { isBest, impact, feedback } = choice;
    setCurrentChoiceFeedback(feedback);
    setIsMoving(false);
    if (impact.item) {
      setShowItemAlert(impact.item);
      setTimeout(() => setShowItemAlert(null), 3000);
    }
    setGameState(prev => ({
      ...prev,
      chaosGauge: Math.max(0, Math.min(100, prev.chaosGauge + impact.chaos)),
      riskGauge: Math.max(0, Math.min(100, prev.riskGauge + impact.risk)),
      inventory: impact.item ? [...prev.inventory, impact.item] : prev.inventory,
      history: [...prev.history, `${isBest ? '✨' : '⚠️'} ${feedback}`],
      interactingWith: null,
      playerPosition: { x: 50, y: 50 }
    }));
  };

  const nextStage = () => {
    setCurrentChoiceFeedback(null);
    setGameState(prev => {
      const nextStageNum = prev.stage + 1;
      const isGameOver = nextStageNum > SCENARIO.length || prev.chaosGauge >= 90 || prev.riskGauge >= 90;
      return { ...prev, stage: nextStageNum, isGameOver };
    });
  };

  if (!gameState.role) {
    return (
      <div className="min-h-screen bg-[#0d0d1a] flex flex-col items-center justify-center p-4 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 to-black pointer-events-none" />
        
        <div className="relative z-10 text-center mb-12">
            <div className="flex items-center justify-center gap-4 mb-2">
                <span className="text-yellow-400 text-4xl">⚜️</span>
                <h1 className="text-5xl font-black text-white tracking-widest drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">NEW GAME - ROLE SELECTION</h1>
                <span className="text-yellow-400 text-4xl">⚜️</span>
            </div>
            <div className="bg-amber-100/10 border-2 border-amber-900/50 px-8 py-2 inline-block">
                <p className="text-amber-200 font-bold tracking-[0.3em] uppercase">Chronicles of Crisis Response Masters</p>
            </div>
        </div>

        <div className="flex gap-4 w-full max-w-7xl justify-center items-end px-4 overflow-x-auto pb-10 custom-scrollbar">
          {(Object.entries(ROLES_INFO) as [RoleType, any][]).map(([key, info]) => (
            <div 
              key={key} 
              onClick={() => handleRoleSelect(key)}
              className="flex flex-col items-center group cursor-pointer min-w-[220px] transition-all hover:scale-105"
            >
              <div className="relative mb-4">
                  {/* Glowing Pedestal */}
                  <div className="w-40 h-10 bg-gray-800 rounded-[50%] border-b-8 border-gray-900 relative z-0 flex items-center justify-center">
                    <div className="absolute -top-4 inset-0 bg-yellow-400/30 blur-xl animate-pulse rounded-full" />
                    <div className="absolute inset-0 border-4 border-yellow-600/50 rounded-[50%]" />
                  </div>
                  {/* Character Sprite */}
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-32 h-32 flex items-center justify-center z-10">
                    {roleImages[key] ? (
                      <img src={roleImages[key]} className="w-full h-full object-contain animate-float" alt={key} />
                    ) : (
                      <div className="w-16 h-16 bg-white/10 rounded-full animate-pulse" />
                    )}
                  </div>
              </div>
              <div className="text-center bg-black/80 p-4 border-t-2 border-yellow-600/50 w-full">
                  <h3 className="text-yellow-400 font-black text-lg tracking-tighter uppercase whitespace-nowrap">{info.name}</h3>
                  <p className="text-white font-bold text-2xl tracking-tighter mb-2">{info.title}</p>
                  <div className={`h-1 w-full bg-gradient-to-r ${info.color} mb-2`} />
                  <p className="text-gray-400 text-xs leading-tight h-10">{info.description}</p>
              </div>
            </div>
          ))}
        </div>
        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          .animate-float { animation: float 3s ease-in-out infinite; }
          .custom-scrollbar::-webkit-scrollbar { height: 8px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: #000; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #ca8a04; }
        `}</style>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-black overflow-hidden relative font-sans select-none">
      {/* Top HUD */}
      <div className="p-4 bg-black border-b-4 border-gray-800 flex justify-between items-center z-50">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-gray-900 border-4 border-yellow-600 relative overflow-hidden">
            {characterImageUrl && <img src={characterImageUrl} className="w-full h-full object-cover scale-150" />}
          </div>
          <div>
            <h2 className="text-yellow-400 text-2xl font-black italic">{(ROLES_INFO as any)[gameState.role].name}</h2>
            <div className="flex gap-2">
                <span className="bg-indigo-900 text-[10px] px-2 py-0.5 border border-white">STAGE {gameState.stage}</span>
                <span className="bg-purple-900 text-[10px] px-2 py-0.5 border border-white">{SCENARIO.find(s=>s.id===gameState.stage)?.time}</span>
            </div>
          </div>
        </div>

        <div className="flex-1 max-w-md mx-8 space-y-2">
          <div className="relative">
            <div className="flex justify-between text-[10px] mb-1 font-black text-purple-400 uppercase"><span>조직 혼란 (CHAOS)</span><span>{gameState.chaosGauge}%</span></div>
            <div className="h-3 bg-gray-800 border border-white overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500" style={{ width: `${gameState.chaosGauge}%` }} />
            </div>
          </div>
          <div className="relative">
            <div className="flex justify-between text-[10px] mb-1 font-black text-red-400 uppercase"><span>대외 리스크 (RISK)</span><span>{gameState.riskGauge}%</span></div>
            <div className="h-3 bg-gray-800 border border-white overflow-hidden">
              <div className="h-full bg-gradient-to-r from-red-600 to-orange-500 transition-all duration-500" style={{ width: `${gameState.riskGauge}%` }} />
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {gameState.inventory.map((item, idx) => (
            <div key={idx} className="w-12 h-12 bg-gray-900 border-2 border-yellow-600 flex items-center justify-center text-3xl relative group">
              {item.icon}
              <div className="absolute top-full right-0 mt-2 w-40 bg-black p-2 border border-yellow-600 text-[10px] hidden group-hover:block z-[100] shadow-2xl">
                  <p className="text-yellow-400 font-bold mb-1">{item.name}</p>
                  <p className="text-gray-400">{item.description}</p>
              </div>
            </div>
          ))}
          {Array.from({ length: 5 - gameState.inventory.length }).map((_, i) => (
            <div key={i} className="w-12 h-12 bg-black border-2 border-gray-800 border-dashed flex items-center justify-center text-gray-700">?</div>
          ))}
        </div>
      </div>

      {/* Main Game Map */}
      <div className={`flex-1 relative overflow-hidden bg-gray-950 ${gameState.chaosGauge > 70 ? 'incident-active' : ''}`}>
        {mapImageUrl && (
          <img 
            src={mapImageUrl} 
            className="absolute inset-0 w-full h-full object-cover opacity-70 transition-all duration-1000 map-ripple" 
            style={{ 
              transform: `scale(1.1) translate(${(gameState.playerPosition.x - 50) * -0.1}%, ${(gameState.playerPosition.y - 50) * -0.1}%)`
            }} 
          />
        )}

        {isGeneratingAssets && (
          <div className="absolute inset-0 bg-black flex flex-col items-center justify-center z-[200]">
            <div className="w-80 p-8 border-4 border-yellow-600 bg-gray-900 text-center">
                <div className="text-6xl animate-bounce mb-4">⚜️</div>
                <h3 className="text-2xl font-black text-yellow-400 mb-6 italic tracking-widest">TRANSMITTING...</h3>
                <div className="h-4 bg-gray-800 border-2 border-yellow-600 overflow-hidden">
                    <div className="h-full bg-yellow-400 animate-loading-bar" />
                </div>
                <p className="mt-4 text-xs text-gray-500 font-bold uppercase tracking-widest">Synchronizing Kingdom Relics</p>
            </div>
          </div>
        )}

        {/* NPCs */}
        {!currentChoiceFeedback && SCENARIO.find(s=>s.id===gameState.stage)?.events[gameState.role!].map((event, idx) => (
          <div key={idx} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${event.pos.x}%`, top: `${event.pos.y}%` }}>
            <div className="flex flex-col items-center group">
              {allyImages[event.ally.id] ? (
                <img src={allyImages[event.ally.id]} className="w-24 h-24 animate-bounce" alt={event.ally.name} />
              ) : <div className="text-4xl">👤</div>}
              <div className="bg-black/90 border border-yellow-600 px-2 py-1 text-[10px] text-yellow-400 font-black whitespace-nowrap">{event.ally.name}</div>
            </div>
          </div>
        ))}

        {/* Player */}
        <div className="absolute -translate-x-1/2 -translate-y-1/2 z-40" style={{ left: `${gameState.playerPosition.x}%`, top: `${gameState.playerPosition.y}%` }}>
          <div style={{ transform: facingDirection === 'left' ? 'scaleX(-1)' : 'scaleX(1)' }}>
            <div className={isMoving ? 'character-walking' : 'character-idle'}>
              {characterImageUrl ? <img src={characterImageUrl} className="w-32 h-32 object-contain drop-shadow-[0_0_10px_white]" /> : <div className="text-6xl">👤</div>}
            </div>
          </div>
          <div className={`w-14 h-4 bg-black/40 rounded-full blur-sm absolute -bottom-2 left-1/2 -translate-x-1/2 ${isMoving ? 'shadow-walking' : ''}`} />
        </div>

        {/* Dialogue Box */}
        {gameState.interactingWith && !currentChoiceFeedback && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-4xl px-4 z-[60]">
            <div className="bg-black border-[6px] border-yellow-600 p-6 flex gap-6 items-start shadow-[0_0_50px_rgba(0,0,0,0.8)]">
                <div className="w-24 h-24 bg-gray-800 border-2 border-yellow-600 shrink-0 overflow-hidden">
                  {allyImages[gameState.interactingWith.ally.id] && <img src={allyImages[gameState.interactingWith.ally.id]} className="w-full h-full object-cover scale-150" />}
                </div>
                <div className="flex-1">
                    <p className="text-yellow-400 font-black mb-2 italic">{gameState.interactingWith.ally.name} <span className="text-gray-600 text-xs ml-2">[{gameState.interactingWith.ally.role}]</span></p>
                    <p className="text-xl font-bold leading-tight mb-6">"{gameState.interactingWith.dialogue}"</p>
                    <div className="space-y-3">
                      {SCENARIO.find(s=>s.id===gameState.stage)?.choices[gameState.role!].map((choice, i) => (
                        <button key={i} onClick={() => handleChoiceSelect(choice)} className="w-full text-left bg-gray-900/50 hover:bg-yellow-900/50 border border-yellow-600/30 p-3 flex items-center gap-4 transition-all">
                          <span className="text-yellow-400">▶</span>
                          <span className="font-bold">{choice.text}</span>
                        </button>
                      ))}
                    </div>
                </div>
            </div>
          </div>
        )}

        {/* Tactical Result Overlay */}
        {currentChoiceFeedback && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-[100] p-10 backdrop-blur-sm">
            <div className="bg-black border-[6px] border-yellow-600 p-10 max-w-2xl w-full text-center">
              <h3 className="text-3xl font-black text-yellow-400 mb-6 italic tracking-widest border-b-2 border-yellow-600 pb-2">TACTICAL ANALYSIS</h3>
              <p className="text-xl leading-relaxed mb-10 font-bold">{currentChoiceFeedback}</p>
              <button onClick={nextStage} className="bg-yellow-600 hover:bg-yellow-400 text-white px-10 py-4 font-black text-2xl border-2 border-white transition-all active:scale-95 shadow-2xl">CONTINUE MISSION →</button>
            </div>
          </div>
        )}

        {showItemAlert && (
          <div className="absolute top-24 left-1/2 -translate-x-1/2 z-[110] bg-yellow-400 text-black px-6 py-2 border-4 border-white font-black text-xl animate-bounce">
              LEGENDARY ITEM ACQUIRED: {showItemAlert.name}!
          </div>
        )}
      </div>

      {/* Log Console */}
      <div className="h-32 bg-black border-t-4 border-gray-800 p-4 overflow-y-auto font-mono text-xs">
        <div className="flex items-center gap-2 mb-2 text-green-500 font-bold border-b border-green-900 pb-1 uppercase tracking-widest">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Tactical Mission Log
        </div>
        {gameState.history.map((log, i) => (
          <p key={i} className={`mb-1 ${log.includes('⚠️') ? 'text-red-400' : 'text-green-400/80'}`}>
            <span className="opacity-30 mr-2">[{new Date().toLocaleTimeString()}]</span> {log}
          </p>
        ))}
      </div>

      <style>{`
        @keyframes loading-bar { 0% { width: 0%; } 100% { width: 100%; } }
        .animate-loading-bar { animation: loading-bar 2s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default App;
