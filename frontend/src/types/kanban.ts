// Role připravené pro budoucí Permissions (Release 23+). Zatím se neenforcují.
export type WorkspaceRole = 'owner' | 'admin' | 'member';
export type ProjectRole = 'owner' | 'member';

/**
 * TeamMember = jediná identita člověka napříč aplikací (úroveň Workspace).
 * Projekty na tuto identitu pouze odkazují přes memberIds, nevytvářejí kopie.
 */
export interface TeamMember {
  id: string;
  fullName: string;
  initials: string;
  avatarColor: string;
  email?: string;
  createdAt: string;
  avatarUrl?: string;
  // Release 23: vazba na reálný účet (profiles.id). Vyplněno u vlastníka
  // a v budoucnu u pozvaných uživatelů; null u placeholder kontaktů.
  profileId?: string;
  // Připraveno pro Permissions -- zatím pouze metadata, bez vynucení.
  workspaceRole?: WorkspaceRole;
  role?: string;
  status?: string;
  online?: boolean;
  permissions?: string[];
}

export interface Assignee {
  name: string;
  initials: string;
  color: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface Comment {
  id: string;
  authorName: string;
  content: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  text: string;
  createdAt: string;
}

export interface Card {
  id: string;
  title: string;
  details: string;
  tag?: string;
  priority?: 'Low' | 'Medium' | 'High';
  assignee?: Assignee;
  assignees?: TeamMember[];
  dueDate?: string;
  checklist?: ChecklistItem[];
  comments?: Comment[];
  activities?: ActivityLog[];
  archived?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Column {
  id: string;
  name: string;
  cards: Card[];
}

