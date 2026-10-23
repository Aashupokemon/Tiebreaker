export type RiskTolerance = 'conservative' | 'balanced' | 'aggressive';

export interface DecisionInput {
  decision: string;
  options: string[];
  context: string;
  priorities: string[];
  riskTolerance: RiskTolerance;
}

export type ImpactLevel = 'critical' | 'high' | 'medium' | 'low';

export interface ProConItem {
  id: string;
  text: string;
  impact: ImpactLevel;
  score: number;
  category: string;
  userWeight?: number; // 0.5x, 1x, 1.5x, 2x or custom user vote
  isCustom?: boolean;
}

export interface OptionProCon {
  option: string;
  summaryBadge: string;
  pros: ProConItem[];
  cons: ProConItem[];
}

export interface MatrixCriterion {
  id: string;
  name: string;
  description: string;
  defaultWeight: number; // 1 to 5
  userWeight?: number; // adjusted dynamically by user slider
}

export interface MatrixScore {
  criteriaId: string;
  score: number; // 1 to 10
  rationale: string;
}

export interface OptionMatrix {
  option: string;
  scores: MatrixScore[];
}

export interface OptionSWOT {
  option: string;
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  strategicTakeaway: string;
}

export interface Blindspot {
  title: string;
  explanation: string;
  advice: string;
}

export interface DevilsAdvocateData {
  targetOption: string;
  hardQuestions: string[];
  worstCaseScenario: string;
  preMortemInsight: string;
}

export interface ActionPlanStep {
  timeframe: string;
  action: string;
  purpose: string;
}

export interface TiebreakerResult {
  winner: string;
  runnerUp: string;
  confidenceScore: number; // e.g. 85
  headline: string;
  coreRationale: string;
  keyDecidingFactor: string;
  conditionalRule: string;
  blindspots: Blindspot[];
  devilsAdvocate: DevilsAdvocateData;
  actionPlan: ActionPlanStep[];
}

export interface FullAnalysis {
  id: string;
  createdAt: string;
  input: DecisionInput;
  summary: string;
  decisionType: string; // e.g., 'Type 1 (One-Way Door)' or 'Type 2 (Two-Way Door)'
  reversibilityExplanation: string;
  prosCons: OptionProCon[];
  matrix: {
    criteria: MatrixCriterion[];
    optionScores: OptionMatrix[];
  };
  swot: OptionSWOT[];
  tiebreaker: TiebreakerResult;
}

export interface PresetDilemma {
  title: string;
  category: string;
  question: string;
  options: string[];
  context: string;
  priorities: string[];
  riskTolerance: RiskTolerance;
}
