# Review - AI Control Center Modul

Modul **AI Control Center** byl plně naimplementován a integrován jako interní vývojářský a observability nástroj (Developer Tool) pro sledování AI požadavků, nákladů, latencí a spotřeby tokenů v reálném čase.

---

## 1. Soubory

### Nové soubory
1. **[`aiCostEstimator.ts`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/services/ai/aiCostEstimator.ts)**: Centrální služba pro výpočet cen na základě počtu tokenů, vybraného modelu a providera (v CZK i USD).
2. **[`aiAnalyticsService.ts`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/services/ai/aiAnalyticsService.ts)**: Třída odpovědná za perzistenci logů, agregaci denních statistik, breakdown podle funkcí a správu rozpočtového limitu.
3. **[`aiClient.ts`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/services/ai/aiClient.ts)**: Klientský wrapper nad `fetch` API pro automatické zachycení latence, tokenů a payloadů.
4. **[`aiAnalytics.test.ts`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/__tests__/aiAnalytics.test.ts)**: Testovací sada ověřující výpočty cen a ukládání logů.
5. **[`page.tsx`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/app/ai-control-center/page.tsx)**: Hlavní stránka administrátorského panelu AI Control Center.
6. **[`AiDashboardStats.tsx`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/components/ai/AiDashboardStats.tsx)**: Vizualizační karty hlavních denních metrik.
7. **[`AiBudgetWidget.tsx`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/components/ai/AiBudgetWidget.tsx)**: Widget sledující měsíční rozpočet (s editací limitu v CZK).
8. **[`AiCharts.tsx`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/components/ai/AiCharts.tsx)**: Vlastní lehké a responzivní SVG grafy (týdenní aktivita a distribuce modulů).
9. **[`AiFeatureBreakdown.tsx`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/components/ai/AiFeatureBreakdown.tsx)**: Dynamický přehled spotřeby rozdělený podle jednotlivých AI funkcí.
10. **[`AiRequestHistory.tsx`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/components/ai/AiRequestHistory.tsx)**: Tabulka historie požadavků s možností rozkliknutí pro detailní debug promptů a odpovědí.

### Upravené soubory
1. **[`Navbar.tsx`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/components/layout/Navbar.tsx)**: Přidán odkaz "AI Studio" do hlavní navigace.
2. **[`GenerateTasksModal.tsx`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/components/board/GenerateTasksModal.tsx)**: Volání API refaktorováno na `aiClient.fetchAi()`.
3. **[`TaskDetailDrawer.tsx`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/components/board/TaskDetailDrawer.tsx)**: Volání API refaktorováno na `aiClient.fetchAi()`.
4. **[`GenerateProjectModal.tsx`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/components/board/GenerateProjectModal.tsx)**: Volání API refaktorováno na `aiClient.fetchAi()`.

---

## 2. Architektura AI Analytics & Control Center

Záznam a zobrazení telemetrie funguje na principu **jednosměrného toku dat a klientského zachycení**:

```
[UI Komponenta] ---> [aiClient.fetchAi()] ---> [Next.js API Route (Server)] ---> [Gemini API]
                        |                                |
                        | (Měří latenci,                 | (Vrací token usage
                        |  sbírá payloady)               |  a model)
                        v                                v
             [aiAnalyticsService] <-----------------------
                        |
                        +---> [localStorage (MVP)]
                        |
            (Vyvolá event 'ai_log_updated')
                        |
                        v
         [AI Control Center Dashboard] (Automatický re-render)
```

- **Oddělení logiky**: Komponenty uživatelského rozhraní pouze vykreslují předpřipravené statistiky. Výpočet nákladů, seskupování dat a filtrace probíhají výhradně uvnitř `aiAnalyticsService.ts` a `aiCostEstimator.ts`.
- **Real-time aktualizace**: Při každém úspěšném zalogování requestu služba vyvolá globální `window` event `ai_log_updated`. Pokud má uživatel otevřenou stránku Control Center a v jiném okně (nebo modalu) provede AI akci, grafy a tabulky se v reálném čase bez nutnosti obnovení stránky překreslí.

---

## 3. Popis ukládání metadat (Příprava na Supabase)

V současné implementaci (MVP) jsou data ukládána do `localStorage` prohlížeče pod klíčem `ai_control_center_logs`.

- **Capping (Omezení velikosti)**: Aby nedošlo k přeplnění kapacity lokálního úložiště (`quota exceeded`), service udržuje maximálně **500 nejnovějších záznamů**. Starší záznamy jsou automaticky odmazávány (`existingLogs.shift()`).
- **Připravenost na Supabase**: Služba `aiAnalyticsService` je plně připravena na budoucí migraci do databáze. Pro uložení na server stačí upravit asynchronní metodu `logRequest` a vyměnit uložení do `localStorage` za volání databázového klienta:
  ```typescript
  // Budoucí přechod na Supabase:
  async logRequest(entry) {
    const cost = aiCostEstimator.calculateCostCzk(...);
    const { data, error } = await supabase
      .from('ai_request_logs')
      .insert([{ ...entry, estimatedCostCzk: cost }]);
  }
  ```

---

## 4. Cost Estimator & Více providerů

Výpočet ceny byl zcela oddělen a parametrizován:
- Sazby za tokeny jsou uloženy v konfiguraci `PROVIDER_PRICING` strukturované podle providerů (např. `google`, `openrouter`) a jednotlivých modelů.
- Ceny jsou zadávány v USD za **1 000 000 tokenů** (např. 0.075 USD pro vstup a 0.30 USD pro výstup u `gemini-3.5-flash`), což zamezuje chybám při práci s drobnými desetinnými čísly.
- Kurz převodu na CZK je centralizován v proměnné `USD_TO_CZK_RATE` (výchozí hodnota `23.5`).
- Při nahrání neznámého modelu systém automaticky použije bezpečné výchozí sazby (`DEFAULT_PRICING`), aby nedocházelo k chybám výpočtu.

---

## 5. Doporučení pro další rozvoj

1. **Serverové logování (DB Sync)**: Jakmile bude do aplikace zavedena perzistence boardů, doporučujeme vytvořit tabulku `ai_request_logs` v Supabase a asynchronně do ní zapisovat logy přímo z Next.js API rout na serveru. Tím získáte centrální logy ze všech zařízení a uživatelů.
2. **Alerting při překročení budgetu**: Rozpočtový widget lze napojit na klientskou blokaci AI požadavků – pokud `monthlyUsage >= budgetLimit`, tlačítka pro volání AI v UI mohou být deaktivována nebo varovat uživatele před dodatečnými náklady.

---

## 6. Testování & Kontrola kvality

1. **Unit testy**: Napsal jsem 8 nových testů v [`aiAnalytics.test.ts`](file:///Users/beng/Cursor%20-%20Projects/kanban_antigravity/frontend/src/__tests__/aiAnalytics.test.ts), které spolehlivě testují výpočty cen, formátování CZK, ukládání historie a hlídání měsíčního rozpočtu.
2. **Vitest**: Všechny testy v projektu (celkem **62 testů**) úspěšně procházejí bez chyb.
3. **Linter & Build**: Příkazy `npm run lint` i `npm run build` skončily s nulovým počtem chyb či varování.
