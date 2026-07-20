import { Column, Assignee, TeamMember } from '../types/kanban';

export const ASSIGNEES: Assignee[] = [
  { name: 'Alex Rivera', initials: 'AR', color: '#209dd7' }, // Modrá
  { name: 'Sarah Chen', initials: 'SC', color: '#753991' }, // Fialová
  { name: 'Marcus Johnson', initials: 'MJ', color: '#10b981' }, // Zelená
  { name: 'Elena Rostova', initials: 'ER', color: '#ecad0a' }, // Žlutá
];

export const DEFAULT_MEMBERS: TeamMember[] = [
  {
    id: 'member-1',
    fullName: 'Alex Rivera',
    initials: 'AR',
    avatarColor: '#209dd7',
    email: 'alex.rivera@example.com',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'member-2',
    fullName: 'Sarah Chen',
    initials: 'SC',
    avatarColor: '#753991',
    email: 'sarah.chen@example.com',
    createdAt: '2026-01-02T00:00:00.000Z',
  },
  {
    id: 'member-3',
    fullName: 'Marcus Johnson',
    initials: 'MJ',
    avatarColor: '#10b981',
    email: 'marcus.johnson@example.com',
    createdAt: '2026-01-03T00:00:00.000Z',
  },
  {
    id: 'member-4',
    fullName: 'Elena Rostova',
    initials: 'ER',
    avatarColor: '#ecad0a',
    email: 'elena.rostova@example.com',
    createdAt: '2026-01-04T00:00:00.000Z',
  },
];

export const INITIAL_COLUMNS: Column[] = [
  {
    id: 'column-1',
    name: 'Nápady',
    cards: [
      {
        id: 'card-1',
        title: 'Návrh mockupů hlavní stránky',
        details: 'Vytvořit vizuální návrhy pro desktopové a mobilní rozložení podle nových pravidel naší značky.',
        tag: 'Návrh',
        priority: 'Medium',
        assignee: ASSIGNEES[0],
        assignees: [DEFAULT_MEMBERS[0]],
        dueDate: '2026-07-20',
      },
      {
        id: 'card-2',
        title: 'Výzkum poskytovatelů OAuth',
        details: 'Vyhodnotit Auth0, Clerk a vlastní řešení z hlediska bezpečnosti, ceny a snadnosti integrace.',
        tag: 'Výzkum',
        priority: 'Low',
        assignee: ASSIGNEES[3],
        assignees: [DEFAULT_MEMBERS[3]],
        dueDate: '2026-07-25',
      },
    ],
  },
  {
    id: 'column-2',
    name: 'Naplánováno',
    cards: [
      {
        id: 'card-3',
        title: 'Konfigurace CI/CD pipeline',
        details: 'Nastavit workflow v GitHub Actions pro sestavení a otestování projektu při každém pull requestu.',
        tag: 'Funkce',
        priority: 'High',
        assignee: ASSIGNEES[1],
        assignees: [DEFAULT_MEMBERS[1]],
        dueDate: '2026-07-18',
      },
      {
        id: 'card-4',
        title: 'Napsat unit testy pro autentizaci',
        details: 'Dosáhnout alespoň 80% pokrytí kódu u ověřování a registrace uživatelů.',
        tag: 'Blokováno',
        priority: 'High',
        assignee: ASSIGNEES[2],
        assignees: [DEFAULT_MEMBERS[2]],
        dueDate: '2026-07-16',
      },
    ],
  },
  {
    id: 'column-3',
    name: 'V průběhu',
    cards: [
      {
        id: 'card-5',
        title: 'Refaktorovat správu stavu',
        details: 'Optimalizovat React hooky a vyčistit logiku kontextu, aby se zabránilo zbytečným re-renderům.',
        tag: 'Funkce',
        priority: 'Medium',
        assignee: ASSIGNEES[1],
        assignees: [DEFAULT_MEMBERS[1]],
        dueDate: '2026-07-22',
      },
    ],
  },
  {
    id: 'column-4',
    name: 'K revizi',
    cards: [
      {
        id: 'card-6',
        title: 'Vizuální testování napříč prohlížeči',
        details: 'Ověřit, zda se komponenty UI správně vykreslují v prohlížečích Chrome, Firefox a Safari.',
        tag: 'Výzkum',
        priority: 'Low',
        assignee: ASSIGNEES[0],
        assignees: [DEFAULT_MEMBERS[0]],
        dueDate: '2026-07-30',
      },
    ],
  },
  {
    id: 'column-5',
    name: 'Hotovo',
    cards: [
      {
        id: 'card-7',
        title: 'Úvodní schůzka k projektu',
        details: 'Sjednotit se se zúčastněnými stranami na počátečním rozsahu MVP, harmonogramu a výstupech.',
        tag: 'Návrh',
        priority: 'Low',
        assignee: ASSIGNEES[3],
        assignees: [DEFAULT_MEMBERS[3]],
        dueDate: '2026-07-10',
      },
    ],
  },
];

