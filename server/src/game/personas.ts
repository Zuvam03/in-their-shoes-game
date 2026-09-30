import type { PersonaDefinition } from './types';

export const PERSONAS: PersonaDefinition[] = [
  {
    id: 'overcommitted_achiever',
    name: 'Arjun Sharma',
    title: 'The Overcommitted Achiever',
    description: 'A driven professional who always takes on more than he can handle, juggling multiple deadlines with caffeine and determination.',
    backstory: 'Arjun grew up watching his father miss promotions. He vowed to never be overlooked. Now he overcompensates — every opportunity accepted, every deadline met, every relationship strained.',
    traits: {
      analyticalThinking: 8, emotionalSensitivity: 3, appetite: 4,
      workOrientation: 10, spendingStyle: 5, socialOrientation: 5,
      riskTolerance: 6, resilience: 7, adaptability: 6, cooperation: 5
    },
    motivations: {
      careerAdvancement: 10, financialSecurity: 7, socialAcceptance: 6,
      personalIndependence: 8, familyResponsibility: 5, fairness: 5,
      helpingOthers: 3, achievement: 10, comfort: 4
    },
    foodPreferences: ['any'],
    startingCash: 350,
    startingEnergy: 65,
    traitInteractions: [
      'Completing work tasks gives extra motivation boost',
      'Overwork rapidly accumulates stress',
      'Analytical mind spots route efficiencies'
    ],
    strengths: ['High work output', 'Analytical route planning', 'Stress resistance until threshold'],
    vulnerabilities: ['Rapid stress accumulation when overworked', 'Ignores personal needs', 'Low capacity for leisure'],
    modifiers: {
      hungerRate: 0.8, energyRecovery: 0.9, moodFromFood: 0.8,
      stressFromWork: 1.6, moodFromSocial: 0.7, analyticsBonus: 1.5,
      spendingResistance: 1.1, socialRecovery: 0.7, riskRewardBonus: 1.1,
      cooperationBonus: 0.9, stressThreshold: 70, independencePenalty: 0
    }
  },
  {
    id: 'emotionally_sensitive_friend',
    name: 'Priya Banerjee',
    title: 'The Emotionally Sensitive Friend',
    description: 'A compassionate person who feels everything deeply — other people\'s joy and pain alike. Her empathy is her superpower and her burden.',
    backstory: 'Priya has always been the one friends call in a crisis. She never says no, even when she should. Her relationships are deep but she often neglects her own wellbeing.',
    traits: {
      analyticalThinking: 5, emotionalSensitivity: 10, appetite: 6,
      workOrientation: 5, spendingStyle: 6, socialOrientation: 9,
      riskTolerance: 3, resilience: 5, adaptability: 6, cooperation: 10
    },
    motivations: {
      careerAdvancement: 4, financialSecurity: 5, socialAcceptance: 9,
      personalIndependence: 4, familyResponsibility: 8, fairness: 9,
      helpingOthers: 10, achievement: 5, comfort: 7
    },
    foodPreferences: ['sweet', 'vegetarian'],
    startingCash: 250,
    startingEnergy: 75,
    traitInteractions: [
      'Helping others gives significant mood boost',
      'Rejection or conflict causes outsized mood drops',
      'Social interactions restore mood efficiently'
    ],
    strengths: ['Excellent cooperation bonuses', 'Mood recovery from social interaction', 'High karma from genuine help'],
    vulnerabilities: ['Mood craters from rejection', 'Exhausts herself helping others', 'Avoids confrontation'],
    modifiers: {
      hungerRate: 1.0, energyRecovery: 1.1, moodFromFood: 1.3,
      stressFromWork: 0.9, moodFromSocial: 2.0, analyticsBonus: 0.8,
      spendingResistance: 0.85, socialRecovery: 1.8, riskRewardBonus: 0.8,
      cooperationBonus: 1.5, stressThreshold: 50, independencePenalty: 0
    }
  },
  {
    id: 'analytical_planner',
    name: 'Debashish Roy',
    title: 'The Analytical Planner',
    description: 'A methodical thinker who researches everything before acting. His plans are brilliant but sometimes the city doesn\'t follow his spreadsheet.',
    backstory: 'Debashish is a data analyst who applies the same rigor to life decisions that he applies to work. He is rarely impulsive and rarely surprised — but real life keeps throwing variables his spreadsheet never modeled.',
    traits: {
      analyticalThinking: 10, emotionalSensitivity: 4, appetite: 5,
      workOrientation: 8, spendingStyle: 3, socialOrientation: 3,
      riskTolerance: 2, resilience: 8, adaptability: 3, cooperation: 5
    },
    motivations: {
      careerAdvancement: 7, financialSecurity: 10, socialAcceptance: 3,
      personalIndependence: 9, familyResponsibility: 6, fairness: 8,
      helpingOthers: 4, achievement: 9, comfort: 5
    },
    foodPreferences: ['vegetarian', 'any'],
    startingCash: 400,
    startingEnergy: 80,
    traitInteractions: [
      'Analytical actions reveal extra route or resource information',
      'Unexpected events cause higher stress due to low adaptability',
      'Frugal spending preserves cash longer'
    ],
    strengths: ['Best route efficiency', 'Detailed action information', 'High starting cash reserve'],
    vulnerabilities: ['Struggles with unexpected events', 'Poor social interactions', 'Rigid planning causes missed opportunities'],
    modifiers: {
      hungerRate: 0.9, energyRecovery: 1.0, moodFromFood: 0.9,
      stressFromWork: 0.8, moodFromSocial: 0.6, analyticsBonus: 2.0,
      spendingResistance: 1.5, socialRecovery: 0.5, riskRewardBonus: 0.7,
      cooperationBonus: 0.8, stressThreshold: 60, independencePenalty: 5
    }
  },
  {
    id: 'impulsive_shopaholic',
    name: 'Ritika Ghosh',
    title: 'The Impulsive Shopaholic',
    description: 'A vibrant soul who lives in the moment and spends freely. Life is short and the street market is calling.',
    backstory: 'Ritika earned well for two years and spent better. Now she\'s navigating tighter times without tightening her habits. Every budget is temporary; every purchase is justified.',
    traits: {
      analyticalThinking: 3, emotionalSensitivity: 7, appetite: 7,
      workOrientation: 5, spendingStyle: 9, socialOrientation: 8,
      riskTolerance: 7, resilience: 6, adaptability: 8, cooperation: 7
    },
    motivations: {
      careerAdvancement: 4, financialSecurity: 2, socialAcceptance: 8,
      personalIndependence: 7, familyResponsibility: 4, fairness: 6,
      helpingOthers: 6, achievement: 5, comfort: 9
    },
    foodPreferences: ['street', 'spicy', 'sweet'],
    startingCash: 180,
    startingEnergy: 80,
    traitInteractions: [
      'Purchases give temporary mood boost',
      'Low cash causes increasing stress',
      'Adapts quickly to new situations'
    ],
    strengths: ['High adaptability', 'Mood from purchases', 'Social connections are easy'],
    vulnerabilities: ['Drains cash faster', 'Financial stress escalates quickly', 'Hard to save for mission-critical spending'],
    modifiers: {
      hungerRate: 1.1, energyRecovery: 1.0, moodFromFood: 1.4,
      stressFromWork: 0.9, moodFromSocial: 1.3, analyticsBonus: 0.6,
      spendingResistance: 0.5, socialRecovery: 1.3, riskRewardBonus: 1.2,
      cooperationBonus: 1.1, stressThreshold: 45, independencePenalty: 0
    }
  },
  {
    id: 'food_loving_explorer',
    name: 'Sourav Das',
    title: 'The Food-Loving Explorer',
    description: 'A foodie with an adventurous spirit who treats every meal as a destination. He can walk an extra mile for the right biryani.',
    backstory: 'Sourav runs a food blog. Everything in his day is organized around what he might eat next. He has strong opinions about where to eat and is happiest on the move, discovering new spots.',
    traits: {
      analyticalThinking: 5, emotionalSensitivity: 6, appetite: 10,
      workOrientation: 4, spendingStyle: 7, socialOrientation: 7,
      riskTolerance: 6, resilience: 7, adaptability: 8, cooperation: 7
    },
    motivations: {
      careerAdvancement: 3, financialSecurity: 4, socialAcceptance: 6,
      personalIndependence: 7, familyResponsibility: 3, fairness: 5,
      helpingOthers: 6, achievement: 5, comfort: 10
    },
    foodPreferences: ['street', 'meat', 'spicy', 'sweet'],
    startingCash: 300,
    startingEnergy: 85,
    traitInteractions: [
      'Preferred meals give significant energy and mood boost',
      'High appetite means hunger rises faster',
      'Will explore map detours for good food opportunities'
    ],
    strengths: ['Huge benefit from preferred food', 'High starting energy', 'Adaptable routes'],
    vulnerabilities: ['Hunger rises faster than average', 'Spending on food can strain cash', 'Distracted by food opportunities'],
    modifiers: {
      hungerRate: 1.4, energyRecovery: 1.2, moodFromFood: 2.0,
      stressFromWork: 0.9, moodFromSocial: 1.0, analyticsBonus: 0.8,
      spendingResistance: 0.7, socialRecovery: 1.0, riskRewardBonus: 1.0,
      cooperationBonus: 1.0, stressThreshold: 55, independencePenalty: 0
    }
  },
  {
    id: 'frugal_survivor',
    name: 'Mita Mondal',
    title: 'The Frugal Survivor',
    description: 'A resourceful woman who has stretched every rupee her entire life. She knows every shortcut, every free resource, every bargain.',
    backstory: 'Mita raised two siblings on a tight budget after their parents passed early. She has never wasted a paisa and never will. Generosity costs money; she is careful but not unkind.',
    traits: {
      analyticalThinking: 7, emotionalSensitivity: 5, appetite: 6,
      workOrientation: 8, spendingStyle: 1, socialOrientation: 4,
      riskTolerance: 3, resilience: 9, adaptability: 7, cooperation: 6
    },
    motivations: {
      careerAdvancement: 5, financialSecurity: 10, socialAcceptance: 3,
      personalIndependence: 9, familyResponsibility: 9, fairness: 7,
      helpingOthers: 6, achievement: 6, comfort: 4
    },
    foodPreferences: ['vegetarian', 'street'],
    startingCash: 150,
    startingEnergy: 70,
    traitInteractions: [
      'Strong resistance to unnecessary spending',
      'Free or cheap actions have boosted effectiveness',
      'High resilience makes her last through difficult moments'
    ],
    strengths: ['Lowest cash drain', 'High resilience', 'Best at free resource utilization'],
    vulnerabilities: ['Low starting cash limits early options', 'Reluctant to spend even when needed', 'Risk aversion misses opportunities'],
    modifiers: {
      hungerRate: 0.9, energyRecovery: 1.0, moodFromFood: 1.0,
      stressFromWork: 0.7, moodFromSocial: 0.8, analyticsBonus: 1.2,
      spendingResistance: 2.5, socialRecovery: 0.8, riskRewardBonus: 0.7,
      cooperationBonus: 0.9, stressThreshold: 75, independencePenalty: 3
    }
  },
  {
    id: 'social_connector',
    name: 'Neha Chatterjee',
    title: 'The Social Connector',
    description: 'Someone who knows everyone and makes friends everywhere she goes. Her network is her greatest asset.',
    backstory: 'Neha is the person at every party who leaves with five new contacts. She\'s naturally warm, always curious about people, and has helped more careers than she can count — through introductions alone.',
    traits: {
      analyticalThinking: 5, emotionalSensitivity: 8, appetite: 5,
      workOrientation: 5, spendingStyle: 6, socialOrientation: 10,
      riskTolerance: 5, resilience: 7, adaptability: 8, cooperation: 9
    },
    motivations: {
      careerAdvancement: 5, financialSecurity: 5, socialAcceptance: 10,
      personalIndependence: 4, familyResponsibility: 6, fairness: 7,
      helpingOthers: 9, achievement: 5, comfort: 6
    },
    foodPreferences: ['any', 'street'],
    startingCash: 280,
    startingEnergy: 78,
    traitInteractions: [
      'Social interactions restore mood efficiently',
      'Cooperation with others gives boosted bonuses',
      'Isolation causes mood decline'
    ],
    strengths: ['Exceptional cooperation bonuses', 'Mood recovery via social actions', 'Information network advantage'],
    vulnerabilities: ['Relies on others, vulnerable if isolated', 'Struggles without social support', 'Social obligations can slow mission progress'],
    modifiers: {
      hungerRate: 1.0, energyRecovery: 1.0, moodFromFood: 1.1,
      stressFromWork: 1.0, moodFromSocial: 2.5, analyticsBonus: 0.9,
      spendingResistance: 0.9, socialRecovery: 2.2, riskRewardBonus: 0.9,
      cooperationBonus: 1.8, stressThreshold: 55, independencePenalty: 0
    }
  },
  {
    id: 'independent_loner',
    name: 'Suman Gupta',
    title: 'The Independent Loner',
    description: 'A self-reliant introvert who prefers to work alone and trusts nobody to help him — and doesn\'t want to help anyone either.',
    backstory: 'Suman had partners who let him down. He reorganized his life to need no one. He\'s highly capable, but the city occasionally forces interactions he\'d rather avoid.',
    traits: {
      analyticalThinking: 7, emotionalSensitivity: 4, appetite: 5,
      workOrientation: 7, spendingStyle: 4, socialOrientation: 1,
      riskTolerance: 5, resilience: 9, adaptability: 5, cooperation: 1
    },
    motivations: {
      careerAdvancement: 6, financialSecurity: 8, socialAcceptance: 1,
      personalIndependence: 10, familyResponsibility: 3, fairness: 6,
      helpingOthers: 2, achievement: 8, comfort: 7
    },
    foodPreferences: ['any'],
    startingCash: 320,
    startingEnergy: 85,
    traitInteractions: [
      'Works more effectively alone — solo actions are more potent',
      'Receiving help feels uncomfortable — slight mood penalty',
      'Very high resilience for sustained solo missions'
    ],
    strengths: ['Best solo effectiveness', 'High resilience', 'Self-sufficient cash management'],
    vulnerabilities: ['Poor cooperation effectiveness', 'Mood penalty from receiving help', 'Miss multiplayer bonuses'],
    modifiers: {
      hungerRate: 0.9, energyRecovery: 1.1, moodFromFood: 1.0,
      stressFromWork: 0.8, moodFromSocial: 0.3, analyticsBonus: 1.2,
      spendingResistance: 1.2, socialRecovery: 0.3, riskRewardBonus: 1.1,
      cooperationBonus: 0.5, stressThreshold: 80, independencePenalty: 8
    }
  },
  {
    id: 'risk_taking_opportunist',
    name: 'Rohan Bose',
    title: 'The Risk-Taking Opportunist',
    description: 'A gambler at heart who sees every uncertain situation as an opportunity. Sometimes he\'s right; sometimes it hurts.',
    backstory: 'Rohan made his first money trading during volatile periods. He loves the rush of uncertain outcomes. His instincts are often right — but "often" has limits.',
    traits: {
      analyticalThinking: 6, emotionalSensitivity: 4, appetite: 6,
      workOrientation: 5, spendingStyle: 7, socialOrientation: 7,
      riskTolerance: 10, resilience: 7, adaptability: 9, cooperation: 6
    },
    motivations: {
      careerAdvancement: 6, financialSecurity: 3, socialAcceptance: 6,
      personalIndependence: 8, familyResponsibility: 4, fairness: 5,
      helpingOthers: 5, achievement: 9, comfort: 6
    },
    foodPreferences: ['street', 'spicy', 'any'],
    startingCash: 260,
    startingEnergy: 82,
    traitInteractions: [
      'High-risk actions have boosted rewards when successful',
      'Adapts quickly to unexpected city events',
      'Can read opportunities others miss'
    ],
    strengths: ['Best risk action payoffs', 'Excellent adaptability', 'Opportunity recognition'],
    vulnerabilities: ['Risk failures can be severe', 'Unstable resource trajectory', 'Financial inconsistency'],
    modifiers: {
      hungerRate: 1.0, energyRecovery: 1.0, moodFromFood: 1.0,
      stressFromWork: 0.9, moodFromSocial: 1.1, analyticsBonus: 0.9,
      spendingResistance: 0.8, socialRecovery: 1.0, riskRewardBonus: 1.8,
      cooperationBonus: 1.1, stressThreshold: 65, independencePenalty: 0
    }
  },
  {
    id: 'quiet_caregiver',
    name: 'Anita Paul',
    title: 'The Quiet Caregiver',
    description: 'A gentle, self-effacing person who puts everyone else first — often to the point of forgetting herself.',
    backstory: 'Anita cares for an elderly parent and a younger sibling. She is used to sacrifice. In the city alone, without her usual role, she sometimes doesn\'t know what she actually wants.',
    traits: {
      analyticalThinking: 5, emotionalSensitivity: 9, appetite: 5,
      workOrientation: 6, spendingStyle: 3, socialOrientation: 6,
      riskTolerance: 3, resilience: 8, adaptability: 6, cooperation: 9
    },
    motivations: {
      careerAdvancement: 3, financialSecurity: 6, socialAcceptance: 6,
      personalIndependence: 4, familyResponsibility: 10, fairness: 9,
      helpingOthers: 10, achievement: 4, comfort: 5
    },
    foodPreferences: ['vegetarian', 'sweet'],
    startingCash: 200,
    startingEnergy: 68,
    traitInteractions: [
      'Helping others gives significant energy and mood boost',
      'Own needs neglected leads to declining stats',
      'Remarkably effective at cooperative objectives'
    ],
    strengths: ['Exceptional help effectiveness', 'Mood boost from helping', 'Trust building is fast'],
    vulnerabilities: ['Starting energy is low', 'Self-neglect accelerates personal stat decline', 'Can be exploited by selfish players'],
    modifiers: {
      hungerRate: 0.95, energyRecovery: 0.85, moodFromFood: 1.1,
      stressFromWork: 0.8, moodFromSocial: 1.4, analyticsBonus: 0.9,
      spendingResistance: 1.3, socialRecovery: 1.5, riskRewardBonus: 0.8,
      cooperationBonus: 1.6, stressThreshold: 55, independencePenalty: 2
    }
  },
  {
    id: 'anxious_perfectionist',
    name: 'Kavya Mukherjee',
    title: 'The Anxious Perfectionist',
    description: 'A high-achiever plagued by self-doubt who triple-checks everything and still worries it\'s wrong.',
    backstory: 'Kavya graduated top of her class and immediately began catastrophizing that her next move would undo it all. She is supremely capable when calm, but anxiety escalates faster than anyone.',
    traits: {
      analyticalThinking: 9, emotionalSensitivity: 8, appetite: 4,
      workOrientation: 9, spendingStyle: 4, socialOrientation: 4,
      riskTolerance: 2, resilience: 4, adaptability: 3, cooperation: 6
    },
    motivations: {
      careerAdvancement: 9, financialSecurity: 8, socialAcceptance: 7,
      personalIndependence: 7, familyResponsibility: 7, fairness: 8,
      helpingOthers: 5, achievement: 10, comfort: 6
    },
    foodPreferences: ['vegetarian', 'any'],
    startingCash: 370,
    startingEnergy: 72,
    traitInteractions: [
      'High analytics gives best possible information quality',
      'Stress accumulates very quickly from setbacks',
      'Perfectionist approach occasionally delays actions'
    ],
    strengths: ['Exceptional analytical advantage', 'High achiever at work actions', 'Good starting cash'],
    vulnerabilities: ['Stress threshold is very low', 'Unexpected events devastating', 'Low resilience means difficult recovery'],
    modifiers: {
      hungerRate: 0.9, energyRecovery: 0.8, moodFromFood: 0.9,
      stressFromWork: 1.4, moodFromSocial: 0.8, analyticsBonus: 1.9,
      spendingResistance: 1.2, socialRecovery: 0.6, riskRewardBonus: 0.6,
      cooperationBonus: 0.8, stressThreshold: 40, independencePenalty: 3
    }
  },
  {
    id: 'street_smart_negotiator',
    name: 'Tapas Chatterjee',
    title: 'The Adaptable Street-Smart Negotiator',
    description: 'A hustler who grew up reading situations and people. He never pays full price and never misses an angle.',
    backstory: 'Tapas navigated Kolkata\'s markets before he could read. He has an instinct for value, negotiation, and people\'s real motivations. Nothing surprises him for long.',
    traits: {
      analyticalThinking: 7, emotionalSensitivity: 6, appetite: 7,
      workOrientation: 6, spendingStyle: 5, socialOrientation: 8,
      riskTolerance: 7, resilience: 8, adaptability: 10, cooperation: 7
    },
    motivations: {
      careerAdvancement: 6, financialSecurity: 7, socialAcceptance: 7,
      personalIndependence: 8, familyResponsibility: 6, fairness: 6,
      helpingOthers: 5, achievement: 7, comfort: 7
    },
    foodPreferences: ['street', 'spicy', 'meat'],
    startingCash: 240,
    startingEnergy: 80,
    traitInteractions: [
      'Best adaptability — city events affect him least negatively',
      'Negotiation gives better resource exchange rates',
      'Street knowledge reveals hidden opportunities'
    ],
    strengths: ['Best adaptability', 'Negotiation efficiency', 'Opportunity recognition in unexpected events'],
    vulnerabilities: ['Moderate in everything, excellent at nothing', 'Can be overconfident in negotiations'],
    modifiers: {
      hungerRate: 1.0, energyRecovery: 1.0, moodFromFood: 1.1,
      stressFromWork: 0.8, moodFromSocial: 1.2, analyticsBonus: 1.1,
      spendingResistance: 1.3, socialRecovery: 1.1, riskRewardBonus: 1.3,
      cooperationBonus: 1.2, stressThreshold: 60, independencePenalty: 0
    }
  }
];

export function getPersonaById(id: string): PersonaDefinition | undefined {
  return PERSONAS.find(p => p.id === id);
}

export function shufflePersonas(playerCount: number, seed: number): PersonaDefinition[] {
  const pool = [...PERSONAS];
  // Seeded shuffle (Fisher-Yates)
  let s = seed;
  const rand = () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, playerCount);
}
