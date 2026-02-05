interface Answer {
  domain: string;
  facet?: number;
  score: number | string;
}

interface FacetScore {
  score: number;
  count: number;
  result: string;
}

interface DomainScore {
  score: number;
  count: number;
  result: string;
  facet: Record<string | number, FacetScore>;
}

export interface ScoreInput {
  answers: Answer[];
  calculateResult?: (score: number, count: number) => string;
}

const defaultCalculateResult = (score: number, count: number): string => {
  const average = score / count;
  if (average > 3) return 'high';
  if (average < 3) return 'low';
  return 'neutral';
};

export function calculateScore({
  answers,
  calculateResult = defaultCalculateResult
}: ScoreInput): Record<string, DomainScore> {
  const result: Record<string, DomainScore> = {};

  const reduceFactors = (acc: Record<string, DomainScore>, answer: Answer) => {
    const scoreValue = parseInt(String(answer.score || 0), 10);

    if (!acc[answer.domain]) {
      acc[answer.domain] = { score: 0, count: 0, result: 'neutral', facet: {} };
    }

    const domain = acc[answer.domain];
    domain.score += scoreValue;
    domain.count += 1;
    domain.result = calculateResult(domain.score, domain.count);

    if (answer.facet != null) {
      const facetKey: string | number = answer.facet;
      if (!domain.facet[facetKey]) {
        domain.facet[facetKey] = { score: 0, count: 0, result: 'neutral' };
      }
      const facet = domain.facet[facetKey];
      facet.score += scoreValue;
      facet.count += 1;
      facet.result = calculateResult(facet.score, facet.count);
    }

    return acc;
  };

  return answers.reduce(reduceFactors, result);
}

export default function calculateScoreDefault(input: ScoreInput) {
  if (!input) {
    throw new Error('Missing required input');
  }

  if (!input.answers) {
    throw new Error('Missing required input data.answers');
  }

  if (!Array.isArray(input.answers)) {
    throw new Error('Wrong format. Data.answers must be an array');
  }

  return calculateScore(input);
}
