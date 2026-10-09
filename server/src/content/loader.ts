import * as fs from 'fs';
import * as path from 'path';
import type { PersonaDefinition, SocialDilemma } from '../game/types';

const CONTENT_DIR = path.join(__dirname, '.');

let _personas: PersonaDefinition[] = [];
let _dilemmas: SocialDilemma[] = [];
let _loaded = false;

export function loadContent(): void {
  if (_loaded) return;

  const personaDir = path.join(CONTENT_DIR, 'personas');
  const scenarioDir = path.join(CONTENT_DIR, 'scenarios');

  if (fs.existsSync(personaDir)) {
    const files = fs.readdirSync(personaDir).filter(f => f.endsWith('.json'));
    for (const file of files) {
      try {
        const raw = fs.readFileSync(path.join(personaDir, file), 'utf-8');
        const persona = JSON.parse(raw) as PersonaDefinition;
        _personas.push(persona);
      } catch (e) {
        console.warn(`[content] Failed to load persona ${file}:`, e);
      }
    }
    console.log(`[content] Loaded ${_personas.length} persona(s) from ${personaDir}`);
  }

  if (fs.existsSync(scenarioDir)) {
    const files = fs.readdirSync(scenarioDir).filter(f => f.endsWith('.json'));
    for (const file of files) {
      try {
        const raw = fs.readFileSync(path.join(scenarioDir, file), 'utf-8');
        const dilemma = JSON.parse(raw) as SocialDilemma;
        _dilemmas.push(dilemma);
      } catch (e) {
        console.warn(`[content] Failed to load scenario ${file}:`, e);
      }
    }
    console.log(`[content] Loaded ${_dilemmas.length} scenario(s) from ${scenarioDir}`);
  }

  _loaded = true;
}

export function getContentPersonas(): PersonaDefinition[] {
  return _personas;
}

export function getContentDilemmas(): SocialDilemma[] {
  return _dilemmas;
}

// Reset for testing
export function _resetContent(): void {
  _personas = [];
  _dilemmas = [];
  _loaded = false;
}
