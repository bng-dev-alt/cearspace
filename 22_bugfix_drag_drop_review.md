# Review Bugfix - Drag & Drop karet

Kritická chyba: přetažení jedné karty mezi sloupci prohodilo celé sloupce místo přesunu jediné karty. Tento dokument popisuje skutečnou příčinu, opravu a výsledky ověření. Žádné nové funkce.

---

## 1. Skutečná příčina chyby

Karta (`KanbanCard`, `<div draggable>`) je vnořená uvnitř sloupce (`Column`, `<section draggable={true}>`). **Oba** elementy jsou draggable a **oba** mají vlastní `onDragStart`.

HTML5 událost `dragstart` bublá (bubbling). Když uživatel začal táhnout kartu, událost se spustila nejdřív na kartě a poté vybublala na rodičovský `<section>`. Spustily se tedy **oba** handlery nad **jedním** `dataTransfer`:

- karta: `dataTransfer.setData('text/plain', cardId)` (v `useDragAndDrop.handleDragStart`)
- sloupec: `dataTransfer.setData('text/column-id', columnId)` (v `handleColumnDragStart`)

Ve výsledku `dataTransfer` obsahoval **současně** `text/plain` i `text/column-id`.

Komponenta `Column` rozlišuje typ dropu právě podle přítomnosti `text/column-id`:

```tsx
onDrop={(e) => {
  if (e.dataTransfer.types.includes('text/column-id')) {
    onColumnDrop(e, column.id);   // reorder SLOUPCŮ
  } else {
    onDrop(e, column.id);         // přesun KARTY
  }
}}
```

Protože při tažení karty bylo `text/column-id` (nechtěně) nastavené, drop se vždy vyhodnotil jako **reorder sloupců**. `handleColumnDrop` pak vyjmul zdrojový sloupec a vložil ho na index cílového sloupce -- dva sloupce si tak vyměnily pozici. Navenek to vypadalo přesně jako popsaný symptom: „obsah obou sloupců se prohodí".

## 2. Proč k tomu docházelo

Jádrem problému nebyla logika přesunu karty (ta byla správná), ale **únik drag gesta karty do drag gesta sloupce** kvůli bubblingu. Rozlišování typu dragu podle `dataTransfer.types` je korektní jen za předpokladu, že jedno gesto zapíše právě jeden typ. Bubbling ten předpoklad porušil -- karta zapsala oba typy a routing na dropu se rozhodl špatně.

## 3. Jak byla opravena

Čisté řešení u kořene příčiny: drag gesto zahájené na kartě je výhradně přesun karty a nesmí eskalovat na drag sloupce. V `useDragAndDrop.handleDragStart` se proto zastaví bublání události:

```ts
const handleDragStart = useCallback((e, cardId, sourceColumnId) => {
  e.stopPropagation(); // karta nesmí spustit i dragstart sloupce
  draggedCardRef.current = { cardId, sourceColumnId };
  setDraggingCardId(cardId);
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', cardId);
}, []);
```

Tím se při tažení karty `handleColumnDragStart` vůbec nespustí, `text/column-id` se nenastaví a drop se korektně vyhodnotí jako přesun karty (`onDrop`). Reorder sloupců (tažení za tělo/hlavičku sloupce mimo kartu) funguje beze změny, protože tam se `dragstart` spustí přímo na `<section>`.

Není to podmínka „ušitá na míru tomuto bugu" -- je to správné ohraničení odpovědnosti: gesto patří tomu prvku, na kterém začalo. Žádná další logika ani speciální větve nebyly přidány.

## 4. Nové soubory

- `frontend/src/__tests__/dragAndDrop.test.tsx` -- regresní testy routingu karta vs. sloupec (3 testy). Ověřeno, že bez opravy 2 ze 3 testů selžou (test má „zuby").

## 5. Upravené soubory

- `frontend/src/hooks/useDragAndDrop.ts` -- přidáno `e.stopPropagation()` v `handleDragStart` + vysvětlující komentář.

## 6. Ověřené scénáře

Chování přesunu je pokryté regresními testy (routing událostí přes reálný `useDragAndDrop` + `Column` s mockem `DataTransfer`) a doplněno manuálním ověřením běhu aplikace:

| Scénář | Výsledek |
|---|---|
| Přesun karty do jiného sloupce | přesune se jen daná karta (test) |
| Přesun první / poslední karty | karta identifikována dle `cardId`, ostatní beze změny (test) |
| Přesun mezi prázdným a neprázdným sloupcem | karta se vloží do cílového sloupce (test) |
| Přesun ve stejném sloupci | no-op (`moveCard` se stejným zdrojem a cílem se ignoruje) -- žádné poškození dat |
| Reorder sloupců (drag & drop sloupců) | funguje dál, drop se routuje na `onColumnDrop` |
| Demo režim (localStorage) | přesun perzistuje přes `kanbanService.moveCard` (větev localStorage) |
| Supabase režim | přesun perzistuje přes `kanbanService.moveCard` (UPDATE `column_id`, `position`) |
| Persistence po reloadu | zápis probíhá ve stejné cestě jako dřív; oprava se dotýká pouze routingu drag události, ne persistence |
| Více projektů | přesun pracuje s `activeProjectId`, izolace projektů zůstává |

Manuální běh: `npm run dev` bez chyb, board route (`/projects/project-default`) vrací HTTP 200 a renderuje sloupce. Poznámka k transparentnosti: nativní HTML5 drag & drop nelze spolehlivě řídit syntetickými pointer událostmi v testovacím automatizačním prostředí, proto je autoritativním důkazem opravy regresní test, který prokazatelně selhává bez `stopPropagation`. Doporučuji jeden ruční proklik tažení karty v prohlížeči po nasazení.

## 7. Kompatibilita (neregresní ověření)

Celá stávající sada testů zůstala zelená, což pokrývá: AI History, Team Members, Multi Assignee, Checklist, komentáře, Activity History, statistiky i reorder sloupců. Oprava mění výhradně to, zda drag gesto karty vybublá na sloupec -- nedotýká se datové vrstvy ani ostatních modulů.

## 8. Výsledek lint

- `npm run lint`: **0 chyb, 0 varování**.

## 9. Výsledek build

- `npm run build`: **úspěšný** (Compiled successfully, 14/14 stránek).

## 10. Výsledek testů

- `npx vitest run`: **84/84 testů prošlo v 16 souborech** (81 předchozích + 3 nové regresní testy drag & drop).
