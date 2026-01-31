
import { RoleType, ScenarioStep, Item, Ally, DialogueEvent } from './types';

export const ITEMS: Record<string, Item> = {
  NOTICE_SCROLL: { id: 'NOTICE_SCROLL', name: '영광의 스크롤', description: '진실을 선포하는 마법지', icon: '📜' },
  TECH_TABLET: { id: 'TECH_TABLET', name: '시스템 석판', description: '서버의 마력을 제어함', icon: '📱' },
  WAR_MAP: { id: 'WAR_MAP', name: '전략의 지도', description: '전장의 흐름을 읽는 도구', icon: '🗺️' },
  GEAR_SPHERE: { id: 'GEAR_SPHERE', name: '톱니바퀴 마력구', description: '기술의 마력을 증폭함', icon: '🔮' },
  CHRONO_WATCH: { id: 'CHRONO_WATCH', name: '황금 회중시계', description: '시간의 기록을 멈춤', icon: '⏳' },
  
  FAQ_BUNDLE: { id: 'FAQ_BUNDLE', name: '지식의 성전', description: '해결책이 담긴 책자', icon: '📚' },
  TECH_CORE: { id: 'TECH_CORE', name: '테크 번역 보주', description: '언어 소통의 핵심', icon: '💎' },
  RISK_COMPASS: { id: 'RISK_COMPASS', name: '운명의 나침반', description: '위기 감지 도구', icon: '🧭' },
  STABILITY_CUBE: { id: 'STABILITY_CUBE', name: '안정의 큐브', description: '서버 안정화 파편', icon: '🧊' },
  UNITY_CREST: { id: 'UNITY_CREST', name: '통합의 문장', description: '궁극의 유니티 크레스트', icon: '🔱' }
};

export const ROLES_INFO = {
  [RoleType.COMMUNICATOR]: {
    name: 'COMMUNICATOR',
    title: 'HERO',
    description: '공지 스크롤로 마을 사람들을 안심시키는 전령.',
    color: 'from-blue-500 to-cyan-600',
    baseItem: ITEMS.NOTICE_SCROLL,
    visualPrompt: "Chibi pixel art RPG hero, young man with brown spiky hair, blue and white adventurer vest, holding a glowing golden paper scroll, 말풍선 아이콘 떠있음, high quality, heroic pose, transparent background"
  },
  [RoleType.TECH_LEADER]: {
    name: 'TECH LEADER',
    title: 'WARRIOR',
    description: '시스템 석판을 휘두르며 서버의 마력을 다스리는 기사.',
    color: 'from-slate-600 to-indigo-900',
    baseItem: ITEMS.TECH_TABLET,
    visualPrompt: "Chibi pixel art RPG warrior, female knight with a brown ponytail, wearing silver plate armor, holding a glowing high-tech blue crystal tablet, heroic pose, high quality, transparent background"
  },
  [RoleType.CONTROL_TOWER]: {
    name: 'STRATEGIST LEADER',
    title: 'CONTROL TOWER',
    description: '지도를 보며 리스크의 방향을 결정하는 현명한 지휘관.',
    color: 'from-red-600 to-amber-900',
    baseItem: ITEMS.WAR_MAP,
    visualPrompt: "Chibi pixel art RPG strategist, dignified man with dark hair, wearing a high-collared navy blue and gold commander uniform, red cape, holding a wide glowing paper map, tactical icons around him, high quality, transparent background"
  },
  [RoleType.MAGE]: {
    name: 'TECH COMMUNICATOR',
    title: 'MAGE',
    description: '톱니바퀴 마력으로 기술을 세상에 전하는 마법사.',
    color: 'from-purple-600 to-indigo-600',
    baseItem: ITEMS.GEAR_SPHERE,
    visualPrompt: "Chibi pixel art RPG mage, wearing a large purple wizard hat with gold trim, holding a glowing magical sphere with floating mechanical gears, blue wizard robes, magical aura, high quality, transparent background"
  },
  [RoleType.REPORTER]: {
    name: 'REPORTER',
    title: 'SCHOLAR',
    description: '거대한 시계로 시간을 기록하고 사건을 전파하는 학자.',
    color: 'from-yellow-600 to-orange-900',
    baseItem: ITEMS.CHRONO_WATCH,
    visualPrompt: "Chibi pixel art RPG scholar, wearing a brown suit and glasses, holding a thick record book and a massive golden pocket watch on a chain, scholarly pose, high quality, transparent background"
  }
};

const ALLIES: Record<string, Ally> = {
  CX_GUARDIAN: { id: 'cx', name: '현장 지킴이', icon: '', description: '마을 광장을 지키는 전사', role: '민심 안정' },
  TECH_SAGE: { id: 'sage', name: '기술 현자', icon: '', description: '지혜로운 늙은 마법사', role: '원인 파악' },
  BIZ_LORD: { id: 'biz', name: '사업 영주', icon: '', description: '킹덤의 재정을 담당하는 영주', role: '손실 제어' },
  INFRA_MINT: { id: 'infra', name: '인프라 거인', icon: '', description: '철의 거인 공학자', role: '시스템 재구축' }
};

export const SCENARIO: ScenarioStep[] = [
  {
    id: 1,
    time: '15:00',
    title: 'Stage 1: 혼돈의 안개',
    description: '마을에 정체불명의 장애 안개가 깔렸습니다. 광장의 현장 지킴이를 찾아 상황을 수습하세요.',
    choices: {
      [RoleType.COMMUNICATOR]: [{ text: '공지로 안심시키기', isBest: true, impact: { chaos: -15, risk: 0, item: ITEMS.FAQ_BUNDLE }, feedback: 'FAQ 성전을 얻어 고객들의 혼란을 막아냈습니다!' }],
      [RoleType.TECH_LEADER]: [{ text: '석판으로 데이터 동기화', isBest: true, impact: { chaos: -5, risk: -10, item: ITEMS.FAQ_BUNDLE }, feedback: '현장과 서버의 정보를 일치시켰습니다.' }],
      [RoleType.CONTROL_TOWER]: [{ text: '피해 지역 우선순위 지정', isBest: true, impact: { chaos: -10, risk: -20, item: ITEMS.FAQ_BUNDLE }, feedback: '효율적인 자원 배분으로 리스크를 줄였습니다.' }],
      [RoleType.MAGE]: [{ text: '기술 마력 분석', isBest: true, impact: { chaos: -10, risk: -5, item: ITEMS.FAQ_BUNDLE }, feedback: '장애의 본질을 꿰뚫어 보았습니다.' }],
      [RoleType.REPORTER]: [{ text: '초동 로그 기록', isBest: true, impact: { chaos: -10, risk: 0, item: ITEMS.FAQ_BUNDLE }, feedback: '사건의 전말을 정확히 기록하기 시작했습니다.' }]
    },
    events: {
      [RoleType.COMMUNICATOR]: [{ ally: ALLIES.CX_GUARDIAN, triggerCondition: '', dialogue: "안개 때문에 사람들이 떨고 있어요! 이 성전의 지식으로 사람들을 안심시켜 주시오.", effectDescription: "현장 동요 완화", pos: { x: 30, y: 40 } }],
      [RoleType.TECH_LEADER]: [{ ally: ALLIES.CX_GUARDIAN, triggerCondition: '', dialogue: "현장의 소리가 서버에 닿지 않소. 이 성전을 석판에 연결해 주시오.", effectDescription: "데이터 경로 확보", pos: { x: 30, y: 40 } }],
      [RoleType.CONTROL_TOWER]: [{ ally: ALLIES.CX_GUARDIAN, triggerCondition: '', dialogue: "어디부터 구해야 할지 지시를 내려주시오! 이 성전의 기록을 참고하십시오.", effectDescription: "우선순위 데이터 확보", pos: { x: 30, y: 40 } }],
      [RoleType.MAGE]: [{ ally: ALLIES.CX_GUARDIAN, triggerCondition: '', dialogue: "이 기현상을 분석해 주시오. 성전의 옛 기록이 도움이 될 것이오.", effectDescription: "해석의 단초 확보", pos: { x: 30, y: 40 } }],
      [RoleType.REPORTER]: [{ ally: ALLIES.CX_GUARDIAN, triggerCondition: '', dialogue: "모든 것을 적어야 하오. 이 성전에 그 첫 문장을 써주시오.", effectDescription: "기록 정합성 확보", pos: { x: 30, y: 40 } }]
    }
  },
  {
    id: 2,
    time: '16:30',
    title: 'Stage 2: 현자의 계시',
    description: '안개의 근원을 찾기 위해 숲속의 기술 현자를 만나세요.',
    choices: {
      [RoleType.COMMUNICATOR]: [{ text: '어려운 진실을 쉽게 풀이', isBest: true, impact: { chaos: -20, risk: -5, item: ITEMS.TECH_CORE }, feedback: '테크 번역 보주로 마을에 평화가 찾아옵니다.' }],
      [RoleType.TECH_LEADER]: [{ text: '모듈 재배열 시전', isBest: true, impact: { chaos: -10, risk: -15, item: ITEMS.TECH_CORE }, feedback: '번역 보주가 서버의 명령어를 정렬합니다.' }],
      [RoleType.CONTROL_TOWER]: [{ text: '전략적 우회로 탐색', isBest: true, impact: { chaos: -10, risk: -30, item: ITEMS.TECH_CORE }, feedback: '보주가 가리키는 최적의 경로를 찾았습니다.' }],
      [RoleType.MAGE]: [{ text: '톱니바퀴 마법 폭주 제어', isBest: true, impact: { chaos: -15, risk: -10, item: ITEMS.TECH_CORE }, feedback: '기술의 마력이 다시 안정화됩니다.' }],
      [RoleType.REPORTER]: [{ text: '사건 타임라인 완성', isBest: true, impact: { chaos: -15, risk: 0, item: ITEMS.TECH_CORE }, feedback: '보주를 통해 과거의 장애 패턴을 찾아냈습니다.' }]
    },
    events: {
      [RoleType.COMMUNICATOR]: [{ ally: ALLIES.TECH_SAGE, triggerCondition: '', dialogue: "진실은 무겁다네. 이 보주를 써서 사람들에게 상냥하게 전해주게나.", effectDescription: "메시지 정제력 강화", pos: { x: 70, y: 20 } }],
      [RoleType.TECH_LEADER]: [{ ally: ALLIES.TECH_SAGE, triggerCondition: '', dialogue: "복잡한 코드의 미로를 헤매고 있군. 보주의 빛이 자네를 인도할 걸세.", effectDescription: "코드 가독성 향상", pos: { x: 70, y: 20 } }],
      [RoleType.CONTROL_TOWER]: [{ ally: ALLIES.TECH_SAGE, triggerCondition: '', dialogue: "결정에는 지혜가 필요하지. 보주가 위기의 방향을 알려줄 것이야.", effectDescription: "리스크 판단력 강화", pos: { x: 70, y: 20 } }],
      [RoleType.MAGE]: [{ ally: ALLIES.TECH_SAGE, triggerCondition: '', dialogue: "동료 마법사여, 이 보주로 자네의 톱니바퀴 마력을 증폭시키게.", effectDescription: "마법 화력 증강", pos: { x: 70, y: 20 } }],
      [RoleType.REPORTER]: [{ ally: ALLIES.TECH_SAGE, triggerCondition: '', dialogue: "기록의 핵심은 통찰이라네. 보주를 통해 보이지 않는 로그를 보게.", effectDescription: "데이터 통찰 확보", pos: { x: 70, y: 20 } }]
    }
  }
];
