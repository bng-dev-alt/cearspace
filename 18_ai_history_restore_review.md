# Review - AI History & Restore

Tento soubor shrnuje kompletní přehled implementace systémové funkce **AI History & Restore**.

---

## 1. Architektura AI History
- **Jednotný mechanismus**: Všechny AI moduly, které modifikují obsah projektu (boardy nebo seznam projektů), používají stejné centralizované API ze služby `aiHistoryService`.
- **Synchronní chování**: Pořizování snapshotů i ukládání historie probíhá plně synchronně na úrovni klientské paměti (props / state) a local storage, čímž je zamezeno asynchronním konfliktům, neočekávaným renderům a rozbití stávajících integračních a unit testů.
- **Transakční bezpečnost**: Pokud kterákoliv AI operace selže na backendu nebo se ji nepodaří naimportovat, snapshot ani záznam v historii nevzniknou. Záznam se bezpečně zapíše až po kompletním dokončení a potvrzení změn.

---

## 2. Jak funguje Snapshot
- **Deep Copy**: Služba `aiHistoryService.captureSnapshot` pořídí kompletní hlubokou kopii (deep copy) aktuálních dat pomocí serializace.
- **Identifikace projektu**: Snapshot zachycuje vazbu na `projectId` a `projectName`. U nově zakládaných projektů (jako AI Sprint Planner nebo AI Generate Project) je snapshot zachycen bez ID a po vytvoření projektu je jeho ID asociováno, což umožňuje detekovat nutnost smazání projektu při rollbacku.

---

## 3. Jak probíhá Restore
- **Krok 1**: Uživatel klikne na tlačítko "Obnovit" v Timeline a potvrdí dialog.
- **Krok 2**: Služba vyhledá příslušný snapshot.
- **Krok 3**: Pokud `boardData` snapshotu neexistuje (např. projekt byl nově vytvořen AI), operace provede odstranění projektu ze seznamu projektů a vymaže jeho board z úložiště. Pokud existuje, přepíše stávající board do stavu snapshotu.
- **Krok 4 (Database Sync)**: V souboru `kanbanService.ts` je integrována metoda `restoreProjectSnapshot`, která synchronizuje data lokálně a zároveň provede kompletní vymazání a opětovné nasazení karet a sloupců v databázi (Supabase), pokud je aktivní.
- **Krok 5 (Timeline Truncation)**: Všechny pozdější AI změny (které v chronologickém seznamu předcházejí vybranému záznamu) jsou z historie zkráceny a trvale smazány k zajištění integrity stavu.

---

## 4. Jaké entity jsou ukládány
Každý Snapshot a History záznam ukládá:
- **Project**: Metadata o projektu (ID, Name, User ID).
- **Columns & Cards**: Kompletní hierarchie sloupců na boardu a jejich karet.
- **Card Sub-entities**: Pro každou kartu se uchovávají:
  - Checklisty (položky a jejich stavy splnění).
  - Komentáře (autor, obsah a datum).
  - Historie aktivit (textové logy a datum).
- **Seznam projektů**: Kompletní seznam všech projektů uživatele v době před provedením operace.

---

## 5. Nové soubory
1. **[`aiHistoryService.ts` (Služba)](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/services/ai/aiHistoryService.ts)**: Core logika pro ukládání snapshotů, logování operací a řízení obnovy.
2. **[`page.tsx` (AI History)](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/app/ai-history/page.tsx)**: UI stránka `/ai-history` s timeline zobrazením, detaily změn, tlačítky obnovy a potvrzovacím modálem.
3. **[`ai-history.test.tsx` (Testy)](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/__tests__/ai-history.test.tsx)**: Testovací sada ověřující funkčnost snapshotu, ukládání historie, mazání historie a mechanismus restore.

---

## 6. Upravené soubory
1. **[`kanbanService.ts`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/services/kanbanService.ts)**: Přidána metoda `restoreProjectSnapshot` zajišťující databázový i lokální rollback stavu.
2. **[`TaskDetailDrawer.tsx`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/components/board/TaskDetailDrawer.tsx)**: Integrace snapshotu a historie při schválení vylepšení úkolu.
3. **[`GenerateTasksModal.tsx`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/components/board/GenerateTasksModal.tsx)**: Integrace snapshotu a historie při importu vygenerovaných úkolů.
4. **[`ProjectDashboard.tsx`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/components/dashboard/ProjectDashboard.tsx)**: Integrace snapshotu a historie při založení projektu generovaného AI.
5. **[`GenerateSprintModal.tsx`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/components/board/GenerateSprintModal.tsx)**: Integrace snapshotu a historie při vytvoření Sprint boardu.
6. **[`Navbar.tsx`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/components/layout/Navbar.tsx)**: Přidán odkaz **AI History** do hlavní navigace.

---

## 7. UI rozhodnutí
- **Timeline design**: Zobrazeno jako vertikální přehledná osa s kulatými barevnými ikonami pro jednotlivé typy AI operací.
- **Obnovit Action**: Fialové tlačítko v pravé části karty okamžitě vyvolá dialog. Dialog obsahuje jasný text *"Opravdu chcete obnovit projekt do stavu před touto AI operací? Budou zrušeny všechny pozdější AI změny."* k zamezení nechtěného přepsání dat.
- **Light/Dark Mode**: Design plně respektuje CSS proměnné aplikace a bezchybně se přepíná.
- **Visual Placeholders**: V dolní části každé karty v Timeline jsou připraveny zešedlé odkazy pro budoucí rozšíření (Compare, Diff, Export), které naznačují architektonickou připravenost.

---

## 8. Budoucí možnosti rozšíření
- **Compare versions**: Možnost porovnat stav v snapshotu se stávajícím živým stavem.
- **Diff změn**: Textové nebo vizuální zobrazení přidaných/smazaných karet.
- **Export historie**: Stažení JSON/CSV souboru se všemi snapshoty a logy.
- **Oblíbené verze**: Uživatel si může označit určité verze hvězdičkou (oblíbené verze jsou již datově podporovány v typu `AiHistoryRecord.isFavorite`).

---

## 9. Výsledky testování, lintu a buildu
- **Manuální testování**: Ověřeno vytváření historie u všech AI modulů a následné plnohodnotné obnovení stavu.
- **Lint**: Spuštění `npm run lint` je 100% čisté (bez chyb a varování).
- **Build**: Next.js produkční build (`npm run build`) proběhl úspěšně bez chyb typu TypeScriptu.
- **Testy**: Všechny testy v projektu (celkem **69 testů**) procházejí a jsou plně zelené.
