
import React, { useState, useEffect, useRef } from 'react';
import { RoleType, GameState, Item, DialogueEvent, Position } from './types';
import { ROLES_INFO, SCENARIO } from './constants';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    role: null,
    stage: 0,
    chaosGauge: 30,
    riskGauge: 10,
    inventory: [],
    isGameOver: false,
    history: ["서기 2025년... 평화롭던 킹덤 오브 서비스에 장애의 그림자가 드리웁니다."],
    playerPosition: { x: 50, y: 50 },
    interactingWith: null
  });

  const [currentChoiceFeedback, setCurrentChoiceFeedback] = useState<string | null>(null);
  const [characterImageUrl, setCharacterImageUrl] = useState<string | null>(null);
  const [isGeneratingAssets, setIsGeneratingAssets] = useState(false);
  const [mapImageUrl, setMapImageUrl] = useState<string | null>(null);
  const [showItemAlert, setShowItemAlert] = useState<Item | null>(null);
  const [hasClosedDialogueAtPos, setHasClosedDialogueAtPos] = useState<string | null>(null);

  const aiRef = useRef(new GoogleGenAI({ apiKey: process.env.API_KEY }));

  const generateAssets = async (role: RoleType) => {
    setIsGeneratingAssets(true);
    try {
      const roleInfo = ROLES_INFO[role];
      // 캐릭터 생성 (플레이어가 제공한 이미지 느낌의 SD 캐릭터)
      const charPrompt = `Fantasy RPG 2D pixel art character sprite, SD chibi style, ${role} hero holding ${roleInfo.weapon}, Dragon Quest style, transparent background.`;
      const charRes: GenerateContentResponse = await aiRef.current.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: charPrompt }] },
      });
      for (const part of charRes.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          setCharacterImageUrl(`data:image/png;base64,${part.inlineData.data}`);
          break;
        }
      }

      // 맵 생성 (마을 배경)
      const mapPrompt = `Top-down 2D pixel art game map background, peaceful Korean fantasy village with Kakao T themed modern buildings, Dragon Quest style village layout.`;
      const mapRes: GenerateContentResponse = await aiRef.current.models.generateContent({
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
      console.error("Asset generation failed:", error);
    } finally {
      setIsGeneratingAssets(false);
    }
  };

  const handleRoleSelect = (selectedRole: RoleType) => {
    setGameState(prev => ({ ...prev, role: selectedRole, stage: 1 }));
    generateAssets(selectedRole);
  };

  // 이동 및 상호작용 로직
  useEffect(() => {
    if (!gameState.role || gameState.isGameOver || currentChoiceFeedback) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // 대화창 닫기 (ESC 또는 X)
      if (gameState.interactingWith && (e.key === 'Escape' || e.key === 'x' || e.key === 'X')) {
        setHasClosedDialogueAtPos(gameState.interactingWith.ally.id);
        setGameState(prev => ({ ...prev, interactingWith: null }));
        return;
      }

      // 이동 (대화 중에는 이동 불가하도록 설정 가능하지만, 사용자의 "가까워지면 띄워라"는 의도상 열린 채로 이동도 가능하게 구현)
      const step = 2.5; 
      setGameState(prev => {
        let { x, y } = prev.playerPosition;
        if (['ArrowUp', 'w', 'W'].includes(e.key)) y = Math.max(5, y - step);
        if (['ArrowDown', 's', 'S'].includes(e.key)) y = Math.min(95, y + step);
        if (['ArrowLeft', 'a', 'A'].includes(e.key)) x = Math.max(5, x - step);
        if (['ArrowRight', 'd', 'D'].includes(e.key)) x = Math.min(95, x + step);

        // NPC 근접 감지
        const currentStep = SCENARIO.find(s => s.id === prev.stage);
        const events = currentStep?.events[prev.role!] || [];
        let newlyInteracting: DialogueEvent | null = null;
        
        for (const event of events) {
          const dx = x - event.pos.x;
          const dy = y - event.pos.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 5) { // 상호작용 반경
            // 이미 ESC로 닫은 경우 다시 멀어졌다 오기 전까진 안 띄움
            if (hasClosedDialogueAtPos !== event.ally.id) {
              newlyInteracting = event;
            }
            break;
          } else {
            // 거리가 멀어지면 ESC 플래그 초기화
            if (hasClosedDialogueAtPos === event.ally.id) {
              setHasClosedDialogueAtPos(null);
            }
          }
        }

        return { ...prev, playerPosition: { x, y }, interactingWith: newlyInteracting };
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState.role, gameState.isGameOver, currentChoiceFeedback, gameState.stage, gameState.interactingWith, hasClosedDialogueAtPos]);

  const handleChoiceSelect = (choice: any) => {
    const { isBest, impact, feedback } = choice;
    setCurrentChoiceFeedback(feedback);
    
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
      playerPosition: { x: 50, y: 50 } // 스테이지 전환 시 위치 초기화
    }));
    setHasClosedDialogueAtPos(null);
  };

  const nextStage = () => {
    setCurrentChoiceFeedback(null);
    setGameState(prev => {
      const nextStageNum = prev.stage + 1;
      const isGameOver = nextStageNum > SCENARIO.length || prev.chaosGauge >= 90 || prev.riskGauge >= 90;
      return { ...prev, stage: nextStageNum, isGameOver };
    });
  };

  const resetGame = () => {
    setGameState({
      role: null,
      stage: 0,
      chaosGauge: 30,
      riskGauge: 10,
      inventory: [],
      isGameOver: false,
      history: ["새로운 훈련이 시작됩니다."],
      playerPosition: { x: 50, y: 50 },
      interactingWith: null
    });
    setCharacterImageUrl(null);
    setMapImageUrl(null);
    setHasClosedDialogueAtPos(null);
  };

  if (gameState.isGameOver) {
    const isSuccess = gameState.chaosGauge < 80 && gameState.riskGauge < 80;
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-black">
        <div className="pixel-border bg-gray-900 p-10 max-w-2xl text-center border-4 border-white shadow-[0_0_20px_rgba(255,255,255,0.3)]">
          <h1 className="text-4xl mb-6 text-yellow-400 font-bold">{isSuccess ? "🏆 장애대응 마스터 탄생!" : "💀 킹덤의 멸망..."}</h1>
          <div className="mb-8 text-8xl animate-bounce">{isSuccess ? "👑" : "💥"}</div>
          <p className="text-xl mb-8 leading-relaxed">
            {isSuccess 
              ? "동료들과의 완벽한 합심으로 킹덤의 평화를 지켜냈습니다! 이제 당신은 어떤 장애 괴물도 두렵지 않은 마스터입니다."
              : "조직의 위기를 극복하지 못했습니다. 당신의 부재 속에 장애 괴물이 킹덤을 휩쓸었습니다. 다시 도전하세요."}
          </p>
          <button onClick={resetGame} className="bg-yellow-600 hover:bg-yellow-400 text-white px-10 py-5 pixel-border border-2 border-white text-2xl font-black transition-all">
            다시 도전하기
          </button>
        </div>
      </div>
    );
  }

  if (!gameState.role) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-[#0a0a1a] overflow-y-auto">
        <div className="relative mb-12">
            <h1 className="text-6xl font-black text-yellow-400 tracking-tighter text-center italic drop-shadow-[0_0_10px_rgba(253,224,71,0.5)]">
                KINGDOM OF SERVICE<br/>INCIDENT MASTER
            </h1>
        </div>
        <p className="text-2xl mb-12 text-blue-300 font-bold border-y border-blue-900 py-2">~ 2025 명절 장애대응 모의훈련 ~</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-7xl px-4">
          {Object.entries(ROLES_INFO).map(([role, info]) => (
            <div 
              key={role}
              onClick={() => handleRoleSelect(role as RoleType)}
              className={`p-6 pixel-border cursor-pointer transform hover:-translate-y-4 transition-all duration-300 ${info.color} hover:brightness-125 border-4 border-white`}
            >
              <div className="text-7xl mb-6 text-center">{info.icon}</div>
              <h2 className="text-2xl font-bold mb-4 text-center border-b-2 border-white pb-2">{role}</h2>
              <p className="text-lg mb-6 h-20 leading-snug text-center">{info.description}</p>
              <div className="bg-black bg-opacity-40 p-4 text-sm space-y-2 rounded border border-white border-opacity-30">
                <p>⚔️ 주무기: <span className="text-yellow-300 font-bold">{info.weapon}</span></p>
                <p>✨ 특수기: <span className="text-cyan-300 font-bold">{info.ability}</span></p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const currentStep = SCENARIO.find(s => s.id === gameState.stage);
  const activeEvents = currentStep?.events[gameState.role!] || [];
  const activeChoices = currentStep?.choices[gameState.role!] || [];

  return (
    <div className="flex flex-col h-screen bg-black overflow-hidden relative font-sans select-none">
      {/* HUD (Top) */}
      <div className="p-4 bg-black border-b-4 border-gray-800 flex justify-between items-center z-50">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-gray-900 pixel-border overflow-hidden border-2 border-white">
            {isGeneratingAssets ? (
              <div className="flex items-center justify-center h-full animate-pulse text-[10px]">Loading...</div>
            ) : characterImageUrl ? (
              <img src={characterImageUrl} alt="Hero" className="w-full h-full object-cover scale-150" />
            ) : (
              <div className="text-4xl text-center mt-2">{ROLES_INFO[gameState.role].icon}</div>
            )}
          </div>
          <div>
            <p className="text-yellow-400 text-xl font-bold tracking-tight">{gameState.role}</p>
            <div className="flex gap-2 mt-1">
                <span className="bg-blue-900 text-[10px] px-2 py-0.5 border border-white">STAGE {gameState.stage}</span>
                <span className="bg-purple-900 text-[10px] px-2 py-0.5 border border-white">{currentStep?.time}</span>
            </div>
          </div>
        </div>

        <div className="flex-1 max-w-md mx-8 space-y-2">
          <div className="relative">
            <div className="flex justify-between text-[10px] mb-1 font-black text-purple-400"><span>조직 혼란도 (CHAOS)</span><span>{gameState.chaosGauge}%</span></div>
            <div className="gauge-container h-3 border border-white"><div className="gauge-fill bg-gradient-to-r from-purple-500 to-pink-500" style={{ width: `${gameState.chaosGauge}%` }}></div></div>
          </div>
          <div className="relative">
            <div className="flex justify-between text-[10px] mb-1 font-black text-red-400"><span>대외 리스크 (RISK)</span><span>{gameState.riskGauge}%</span></div>
            <div className="gauge-container h-3 border border-white"><div className="gauge-fill bg-gradient-to-r from-red-600 to-orange-500" style={{ width: `${gameState.riskGauge}%` }}></div></div>
          </div>
        </div>

        <div className="flex gap-2">
          {gameState.inventory.map(item => (
            <div key={item.id} className="w-10 h-10 bg-gray-800 border-2 border-white flex items-center justify-center text-2xl group relative">
              {item.icon}
              <div className="absolute top-12 right-0 w-48 bg-black p-3 text-[10px] hidden group-hover:block z-[100] border-2 border-white shadow-2xl">
                <p className="text-yellow-400 font-bold mb-1 border-b border-yellow-900 pb-1">{item.name}</p>
                <p className="text-gray-300 leading-tight">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* World Map View (Center) */}
      <div className="flex-1 relative overflow-hidden bg-gray-900">
        {mapImageUrl && (
          <img 
            src={mapImageUrl} 
            alt="Map" 
            className="absolute inset-0 w-full h-full object-cover opacity-60 pointer-events-none"
          />
        )}
        
        {/* NPCs */}
        {!currentChoiceFeedback && activeEvents.map((event, idx) => (
          <div 
            key={idx}
            className="absolute transition-all duration-300 transform -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${event.pos.x}%`, top: `${event.pos.y}%` }}
          >
            <div className="relative flex flex-col items-center">
              <div className="text-4xl animate-bounce mb-2 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">{event.ally.icon}</div>
              <div className="bg-black bg-opacity-90 px-3 py-1 border-2 border-white text-[10px] text-yellow-300 font-bold whitespace-nowrap shadow-lg">
                {event.ally.name}
              </div>
            </div>
          </div>
        ))}

        {/* Player Sprite */}
        <div 
          className="absolute transition-all duration-100 transform -translate-x-1/2 -translate-y-1/2 z-40"
          style={{ left: `${gameState.playerPosition.x}%`, top: `${gameState.playerPosition.y}%` }}
        >
          <div className="relative">
            {characterImageUrl ? (
              <img src={characterImageUrl} alt="Hero" className="w-16 h-16 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]" />
            ) : (
              <div className="text-5xl">{ROLES_INFO[gameState.role].icon}</div>
            )}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-2 bg-black bg-opacity-40 rounded-full blur-sm"></div>
          </div>
        </div>

        {/* Dialogue UI (Dragon Quest Style) */}
        {gameState.interactingWith && !currentChoiceFeedback && (
          <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 w-full max-w-4xl px-4 z-[60] animate-in slide-in-from-bottom-6">
            <div className="bg-black border-[6px] border-white p-8 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative">
              <div className="absolute -top-10 left-8 bg-black border-4 border-white px-6 py-2 text-yellow-400 font-bold text-2xl italic tracking-tight">
                {gameState.interactingWith.ally.name}
              </div>
              <div className="flex gap-8 items-start">
                <div className="w-24 h-24 bg-gray-800 border-4 border-white flex items-center justify-center text-7xl shrink-0 shadow-inner">
                  {gameState.interactingWith.ally.icon}
                </div>
                <div className="flex-1">
                  <p className="text-2xl leading-relaxed mb-8 font-bold border-b-2 border-white border-opacity-10 pb-4 italic tracking-wide">
                    "{gameState.interactingWith.dialogue}"
                  </p>
                  <div className="space-y-6">
                    <p className="text-cyan-400 text-sm font-bold tracking-widest uppercase">
                        ✨ 도움 효과: {gameState.interactingWith.effectDescription}
                    </p>
                    <div className="grid grid-cols-1 gap-4">
                      {activeChoices.map((choice, i) => (
                        <button
                          key={i}
                          onClick={() => handleChoiceSelect(choice)}
                          className="w-full text-left bg-gray-950 hover:bg-blue-900 border-2 border-white border-opacity-20 hover:border-opacity-100 p-5 transition-all flex items-center gap-4 group relative overflow-hidden"
                        >
                          <span className="text-yellow-400 animate-pulse group-hover:scale-125 transition-transform text-2xl">▶</span>
                          <span className="text-xl font-bold group-hover:text-yellow-300 transition-colors">{choice.text}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-4 right-4 text-[10px] text-gray-500 animate-pulse uppercase tracking-widest">
                Press ESC to cancel interaction
              </div>
            </div>
          </div>
        )}

        {/* Feedback/Result Modal */}
        {currentChoiceFeedback && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 z-[100] p-10 backdrop-blur-sm">
            <div className="bg-black border-[6px] border-white p-12 max-w-2xl w-full text-center animate-in zoom-in duration-300 shadow-[0_0_100px_rgba(255,255,255,0.2)]">
              <h3 className="text-4xl font-black text-yellow-400 mb-8 italic tracking-tighter underline underline-offset-8 decoration-double">TACTICAL RESULT</h3>
              <p className="text-2xl leading-relaxed text-blue-100 mb-12 font-bold px-4">
                {currentChoiceFeedback}
              </p>
              <button 
                onClick={nextStage} 
                className="bg-yellow-600 hover:bg-yellow-400 text-white px-12 py-6 border-4 border-white text-3xl font-black transition-all active:scale-95 shadow-2xl hover:text-black tracking-tight"
              >
                NEXT STAGE →
              </button>
            </div>
          </div>
        )}

        {/* Item Alert */}
        {showItemAlert && (
            <div className="absolute top-24 left-1/2 transform -translate-x-1/2 z-[110] bg-yellow-400 text-black px-8 py-4 border-4 border-white font-black text-2xl flex items-center gap-6 animate-bounce shadow-[0_0_30px_rgba(253,224,71,0.6)]">
                <span>{showItemAlert.icon} 아이템 획득: {showItemAlert.name}!</span>
            </div>
        )}

        {/* Instruction Message */}
        {gameState.stage === 1 && !gameState.interactingWith && !currentChoiceFeedback && (
            <div className="absolute top-24 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-90 px-8 py-6 border-4 border-white max-w-xl text-center animate-in fade-in slide-in-from-top-6 duration-1000 shadow-2xl">
                <p className="text-2xl leading-relaxed font-bold">
                    마을의 <span className="text-yellow-400">동료들</span>에게 다가가 조언을 듣고 킹덤의 위기를 해결하세요!
                </p>
                <p className="text-sm mt-4 text-gray-400 font-bold uppercase tracking-[0.2em]">WASD / Arrow Keys to Move</p>
            </div>
        )}
      </div>

      {/* Log (Bottom) */}
      <div className="h-40 bg-black border-t-4 border-gray-800 p-5 overflow-y-auto font-mono text-xs shadow-[inset_0_10px_20px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-3 mb-3 text-green-500 border-b border-green-900 pb-2">
            <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></span>
            <span className="font-bold tracking-widest uppercase text-sm">Operation Tactical Log</span>
        </div>
        <div className="space-y-1.5">
            {gameState.history.map((log, i) => (
              <p key={i} className={`mb-1 pl-4 border-l-2 ${log.includes('⚠️') ? 'text-red-400 border-red-900' : 'text-green-400 border-green-900 opacity-80'}`}>
                <span className="opacity-40 mr-4 font-bold">[{new Date().toLocaleTimeString()}]</span> {log}
              </p>
            ))}
        </div>
      </div>
    </div>
  );
};

export default App;
