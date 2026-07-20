/**
 * JSON Schemas for Gemini Structured Output (responseSchema).
 * Ensures native validation and correct output formats.
 */

export const improveTaskSchema = {
  type: 'OBJECT',
  properties: {
    details: { type: 'STRING', description: 'Vylepšený podrobný popis úkolu' },
    acceptanceCriteria: { type: 'STRING', description: 'Akceptační kritéria úkolu' },
    risks: { type: 'STRING', description: 'Možná rizika úkolu' },
    missingInfo: { type: 'STRING', description: 'Chybějící informace, které by bylo dobré doplnit' },
    checklist: {
      type: 'ARRAY',
      items: { type: 'STRING' },
      description: 'Checklist podúkolů'
    }
  },
  required: ['details', 'acceptanceCriteria', 'risks', 'missingInfo', 'checklist']
};

export const backlogGenerateSchema = {
  type: 'OBJECT',
  properties: {
    tasks: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          title: { type: 'STRING', description: 'Název úkolu' },
          description: { type: 'STRING', description: 'Stručný popis úkolu' },
          priority: { type: 'STRING', enum: ['High', 'Medium', 'Low'], description: 'Priorita úkolu' },
          estimate: { type: 'STRING', description: 'Odhad času (např. 2h, 1d)' },
          acceptanceCriteria: {
            type: 'ARRAY',
            items: { type: 'STRING' },
            description: 'Akceptační kritéria'
          },
          checklist: {
            type: 'ARRAY',
            items: { type: 'STRING' },
            description: 'Položky checklistu'
          },
          recommendedColumn: { type: 'STRING', description: 'Cílový sloupec z povolených sloupců' }
        },
        required: ['title', 'description', 'priority', 'estimate', 'acceptanceCriteria', 'checklist', 'recommendedColumn']
      }
    }
  },
  required: ['tasks']
};

export const projectGenerateSchema = {
  type: 'OBJECT',
  properties: {
    name: { type: 'STRING', description: 'Vylepšený název projektu' },
    description: { type: 'STRING', description: 'Popis projektu' },
    summary: { type: 'STRING', description: 'Architektonický souhrn projektu' },
    icon: { type: 'STRING', description: 'Jedno emoji reprezentující projekt' },
    accentColor: { type: 'STRING', description: 'HEX kód barvy projektu' },
    recommendedColumns: {
      type: 'ARRAY',
      items: { type: 'STRING' },
      description: 'Seznam 3 až 5 sloupců pro board'
    },
    recommendedStack: {
      type: 'ARRAY',
      items: { type: 'STRING' },
      description: 'Doporučené technologie'
    },
    complexity: { type: 'STRING', enum: ['Low', 'Medium', 'High'], description: 'Složitost projektu' },
    estimatedDuration: { type: 'STRING', description: 'Odhadovaná doba realizace' },
    recommendedTeamSize: { type: 'STRING', description: 'Doporučený počet lidí v týmu' },
    tags: {
      type: 'ARRAY',
      items: { type: 'STRING' },
      description: 'Štítky projektu'
    },
    aiRecommendation: {
      type: 'OBJECT',
      properties: {
        recommendation: { type: 'STRING', description: 'Hlavní doporučení' },
        biggestRisk: { type: 'STRING', description: 'Největší technické riziko' },
        focusArea: { type: 'STRING', description: 'Na co se zaměřit' },
        mvpScope: { type: 'STRING', description: 'Rozsah MVP' }
      },
      required: ['recommendation', 'biggestRisk', 'focusArea', 'mvpScope']
    },
    tasks: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          title: { type: 'STRING', description: 'Název úkolu' },
          description: { type: 'STRING', description: 'Stručný popis úkolu' },
          priority: { type: 'STRING', enum: ['High', 'Medium', 'Low'], description: 'Priorita úkolu' },
          estimate: { type: 'STRING', description: 'Odhad času' },
          acceptanceCriteria: {
            type: 'ARRAY',
            items: { type: 'STRING' },
            description: 'Akceptační kritéria'
          },
          checklist: {
            type: 'ARRAY',
            items: { type: 'STRING' },
            description: 'Položky checklistu'
          },
          recommendedColumn: { type: 'STRING', description: 'Doporučený sloupec' }
        },
        required: ['title', 'description', 'priority', 'estimate', 'acceptanceCriteria', 'checklist', 'recommendedColumn']
      }
    }
  },
  required: [
    'name',
    'description',
    'summary',
    'icon',
    'accentColor',
    'recommendedColumns',
    'recommendedStack',
    'complexity',
    'estimatedDuration',
    'recommendedTeamSize',
    'tags',
    'aiRecommendation',
    'tasks'
  ]
};

export const sprintPlanningSchema = {
  type: 'OBJECT',
  properties: {
    sprintGoal: { type: 'STRING', description: 'Hlavní cíl sprintu (1-2 věty)' },
    sprintSummary: { type: 'STRING', description: 'Stručné zdůvodnění a shrnutí sprintu (max 3 věty)' },
    recommendedSprintLength: { type: 'STRING', description: 'Doporučená délka sprintu (např. 2 týdny)' },
    sprintCapacity: { type: 'STRING', description: 'Doporučená kapacita sprintu (např. 40 SP nebo 80 hodin)' },
    selectedTasks: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          id: { type: 'STRING', description: 'Originální ID úkolu z backlogu' },
          title: { type: 'STRING', description: 'Název úkolu' },
          priority: { type: 'STRING', enum: ['High', 'Medium', 'Low'], description: 'Priorita úkolu' },
          storyPoints: { type: 'INTEGER', description: 'Odhadované Story Points pro úkol (Fibonacci: 1, 2, 3, 5, 8, 13)' },
          estimatedTime: { type: 'STRING', description: 'Odhadovaný čas realizace (např. 4h, 1d)' },
          reason: { type: 'STRING', description: 'Zdůvodnění, proč byl úkol zařazen do tohoto sprintu' }
        },
        required: ['id', 'title', 'priority', 'storyPoints', 'estimatedTime', 'reason']
      },
      description: 'Seznam vybraných úkolů zařazených do sprintu v doporučeném pořadí realizace'
    },
    dependencies: {
      type: 'ARRAY',
      items: { type: 'STRING' },
      description: 'Závislosti mezi úkoly v rámci sprintu'
    },
    risks: {
      type: 'ARRAY',
      items: { type: 'STRING' },
      description: 'Možná technická nebo procesní rizika'
    },
    outOfScope: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          id: { type: 'STRING', description: 'Originální ID úkolu' },
          title: { type: 'STRING', description: 'Název úkolu' },
          reason: { type: 'STRING', description: 'Proč byl úkol ponechán mimo sprint' }
        },
        required: ['id', 'title', 'reason']
      },
      description: 'Důležité úkoly, které byly ponechány mimo sprint (a proč)'
    }
  },
  required: [
    'sprintGoal',
    'sprintSummary',
    'recommendedSprintLength',
    'sprintCapacity',
    'selectedTasks',
    'dependencies',
    'risks',
    'outOfScope'
  ]
};

export const projectRiskAnalysisSchema = {
  type: 'OBJECT',
  properties: {
    executiveSummary: { type: 'STRING', description: 'Manažerské shrnutí rizik celého projektu (2-3 odstavce)' },
    overallRiskScore: { type: 'INTEGER', description: 'Celkové skóre rizika od 0 (bez rizika) do 100 (kritické riziko)' },
    biggestRisks: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          name: { type: 'STRING', description: 'Název rizika' },
          severity: { type: 'STRING', enum: ['Low', 'Medium', 'High'], description: 'Závažnost rizika' },
          explanation: { type: 'STRING', description: 'Podrobné vysvětlení rizika a jeho dopadů v češtině' },
          recommendation: { type: 'STRING', description: 'Doporučené řešení a mitigace rizika v češtině' }
        },
        required: ['name', 'severity', 'explanation', 'recommendation']
      },
      description: 'Seznam největších rizik identifikovaných v projektu'
    },
    bottlenecks: {
      type: 'ARRAY',
      items: { type: 'STRING' },
      description: 'Identifikovaná úzká hrdla (bottlenecks) v projektu, workflow nebo prioritách'
    },
    missingFeatures: {
      type: 'ARRAY',
      items: { type: 'STRING' },
      description: 'Chybějící funkce nebo klíčové prvky, které by v projektu měly být'
    },
    technicalDebt: {
      type: 'ARRAY',
      items: { type: 'STRING' },
      description: 'Potenciální technický dluh a architektonická rizika'
    },
    securityRisks: {
      type: 'ARRAY',
      items: { type: 'STRING' },
      description: 'Bezpečnostní rizika a doporučení'
    },
    performanceRisks: {
      type: 'ARRAY',
      items: { type: 'STRING' },
      description: 'Výkonnostní rizika a škálovatelnost'
    },
    mvpRecommendations: {
      type: 'ARRAY',
      items: { type: 'STRING' },
      description: 'Doporučení pro rozsah MVP'
    },
    topAiRecommendations: {
      type: 'ARRAY',
      items: { type: 'STRING' },
      description: 'Top 5 konkrétních a akčních doporučení pro úspěch projektu (přesně 5 položek)'
    }
  },
  required: [
    'executiveSummary',
    'overallRiskScore',
    'biggestRisks',
    'bottlenecks',
    'missingFeatures',
    'technicalDebt',
    'securityRisks',
    'performanceRisks',
    'mvpRecommendations',
    'topAiRecommendations'
  ]
};
