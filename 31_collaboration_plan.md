# Plán: Reálná spolupráce (Invites + Multi-user + Realtime)

Cíl: posílat e-mailové pozvánky → pozvaní se zaregistrují → **reálně spolu pracují a změny se projevují v reálném čase**.

Tohle je největší architektonický skok projektu: z jednouživatelského dema na skutečný **multi-tenant SaaS**.

---

## 0. Realita: konec „demo-only"

Reálná spolupráce = **sdílený backend**. `localStorage` je per-prohlížeč, nikdy nemůže sdílet data mezi lidmi. Tenhle krok tedy **přepíná aplikaci do Supabase režimu** (kód pro něj už existuje z R21–R23, ale nikdy neběžel proti živé DB). Demo režim zůstane jako fallback pro „vyzkoušej bez účtu".

**Prerekvizita:** Supabase projekt + env proměnné + spuštění schématu + konfigurace Auth (e-mail).

---

## Architektura — tři pilíře (staví na sobě v tomto pořadí)

### A. Sdílené workspace + RLS (multi-tenant) — nejdůležitější a nejcitlivější

- **Dnes:** workspace = účet vlastníka (`owner_id`), RLS = `auth.uid() = owner_id` → jen vlastník vidí svá data.
- **Cíl:** kolaborant (jiný účet) vidí a edituje **sdílená** data workspace, kde je členem.
- **Řešení:** uživatel patří do workspace W, když má `workspace_members` řádek ve W se svým `profile_id`. RLS politiky se přepíšou z „jsem vlastník" na „jsem člen tohoto workspace" — přes SQL helper `is_workspace_member(workspace_owner_id)`.
- **Dotčené tabulky:** projects, columns, cards, project_members, card_assignees, workspace_members.
- ⚠️ **Nejrizikovější část** (bezpečnost / data-leaky) → musí mít důkladné RLS testy.

### B. Pozvánky (Invite Members) — nejlepší cesta přes Supabase nativně

Elegantní řešení bez vlastní e-mailové infrastruktury, které navíc **znovupoužije stávající `handle_new_user` trigger**:

1. Serverová route `POST /api/invites` (běží se `service_role` klíčem, jen na serveru) zavolá
   `supabase.auth.admin.inviteUserByEmail(email, { data: { invited_to_owner, invited_role, project_id } })`.
2. Supabase pošle **invite e-mail** (odkaz na nastavení hesla).
3. Pozvaný nastaví heslo → vznikne auth účet → **stávající trigger** přečte metadata z pozvánky a založí `workspace_members` napojený na zvoucí workspace + `project_members` řádek.
4. Hotovo — reálný účet, propojený, s rolí.

- Placeholder kontakty (bez účtu) z Tým stránky se pozvánkou **„povýší" na reálné účty** (napojí se `profile_id`).
- **Produkce:** nakonfigurovat SMTP/Resend (Supabase má vlastní e-mail jen na testování, s limity).
- **Alternativa (víc kontroly):** vlastní `invitations` tabulka s tokenem + `/invite/[token]` accept stránka + Resend. Víc práce, ale nezávislé na Supabase e-mail limitech.

### C. Realtime

- **Supabase Realtime:** subscribe na Postgres změny `cards` / `columns` / `project_members` / `card_assignees` pro aktivní projekt.
- Wire do `useKanbanBoard`: příchozí změna → patch stavu (nebo cílený refetch). Optimistické mutace s **rollbackem** (základ už je v R21 `persistenceStatus`).
- **Frakční pozice (lexorank)** místo integerových pozic → drag & drop bez konfliktů při souběhu. Malá, ale nutná změna schématu.

### D. Permissions (role) — doladit na konec

`workspace_role` / `project_role` už v modelu jsou, jen se nevynucují. S multi-user se vynutí přes RLS (owner/admin smí mazat projekt, zvát, měnit role) + UI guardy.

---

## Fázový plán (doporučené pořadí releasů)

| Fáze | Co | Proč
|---|---|---|
| **0 — Go live na Supabase** | Projekt, env, schéma, přepnutí do Supabase režimu, ověření stávajících featur proti živé DB | Prerekvizita všeho + vyřeší dlouho odkládané „ověřeno jen staticky". Sám o sobě reálná práce (ladění live bugů). |
| **1 — Sdílené workspace + RLS** | Multi-tenant přístup, členství podle profilu, přepis RLS | Bez tohohle jsou pozvánky k ničemu. |
| **2 — Pozvánky** | `/api/invites` + Supabase invite e-mail + trigger linking + `/invite` accept | Vpuštění dalších lidí. |
| **3 — Realtime** | Subscriptions + optimistický rollback + frakční pozice | Změny v reálném čase. |
| **4 — Permissions** | Vynucení rolí (RLS + UI) | Bezpečné sdílení. |

---

## Klíčová rozhodnutí (tvoje)

1. **Supabase projekt** — založíš (free tier stačí na portfolio)? Bez něj se dál nehne.
2. **E-mail:** Supabase built-in (rychlé, limity, dobré na demo/test) vs **Resend/SMTP** (produkce). Doporučuju začít Supabase built-in, Resend později.
3. **Rozsah realtime:** jen board (doporučuju MVP) vs všechno.
4. **Deployment:** aplikace teď potřebuje serverové env (Supabase URL/anon + `service_role` pro invites) → Vercel deploy s proměnnými (konec pure-demo). Demo režim necháme jako fallback bez env.

---

## Poctivé tradeoffs / rizika

- **Skok ve složitosti:** z jednouživatelského dema na reálný multi-tenant SaaS. Největší kus projektu.
- **Bezpečnost RLS:** multi-tenant RLS je místo, kde vznikají data-leaky. Nutné testy.
- **Operační surface:** reálný backend, e-mail deliverability, realtime limity (free tier má strop na concurrent connections).
- **Cena/limity:** free tier zvládne portfolio demo; při reálném provozu limity.
- Není to víkendovka — reálně **4–5 soustředěných releasů**.

---

## Doporučení, kde začít

**Fáze 0 (go live na Supabase) hned** — je to prerekvizita pro všechno a zároveň vyřeší dlouho odkládané „ověřit Supabase cesty proti živé DB". Jakmile aplikace běží na reálném backendu, fáze 1–4 jdou přirozeně za sebou.
