# Architektur-Entscheidungen

## Decisions
- **Self-hosted Supabase** als Backend (via offizielle `supabase/docker-compose.yml`), nicht Plain-Postgres und nicht Supabase Cloud.
- **Node.js + Express** als App-Service, eingebunden via Compose `include:` in eine Top-Level `docker-compose.yml`.
- **Functional Core / Imperative Shell**: `app/server.js` trennt pure FP-Funktionen (oben) von HTTP/DB-Seiteneffekten (unten).
- **`@supabase/supabase-js`** spricht via Kong-Gateway (`http://kong:8000`) mit PostgREST — kein direkter `pg`-Zugriff.
- **Schema-Init manuell** via `init.sql` im Supabase Studio (nicht automatisiert), damit der Workflow im Unterricht sichtbar bleibt.

## Reasoning
- Modul M323 verlangt **funktionale Programmierung** — die Trennung Core/Shell macht FP-Konzepte (Pure Functions, map/filter/reduce, Immutability) didaktisch greifbar.
- Self-hosted Supabase wurde gegenüber Plain-Postgres bevorzugt, weil der User es explizit wollte und Studio + Auth-Stack als realitätsnaher Tech-Stack für EFZ-Lernende dienen.
- `include:` statt einer monolithischen Compose-Datei: hält Supabase-Setup unverändert (einfach updatebar) und unsere App davon getrennt.
- Manuelles Schema-Setup statt Auto-Migration: 25-Min-Demo-Slot, Studio-SQL-Editor ist ein Lerngegenstand an sich.

## Implications
- Erster `docker compose up` zieht ~2 GB Images — vor Live-Demo `pull` ausführen.
- Anon-Key aus `supabase/.env` wird per `${ANON_KEY}` an die App durchgereicht; ändert sich der Key, muss die App neu gestartet werden.
- Da RLS-Policies auf `grades` offen für `anon` stehen, ist das Setup **nicht produktionstauglich** — bewusst Demo-Scope.
- Schema lebt in `init.sql` (Repo), nicht als Supabase-Migration — beim DB-Volume-Reset muss SQL erneut eingespielt werden.

## Open questions
- Soll später eine echte Migration (z.B. `supabase/migrations/`) das manuelle `init.sql` ersetzen?
- Auth/RLS als Erweiterungsübung für die Klasse?

## Last updated
2026-05-22
