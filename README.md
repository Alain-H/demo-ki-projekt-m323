# Notenrechner — M323 Demo

Eine kleine **dockerisierbare Webapp** mit **self-hosted Supabase** als Backend.
Sie demonstriert die Kernkonzepte aus dem Modul **M323 – Funktional programmieren**
(EFZ Informatik, Schweizer Standard) anhand eines Notenrechners.

> Schüler:innen können Noten eintragen, die App berechnet pro Person den
> (gewichteten) Durchschnitt, zählt bestandene/ungenügende Noten und zeigt,
> ob die Person bestanden hat.

---

## Funktionale Konzepte im Code

Alle Konzepte sind in [`app/server.js`](app/server.js) mit `[FP]`-Kommentaren
markiert.

| Konzept                  | Wo im Code                                  | Was zu sehen ist                                  |
|--------------------------|---------------------------------------------|---------------------------------------------------|
| **Pure Functions**       | `isPassing`, `weightedValue`, `sum`         | Gleiches Input → gleiches Output, kein Seiteneff. |
| **Higher-Order**         | `passingGrades` (übergibt Lambda an filter) | Funktionen als Argumente                          |
| **`map`**                | `weightedValues`                            | Liste transformieren ohne Mutation                |
| **`filter`**             | `passingGrades`, `failingGrades`            | Selektieren ohne Mutation                         |
| **`reduce`**             | `sum`, `groupByStudent`                     | Liste falten zu einem Wert / Objekt               |
| **Immutability**         | `groupByStudent` (Spread `...acc`)          | Statt `push` immer neue Werte                     |
| **Komposition / Pipeline** | `buildReport`                             | Daten fliessen durch eine Kette von Funktionen    |

Die Seiteneffekte (DB-Zugriff, HTTP) sind **bewusst getrennt** in der unteren
Hälfte der Datei. Oben: pure FP-Welt. Unten: HTTP-Adapter. Das ist ein
typisches FP-Muster („functional core, imperative shell").

---

## Architektur

```
Browser  ──►  Node.js (Express)  ──►  Kong (API-Gateway)  ──►  PostgREST  ──►  Postgres
              [unser app/]            └──────────── self-hosted Supabase ──────────┘
```

- **app/** – Node.js + Express + `@supabase/supabase-js`
- **supabase/** – offizielle self-hosted Supabase-Stack (Studio, Kong, Auth, REST, DB …)
- **docker-compose.yml** – fügt beides zusammen via `include:`

---

## Setup

### 1. Voraussetzungen
- Docker Desktop (oder Docker Engine + Compose v2.20+)
- Git

### 2. Repo klonen
```bash
git clone git@github.com:Alain-H/demo-ki-projekt-m323.git
cd demo-ki-projekt-m323
```

### 3. Supabase `.env` anlegen
```bash
cp supabase/.env.example supabase/.env
```
> Für eine Demo reichen die Default-Werte. In Produktion **immer** die Keys
> (`POSTGRES_PASSWORD`, `JWT_SECRET`, `ANON_KEY`, `SERVICE_ROLE_KEY`,
> `DASHBOARD_PASSWORD` …) neu generieren!

### 4. Stack starten
```bash
docker compose --env-file supabase/.env up -d
```
Beim ersten Mal zieht Docker viele Images (~2 GB). Bei einer Live-Demo
**vorher einmal pullen**, damit es im Unterricht schnell geht:
```bash
docker compose --env-file supabase/.env pull
```

### 5. Schema initialisieren
1. Supabase Studio öffnen: <http://localhost:8000>
   (Login: `supabase` / aus `DASHBOARD_PASSWORD` in `supabase/.env`)
2. Links auf **SQL Editor**.
3. Inhalt von [`init.sql`](init.sql) einfügen und ausführen.

### 6. App öffnen
<http://localhost:3000>

---

## Stoppen / Aufräumen

```bash
docker compose --env-file supabase/.env down          # nur stoppen
docker compose --env-file supabase/.env down -v       # inkl. Volumes (DB-Daten weg!)
```

---

## Endpoints (für Tests / Demo)

| Methode | Pfad             | Beschreibung                            |
|---------|------------------|-----------------------------------------|
| GET     | `/api/grades`    | Alle Rohnoten                           |
| GET     | `/api/report`    | Aggregierte Auswertung pro Schüler:in   |
| POST    | `/api/grades`    | Neue Note ablegen                       |

Beispiel:
```bash
curl -X POST http://localhost:3000/api/grades \
  -H "Content-Type: application/json" \
  -d '{"student_name":"Diana","subject":"Englisch","grade":5.5,"weight":1}'
```

---

## Hinweise für den Unterricht

- 25-Min-Slot: zeige zuerst die App im Browser, dann **`server.js` von oben nach
  unten** durchgehen. Die `[FP]`-Marker sind didaktische Wegweiser.
- Diskussionsfrage für die Klasse: *Was wäre der Unterschied, wenn wir
  `groupByStudent` mit `for`-Schleife und `acc[name].push(g)` schreiben würden?*
  → Mutation vs. Immutability als Aufhänger.
