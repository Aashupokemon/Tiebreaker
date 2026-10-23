import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Comprehensive decision analysis endpoint
app.post('/api/analyze-decision', async (req, res) => {
  try {
    const {
      decision,
      options = [],
      context = '',
      priorities = [],
      riskTolerance = 'balanced',
    } = req.body;

    if (!decision || typeof decision !== 'string') {
      return res.status(400).json({ error: 'A decision question or topic is required.' });
    }

    const cleanOptions = Array.isArray(options) && options.length >= 2
      ? options.filter((o: string) => o && o.trim().length > 0)
      : ['Option A', 'Option B'];

    if (!apiKey) {
      console.warn('GEMINI_API_KEY is not set. Generating intelligent heuristic fallback analysis.');
      return res.json(generateFallbackAnalysis(decision, cleanOptions, context, priorities, riskTolerance));
    }

    const prompt = `
You are the world's best strategic decision-making advisor and referee running "The Tiebreaker".
Your mission is to perform an exhaustive, objective, high-clarity decision breakdown for a user who needs to choose between alternatives.

DECISION TO MAKE:
"${decision}"

CANDIDATE OPTIONS:
${cleanOptions.map((opt: string, i: number) => `${i + 1}. ${opt}`).join('\n')}

ADDITIONAL USER CONTEXT & CONSTRAINTS:
${context || 'None provided by user.'}

USER'S EXPLICIT PRIORITIES (Ranked/Highlighted by user):
${priorities.length > 0 ? priorities.join(', ') : 'Balance of short-term practicality and long-term payoff.'}

USER RISK TOLERANCE:
${riskTolerance} (e.g. conservative, balanced, aggressive)

Analyze this decision thoroughly across 4 frameworks:
1. PROS & CONS: For each option, list 3 to 6 tangible pros and 3 to 6 tangible cons. Categorize each (e.g., Financial, Career, Emotional, Time, Risk). Assign an impact rating ('critical', 'high', 'medium', 'low') and an integer score (+1 to +10 for pros, -1 to -10 for cons). Also provide a 1-sentence option summary badge.
2. COMPARATIVE MATRIX: Define 5 to 7 sharp, cross-cutting evaluation criteria (e.g. Upfront Cost/Effort, 3-Year Upside, Reversibility, Stress/Mental Load, Alignment with Growth, Risk of Regret). Rate every option on each criterion from 1 to 10 (where 10 is best/most favorable) with a punchy 1-sentence rationale. Assign a default weight (1 to 5) to each criterion based on typical decision importance.
3. SWOT ANALYSIS: For every option, provide 3 Strengths, 3 Weaknesses, 2-3 Opportunities, 2-3 Threats, and 1 Strategic Takeaway recommendation.
4. THE TIEBREAKER VERDICT:
   - Identify the clear winning option (must pick exactly one from the provided options).
   - Identify the runner-up.
   - Provide a confidence score (between 65 and 95).
   - A bold, definitive headline (e.g., "The Tiebreaker Verdict: Why Option A takes the crown").
   - The Core Rationale: A compelling, nuanced 2-3 paragraph breakdown explaining why the winner edges out the competition given the user's context and risk tolerance.
   - The Tipping Point / Key Deciding Factor: The single decisive variable that breaks the tie.
   - The "If-Then" Rule: e.g. "Choose Option A if X is true; but if Y happens or your priority changes to Z, immediately pivot to Option B."
   - 3 Hidden Blindspots / Cognitive Biases: Unspoken risks, opportunity costs, or cognitive traps (e.g., sunk cost fallacy, optimism bias) that the user might be ignoring.
   - Devil's Advocate Stress-Test: Interrogate the winning option with 3 tough, uncomfortable questions and a worst-case scenario check.
   - Reversibility Assessment: Is this a "Type 1" (one-way door, almost irreversible, requires high caution) or "Type 2" (two-way door, easily reversible, bias toward action) decision?
   - 72-Hour Action Plan: 3 concrete next steps with timeframe (Today, Within 48h, Within 72h).

Be specific, realistic, and brutally honest—avoid vague corporate platitudes.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            decisionType: { type: Type.STRING, description: "Type 1 (One-Way Door) or Type 2 (Two-Way Door)" },
            reversibilityExplanation: { type: Type.STRING },
            prosCons: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  option: { type: Type.STRING },
                  summaryBadge: { type: Type.STRING },
                  pros: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        text: { type: Type.STRING },
                        impact: { type: Type.STRING, description: "critical, high, medium, or low" },
                        score: { type: Type.INTEGER, description: "Positive number 1-10" },
                        category: { type: Type.STRING }
                      },
                      required: ['id', 'text', 'impact', 'score', 'category']
                    }
                  },
                  cons: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        id: { type: Type.STRING },
                        text: { type: Type.STRING },
                        impact: { type: Type.STRING, description: "critical, high, medium, or low" },
                        score: { type: Type.INTEGER, description: "Negative number -10 to -1" },
                        category: { type: Type.STRING }
                      },
                      required: ['id', 'text', 'impact', 'score', 'category']
                    }
                  }
                },
                required: ['option', 'summaryBadge', 'pros', 'cons']
              }
            },
            matrix: {
              type: Type.OBJECT,
              properties: {
                criteria: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      name: { type: Type.STRING },
                      description: { type: Type.STRING },
                      defaultWeight: { type: Type.INTEGER, description: "1 to 5" }
                    },
                    required: ['id', 'name', 'description', 'defaultWeight']
                  }
                },
                optionScores: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      option: { type: Type.STRING },
                      scores: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            criteriaId: { type: Type.STRING },
                            score: { type: Type.INTEGER, description: "1 to 10" },
                            rationale: { type: Type.STRING }
                          },
                          required: ['criteriaId', 'score', 'rationale']
                        }
                      }
                    },
                    required: ['option', 'scores']
                  }
                }
              },
              required: ['criteria', 'optionScores']
            },
            swot: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  option: { type: Type.STRING },
                  strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                  weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
                  opportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
                  threats: { type: Type.ARRAY, items: { type: Type.STRING } },
                  strategicTakeaway: { type: Type.STRING }
                },
                required: ['option', 'strengths', 'weaknesses', 'opportunities', 'threats', 'strategicTakeaway']
              }
            },
            tiebreaker: {
              type: Type.OBJECT,
              properties: {
                winner: { type: Type.STRING },
                runnerUp: { type: Type.STRING },
                confidenceScore: { type: Type.INTEGER },
                headline: { type: Type.STRING },
                coreRationale: { type: Type.STRING },
                keyDecidingFactor: { type: Type.STRING },
                conditionalRule: { type: Type.STRING },
                blindspots: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      explanation: { type: Type.STRING },
                      advice: { type: Type.STRING }
                    },
                    required: ['title', 'explanation', 'advice']
                  }
                },
                devilsAdvocate: {
                  type: Type.OBJECT,
                  properties: {
                    targetOption: { type: Type.STRING },
                    hardQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
                    worstCaseScenario: { type: Type.STRING },
                    preMortemInsight: { type: Type.STRING }
                  },
                  required: ['targetOption', 'hardQuestions', 'worstCaseScenario', 'preMortemInsight']
                },
                actionPlan: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      timeframe: { type: Type.STRING },
                      action: { type: Type.STRING },
                      purpose: { type: Type.STRING }
                    },
                    required: ['timeframe', 'action', 'purpose']
                  }
                }
              },
              required: [
                'winner',
                'runnerUp',
                'confidenceScore',
                'headline',
                'coreRationale',
                'keyDecidingFactor',
                'conditionalRule',
                'blindspots',
                'devilsAdvocate',
                'actionPlan'
              ]
            }
          },
          required: ['summary', 'decisionType', 'reversibilityExplanation', 'prosCons', 'matrix', 'swot', 'tiebreaker']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error generating decision analysis with Gemini:', error);
    res.status(500).json({
      error: 'Failed to complete AI decision analysis. ' + (error?.message || ''),
    });
  }
});

// Quick suggestion endpoint to help users frame their decision options and criteria
app.post('/api/suggest-options', async (req, res) => {
  try {
    const { decision } = req.body;
    if (!decision) {
      return res.status(400).json({ error: 'Decision topic is required.' });
    }

    if (!apiKey) {
      return res.json({
        options: ['Option A: Status Quo / Conservative Path', 'Option B: Bold Pivot / High Growth'],
        suggestedPriorities: ['Financial Safety', 'Long-term Growth', 'Work-Life Balance', 'Personal Fulfillment']
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `For this decision: "${decision}", suggest 2 to 4 realistic, distinct options to compare, and 4 to 6 key evaluation criteria / priorities that matter most. Return as JSON.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            suggestedPriorities: { type: Type.ARRAY, items: { type: Type.STRING } },
            detectedCategory: { type: Type.STRING }
          },
          required: ['options', 'suggestedPriorities']
        }
      }
    });

    res.json(JSON.parse(response.text || '{}'));
  } catch (err: any) {
    console.error('Error suggesting options:', err);
    res.status(500).json({ error: 'Could not generate suggestions' });
  }
});

// Follow-up devil's advocate stress-testing endpoint
app.post('/api/stress-test', async (req, res) => {
  try {
    const { decision, chosenOption, userReasoning } = req.body;
    if (!decision || !chosenOption) {
      return res.status(400).json({ error: 'Missing decision or chosen option.' });
    }

    if (!apiKey) {
      return res.json({
        verdict: 'Fallback Stress Test',
        challenges: [
          'What is the hidden recurring cost you haven\'t factored in?',
          'If you had to reverse this 6 months from now, how painful is it?',
          'Are you choosing this to run towards an opportunity, or running away from discomfort?'
        ],
        preMortem: 'Assume 1 year has passed and this failed. What is the most probable culprit?'
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `
You are a sharp, empathetic Devil's Advocate for decision making.
Decision: "${decision}"
User is leaning towards: "${chosenOption}"
User's self-reported reasoning: "${userReasoning || 'Not specified'}"

Generate a constructive stress-test:
1. 3 incisive counter-arguments / blindspot questions that poke holes in their optimism without being cynical.
2. A Pre-Mortem Scenario: Imagine it's 12 months in the future and this choice proved to be a mistake. What was the exact failure mode?
3. A Litmus Test: A single question the user must answer honestly right now before committing.
Return as JSON.
`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            challenges: { type: Type.ARRAY, items: { type: Type.STRING } },
            preMortem: { type: Type.STRING },
            litmusTest: { type: Type.STRING },
            encouragement: { type: Type.STRING }
          },
          required: ['challenges', 'preMortem', 'litmusTest', 'encouragement']
        }
      }
    });

    res.json(JSON.parse(response.text || '{}'));
  } catch (err: any) {
    console.error('Error in stress test:', err);
    res.status(500).json({ error: 'Stress test failed' });
  }
});

function generateFallbackAnalysis(
  decision: string,
  options: string[],
  context: string,
  priorities: string[],
  riskTolerance: string
) {
  const optA = options[0] || 'Option 1';
  const optB = options[1] || 'Option 2';

  return {
    summary: `Structured comparison between "${optA}" and "${optB}" addressing the question "${decision}".`,
    decisionType: 'Type 2 (Two-Way Door)',
    reversibilityExplanation: 'Most elements of this decision can be recalibrated or pivoted within 6-12 months if key metrics underperform.',
    prosCons: [
      {
        option: optA,
        summaryBadge: 'High predictability and immediate stability',
        pros: [
          { id: 'p1', text: 'Lower volatility and immediate peace of mind', impact: 'high', score: 8, category: 'Stability' },
          { id: 'p2', text: 'Clear roadmap with minimal learning curve', impact: 'medium', score: 6, category: 'Execution' },
          { id: 'p3', text: 'Preserves current social and operational equilibrium', impact: 'medium', score: 5, category: 'Lifestyle' }
        ],
        cons: [
          { id: 'c1', text: 'Limited ceiling for transformative growth or upside', impact: 'high', score: -7, category: 'Opportunity Cost' },
          { id: 'c2', text: 'Risk of boredom or creeping dissatisfaction over time', impact: 'medium', score: -5, category: 'Motivation' }
        ]
      },
      {
        option: optB,
        summaryBadge: 'High upside with elevated short-term friction',
        pros: [
          { id: 'p4', text: 'Significantly higher long-term upside and growth potential', impact: 'critical', score: 9, category: 'Growth' },
          { id: 'p5', text: 'Forces accelerated learning and personal expansion', impact: 'high', score: 8, category: 'Skill Acquisition' },
          { id: 'p6', text: 'Eliminates the "what if" lingering regret', impact: 'high', score: 7, category: 'Psychological' }
        ],
        cons: [
          { id: 'c3', text: 'Greater upfront effort, adjustment friction, and uncertainty', impact: 'high', score: -7, category: 'Execution' },
          { id: 'c4', text: 'Higher downside risk if early execution hurdles arise', impact: 'medium', score: -6, category: 'Risk' }
        ]
      }
    ],
    matrix: {
      criteria: [
        { id: 'growth', name: 'Long-term Upside', description: 'Compound benefits over a 3-5 year horizon', defaultWeight: 5 },
        { id: 'financial', name: 'Financial / Resource Efficiency', description: 'Net return on invested money & time', defaultWeight: 4 },
        { id: 'stress', name: 'Mental Peace & Sustainability', description: 'Daily stress and work-life balance', defaultWeight: 4 },
        { id: 'reversibility', name: 'Reversibility & Agility', description: 'Ease of undoing or pivoting if needed', defaultWeight: 3 },
        { id: 'regret', name: 'Regret Minimization', description: 'Looking back in 10 years, which would you regret avoiding?', defaultWeight: 5 }
      ],
      optionScores: [
        {
          option: optA,
          scores: [
            { criteriaId: 'growth', score: 6, rationale: 'Steady baseline, but lacks exponential upside.' },
            { criteriaId: 'financial', score: 8, rationale: 'Predictable and capital-conservative.' },
            { criteriaId: 'stress', score: 8, rationale: 'Low immediate disruption to existing routines.' },
            { criteriaId: 'reversibility', score: 7, rationale: 'Easily maintained without high stakes.' },
            { criteriaId: 'regret', score: 5, rationale: 'May trigger "what if" reflections later.' }
          ]
        },
        {
          option: optB,
          scores: [
            { criteriaId: 'growth', score: 9, rationale: 'Substantial catalyst for leapfrog progress.' },
            { criteriaId: 'financial', score: 7, rationale: 'Higher initial investment, but larger potential yield.' },
            { criteriaId: 'stress', score: 6, rationale: 'Steeper initial friction, normalizing once habits form.' },
            { criteriaId: 'reversibility', score: 6, rationale: 'Requires active management to pivot smoothly.' },
            { criteriaId: 'regret', score: 9, rationale: 'Taking the bolder step drastically minimizes regret.' }
          ]
        }
      ]
    },
    swot: [
      {
        option: optA,
        strengths: ['Established foundation', 'High certainty of outcome', 'Immediate comfort'],
        weaknesses: ['Capped upside', 'Vulnerability to stagnation', 'Diminishing novelty'],
        opportunities: ['Optimize current position', 'Accumulate surplus energy for side pursuits'],
        threats: ['Changing external landscape leaves you behind', 'Regret accumulation'],
        strategicTakeaway: 'Great if your overarching priority is deep restoration and risk defense right now.'
      },
      {
        option: optB,
        strengths: ['Catalyst for breakout progress', 'High alignment with ambition', 'New network and skills'],
        weaknesses: ['Steep learning curve', 'Short-term cognitive fatigue', 'Unproven variables'],
        opportunities: ['Establish market/career leadership', 'Unlock compounding secondary opportunities'],
        threats: ['Underestimating the time to achieve stability', 'Burnout if boundaries lapse'],
        strategicTakeaway: 'The superior choice if you possess 3-6 months of buffer and crave meaningful growth.'
      }
    ],
    tiebreaker: {
      winner: riskTolerance === 'conservative' ? optA : optB,
      runnerUp: riskTolerance === 'conservative' ? optB : optA,
      confidenceScore: 84,
      headline: riskTolerance === 'conservative'
        ? `The Tiebreaker Verdict: Why ${optA} wins for your risk profile`
        : `The Tiebreaker Verdict: Why ${optB} wins on compounding upside`,
      coreRationale: `When analyzing "${decision}", the primary friction point is balancing the comfort of certainty against the compounding value of proactive change. While ${optA} provides undeniable peace of mind and preserves stability, ${optB} fundamentally addresses the core driver of long-term satisfaction: regret minimization. In our weighted multi-criteria matrix, the bolder option pulls ahead precisely in categories that shape life outcomes 3 to 5 years down the road.`,
      keyDecidingFactor: 'The asymmetry between regret minimization versus transient short-term comfort.',
      conditionalRule: `Pick ${optB} if you can commit to an initial 90-day adjustment window; however, if personal bandwidth is currently at capacity, temporarily shelter in ${optA} for 6 months.`,
      blindspots: [
        {
          title: 'The Sunk Cost Delusion',
          explanation: 'Giving disproportionate weight to past time, money, or comfort already spent rather than future marginal gains.',
          advice: 'Assess both options as if you were an external advisor appointed today with clean slate.'
        },
        {
          title: 'The Reversibility Trap',
          explanation: 'Overestimating how permanent this decision actually is.',
          advice: 'Treat this as an experiment with an explicit 6-month checkpoint rather than a lifetime contract.'
        },
        {
          title: 'Default Bias (Status Quo)',
          explanation: 'Viewing doing nothing or staying put as "free of cost", when in reality the cost is passive erosion.',
          advice: 'Explicitly calculate what doing nothing will cost you over 24 months.'
        }
      ],
      devilsAdvocate: {
        targetOption: riskTolerance === 'conservative' ? optA : optB,
        hardQuestions: [
          'If this option fails to deliver within 6 months, what is your predefined exit trigger?',
          'Are you choosing this out of genuine excitement, or simply fear of the alternative?',
          'What is the one variable that, if it went wrong, would make you regret this immediately?'
        ],
        worstCaseScenario: 'You experience an initial dip in confidence during the transition and mistakenly interpret early friction as failure.',
        preMortemInsight: 'The leading reason this choice could falter is poor communication of expectations with key stakeholders.'
      },
      actionPlan: [
        { timeframe: 'Today (Next 2 Hours)', action: 'Perform the 10/10/10 test: How will this decision look in 10 minutes, 10 months, and 10 years?', purpose: 'Detaches immediate emotional anxiety from long-term logic.' },
        { timeframe: 'Within 48 Hours', action: 'Draft a one-page "commitment charter" outlining non-negotiable boundaries and checkpoints.', purpose: 'Protects downside before taking the plunge.' },
        { timeframe: 'Within 72 Hours', action: 'Take the first irreversible or formal step towards the chosen path.', purpose: 'Cuts through decision paralysis and builds momentum.' }
      ]
    }
  };
}

// Full-stack Vite setup for dev and production
const port = parseInt(process.env.PORT || '3000', 10);

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`The Tiebreaker server running at http://localhost:${port}`);
  });
}

startServer();
