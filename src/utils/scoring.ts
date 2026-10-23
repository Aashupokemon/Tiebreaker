import { MatrixCriterion, OptionMatrix, OptionProCon } from '../types/decision';

export interface MatrixResult {
  option: string;
  totalScore: number;
  maxPossibleScore: number;
  percentage: number;
  rank: number;
}

export function calculateMatrixTotals(
  criteria: MatrixCriterion[],
  optionScores: OptionMatrix[]
): MatrixResult[] {
  const totalWeight = criteria.reduce((sum, c) => sum + (c.userWeight ?? c.defaultWeight ?? 3), 0);
  const maxPossible = totalWeight * 10;

  const results = optionScores.map((opt) => {
    let rawWeightedScore = 0;

    criteria.forEach((criterion) => {
      const weight = criterion.userWeight ?? criterion.defaultWeight ?? 3;
      const scoreObj = opt.scores.find((s) => s.criteriaId === criterion.id);
      const score = scoreObj ? scoreObj.score : 5;
      rawWeightedScore += score * weight;
    });

    const percentage = maxPossible > 0 ? Math.round((rawWeightedScore / maxPossible) * 100) : 50;

    return {
      option: opt.option,
      totalScore: rawWeightedScore,
      maxPossibleScore: maxPossible,
      percentage,
      rank: 1, // calculated below
    };
  });

  // Sort descending and assign ranks
  results.sort((a, b) => b.totalScore - a.totalScore);
  results.forEach((item, index) => {
    item.rank = index + 1;
  });

  return results;
}

export function calculateProConNetScore(optionData: OptionProCon): {
  prosSum: number;
  consSum: number;
  netScore: number;
} {
  const prosSum = optionData.pros.reduce((acc, item) => {
    const weight = item.userWeight ?? 1;
    return acc + item.score * weight;
  }, 0);

  const consSum = optionData.cons.reduce((acc, item) => {
    const weight = item.userWeight ?? 1;
    // item.score is negative, so Math.abs
    return acc + Math.abs(item.score) * weight;
  }, 0);

  return {
    prosSum: Math.round(prosSum * 10) / 10,
    consSum: Math.round(consSum * 10) / 10,
    netScore: Math.round((prosSum - consSum) * 10) / 10,
  };
}
