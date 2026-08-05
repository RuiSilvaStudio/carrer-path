import { describe, it, expect } from 'vitest';
import {
  createEmptyCareerDirection,
  normaliseCareerDirection,
  advanceStage,
  getStageStatus,
  isExplorerStale,
  isBriefStale,
  isMarketStale,
  directionFromTitle,
} from '../lib/careerDirection';
import { createEmptyProfile as createEmptyProfileData } from '../lib/profile-data';
import { extractionToProfile } from '../lib/profile-data';

describe('career direction data integrity', () => {
  it('creates a complete empty career direction with version 2', () => {
    const data = createEmptyCareerDirection();

    expect(data.version).toBe(2);
    expect(data.currentStage).toBe('profile');
    expect(data.profile.roles).toEqual([]);
    expect(data.directions).toEqual([]);
    expect(data.marketInsight).toBeNull();
    expect(data.actionItems).toEqual([]);
  });

  it('preserves all profile fields through normalisation', () => {
    const raw = {
      currentStage: 'shortlist' as any,
      profile: {
        currentSituation: 'employed_exploring',
        changeDriver: 'career_growth',
        situationNote: 'test',
        roles: [
          {
            id: '1',
            title: 'Manager',
            organisation: 'Acme',
            startYear: 2020,
            endYear: null,
            location: 'PT',
            scope: 'Ops',
            highlights: ['A'],
          },
        ],
        skills: ['leadership'],
        education: [],
        languages: ['pt', 'en'],
        careerSummary: 'summary',
        evidenceNote: 'note',
        location: 'Lisbon',
        workArrangement: 'hybrid',
        mobility: 'open_to_relocate',
        travelTolerance: 'up_to_25',
        availability: '1_3_months',
        incomeExpectation: '80_100k',
        conditionsNote: 'conditions',
      },
      preferences: { contribution: 'c', environment: 'e', constraints: 'x' },
      directions: [],
      chosenDirectionId: null,
      explorerCompletedAt: null,
    } as any;

    const normalised = normaliseCareerDirection(raw);

    expect(normalised.version).toBe(2);
    expect(normalised.currentStage).toBe('explorer'); // V1 shortlist migrated
    expect(normalised.profile.roles).toHaveLength(1);
    expect(normalised.profile.skills).toEqual(['leadership']);
    expect(normalised.profile.workArrangement).toBe('hybrid');
    expect(normalised.profile.incomeExpectation).toBe('80_100k');
    expect(normalised.preferences.contribution).toBe('c');
  });

  it('migrates legacy currentStage names to the 3-stage model', () => {
    const cases: Record<string, 'profile' | 'explorer' | 'marketAction'> = {
      profile: 'profile',
      preferences: 'profile',
      shortlist: 'explorer',
      compare: 'explorer',
      explorer: 'explorer',
      brief: 'explorer', // Brief is now the Explorer's outcome screen
      workspace: 'explorer',
      marketAction: 'marketAction',
      pulse: 'marketAction',
      marketContext: 'marketAction',
      reassess: 'marketAction',
    };

    for (const [input, expected] of Object.entries(cases)) {
      const result = normaliseCareerDirection({ currentStage: input } as any);
      expect(result.currentStage).toBe(expected);
    }
  });

  it('lands a user with a chosen direction on the Brief outcome screen', () => {
    const direction = directionFromTitle('Ops Director');
    const data = normaliseCareerDirection({
      currentStage: 'explorer',
      directions: [{ ...direction, selected: true, status: 'active' }],
      chosenDirectionId: direction.id,
    });
    expect(data.explorerStep).toBe('brief');
  });

  it('preserves legacy selected direction when chosenDirectionId is missing', () => {
    const direction = directionFromTitle('Ops Director');
    const data = normaliseCareerDirection({
      currentStage: 'explorer',
      directions: [{ ...direction, selected: true, status: 'active' }],
      chosenDirectionId: null,
    });

    expect(data.chosenDirectionId).toBe(direction.id);
  });

  it('advances stages in order and stops at marketAction', () => {
    expect(advanceStage('profile')).toBe('explorer');
    expect(advanceStage('explorer')).toBe('marketAction');
    expect(advanceStage('marketAction')).toBe('marketAction');
  });

  it('detects explorer staleness when profile changes after explorer completion', () => {
    const older = '2024-01-01T00:00:00.000Z';
    const newer = '2024-06-01T00:00:00.000Z';

    expect(isExplorerStale({
      profileUpdatedAt: newer,
      explorerCompletedAt: older,
      directions: [],
      chosenDirectionId: null,
    } as any)).toBe(true);

    expect(isExplorerStale({
      profileUpdatedAt: older,
      explorerCompletedAt: newer,
      directions: [],
      chosenDirectionId: null,
    } as any)).toBe(false);
  });

  it('detects brief staleness from explorer staleness', () => {
    expect(isBriefStale({
      profileUpdatedAt: '2024-06-01T00:00:00.000Z',
      explorerCompletedAt: '2024-01-01T00:00:00.000Z',
      directions: [],
      chosenDirectionId: null,
    } as any)).toBe(true);
  });

  it('detects market staleness from profile or direction changes', () => {
    const base = {
      profileUpdatedAt: '2024-06-01T00:00:00.000Z',
      marketInsight: { generatedAt: '2024-01-01T00:00:00.000Z' } as any,
      chosenDirectionId: 'dir-1',
      directions: [],
    };

    expect(isMarketStale(base as any)).toBe(true);
  });

  it('reports stage status correctly', () => {
    const empty = createEmptyCareerDirection();
    expect(getStageStatus(empty, 'profile')).toBe('empty');
    expect(getStageStatus(empty, 'explorer')).toBe('empty');
  });

  it('converts extracted CV into structured profile without dropping fields', () => {
    const extracted = {
      roles: [
        {
          title: 'CEO',
          organisation: 'Co',
          startYear: 2018,
          endYear: null,
          location: 'PT',
          scope: 'Full',
          highlights: ['H1'],
        },
      ],
      skills: ['P&L', 'Strategy'],
      education: [
        { qualification: 'MBA', institution: 'Uni', year: 2010 },
      ],
      languages: ['en', 'pt'],
      summary: 'Executive summary',
      currentSituation: 'employed_exploring',
    };

    const profile = extractionToProfile(extracted);

    expect(profile.roles).toHaveLength(1);
    expect(profile.roles[0].title).toBe('CEO');
    expect(profile.skills).toEqual(['P&L', 'Strategy']);
    expect(profile.education).toHaveLength(1);
    expect(profile.languages).toEqual(['en', 'pt']);
    expect(profile.careerSummary).toBe('Executive summary');
    expect(profile.currentSituation).toBe('employed_exploring');
  });

  it('does not lose optional enrichment fields when normalising legacy data', () => {
    const legacy = {
      currentStage: 'brief',
      profile: createEmptyProfileData(),
      preferences: { contribution: '', environment: '', constraints: '' },
      directions: [
        {
          ...directionFromTitle('Test'),
          enrichment: {
            rationale: 'r',
            skillOverlap: ['a'],
            skillGaps: ['b'],
            workValuesAlignment: 'w',
            workValuesBullets: { strong: ['s'], stretch: ['x'] },
            practicalFit: 'p',
            practicalFitFlags: ['f1'],
            practicalFitBullets: ['pb'],
            whatIsUnknown: 'u',
            unknownBullet: 'ub',
            suggestedTest: 't',
            testBullet: 'tb',
            dimensionRatings: {
              skills: 'strong',
              workValues: 'good',
              practical: 'stretch',
              evidence: 'good',
              fit: 'strong',
            },
            enrichedAt: '2024-01-01T00:00:00.000Z',
          },
        },
      ],
      chosenDirectionId: null,
      explorerCompletedAt: '2024-01-01T00:00:00.000Z',
      workspaceEvidence: '',
      workspaceAssumption: '',
    };

    const normalised = normaliseCareerDirection(legacy as any);
    const enrichment = normalised.directions[0].enrichment;

    expect(enrichment?.workValuesBullets?.strong).toEqual(['s']);
    expect(enrichment?.practicalFitBullets).toEqual(['pb']);
    expect(enrichment?.unknownBullet).toBe('ub');
    expect(enrichment?.testBullet).toBe('tb');
  });
});
