import { publisher } from "./publisher.mjs";
export const families = [
  {
    id: "practice",
    name: "Practice!",
    icon: "practice",
    color: "#1264a3",
    purpose: "Make a technique second nature.",
    description:
      "Focused training that helps you recognise one pattern, then use it with confidence.",
    need: "I want to work on a specific technique.",
  },
  {
    id: "start-here",
    name: "Start Here",
    icon: "guidance",
    color: "#b14b38",
    purpose: "A little direction. Your own discovery.",
    description:
      "Full puzzles with hints that show you where to look, without giving the answer away.",
    need: "I get stuck and want a nudge.",
  },
  {
    id: "candidates-done",
    name: "Candidates Done",
    icon: "candidates",
    color: "#327053",
    purpose: "Skip the setup. Find the logic.",
    description:
      "Candidate notes are already supplied, so you can get straight to the interesting part.",
    need: "I want to solve without writing pencil marks.",
  },
  {
    id: "mastery",
    name: "Mastery",
    icon: "mastery",
    color: "#70509a",
    purpose: "Put your skills to the test.",
    description:
      "Graded puzzles for independent solving. Choose your own techniques, keep your notes current, and bring your skills together.",
    need: "I'm ready to solve independently.",
  },
  {
    id: "discovery",
    name: "Discovery",
    icon: "discovery",
    color: "#a92b36",
    purpose: "Solve a puzzle. Reveal something new.",
    description:
      "Sudoku with something more to discover. Use your solutions to follow drawing clues and watch a picture take shape, one puzzle at a time.",
    need: "I'd like a puzzle with a creative surprise.",
  },
];
export const books = [
  {
    slug: "the-sudoku-learners-guide",
    title: "The Sudoku Learner's Guide",
    subtitle:
      "A Step-by-Step Handbook of Rules, Techniques, and Practice Grids",
    family: "guide",
    isbn: "978-1-0681462-0-6",
    cover: "guide",
    coverSource: "src/assets/covers/guide.png",
    coverManifest: "src/assets/covers/guide.json",
    coverWidth: 1800,
    coverHeight: 2700,
    coverStatus: "Print cover artwork",
    courseDescription:
      "A full-colour, 6 x 9 inch course with 45 complete puzzles, visual explanations, and walkthroughs that build from the first rules to advanced patterns and chains.",
    sampleSpreads: [
      {
        title: "See the pattern. Find the next step.",
        description:
          "An X-Wing example from Chapter 3: Advanced Pattern Recognition. Follow the highlighted candidates from the first deduction to the next placement.",
        caption:
          "Draft interior / Printed pages 82-83 / Layout and content may change before publication.",
        pdf: "/assets/samples/sudoku-learners-guide-x-wing-sample.pdf",
        pages: [
          {
            image: "guide-x-wing-82",
            label: "Page 82: Recognise the X-Wing",
            alt: "Draft page 82: candidate 8 highlighted at the four corners of an X-Wing in rows 3 and 5, columns 5 and 6.",
          },
          {
            image: "guide-x-wing-83",
            label: "Page 83: Eliminate and place",
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
    slug: "25-days-of-christmas-sudoku",
    title: "25 Days of Christmas Sudoku",
    subtitle:
      "An Advent Puzzle Book with a Daily Drawing Reveal / December 2026",
    family: "discovery",
    isbn: "9798174365575",
    cover: "advent-2026",
    coverSource: "src/assets/covers/advent-2026.png",
    coverManifest: "src/assets/covers/advent-2026.json",
    coverWidth: 1800,
    coverHeight: 2250,
    coverStatus: "Print cover artwork",
    description:
      "A Sudoku Advent calendar for December 2026. Solve one moderate puzzle each day from December 1 to Christmas Day, then use your answers to reveal another part of a festive drawing.",
    bestFor:
      "Solvers who enjoy moderate Sudoku and would like a daily puzzle-and-drawing ritual in the run-up to Christmas.",
    featureIntro: "The first Discovery book",
    featureHeading: "One puzzle a day. One picture to discover.",
    featureNote:
      "Made for pencil and paper, with an 8 x 10 inch page format and printed drawing instructions.",
    features: [
      {
        title: "Solve the day's Sudoku",
        description:
          "Settle in with one of 25 moderate puzzles, one for each day from December 1 to 25.",
      },
      {
        title: "Follow the drawing clues",
        description:
          "Use your Sudoku answers and the printed lookups to join numbered dots on the day's drawing tile.",
      },
      {
        title: "Bring the scene together",
        description:
          "Combine the 6-inch tiles into one large festive picture. Sudoku answers are included in the book.",
      },
    ],
  },
  {
    slug: "practice-x-wing-sudoku",
    title: "Practice! X-Wing Sudoku",
    subtitle:
      "Guided Pattern Training from First Recognition to Independent Solving",
    family: "practice",
    cover: "practice",
    coverSource: "src/assets/covers/practice-xwing.png",
    coverManifest: "src/assets/covers/practice-xwing.json",
    coverWidth: 1800,
    coverHeight: 2250,
    coverStatus: "Print cover artwork",
    description:
      "Learn to spot X-Wing patterns through progressive, deliberate practice. Turn a technique you understand into one you can recognise.",
    bestFor:
      "Solvers who know the basics and want focused practice with X-Wing patterns.",
  },
  {
    slug: "start-here-hard-sudoku-with-hints",
    title: "Start Here: Hard Sudoku with Visual Hints",
    subtitle: "See the Pattern. Use It. Find It Again.",
    family: "start-here",
    cover: "start-here",
    coverSource: "src/assets/covers/start-here.png",
    coverManifest: "src/assets/covers/start-here.json",
    coverWidth: 1800,
    coverHeight: 2250,
    coverStatus: "Print cover artwork",
    description:
      "Take on hard Sudoku with a little direction when you need it. Hints point you towards your next move while leaving the discovery to you.",
    bestFor:
      "Solvers moving into harder puzzles who would like guidance when they get stuck.",
  },
  {
    slug: "candidates-done-hard-sudoku",
    title: "Candidates Done: Hard Sudoku",
    subtitle:
      "Just Start Solving / Candidate Notes Already Filled In / Focus on Your Next Deduction",
    family: "candidates-done",
    cover: "candidates-done",
    coverSource: "src/assets/covers/candidates-done.png",
    coverManifest: "src/assets/covers/candidates-done.json",
    coverWidth: 1800,
    coverHeight: 2250,
    coverStatus: "Print cover artwork",
    description:
      "Start with the pencil marks in place. Spend your solving time exploring patterns and making deductions, with the initial setup already done.",
    bestFor:
      "Solvers who enjoy the logic of hard puzzles and want to skip the candidate setup.",
  },
  {
    slug: "mastery-hard-sudoku",
    title: "Mastery! Advanced Sudoku",
    subtitle: "120 Carefully Graded Puzzles for Independent Solving",
    family: "mastery",
    cover: "mastery",
    coverSource: "src/assets/covers/mastery.png",
    coverManifest: "src/assets/covers/mastery.json",
    coverWidth: 1800,
    coverHeight: 2250,
    coverStatus: "Print cover artwork",
    description:
      "You know the techniques. Now decide when to use them. Solve 120 original Sudoku puzzles, progressing from intermediate patterns to deeper chains and coloring, without hints or technique labels beside the grids.",
    bestFor:
      "Solvers ready to choose their own next move and bring a growing toolkit to advanced puzzles.",
    featureIntro: "The first Mastery book",
    featureHeading: "Trust your toolkit. Find the next move.",
    featureNote:
      "Large solving grids and room for notes in an 8 x 10 inch format. Solutions include completed grids and selected key moves. Scan the printed QR codes to solve the same puzzles digitally or follow full solution walkthroughs.",
    features: [
      {
        title: "Find Your Rhythm",
        description:
          "Puzzles 1-30: settle into independent solving, keep your notes current, and look for the connection that opens up the grid.",
      },
      {
        title: "Build the Connections",
        description:
          "Puzzles 31-60: bring more of your toolkit together as the challenge grows.",
      },
      {
        title: "Go Deeper",
        description:
          "Puzzles 61-90: take your time with more demanding logic and find your own route through.",
      },
      {
        title: "Master the Grid",
        description:
          "Puzzles 91-120: put your skills to work in the final stretch of the book's graded progression.",
      },
    ],
  },
].map((b) => ({
  ...b,
  collection: "The Sudoku Learner's Library",
  status: "Forthcoming",
  author: publisher.author,
  concept: false,
  isbn: null,
  asin: null,
  amazonCa: null,
  amazonCom: null,
  coverSource: b.cover
    ? `sample_covers/ChatGPT Image Sep 9, 2026, 12_36_59 AM (${{ practice: 2, "start-here": 3, "candidates-done": 4 }[b.cover]}).png`
    : null,
  coverWidth: 1024,
  coverHeight: 1536,
  coverStatus: b.cover
    ? "Concept cover / final artwork forthcoming"
    : "Cover forthcoming",
  sampleSpreads: [],
  ...b,
}));
