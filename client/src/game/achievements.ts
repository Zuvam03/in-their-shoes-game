import type { Player } from '../store/gameStore';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  check: (player: Player, tick: number) => boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_steps',
    title: 'First Steps',
    description: 'Complete your first action',
    icon: '👣',
    check: (p) => p.actionLog.length >= 1
  },
  {
    id: 'good_samaritan',
    title: 'Good Samaritan',
    description: 'Help another player',
    icon: '🤝',
    check: (p) => p.state.helpedOthersCount >= 1
  },
  {
    id: 'generous_soul',
    title: 'Generous Soul',
    description: 'Help 3 or more players',
    icon: '💛',
    check: (p) => p.state.helpedOthersCount >= 3
  },
  {
    id: 'survivor',
    title: 'Survivor',
    description: 'Keep health above 50 for 5 minutes',
    icon: '🛡️',
    check: (p, tick) => p.state.health > 50 && tick >= 300
  },
  {
    id: 'well_fed',
    title: 'Well Fed',
    description: 'Keep hunger below 30',
    icon: '🍽️',
    check: (p) => p.state.hunger < 30 && p.actionLog.some(e => e.type === 'eat')
  },
  {
    id: 'moneymaker',
    title: 'Money Maker',
    description: 'Earn over ₹200',
    icon: '💰',
    check: (p) => p.state.cash >= 200
  },
  {
    id: 'explorer',
    title: 'Explorer',
    description: 'Visit 5 different locations',
    icon: '🧭',
    check: (p) => {
      const locations = new Set(p.actionLog.filter(e => e.type === 'move').map(e => e.description));
      return locations.size >= 5;
    }
  },
  {
    id: 'mission_start',
    title: 'On Track',
    description: 'Complete your first objective',
    icon: '🎯',
    check: (p) => p.mission.objectives.some(o => o.completed)
  },
  {
    id: 'mission_complete',
    title: 'Mission Accomplished',
    description: 'Complete all required objectives',
    icon: '🏆',
    check: (p) => p.mission.status === 'completed'
  },
  {
    id: 'dilemma_faced',
    title: 'Moral Compass',
    description: 'Resolve a social dilemma',
    icon: '⚖️',
    check: (p) => (p as Player & { dilemmasResolved?: unknown[] }).dilemmasResolved !== undefined &&
      ((p as Player & { dilemmasResolved?: unknown[] }).dilemmasResolved?.length || 0) >= 1
  },
  {
    id: 'community_hero',
    title: 'Community Hero',
    description: 'Reach 70+ social trust',
    icon: '🌟',
    check: (p) => p.socialTrust >= 70
  },
  {
    id: 'night_owl',
    title: 'Night Owl',
    description: 'Play through a night cycle',
    icon: '🦉',
    check: (_, tick) => tick >= 400 && (tick % 600) > 400
  }
];

export function checkAchievements(player: Player, tick: number, unlocked: Set<string>): Achievement[] {
  const newlyUnlocked: Achievement[] = [];
  for (const ach of ACHIEVEMENTS) {
    if (unlocked.has(ach.id)) continue;
    if (ach.check(player, tick)) {
      newlyUnlocked.push(ach);
    }
  }
  return newlyUnlocked;
}
