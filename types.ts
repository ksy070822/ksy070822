
export enum RoleType {
  COMMUNICATOR = '커뮤니케이터',
  TECH_LEADER = '테크리더',
  CONTROL_TOWER = '컨트롤타워',
  REPORTER = '리포터'
}

export interface Item {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface Ally {
  id: string;
  name: string;
  icon: string;
  description: string;
  role: string;
}

export interface Choice {
  text: string;
  impact: {
    chaos: number;
    risk: number;
    item?: Item;
  };
  feedback: string;
  isBest: boolean;
}

export interface DialogueEvent {
  ally: Ally;
  triggerCondition: string;
  dialogue: string;
  effectDescription: string;
  pos: { x: number; y: number };
}

export interface ScenarioStep {
  id: number;
  time: string;
  title: string;
  description: string;
  choices: Record<RoleType, Choice[]>;
  events: Record<RoleType, DialogueEvent[]>;
}

export interface Position {
  x: number;
  y: number;
}

export interface GameState {
  role: RoleType | null;
  stage: number;
  chaosGauge: number;
  riskGauge: number;
  inventory: Item[];
  isGameOver: boolean;
  history: string[];
  playerPosition: Position;
  interactingWith: DialogueEvent | null;
}
