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
    },
    socialContext: {
      class: 'upper-middle',
      communityIdentity: 'Bengali Hindu Brahmin, South Kolkata, IIM aspirant circle',
      politicalPressures: [
        'Family expects him to succeed visibly — a public failure would humiliate the lineage',
        'His company\'s culture rewards ruthlessness disguised as meritocracy',
        'Peers from less privileged backgrounds resent his obliviousness to his own advantages'
      ],
      hiddenObligations: [
        'Promised his mother he would attend her cousin\'s wedding — he hasn\'t told his boss he needs the day off',
        'Owes a favour to a college friend who helped him through a crisis — the friend is now asking',
        'Carries guilt about a junior colleague he didn\'t defend during a layoff'
      ],
      decisionWeights: {
        groupLoyalty: 4,
        selfPreservation: 8,
        principledAction: 5,
        statusAnxiety: 9,
        communityDuty: 3
      },
      insightLines: [
        'Arjun\'s relentless drive isn\'t ambition — it\'s the terror of being his father, overlooked and uncelebrated.',
        'He mistakes exhaustion for effort and visibility for value. The city doesn\'t grade on hours worked.',
        'His privilege lets him treat every setback as temporary. For others in his path, the same setback is permanent.'
      ],
      dilemmaProfile: 'Defaults to self-interest rationalized as pragmatism; genuinely surprised when called selfish'
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
    },
    socialContext: {
      class: 'middle',
      communityIdentity: 'Bengali Hindu, North Kolkata joint family, neighbourhood aunty network',
      politicalPressures: [
        'Expected to be emotionally available to everyone — her own needs are invisible',
        'Neighbours assume she will mediate every family dispute on the block',
        'Her mother-in-law sees her empathy as weakness and openly says so'
      ],
      hiddenObligations: [
        'Supporting a school friend through a divorce in secret — it\'s draining her',
        'Her sister relies on her financially but never acknowledges it',
        'Carrying knowledge of a neighbour\'s domestic abuse she doesn\'t know how to act on'
      ],
      decisionWeights: {
        groupLoyalty: 7,
        selfPreservation: 3,
        principledAction: 8,
        statusAnxiety: 5,
        communityDuty: 9
      },
      insightLines: [
        'Priya\'s empathy isn\'t a personality trait — it\'s a survival strategy learned from being the only one who listened in a loud family.',
        'She helps compulsively not from kindness alone, but because saying no triggers a guilt she can\'t metabolize.',
        'The city tests whether she can exist for herself. Most of her choices reveal she still doesn\'t know how.'
      ],
      dilemmaProfile: 'Instinctively sacrifices for others; internal conflict only surfaces when the cost becomes physical'
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
    },
    socialContext: {
      class: 'upper-middle',
      communityIdentity: 'Bengali Hindu, Salt Lake IT corridor, IIT alumni network',
      politicalPressures: [
        'His data-driven worldview clashes with the emotional politics of his workplace',
        'Colleagues think he\'s cold; he thinks they\'re irrational — both are partly right',
        'His parents want him to marry soon; he has a spreadsheet of reasons he\'s not ready'
      ],
      hiddenObligations: [
        'Privately tutoring his driver\'s son in maths — the only relationship where his precision is appreciated',
        'Owes his career break to a mentor he hasn\'t spoken to in two years',
        'Knows his company\'s product is being used unethically but has modelled the personal cost of whistleblowing'
      ],
      decisionWeights: {
        groupLoyalty: 3,
        selfPreservation: 7,
        principledAction: 7,
        statusAnxiety: 6,
        communityDuty: 4
      },
      insightLines: [
        'Debashish\'s rigidity isn\'t arrogance — it\'s fear. Chaos reminds him that the world doesn\'t run on logic.',
        'His spreadsheets are a wall between him and discomfort. The city forces him to feel what he normally models.',
        'When he finally acts without data, the choice reveals more about him than ten optimized decisions ever could.'
      ],
      dilemmaProfile: 'Paralysis under ambiguity; principled when cost is calculable, evasive when it is not'
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
    },
    socialContext: {
      class: 'middle',
      communityIdentity: 'Bengali Hindu, South Kolkata, former influencer circle',
      politicalPressures: [
        'Her Instagram-curated lifestyle masks growing debt she won\'t discuss',
        'Friends assume she\'s doing well — she\'s performing wellness, not living it',
        'Family sees her spending as irresponsibility; she sees it as the only thing that feels real'
      ],
      hiddenObligations: [
        'Owes ₹40,000 to a friend who quietly covered her rent two months ago',
        'Promised her younger cousin a birthday gift she can\'t actually afford',
        'Hiding from her parents that she left her stable job three months ago'
      ],
      decisionWeights: {
        groupLoyalty: 5,
        selfPreservation: 4,
        principledAction: 4,
        statusAnxiety: 9,
        communityDuty: 3
      },
      insightLines: [
        'Ritika\'s spending isn\'t reckless — it\'s the only language her anxiety understands. Each purchase is a tiny vote that things are still okay.',
        'She performs generosity to maintain her social image. The city strips that performance and asks what she\'d give with no audience.',
        'Her crisis isn\'t financial. It\'s the moment she realizes the person she\'s curated isn\'t the person she actually is.'
      ],
      dilemmaProfile: 'Avoids discomfort through acquisition; generous in public, panicking in private'
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
    },
    socialContext: {
      class: 'middle',
      communityIdentity: 'Bengali Hindu, Gariahat food scene, amateur food blogger community',
      politicalPressures: [
        'The food blogging world is petty — one bad review and you\'re blacklisted from restaurant invites',
        'His parents want him to take his father\'s garment business seriously; he can\'t tell them blogging is his real ambition',
        'Local vendors give him free samples expecting five-star reviews — honesty has a social cost'
      ],
      hiddenObligations: [
        'A street vendor gave him credit when he was broke — he still hasn\'t paid ₹200 back',
        'Promised a restaurant owner he\'d delete a harsh review; it\'s still cached online',
        'His grandmother\'s recipe is his most popular post — she doesn\'t know he monetized it'
      ],
      decisionWeights: {
        groupLoyalty: 5,
        selfPreservation: 5,
        principledAction: 4,
        statusAnxiety: 4,
        communityDuty: 5
      },
      insightLines: [
        'Sourav uses food as a buffer between himself and emotional complexity. Feed him and he\'s fine; ask him to be vulnerable and he orders another plate.',
        'His apparent simplicity hides an avoidance pattern — exploring the city is easier than exploring why he\'s stuck.',
        'The game reveals whether he can care about people as much as he cares about what they eat.'
      ],
      dilemmaProfile: 'Defaults to the comfortable option; confrontation is a last resort'
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
    },
    socialContext: {
      class: 'working',
      communityIdentity: 'Bengali Scheduled Caste, Behala, domestic worker network',
      politicalPressures: [
        'Caste is invisible until it isn\'t — a casual question about her surname reveals everything',
        'The welfare office treats her like a supplicant; she has to perform gratitude for entitlements',
        'Her children\'s school assumes working-class parents don\'t care about education'
      ],
      hiddenObligations: [
        'Sending ₹500/month to her mother in the village — it\'s more than she can afford',
        'Her younger brother needs surgery; she\'s been quietly collecting from three different charities',
        'Promised her daughter she\'d attend the school play — it\'s during work hours she can\'t miss'
      ],
      decisionWeights: {
        groupLoyalty: 6,
        selfPreservation: 8,
        principledAction: 6,
        statusAnxiety: 3,
        communityDuty: 7
      },
      insightLines: [
        'Mita\'s frugality isn\'t a personality — it\'s a scar. Every paisa saved is a day her children don\'t go hungry.',
        'She navigates systems designed to exclude her with more skill than anyone in the game. That skill was expensive to learn.',
        'Her independence is a fortress. She won\'t accept help because every time she did, it came with conditions she couldn\'t meet.'
      ],
      dilemmaProfile: 'Calculates survival cost before ethics; fierce protector of family even at personal expense'
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
    },
    socialContext: {
      class: 'upper-middle',
      communityIdentity: 'Bengali Hindu, Park Street professional circle, alumni network maven',
      politicalPressures: [
        'Her network is her identity — losing connections feels like losing herself',
        'Expected to make introductions that benefit powerful people, not just good ones',
        'Knows secrets about people in her circle that make her both valuable and vulnerable'
      ],
      hiddenObligations: [
        'Introduced two people who started a business — it failed and both blame her',
        'A powerful contact asked her to vouch for someone she doesn\'t trust; she hasn\'t refused yet',
        'Her closest friend confided a serious professional misconduct; Neha\'s silence makes her complicit'
      ],
      decisionWeights: {
        groupLoyalty: 8,
        selfPreservation: 5,
        principledAction: 5,
        statusAnxiety: 7,
        communityDuty: 7
      },
      insightLines: [
        'Neha connects people because being the bridge means she\'s always needed. Without the network, she fears she\'s nobody.',
        'Her warmth is genuine but strategic — she learned early that likability is a currency that pays more reliably than talent.',
        'The game asks whether she can make a choice that costs her a relationship. That\'s the one thing she\'s never been willing to lose.'
      ],
      dilemmaProfile: 'Prioritizes social harmony; avoids positions that alienate any faction in her network'
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
    },
    socialContext: {
      class: 'lower-middle',
      communityIdentity: 'Bengali Hindu, Howrah, machinist background, union-adjacent',
      politicalPressures: [
        'Trusting a business partner cost him everything — the legal system sided with the one who could afford a lawyer',
        'His ex-colleagues think he\'s antisocial; he thinks they\'re naive about how people really operate',
        'Local politicians tried to recruit him for his technical skills — he sees all groups as traps'
      ],
      hiddenObligations: [
        'Still paying off a debt from the failed partnership — the other partner walks free',
        'His estranged sister needs help; he\'s the only family she has, and he\'s avoiding her calls',
        'A younger mechanic at his old shop looks up to him — Suman pretends not to notice'
      ],
      decisionWeights: {
        groupLoyalty: 2,
        selfPreservation: 10,
        principledAction: 6,
        statusAnxiety: 3,
        communityDuty: 2
      },
      insightLines: [
        'Suman\'s isolation isn\'t strength — it\'s a wound that healed wrong. He\'s not self-reliant; he\'s self-imprisoned.',
        'Every dilemma he avoids confirms his worldview that people are unreliable. The game asks if he\'s brave enough to be proven wrong.',
        'His competence is real. His loneliness is the price he pays for never risking trust again.'
      ],
      dilemmaProfile: 'Withdraws from group dynamics; acts only when personal cost is calculable and bounded'
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
    },
    socialContext: {
      class: 'middle',
      communityIdentity: 'Bengali Hindu Kayastha, Tollygunge, ex-trading circle',
      politicalPressures: [
        'The stock market is his religion — it rewards the bold and punishes the careful, which suits him',
        'Friends borrow money from him because he always seems flush; he can\'t say no without losing face',
        'His family thinks he\'s saving; he\'s actually running a risky portfolio on margin'
      ],
      hiddenObligations: [
        'Owes a debt to a moneylender he\'d rather not explain to anyone',
        'Promised his mother he\'d stop "gambling" — he hasn\'t, he just hides it better',
        'A friend invested based on his tip and lost heavily — Rohan hasn\'t acknowledged it'
      ],
      decisionWeights: {
        groupLoyalty: 5,
        selfPreservation: 6,
        principledAction: 4,
        statusAnxiety: 7,
        communityDuty: 4
      },
      insightLines: [
        'Rohan\'s risk appetite isn\'t courage — it\'s a coping mechanism. The rush of uncertainty numbs the anxiety of an ordinary life.',
        'He sees every situation as a trade with an expected value. The game forces him to encounter situations where the math doesn\'t apply.',
        'His biggest risk is emotional: admitting that his wins haven\'t made him happy and his losses have hurt people he cares about.'
      ],
      dilemmaProfile: 'Treats moral situations like probability assessments; uncomfortable with choices that have no upside'
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
    },
    socialContext: {
      class: 'working',
      communityIdentity: 'Bengali Christian, Bowbazar, parish community, elder care network',
      politicalPressures: [
        'As a minority faith in a Hindu-majority city, she\'s learned to make herself small and useful',
        'Her church expects her to volunteer but never asks if she needs help herself',
        'Neighbours treat her Christianity as exotic — she\'s tired of explaining Christmas every year'
      ],
      hiddenObligations: [
        'Her father\'s medicine costs more than her stated income — she\'s working two side jobs nobody knows about',
        'Her brother asked for money to "start a business" — she gave it knowing she\'d never see it back',
        'A family at church relies on her to cook for their sick mother — she hasn\'t missed a day in three months'
      ],
      decisionWeights: {
        groupLoyalty: 7,
        selfPreservation: 4,
        principledAction: 8,
        statusAnxiety: 2,
        communityDuty: 10
      },
      insightLines: [
        'Anita\'s selflessness isn\'t a virtue — it\'s an identity. Take away the people who need her and she doesn\'t know who she is.',
        'She has never asked for help in a way that expects to receive it. The city tests whether she can learn.',
        'Her quiet endurance is invisible labour. The game makes it visible — and asks whether anyone notices before it breaks her.'
      ],
      dilemmaProfile: 'Sacrifices instinctively; the only dilemma she struggles with is choosing herself'
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
    },
    socialContext: {
      class: 'upper-middle',
      communityIdentity: 'Bengali Hindu, Ballygunge, academic family, competitive peer cohort',
      politicalPressures: [
        'Her mother is a professor who expects academic perfection as a baseline, not an achievement',
        'Her peer group at work is fiercely competitive — vulnerability is weakness',
        'The mental health crisis in her generation is invisible to the institution she works in'
      ],
      hiddenObligations: [
        'Her therapist costs ₹3,000/session — she tells her parents it\'s a hobby class',
        'A classmate she competed with is struggling with depression; Kavya feels guilty for winning the position',
        'Her younger sister idolizes her — Kavya can\'t let her see that she\'s falling apart'
      ],
      decisionWeights: {
        groupLoyalty: 5,
        selfPreservation: 7,
        principledAction: 8,
        statusAnxiety: 10,
        communityDuty: 5
      },
      insightLines: [
        'Kavya\'s perfectionism isn\'t discipline — it\'s a trauma response. She believes that any visible flaw will be the one that undoes her.',
        'Her anxiety makes her the most careful player in the game. It also makes her the most exhausted.',
        'The city doesn\'t grade her. That absence of evaluation is either liberating or terrifying — her choices reveal which.'
      ],
      dilemmaProfile: 'Overthinks every choice to the point of paralysis; defaults to whatever protects her image'
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
    },
    socialContext: {
      class: 'lower-middle',
      communityIdentity: 'Bengali Hindu, Shyambazar market, informal economy hustler',
      politicalPressures: [
        'The police know him — not as a criminal, but as someone who operates in the grey zone where permits are optional',
        'Local dadas (strongmen) want a cut from anyone who does well in their area',
        'His charm works everywhere except the bank, where his lack of paperwork makes him invisible'
      ],
      hiddenObligations: [
        'His mother thinks he has a stable job — she doesn\'t know he\'s freelancing in the informal economy',
        'Helped a neighbour bypass a permit process; the neighbour now expects this as a standing arrangement',
        'A younger cousin wants to join his hustle — Tapas knows the life will chew him up but can\'t say that'
      ],
      decisionWeights: {
        groupLoyalty: 6,
        selfPreservation: 7,
        principledAction: 4,
        statusAnxiety: 5,
        communityDuty: 6
      },
      insightLines: [
        'Tapas\'s street smarts are the product of a city that gave him no formal path. His hustle is not personality — it\'s survival infrastructure.',
        'He reads people brilliantly because misreading them once cost him three months of earnings and a friendship.',
        'The game asks whether he\'ll use his skills to help others or only himself. His answer reveals what the city made of him.'
      ],
      dilemmaProfile: 'Reads angles instinctively; loyal to people, sceptical of systems; bends rules before breaking them'
    }
  }
];

export function getPersonaById(id: string): PersonaDefinition | undefined {
  return PERSONAS.find(p => p.id === id);
}

export function shufflePersonas(playerCount: number, seed: number, extraPersonas?: PersonaDefinition[]): PersonaDefinition[] {
  const pool = [...PERSONAS];
  if (extraPersonas) {
    for (const ep of extraPersonas) {
      if (!pool.some(p => p.id === ep.id)) pool.push(ep);
    }
  }
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
