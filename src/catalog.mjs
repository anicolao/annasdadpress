export const families = [
  {
    id: "practice",
    name: "Practice",
    icon: "⌖",
    color: "#1264a3",
    purpose: "Make a technique second nature.",
    description:
      "Focused training that helps you recognise one pattern, then use it with confidence.",
    need: "I want to work on a specific technique.",
  },
  {
    id: "start-here",
    name: "Start Here",
    icon: "↗",
    color: "#b14b38",
    purpose: "A little direction. Your own discovery.",
    description:
      "Full puzzles with hints that show you where to look, without giving the answer away.",
    need: "I get stuck and want a nudge.",
  },
  {
    id: "candidates-done",
    name: "Candidates Done",
    icon: "▦",
    color: "#327053",
    purpose: "Skip the setup. Find the logic.",
    description:
      "Candidate notes are already supplied, so you can get straight to the interesting part.",
    need: "I want to solve without writing pencil marks.",
  },
  {
    id: "mastery",
    name: "Mastery",
    icon: "◇",
    color: "#756039",
    purpose: "Put your skills to the test.",
    description:
      "Carefully graded puzzles for the satisfaction of working it out on your own.",
    need: "I’m ready to solve independently.",
  },
];
export const books = [
  {
    slug: "the-sudoku-learners-guide",
    title: "The Sudoku Learner’s Guide",
    subtitle:
      "A Step-by-Step Handbook of Rules, Techniques, and Practice Grids",
    family: "guide",
    cover: "guide",
    sampleSpreads: [
      {
        title: "See the pattern. Find the next step.",
        description:
          "An X-Wing example from Chapter 3: Advanced Pattern Recognition. Follow the highlighted candidates from the first deduction to the next placement.",
        caption:
          "Draft interior · Printed pages 82–83 · Layout and content may change before publication.",
        pdf: "/assets/samples/sudoku-learners-guide-x-wing-sample.pdf",
        pages: [
          {
            image: "guide-x-wing-82",
            label: "Page 82 — Recognise the X-Wing",
            alt: "Draft page 82: candidate 8 highlighted at the four corners of an X-Wing in rows 3 and 5, columns 5 and 6.",
          },
          {
            image: "guide-x-wing-83",
            label: "Page 83 — Eliminate and place",
            alt: "Draft page 83: the X-Wing removes candidate 8 from row 2, column 6, leaving a green-highlighted 1.",
          },
        ],
        explanation: [
          "On page 82, candidate 8 has exactly two possible positions in each of rows 3 and 5: columns 5 and 6. These four positions form an X-Wing. The two rows must place their 8s in opposite corners, so each of those columns receives an 8 from the pattern.",
          "On page 83, that means no other cell in columns 5 and 6 can contain an 8. Remove candidate 8 from row 2, column 6. Its candidates were 1 and 8; now only 1 remains. Place 1, then rescan the crossing row, column, and box.",
        ],
      },
    ],
    description:
      "A complete course in seeing the logic. Learn the rules, understand the techniques, and build your confidence one well-explained step at a time.",
    bestFor:
      "Learning Sudoku from the beginning, or understanding the techniques behind your next breakthrough.",
  },
  {
    slug: "practice-x-wing-sudoku",
    title: "Practice: X-Wing Sudoku",
    subtitle:
      "Guided Pattern Training from First Recognition to Independent Solving",
    family: "practice",
    cover: "practice",
    description:
      "Learn to spot X-Wing patterns through progressive, deliberate practice. Turn a technique you understand into one you can recognise.",
    bestFor:
      "Solvers who know the basics and want focused practice with X-Wing patterns.",
  },
  {
    slug: "start-here-hard-sudoku-with-hints",
    title: "Start Here: Hard Sudoku with Hints",
    subtitle:
      "Guided Puzzles That Show You Where to Look Without Giving Away the Answer",
    family: "start-here",
    cover: "start-here",
    description:
      "Take on hard Sudoku with a little direction when you need it. Hints point you towards your next move while leaving the discovery to you.",
    bestFor:
      "Solvers moving into harder puzzles who would like guidance when they get stuck.",
  },
  {
    slug: "candidates-done-hard-sudoku",
    title: "Candidates Done: Hard Sudoku",
    subtitle: "Candidate Notes Already Filled In—Just Start Solving",
    family: "candidates-done",
    cover: "candidates-done",
    description:
      "Start with the pencil marks in place. Spend your solving time exploring patterns and making deductions, with the initial setup already done.",
    bestFor:
      "Solvers who enjoy the logic of hard puzzles and want to skip the candidate setup.",
  },
  {
    slug: "mastery-hard-sudoku",
    title: "Mastery: Hard Sudoku",
    subtitle: null,
    family: "mastery",
    cover: null,
    description:
      "Carefully graded hard Sudoku for independent solving. Bring together what you’ve learned and enjoy the challenge of finding your own way through.",
    bestFor: "Confident solvers looking for independent practice.",
  },
].map((b) => ({
  ...b,
  collection: "The Sudoku Learner’s Library",
  status: "Forthcoming",
  isbn: null,
  asin: null,
  amazonCa: null,
  amazonCom: null,
  coverStatus: b.cover
    ? "Concept cover · final artwork forthcoming"
    : "Cover forthcoming",
  sampleSpreads: [],
  ...b,
}));
