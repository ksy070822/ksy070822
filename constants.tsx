
import { RoleType, ScenarioStep, Item, Ally, DialogueEvent } from './types';

export const ROLES_INFO = {
  [RoleType.COMMUNICATOR]: {
    description: '고객문의 최전방 수호자. 명확한 문구로 혼란을 잠재웁니다.',
    weapon: '진실의 확성기',
    ability: '공지 문구 자동 생성',
    color: 'bg-blue-600',
    icon: '📣'
  },
  [RoleType.TECH_LEADER]: {
    description: '시스템의 심장을 고치는 마법사. 복잡한 코드를 해독합니다.',
    weapon: '무한의 태블릿',
    ability: '서버 과부하 예측',
    color: 'bg-purple-600',
    icon: '💻'
  },
  [RoleType.CONTROL_TOWER]: {
    description: '전략의 눈. 비즈니스 리스크를 판단하고 방향을 결정합니다.',
    weapon: '통찰의 방패',
    ability: '의사결정 가이드라인',
    color: 'bg-red-600',
    icon: '🛡️'
  },
  [RoleType.REPORTER]: {
    description: '시간의 기록자. 모든 대응 과정을 기록하고 전파합니다.',
    weapon: '황금 회중시계',
    ability: '타임라인 자동 정렬',
    color: 'bg-yellow-600',
    icon: '⌚'
  }
};

export const ITEMS: Record<string, Item> = {
  DRAFT_NOTICE: { id: 'DRAFT_NOTICE', name: '초안 공지문', description: '빠른 대응을 돕는 마법의 종이', icon: '📝' },
  DEBUG_TOOL: { id: 'DEBUG_TOOL', name: '디버그 젬', description: '원인을 한 눈에 파악하게 해주는 보석', icon: '💎' },
  LEGAL_SHIELD: { id: 'LEGAL_SHIELD', name: '법적 방어권', description: '2시간 의무 공지 시간을 방어하는 방패', icon: '🛡️' },
  CHRONO_LOG: { id: 'CHRONO_LOG', name: '크로노 로그', description: '기록 누락을 방지하는 기록지', icon: '📜' },
  COMPENSATION_BOX: { id: 'COMPENSATION_BOX', name: '보상의 보물상자', description: '고객의 마음을 달래는 아이템', icon: '🎁' },
  UNITY_ORB: { id: 'UNITY_ORB', name: '통합의 보주', description: '조직의 모든 판단이 하나로 합쳐진 결정체', icon: '🔮' }
};

const ALLIES: Record<string, Ally> = {
  CX_GUARDIAN: { id: 'cx', name: 'CX 가디언', icon: '🎧', description: '현장 매니저', role: '고객센터 수호' },
  TECH_SAGE: { id: 'sage', name: '테크 세이지', icon: '🔮', description: '테크 커뮤니케이터', role: '기술 용어 번역' },
  BIZ_LEADER: { id: 'biz', name: '사업 리더', icon: '🗺️', description: '스트래티지스트', role: '계약 리스크 판단' },
  PR_PARTNER: { id: 'pr', name: 'PR 파트너', icon: '📜', description: 'PR 전문가', role: '대외 메시지 정제' },
  INFRA_TEAM: { id: 'infra', name: '인프라 팀', icon: '⚙️', description: '인프라 전문가', role: '시스템 정상화 판정' },
  PARTNER_MGR: { id: 'pm', name: '제휴 담당', icon: '🤝', description: '파트너 매니저', role: '선별적 전파' },
  HISTORY_KEEPER: { id: 'history', name: '과거 기록자', icon: '⏳', description: '기록관', role: '과거 데이터 호출' },
  TIMELINE_KEEPER: { id: 'timeline', name: '타임라인 정렬자', icon: '🕰️', description: '정리 전문가', role: '시간 흐름 정렬' }
};

export const SCENARIO: ScenarioStep[] = [
  {
    id: 1,
    time: '14:58',
    title: 'Stage 1: 재앙의 인지',
    description: '결제 전면 장애 발생! 마을 동료들에게 다가가 현 상황에 대한 조언을 들으세요.',
    choices: {
      [RoleType.COMMUNICATOR]: [
        { text: '즉시 장애 공지를 올린다.', isBest: false, impact: { chaos: 20, risk: 20 }, feedback: '성급했습니다! 30분 내 복구 가능성이 있는데 공지를 하면 신뢰도가 떨어집니다.' },
        { text: '공지를 보류하고 현장 상황을 파악한다.', isBest: true, impact: { chaos: -10, risk: 0, item: ITEMS.DRAFT_NOTICE }, feedback: '현명합니다. CX 가디언이 고객센터 현장을 버텨줄 것입니다.' }
      ],
      [RoleType.TECH_LEADER]: [
        { text: '원인 규명에만 집중한다.', isBest: true, impact: { chaos: -5, risk: -10, item: ITEMS.DEBUG_TOOL }, feedback: '테크세이지가 불필요한 질문을 막아주어 빠르게 원인을 파악했습니다.' },
        { text: '일일이 상황을 설명하며 대응한다.', isBest: false, impact: { chaos: 20, risk: 10 }, feedback: '설명하느라 골든타임을 놓치고 말았습니다.' }
      ],
      [RoleType.CONTROL_TOWER]: [
        { text: '과거 기록을 바탕으로 공지 여부를 결정한다.', isBest: true, impact: { chaos: -10, risk: -5, item: ITEMS.LEGAL_SHIELD }, feedback: '과거 기록자가 훌륭한 판단 기준을 제시했습니다.' },
        { text: '망설이다 시간을 보낸다.', isBest: false, impact: { chaos: 30, risk: 20 }, feedback: '대응 지연으로 조직의 혼란이 가중됩니다.' }
      ],
      [RoleType.REPORTER]: [
        { text: '장애 대응방을 열고 기록을 시작한다.', isBest: true, impact: { chaos: -15, risk: 0, item: ITEMS.CHRONO_LOG }, feedback: '모두가 같은 정보를 공유하게 되었습니다.' },
        { text: '상황이 종료된 후 한꺼번에 쓴다.', isBest: false, impact: { chaos: 25, risk: 5 }, feedback: '중요한 초기 대화 로그가 유실되었습니다.' }
      ]
    },
    events: {
      [RoleType.COMMUNICATOR]: [{
        ally: ALLIES.CX_GUARDIAN,
        triggerCondition: '공지 보류 고려 시',
        dialogue: "지금은 말하기 어려운 상황인 거 이해해요. 현장에는 임시 안내로 버티고 있을게요. 조금만 시간 주세요.",
        effectDescription: "고객센터 혼란 완충, 혼란도 상승 속도 완만",
        pos: { x: 25, y: 35 }
      }],
      [RoleType.TECH_LEADER]: [{
        ally: ALLIES.TECH_SAGE,
        triggerCondition: '질문 압박 발생 시',
        dialogue: "기술적인 질문은 제가 정리해서 받을게요. 지금은 원인 규명에만 집중하셔도 됩니다.",
        effectDescription: "불필요한 커뮤니케이션 차단, 대외 위험도 억제",
        pos: { x: 75, y: 30 }
      }],
      [RoleType.CONTROL_TOWER]: [{
        ally: ALLIES.HISTORY_KEEPER,
        triggerCondition: '판단 망설임 시',
        dialogue: "이전에도 이 단계에서는 공지를 하지 않았습니다. 당시에는 40분 내 복구로 이어졌습니다.",
        effectDescription: "판단 기준 명확화, 보류 선택 안정화",
        pos: { x: 50, y: 20 }
      }],
      [RoleType.REPORTER]: [{
        ally: ALLIES.HISTORY_KEEPER,
        triggerCondition: '기록 시작 시',
        dialogue: "로그를 모으는 건 미래의 백신입니다. 제가 과거 패턴과 대조를 도와드릴게요.",
        effectDescription: "기록 정합성 향상",
        pos: { x: 20, y: 70 }
      }]
    }
  },
  {
    id: 2,
    time: '15:30',
    title: 'Stage 2: 초기 공지 판단',
    description: '30분 경과! 복구가 불투명합니다. 마을 중앙의 테크세이지와 사업 리더를 만나세요.',
    choices: {
      [RoleType.COMMUNICATOR]: [
        { text: '기술 용어를 정제하여 공지한다.', isBest: true, impact: { chaos: -20, risk: -10 }, feedback: '테크세이지의 도움으로 고객들이 이해하기 쉬운 문구가 나갔습니다.' },
        { text: '아무 안내 없이 2시간을 기다린다.', isBest: false, impact: { chaos: 40, risk: 20 }, feedback: 'SNS에 불만이 폭주하며 언론 기사가 나기 시작합니다.' }
      ],
      [RoleType.TECH_LEADER]: [
        { text: '진행 상황을 고객 언어로 정리해 공유한다.', isBest: true, impact: { chaos: -10, risk: -5 }, feedback: '커뮤니케이터와 PR팀이 대응하기 수월해졌습니다.' },
        { text: '기술적 디테일만 계속 설명한다.', isBest: false, impact: { chaos: 10, risk: 10 }, feedback: '동료들이 상황의 위급함을 이해하지 못합니다.' }
      ],
      [RoleType.CONTROL_TOWER]: [
        { text: '특정 제휴사 관리를 시작한다.', isBest: true, impact: { chaos: -5, risk: -20 }, feedback: '사업 리더가 계약상 전파 대상을 명확히 걸러주었습니다.' },
        { text: '모든 파트너에게 무차별 전파한다.', isBest: false, impact: { chaos: 10, risk: 40 }, feedback: '전파하지 않아도 될 리스크까지 대외로 확산시켰습니다.' }
      ],
      [RoleType.REPORTER]: [
        { text: '법적 의무 시점을 기준으로 경고한다.', isBest: true, impact: { chaos: -10, risk: 0 }, feedback: '기준 알림 덕분에 조직이 페이스를 유지합니다.' },
        { text: '기록이 많아져 정리를 소홀히 한다.', isBest: false, impact: { chaos: 20, risk: 10 }, feedback: '결정적인 공지 시점 데이터가 누락되었습니다.' }
      ]
    },
    events: {
      [RoleType.COMMUNICATOR]: [{
        ally: ALLIES.TECH_SAGE,
        triggerCondition: '초기 공지 작성 시',
        dialogue: "기술적으로는 ‘장애’지만, 고객에게는 이렇게 표현하는 게 안전해요. 문구를 다듬어 왔습니다.",
        effectDescription: "불필요한 오해 감소, 위험도 증가 완화",
        pos: { x: 50, y: 50 }
      }],
      [RoleType.TECH_LEADER]: [{
        ally: ALLIES.PR_PARTNER,
        triggerCondition: '공지 협의 시',
        dialogue: "기술팀의 복구 의지는 제가 잘 전달할게요. PR 관점에서 안전한 단어를 선택합시다.",
        effectDescription: "언론 리스크 관리",
        pos: { x: 45, y: 45 }
      }],
      [RoleType.CONTROL_TOWER]: [{
        ally: ALLIES.BIZ_LEADER,
        triggerCondition: '전파 판단 시',
        dialogue: "이 장애는 계약상 즉시 전파 대상은 아닙니다. 다만 특정 제휴사는 별도 관리가 필요합니다.",
        effectDescription: "외부 확산 리스크 감소, 패널티 완화",
        pos: { x: 55, y: 55 }
      }],
      [RoleType.REPORTER]: [{
        ally: ALLIES.TIMELINE_KEEPER,
        triggerCondition: '시간 체크 시',
        dialogue: "현재는 법적 의무 공지 시간 이전입니다. 아직 선택의 여지는 남아 있습니다.",
        effectDescription: "보류 선택 안정화, 내부 불안 감소",
        pos: { x: 30, y: 30 }
      }]
    }
  },
  {
    id: 3,
    time: '16:50',
    title: 'Stage 3: 심화 공지 (2시간 데드라인)',
    description: '110분 경과! 곧 법적 공지 의무 시간입니다. 마을 성곽의 동료들과 상의하세요.',
    choices: {
      [RoleType.COMMUNICATOR]: [
        { text: '원인/범위/보상을 담은 심화 공지 게시', isBest: true, impact: { chaos: -30, risk: -20 }, feedback: 'PR 파트너와 함께 절제된 표현으로 법적 의무를 다했습니다.' },
        { text: '복구 직전이니 조금 더 미뤄본다.', isBest: false, impact: { chaos: 20, risk: 60 }, feedback: '데드라인 초과! 과태료와 대외 이미지 실추가 발생합니다.' }
      ],
      [RoleType.TECH_LEADER]: [
        { text: '내부 복구 완료를 선언하고 외부를 분리한다.', isBest: true, impact: { chaos: -20, risk: -10 }, feedback: '인프라 팀의 도움으로 문제의 범위를 명확히 규정했습니다.' },
        { text: '모든 시스템이 문제라고 뭉뚱그려 보고한다.', isBest: false, impact: { chaos: 10, risk: 20 }, feedback: '책임 소재가 불분명해져 보상안 수립이 어려워집니다.' }
      ],
      [RoleType.CONTROL_TOWER]: [
        { text: '선별적으로 영향 있는 파트너에게만 공유', isBest: true, impact: { chaos: -10, risk: -30 }, feedback: '제휴 담당 덕분에 사업적 갈등 리스크가 제거되었습니다.' },
        { text: '공지 없이 전면 복구만 기다린다.', isBest: false, impact: { chaos: 40, risk: 50 }, feedback: '파트너사들이 나중에 알게 되어 항의가 쏟아집니다.' }
      ],
      [RoleType.REPORTER]: [
        { text: '취합된 지표를 기반으로 정확히 보고한다.', isBest: true, impact: { chaos: -20, risk: 0 }, feedback: '타임라인 정렬자 덕분에 보고서의 신뢰도가 상승했습니다.' },
        { text: '데이터 없이 텍스트로만 리포팅한다.', isBest: false, impact: { chaos: 30, risk: 10 }, feedback: '의사결정권자들이 정확한 피해 규모를 몰라 당황합니다.' }
      ]
    },
    events: {
      [RoleType.COMMUNICATOR]: [{
        ally: ALLIES.PR_PARTNER,
        triggerCondition: '심화 공지 작성 시',
        dialogue: "표현은 최대한 절제합시다. 원인 단정은 피하는 게 좋겠습니다. 제가 검수를 마쳤습니다.",
        effectDescription: "외부 해석 리스크 제한, 위험도 상한 고정",
        pos: { x: 80, y: 20 }
      }],
      [RoleType.TECH_LEADER]: [{
        ally: ALLIES.INFRA_TEAM,
        triggerCondition: '구간 판정 시',
        dialogue: "내부 시스템은 정상화되었습니다. 현재 이슈는 외부 연동 구간입니다. 이를 명확히 알리세요.",
        effectDescription: "문제 범위 명확화, 혼란도 감소",
        pos: { x: 20, y: 80 }
      }],
      [RoleType.CONTROL_TOWER]: [{
        ally: ALLIES.PARTNER_MGR,
        triggerCondition: '파트너 소통 시',
        dialogue: "전면 공지 대신, 영향 있는 파트너에게만 먼저 공유하겠습니다. 제가 직접 소통할게요.",
        effectDescription: "사업 리스크 이벤트 제거",
        pos: { x: 50, y: 15 }
      }],
      [RoleType.REPORTER]: [{
        ally: ALLIES.TIMELINE_KEEPER,
        triggerCondition: '집계 시',
        dialogue: "모든 지표가 취합되었습니다. 이제 정확한 리포팅이 가능합니다.",
        effectDescription: "엔딩 평가 보정 및 신뢰도 향상",
        pos: { x: 15, y: 55 }
      }]
    }
  },
  {
    id: 4,
    time: '18:30',
    title: 'Stage 4: 복구 판단',
    description: '시스템 정상화 중! 끝났다고 말하기 전, 마지막 체크가 필요합니다.',
    choices: {
      [RoleType.COMMUNICATOR]: [
        { text: '부분 정상화 상태임을 명시하여 공지', isBest: true, impact: { chaos: -40, risk: -20 }, feedback: '테크리더의 조언을 받아 성급한 공지로 인한 리스크를 방지했습니다.' },
        { text: '전면 복구 완료라고 즉시 공지', isBest: false, impact: { chaos: 10, risk: 30 }, feedback: '공지 직후 잔여 오류로 인해 다시 불만이 폭주합니다.' }
      ],
      [RoleType.TECH_LEADER]: [
        { text: '최종 지표가 그린 라이트가 될 때까지 감시', isBest: true, impact: { chaos: -10, risk: -30 }, feedback: '인프라 팀과 함께 완벽한 정상화를 확인했습니다.' },
        { text: '정상화 된 것 같으니 바로 퇴근한다.', isBest: false, impact: { chaos: 30, risk: 50 }, feedback: '잔여 트래픽으로 인한 2차 장애에 대응하지 못했습니다.' }
      ],
      [RoleType.CONTROL_TOWER]: [
        { text: '보상 가이드라인 배포 및 후속 대응', isBest: true, impact: { chaos: -50, risk: -20, item: ITEMS.COMPENSATION_BOX }, feedback: '위기를 기회로 바꾸는 완벽한 마무리 전략입니다.' },
        { text: '상황이 끝났으니 조용히 지켜본다.', isBest: false, impact: { chaos: 20, risk: 10 }, feedback: '후속 조치 지연으로 경쟁 서비스로 고객이 이탈합니다.' }
      ],
      [RoleType.REPORTER]: [
        { text: '장애 타임라인 최종 정렬 및 전파', isBest: true, impact: { chaos: -30, risk: -10 }, feedback: '이 기록은 우리 조직의 전설적인 지식 자산이 될 것입니다.' },
        { text: '로그 기록을 삭제하고 쉰다.', isBest: false, impact: { chaos: 50, risk: 50 }, feedback: '역사가 사라졌습니다. 다음 장애 때 똑같이 당하게 됩니다.' }
      ]
    },
    events: {
      [RoleType.COMMUNICATOR]: [{
        ally: ALLIES.TECH_LEADER,
        triggerCondition: '복구 공지 고려 시',
        dialogue: "지금은 ‘부분 정상화’ 상태입니다. 완전 복구 기준은 아직 남아 있으니 신중히 알립시다.",
        effectDescription: "성급한 복구 공지 리스크 방지",
        pos: { x: 45, y: 55 }
      }],
      [RoleType.REPORTER]: [{
        ally: ALLIES.TIMELINE_KEEPER,
        triggerCondition: '마무리 시',
        dialogue: "장애 시작부터 현재까지 시간 흐름이 정리되었습니다. 완벽한 기록입니다.",
        effectDescription: "엔딩 평가 보정 점수 획득",
        pos: { x: 20, y: 25 }
      }],
      [RoleType.CONTROL_TOWER]: [{
        ally: ALLIES.BIZ_LEADER,
        triggerCondition: '보상 결정 시',
        dialogue: "보상안은 공평함이 생명입니다. 법률 검토를 마친 가이드라인을 보냅니다.",
        effectDescription: "후속 갈등 리스크 차단",
        pos: { x: 85, y: 80 }
      }],
      [RoleType.TECH_LEADER]: [{
        ally: ALLIES.INFRA_TEAM,
        triggerCondition: '최종 체크 시',
        dialogue: "모든 지표가 그린 라이트입니다. 이제 안심하고 복구 선언을 하셔도 됩니다.",
        effectDescription: "심리적 안정감 및 최종 안정성 확인",
        pos: { x: 10, y: 85 }
      }]
    }
  },
  {
    id: 5,
    time: '20:00',
    title: 'Stage 5: 조직 통합 및 엔딩',
    description: '모든 아이템이 모였습니다! 마을 한가운데서 동료들과 통합의 보주를 완성하세요.',
    choices: {
      [RoleType.COMMUNICATOR]: [
        { text: '통합의 보주를 완성한다.', isBest: true, impact: { chaos: -100, risk: -100, item: ITEMS.UNITY_ORB }, feedback: '진정한 장애대응 마스터가 되었습니다! 명절의 평화가 찾아옵니다.' },
        { text: '이름을 남기지 않고 명절을 쇤다.', isBest: true, impact: { chaos: -50, risk: -50 }, feedback: '조용히 평화를 만끽합니다.' }
      ],
      [RoleType.TECH_LEADER]: [
        { text: '통합의 보주를 완성한다.', isBest: true, impact: { chaos: -100, risk: -100, item: ITEMS.UNITY_ORB }, feedback: '시스템은 이제 그 어느 때보다 견고합니다.' },
        { text: '노트북을 덮고 휴식한다.', isBest: true, impact: { chaos: -50, risk: -50 }, feedback: '달콤한 휴식입니다.' }
      ],
      [RoleType.CONTROL_TOWER]: [
        { text: '통합의 보주를 완성한다.', isBest: true, impact: { chaos: -100, risk: -100, item: ITEMS.UNITY_ORB }, feedback: '조직의 의사결정 프로세스가 완성되었습니다.' },
        { text: '휴가 가이드를 배포하고 퇴근한다.', isBest: true, impact: { chaos: -50, risk: -50 }, feedback: '수고하셨습니다.' }
      ],
      [RoleType.REPORTER]: [
        { text: '통합의 보주를 완성한다.', isBest: true, impact: { chaos: -100, risk: -100, item: ITEMS.UNITY_ORB }, feedback: '모든 기록이 하나의 지혜로 합쳐졌습니다.' },
        { text: '리포트를 아카이빙하고 종료한다.', isBest: true, impact: { chaos: -50, risk: -50 }, feedback: '역사적인 기록입니다.' }
      ]
    },
    events: {
      [RoleType.COMMUNICATOR]: [{
        ally: ALLIES.CX_GUARDIAN,
        triggerCondition: '마지막 시',
        dialogue: "각자의 판단이 모여, 조직은 버텨냈습니다. 우리는 하나입니다!",
        effectDescription: "조직 동기화 상태 발동, 최종 엔딩 확정",
        pos: { x: 50, y: 50 }
      }],
      [RoleType.TECH_LEADER]: [{
        ally: ALLIES.TECH_SAGE,
        triggerCondition: '마지막 시',
        dialogue: "각자의 판단이 모여, 조직은 버텨냈습니다. 우리는 하나입니다!",
        effectDescription: "조직 동기화 상태 발동, 최종 엔딩 확정",
        pos: { x: 50, y: 50 }
      }],
      [RoleType.CONTROL_TOWER]: [{
        ally: ALLIES.BIZ_LEADER,
        triggerCondition: '마지막 시',
        dialogue: "각자의 판단이 모여, 조직은 버텨냈습니다. 우리는 하나입니다!",
        effectDescription: "조직 동기화 상태 발동, 최종 엔딩 확정",
        pos: { x: 50, y: 50 }
      }],
      [RoleType.REPORTER]: [{
        ally: ALLIES.HISTORY_KEEPER,
        triggerCondition: '마지막 시',
        dialogue: "각자의 판단이 모여, 조직은 버텨냈습니다. 우리는 하나입니다!",
        effectDescription: "조직 동기화 상태 발동, 최종 엔딩 확정",
        pos: { x: 50, y: 50 }
      }]
    }
  }
];
