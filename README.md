<div align="center">

#  Memory

### Train your mind. Sharpen your edge.

**A mobile memory and cognitive training app built with React Native, featuring procedurally generated math challenges, word sequence recall, and sentence position memory games — all designed to sharpen mental agility through repeated, gamified practice.**

![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![AsyncStorage](https://img.shields.io/badge/AsyncStorage-Local_Persistence-blue?style=for-the-badge)
![Platform](https://img.shields.io/badge/Platform-iOS%20%7C%20Android-lightgrey?style=for-the-badge)

<br/>

<!-- SCREENSHOT PLACEHOLDER — Home Screen -->
> <img width="200" height="200" alt="Screenshot_20260929-220039" src="https://github.com/user-attachments/assets/d5dd3a62-aa6c-4e6a-b099-fd6fa83d57a2" />


</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Screenshots](#-screenshots)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [How It Works](#-how-it-works)
- [Data Architecture](#-data-architecture)
- [Math Generator](#-math-generator)
- [Known Limitations](#-known-limitations)
- [Roadmap](#-roadmap)
- [License](#-license)

---

##  Overview

Memory is a cognitive training app that turns brain exercise into a game. Inspired by a curious mini research on neuroplasticity and spaced repetition, it challenges users across three core cognitive domains:

- **Working memory** — remembering sequences and positions under time pressure
- **Mental arithmetic** — performing calculations without pen or paper
- **Long-term retention** — saving and replaying quiz sets days or weeks later

The app is fully offline, stores all data locally on the device, and generates fresh math problems procedurally so no two sessions are ever identical.

---

##  Features

### 🔤 Word Sequence
Memorize a list of 10 words in order within a time limit. When the clock runs out, the words are shuffled and you must tap them back into their original sequence.

- 3 difficulty levels (Easy · Medium · Hard)
- Configurable memorization time (30s · 60s · 90s · 120s)
- Live numbered tap feedback
- Position-accurate scoring
- Save any word set to revisit later

### 📖 Sentence Recall
Study a set of 5–8 sentences and remember each one's position. After the timer, you're asked "Which sentence was in position N?" with multiple-choice options — and sometimes the correct answer isn't listed, requiring a "None of these" response.

- 3 difficulty levels spanning everyday to academic language
- Multiple-choice format with deliberate "None of these" traps (~40% of questions)
- Detailed per-question breakdown in results
- Save sentence sets for spaced repetition practice

###  Mental Math
Back-to-back arithmetic challenges generated fresh every session. No repeated questions, no hardcoded bank.

- **12 problem types:** addition, subtraction, multiplication, division, squares, cubes, square roots, cube roots, percentages, multi-step, algebra (solve for x), fractions
- 2 answer modes: Multiple Choice or Type Your Answer
- Plausible distractor answers scaled to the magnitude of the correct answer
- 3 difficulty levels with appropriate number ranges per type

### Saved Quizzes
Save Word Sequence or Sentence Recall sets and come back to them later to test long-term retention.

- Persisted locally via AsyncStorage
- Replay any saved quiz at any time
- Delete quizzes you no longer need
- Displays difficulty, type, and date saved

---

## 📸 Screenshots

<div align="center">

| Home | Word Sequence | Sentence Recall |
|------|--------------|-----------------|
| <img width="200" height="200" alt="Screenshot_20260929-220044" src="https://github.com/user-attachments/assets/f4634dfa-d27f-462a-ac45-eb7d5e5019a2" />
 | <img width="200" height="200" alt="Screenshot_20260930-171030" src="https://github.com/user-attachments/assets/6c0e62d6-92cc-4230-9325-ecef56146ecb" />
 | <img width="200" height="200" alt="Screenshot_20260930-171211" src="https://github.com/user-attachments/assets/d6d018fd-2c7e-4771-99a0-e1399f6193c6" />
 |

| Mental Math (MCQ) | Mental Math (Typed) | Saved Quizzes |
|-------------------|---------------------|---------------|
| <img width="200" height="200" alt="Screenshot_20260930-171320" src="https://github.com/user-attachments/assets/0989b75d-6ba9-423d-93d6-b1ca9e57420f" />
 | <img width="200" height="200" alt="Screenshot_20260930-171359" src="https://github.com/user-attachments/assets/d52ca7d9-2268-47bf-b1cd-cc3cb3499fc6" />
 | <img width="200" height="200" alt="Screenshot_20260930-171545" src="https://github.com/user-attachments/assets/c001892f-6abb-48f3-8da3-45cecca1b26b" />
 |


</div>

---

## Project Structure

```
Memory/
├── app/
│   ├── _layout.jsx
│   └── index.jsx
│
├── components/
│   ├── Badge.jsx
│   ├── Btn.jsx
│   ├── CircleTimer.jsx
│   └── PulseCircle.jsx
│
├── constants/
│   └── theme.js
│
├── data/
│   ├── sentences.json
│   └── words.json
│
├── screens/
│   ├── HomeScreen.jsx
│   ├── MentalMathScreen.jsx
│   ├── SavedQuizzesScreen.jsx
│   ├── SentenceRecallScreen.jsx
│   └── WordSequenceScreen.jsx
│
├── utils/
│   ├── helpers.js
│   └── mathGenerator.js
│
├── .gitignore
└── README.md

```

---

## Getting Started

### Prerequisites

- Node.js 18+
- React Native CLI or Expo
- Android Studio / Xcode (for emulator) or a physical device

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Wise-zino/memory.git
cd memory

# 2. Install dependencies
npm install

# 3. Install AsyncStorage
npm install @react-native-async-storage/async-storage

# 4. For iOS — install pods
cd ios && pod install && cd ..
```

### Running the App

```bash
# Android
npx react-native run-android

# iOS
npx react-native run-ios
```
---

##  How It Works

### Navigation
Memory uses a lightweight state-based navigation system — no external navigation library required. The root `index.jsx` component holds a `screen` string in state and conditionally renders the appropriate screen component.

```
home → word_sequence
     → sentence_recall
     → mental_math
     → saved_quizzes
```

### Timer Logic
Each memorization phase uses a `setInterval` ref that decrements a `timeLeft` state value every second. When it reaches zero, the game automatically advances to the next phase. Users can also skip the timer early.

### Scoring
- **Word Sequence** — scored by position: a word only counts as correct if it's in the exact right slot
- **Sentence Recall** — each question is binary: correct sentence selected or not
- **Mental Math** — one point per correct answer, percentage shown at end

---

## 🗄 Data Architecture

### Words & Sentences — Lazy-loaded JSON

Word lists and sentence sets live in two JSON asset files loaded only when a user taps **Start Challenge**, keeping startup time fast.

```js
// Loaded once, then cached in module scope
let _wordData = null;

const getWordLists = () => {
  if (!_wordData) _wordData = require('./assets/words.json');
  return _wordData;
};
```

**words.json** structure:
```json
{
  "easy":   [["Apple", "Ocean", ...], [...]],
  "medium": [["Labyrinth", "Symposium", ...], [...]],
  "hard":   [["Perspicacious", "Mellifluous", ...], [...]]
}
```

**sentences.json** structure:
```json
{
  "easy":   [["The cat sat...", "She found..."], [...]],
  "medium": [["The archaeologist...", "Despite the storm..."], [...]],
  "hard":   [["The quantum entanglement...", "Her dissertation..."], [...]]
}
```

### Saved Quizzes — AsyncStorage

Saved quizzes are serialized as JSON and stored under a single AsyncStorage key. Each entry records the type, difficulty, content, and timestamp.

```js
{
  type: 'word_sequence' | 'sentence_recall',
  difficulty: 'easy' | 'medium' | 'hard',
  words: [...] | undefined,
  sentences: [...] | undefined,
  duration: 60,
  createdAt: 1720000000000
}
```

---

##  Math Generator

`mathGenerator.js` generates fresh arithmetic problems on demand — no hardcoded question bank.

### Supported Problem Types

| Type | Example | Difficulties |
|------|---------|--------------|
| Addition | `47 + 83 = ?` | All |
| Subtraction | `91 − 38 = ?` | All |
| Multiplication | `13 × 17 = ?` | All |
| Division | `144 ÷ 12 = ?` | All (always whole answers) |
| Square | `8² = ?` | All |
| Cube | `5³ = ?` | Medium · Hard |
| Square Root | `√169 = ?` | Medium · Hard (perfect squares only) |
| Cube Root | `∛216 = ?` | Hard (perfect cubes only) |
| Percentage | `15% of 340 = ?` | Medium · Hard |
| Multi-step | `(12 × 7) + 9 = ?` | Medium · Hard |
| Algebra | `4x + 6 = 30, x = ?` | Hard |
| Fraction of | `3/4 of 120 = ?` | Hard |

### Key Design Decisions

- **Clean answers only** — division and root problems are always set up to produce whole numbers
- **Plausible distractors** — wrong answers are scaled to the same magnitude as the correct answer so guessing isn't trivial
- **Deduplication** — `generateMathBatch()` ensures no two identical questions appear in the same session

---

## Known Limitations
| JSON assets are bundled by Metro at build time | Not truly lazy at the network level | Acceptable for this data size (~80KB total) |

---

## Roadmap

- [ ] Daily streak tracking
- [ ] Per-category performance history and charts
- [ ] Custom word lists (user-defined)
- [ ] Timed math sprint mode
- [ ] Dark / light theme toggle
- [ ] Sound effects and haptic feedback
- [ ] Leaderboard (local high scores)
- [ ] `Platform.OS` aware alert wrapper for web compatibility

---

##  License

```
MIT License

Copyright (c) 2026 [Wise Zino]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
```

---

<div align="center">

*If this project helped you, consider giving it a ⭐*

</div>
