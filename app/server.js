// =============================================================
//  M323 Demo - Notenrechner
//  Fokus: Funktionale Programmierung in JavaScript
//  Konzepte:  pure functions | map | filter | reduce
//             higher-order functions | immutability | composition
// =============================================================

import express from 'express';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL  = process.env.SUPABASE_URL  || 'http://kong:8000';
const SUPABASE_KEY  = process.env.SUPABASE_ANON_KEY || '';
const PORT          = process.env.PORT || 3000;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// -------------------------------------------------------------
// FP-KERN: reine Funktionen, keine Seiteneffekte, kein Mutieren
// -------------------------------------------------------------

// [FP] pure function — gleiches Input -> gleiches Output
const isPassing = (grade) => grade >= 4.0;

// [FP] higher-order function — gibt eine Funktion zurück
const weightedValue = (g) => g.grade * g.weight;

// [FP] map  — transformiert jedes Element (kein Mutieren!)
const weightedValues = (grades) => grades.map(weightedValue);

// [FP] filter — selektiert ohne Original zu verändern
const passingGrades = (grades) => grades.filter((g) => isPassing(g.grade));
const failingGrades = (grades) => grades.filter((g) => !isPassing(g.grade));

// [FP] reduce — faltet eine Liste zu einem Einzelwert
const sum = (xs) => xs.reduce((acc, x) => acc + x, 0);

// [FP] Komposition: Durchschnitt = sum / count
const average = (xs) => (xs.length === 0 ? 0 : sum(xs) / xs.length);

// [FP] Gewichteter Durchschnitt — Komposition von map + reduce
const weightedAverage = (grades) => {
  const totalWeight = sum(grades.map((g) => g.weight));
  if (totalWeight === 0) return 0;
  return sum(weightedValues(grades)) / totalWeight;
};

// [FP] Gruppieren mit reduce (statt for-Loop mit Mutation)
const groupByStudent = (grades) =>
  grades.reduce((acc, g) => ({
    ...acc,                                  // Immutability via Spread
    [g.student_name]: [...(acc[g.student_name] || []), g],
  }), {});

// [FP] Statistiken pro Schüler:in — pure, deterministisch
const studentStats = (name, grades) => ({
  name,
  count:            grades.length,
  average:          Number(average(grades.map((g) => g.grade)).toFixed(2)),
  weightedAverage:  Number(weightedAverage(grades).toFixed(2)),
  passing:          passingGrades(grades).length,
  failing:          failingGrades(grades).length,
  passed:           weightedAverage(grades) >= 4.0,
});

// [FP] Pipeline: rohe Noten -> gruppiert -> Stats pro Person
const buildReport = (grades) =>
  Object.entries(groupByStudent(grades))
    .map(([name, gs]) => studentStats(name, gs))
    .sort((a, b) => b.weightedAverage - a.weightedAverage);

// -------------------------------------------------------------
// HTTP-Schicht (Seiteneffekte isoliert hier drin)
// -------------------------------------------------------------

const app = express();
app.use(express.json());
app.use(express.static('public'));

app.get('/api/grades', async (_req, res) => {
  const { data, error } = await supabase.from('grades').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.get('/api/report', async (_req, res) => {
  const { data, error } = await supabase.from('grades').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(buildReport(data));
});

app.post('/api/grades', async (req, res) => {
  const { student_name, subject, grade, weight } = req.body;
  const { data, error } = await supabase
    .from('grades')
    .insert([{ student_name, subject, grade, weight: weight ?? 1.0 }])
    .select();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data[0]);
});

app.listen(PORT, () => {
  console.log(`Notenrechner läuft auf http://localhost:${PORT}`);
});
