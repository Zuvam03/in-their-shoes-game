import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import GameStats from './GameStats';
import ConscienceMeter from './ConscienceMeter';
import ExplorationTracker from './ExplorationTracker';
import RelationshipTracker from './RelationshipTracker';
import SocialDynamics from './SocialDynamics';

const TRAIT_LABELS: Record<string, string> = {
  analyticalThinking: 'Analytical', emotionalSensitivity: 'Empathy',
  appetite: 'Appetite', workOrientation: 'Work Drive',
  spendingStyle: 'Spending', socialOrientation: 'Social',
  riskTolerance: 'Risk', resilience: 'Resilience',
  adaptability: 'Adaptability', cooperation: 'Cooperation'
};

const MOTIVATION_LABELS: Record<string, string> = {
  careerAdvancement: 'Career', financialSecurity: 'Financial Security',
  socialAcceptance: 'Social Acceptance', personalIndependence: 'Independence',
  familyResponsibility: 'Family', fairness: 'Fairness',
  helpingOthers: 'Helping Others', achievement: 'Achievement', comfort: 'Comfort'
};

function TrendArrow({ current, previous }: { current: number; previous: number | undefined }) {
  if (previous === undefined) return null;
  const diff = current - previous;
  if (Math.abs(diff) < 1) return null;
  const up = diff > 0;
  return (
    <span style={{
      fontSize: '9px', fontWeight: 700, marginLeft: '3px',
      color: up ? 'var(--accent-green)' : 'var(--accent-red)'
    }}>
      {up ? '▲' : '▼'}
    </span>
  );
}

export default function CharacterPanel() {
  const { myPlayer, prevStats } = useGameStore();
  const [showBackstory, setShowBackstory] = useState(false);
  if (!myPlayer) return null;

  const persona = myPlayer.persona;
  const state = myPlayer.state;

  return (
    <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Identity */}
      <div style={{
        padding: '12px', borderRadius: '10px',
        background: 'rgba(245,200,66,0.05)',
        border: '1px solid rgba(245,200,66,0.2)'
      }}>
        <div style={{ fontWeight: 700, color: 'var(--accent-yellow)', fontSize: '14px' }}>
          {persona.name}
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
          {persona.title}
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px', lineHeight: 1.5 }}>
          {persona.description}
        </div>
        <button onClick={() => setShowBackstory(!showBackstory)} style={{
          marginTop: '6px', background: 'none', border: 'none',
          color: 'var(--accent-blue)', fontSize: '11px', padding: 0,
          cursor: 'pointer', textDecoration: 'underline'
        }}>
          {showBackstory ? 'Hide backstory' : 'Read full backstory'}
        </button>
        {showBackstory && (
          <div style={{
            marginTop: '8px', fontSize: '11px', color: 'var(--text-secondary)',
            lineHeight: 1.6, padding: '8px', borderRadius: '6px',
            background: 'rgba(0,0,0,0.2)', fontStyle: 'italic'
          }}>
            {persona.backstory}
          </div>
        )}
      </div>

      {/* Vital Stats with Trends */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px'
      }}>
        {([
          { key: 'health' as const, label: 'Health', icon: '❤️', color: 'var(--accent-red)', inv: false },
          { key: 'energy' as const, label: 'Energy', icon: '⚡', color: 'var(--accent-yellow)', inv: false },
          { key: 'mood' as const, label: 'Mood', icon: '😊', color: 'var(--accent-purple)', inv: false },
          { key: 'hunger' as const, label: 'Hunger', icon: '🍛', color: 'var(--accent-orange)', inv: true },
          { key: 'hydration' as const, label: 'Thirst', icon: '💧', color: 'var(--accent-blue)', inv: true },
          { key: 'stress' as const, label: 'Stress', icon: '😰', color: 'var(--accent-red)', inv: true },
        ]).map(({ key, label, icon, color, inv }) => {
          const val = state[key] as number;
          const prev = prevStats?.[key] as number | undefined;
          const isWarning = inv ? val > 65 : val < 30;
          return (
            <div key={key} style={{
              padding: '6px 8px', borderRadius: '8px',
              background: isWarning ? 'rgba(239,68,68,0.08)' : 'var(--bg-secondary)',
              border: `1px solid ${isWarning ? 'rgba(239,68,68,0.2)' : 'var(--border)'}`,
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '13px' }}>{icon}</div>
              <div style={{ fontSize: '9px', color: 'var(--text-muted)', marginBottom: '2px' }}>{label}</div>
              <div style={{ fontWeight: 700, fontSize: '13px', color }}>
                {Math.round(val)}
                <TrendArrow current={val} previous={prev} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Cash */}
      <div style={{
        padding: '8px 12px', borderRadius: '8px',
        background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>💰 Cash</span>
        <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--accent-green)' }}>
          ₹{state.cash}
          <TrendArrow current={state.cash} previous={prevStats?.cash} />
        </span>
      </div>

      {/* Strengths & Vulnerabilities */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <div>
          <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--accent-green)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
            Strengths
          </div>
          {persona.strengths?.map((s, i) => (
            <div key={i} style={{ fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '3px', paddingLeft: '6px', borderLeft: '2px solid rgba(34,197,94,0.3)' }}>
              {s}
            </div>
          ))}
        </div>
        <div>
          <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--accent-red)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
            Vulnerabilities
          </div>
          {persona.vulnerabilities?.map((v, i) => (
            <div key={i} style={{ fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '3px', paddingLeft: '6px', borderLeft: '2px solid rgba(239,68,68,0.3)' }}>
              {v}
            </div>
          ))}
        </div>
      </div>

      {/* Trait interactions */}
      <div>
        <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Key Traits
        </div>
        {persona.traitInteractions?.map((ti, i) => (
          <div key={i} style={{
            fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px',
            paddingLeft: '8px', borderLeft: '2px solid rgba(245,200,66,0.3)'
          }}>
            {ti}
          </div>
        ))}
      </div>

      {/* Personality Traits */}
      <div>
        <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Personality Traits
        </div>
        {Object.entries(persona.traits).map(([key, val]) => (
          <div key={key} style={{ marginBottom: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{TRAIT_LABELS[key] || key}</span>
              <span style={{ fontSize: '11px', fontWeight: 600 }}>{val}/10</span>
            </div>
            <div style={{ height: '3px', background: 'var(--border)', borderRadius: '2px' }}>
              <div style={{
                height: '100%', borderRadius: '2px',
                width: `${(val as number) * 10}%`,
                background: `hsl(${(val as number) * 12}deg 65% 50%)`
              }} />
            </div>
          </div>
        ))}
      </div>

      {/* Motivations */}
      <div>
        <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Motivations
        </div>
        {Object.entries(persona.motivations)
          .sort((a, b) => (b[1] as number) - (a[1] as number))
          .slice(0, 5)
          .map(([key, val]) => (
            <div key={key} style={{ marginBottom: '5px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{MOTIVATION_LABELS[key] || key}</span>
                <span style={{ fontSize: '11px', fontWeight: 600 }}>{val}/10</span>
              </div>
              <div style={{ height: '3px', background: 'var(--border)', borderRadius: '2px' }}>
                <div style={{
                  height: '100%', borderRadius: '2px',
                  width: `${(val as number) * 10}%`,
                  background: 'var(--accent-purple)'
                }} />
              </div>
            </div>
          ))}
      </div>

      {/* Social status */}
      <div style={{
        padding: '10px', borderRadius: '8px',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '2px' }}>Social Trust</div>
          <div style={{ fontWeight: 700, color: 'var(--accent-green)', fontSize: '16px' }}>
            {myPlayer.socialTrust}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '2px' }}>Community Impact</div>
          <div style={{
            fontWeight: 700, fontSize: '16px',
            color: myPlayer.communityImpact >= 0 ? 'var(--accent-green)' : 'var(--accent-red)'
          }}>
            {myPlayer.communityImpact >= 0 ? '+' : ''}{myPlayer.communityImpact}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '2px' }}>Helped Others</div>
          <div style={{ fontWeight: 700, color: 'var(--accent-blue)', fontSize: '16px' }}>
            {state.helpedOthersCount}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '2px' }}>Received Help</div>
          <div style={{ fontWeight: 700, color: 'var(--accent-blue)', fontSize: '16px' }}>
            {state.receivedHelpCount}
          </div>
        </div>
      </div>
      {/* Trait Effects */}
      <SocialDynamics />

      {/* Conscience Meter */}
      <ConscienceMeter />

      {/* Exploration */}
      <ExplorationTracker />

      {/* Relationships */}
      <RelationshipTracker />

      {/* Game Stats */}
      <GameStats />
    </div>
  );
}
