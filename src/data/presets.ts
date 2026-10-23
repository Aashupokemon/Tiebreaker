import { PresetDilemma } from '../types/decision';

export const PRESET_DILEMMAS: PresetDilemma[] = [
  {
    title: 'Career Crossroads',
    category: 'Career',
    question: 'Should I leave my stable Senior Engineer corporate job to join an early-stage AI startup as a founding engineer?',
    options: [
      'Stay at Stable Corporate Role (High base salary, 401k match, predictable 40h/week)',
      'Join Early-Stage AI Startup (Significant equity, 15% salary cut, high pace & ownership)'
    ],
    context: '31 years old, 6 months of emergency savings, no kids yet, value long-term financial freedom and feeling energized by what I build.',
    priorities: ['Long-term Wealth & Equity', 'Career Trajectory', 'Daily Excitement & Learning', 'Mental Peace & Burnout Prevention'],
    riskTolerance: 'balanced'
  },
  {
    title: 'Housing Dilemma',
    category: 'Finance',
    question: 'Should we buy a townhouse now in a suburban school district or continue renting in the city center for 2 more years?',
    options: [
      'Buy Suburban Townhouse Now (Lock in mortgage, build equity, longer commute)',
      'Rent in City Center for 2 More Years (Max liquidity for index investing, 10 min commute, flexibility)'
    ],
    context: 'Married, combined income $190k, interest rates around 6.5%, 20% down payment ready in high-yield account.',
    priorities: ['Capital Efficiency & Flexibility', 'Family Readiness', 'Commute Quality of Life', 'Real Estate Appreciation'],
    riskTolerance: 'conservative'
  },
  {
    title: 'Architecture Strategy',
    category: 'Tech & Architecture',
    question: 'Should we refactor our existing monolithic application into event-driven microservices or optimize the modular monolith?',
    options: [
      'Optimize Modular Monolith (Refactor domain boundaries, enhance caching & query indexing)',
      'Migrate to Event-Driven Microservices (Kafka/RabbitMQ, independent team deployments, distributed tracing)'
    ],
    context: 'Engineering team of 14 developers, hitting occasional database contention during peak hours, shipping 3-4 releases per week.',
    priorities: ['Developer Velocity', 'Operational Complexity', 'Infrastructure Cost', 'System Scalability'],
    riskTolerance: 'conservative'
  },
  {
    title: 'Relocation Choice',
    category: 'Lifestyle',
    question: 'Should I relocate from Seattle to Austin for lower taxes and sunshine, or stay close to my long-time network?',
    options: [
      'Stay in Seattle (Established social circle, outdoor mountains, mild summers, higher living cost)',
      'Relocate to Austin (Zero state income tax, vibrant tech scene, hot summers, need to rebuild circle)'
    ],
    context: 'Remote worker, mid-career, loves live music and outdoor sports, occasionally gets seasonal affective mood in winter.',
    priorities: ['Social Connection & Community', 'Financial Savings', 'Year-round Sun & Well-being', 'Career Network'],
    riskTolerance: 'balanced'
  },
  {
    title: 'Product Launch Model',
    category: 'Business',
    question: 'Should our B2B SaaS offer a generous Self-Serve Free Tier (Product-Led Growth) or a High-Touch Sales-Led Demo model?',
    options: [
      'Product-Led Free Tier (Fast viral adoption, self-service onboarding, lower initial ACV)',
      'High-Touch Enterprise Demo (Target $25k+ annual contracts, custom POCs, longer sales cycle)'
    ],
    context: 'Bootstrapped developer tool with 2 co-founders, strong documentation, limited sales team bandwidth.',
    priorities: ['Organic User Acquisition', 'Cashflow Sustainability', 'Customer Retention', 'Founder Time Allocation'],
    riskTolerance: 'aggressive'
  }
];
