import { Column, TaskResource } from '../types/kanban';

export interface SearchResultItem {
  id: string;
  type: 'card' | 'resource' | 'checklist' | 'comment';
  title: string;
  snippet: string;
  columnId?: string;
  columnName?: string;
  cardId?: string;
  resourceId?: string;
  score: number;
}

export const searchService = {
  /**
   * Prohledává nastěnku a nahrané dokumenty podle zadáného dotazu.
   */
  searchBoardData(query: string, columns: Column[], resources: TaskResource[] = []): SearchResultItem[] {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const results: SearchResultItem[] = [];

    // 1. Prohledávání karet a jejich obsahu
    columns.forEach((col) => {
      col.cards.forEach((card) => {
        const titleLower = card.title.toLowerCase();
        const detailsLower = (card.details || '').toLowerCase();
        const tagsLower = (card.tag || '').toLowerCase();

        let score = 0;
        let snippet = card.details || `Ve sloupci "${col.name}"`;

        if (titleLower === q) {
          score += 100;
        } else if (titleLower.startsWith(q)) {
          score += 80;
        } else if (titleLower.includes(q)) {
          score += 60;
        }

        if (detailsLower.includes(q)) {
          score += 30;
          const idx = detailsLower.indexOf(q);
          const start = Math.max(0, idx - 20);
          const end = Math.min(detailsLower.length, idx + q.length + 30);
          snippet = '...' + card.details?.substring(start, end) + '...';
        }

        if (tagsLower.includes(q)) {
          score += 25;
        }

        // Checklist položky
        if (card.checklist) {
          card.checklist.forEach((item) => {
            if (item.text.toLowerCase().includes(q)) {
              score += 20;
              snippet = `Checklist: ${item.text}`;
            }
          });
        }

        if (score > 0) {
          results.push({
            id: `card-${card.id}`,
            type: 'card',
            title: card.title,
            snippet,
            columnId: col.id,
            columnName: col.name,
            cardId: card.id,
            score,
          });
        }
      });
    });

    // 2. Prohledávání nahraných souborů
    resources.forEach((res) => {
      const filenameLower = res.filename.toLowerCase();
      let score = 0;
      const snippet = `Soubor ${res.filename} (${res.mimeType || 'dokument'})`;

      if (filenameLower.includes(q)) {
        score += 70;
      }

      if (score > 0) {
        results.push({
          id: `res-${res.id}`,
          type: 'resource',
          title: res.filename,
          snippet,
          resourceId: res.id,
          score,
        });
      }
    });

    // Seřazení podle skóre
    return results.sort((a, b) => b.score - a.score);
  },
};
