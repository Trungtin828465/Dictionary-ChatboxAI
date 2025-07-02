import { QuestionListening } from "./Question";

export interface Topic {
  id: string;
  name: string;
  description: string;
}

export interface Exam {
  id: string;
  topic: Topic;
  title: string;
  description: string;
  skill: string;
  time: number; // in minutes
  created_at?: string;
  updated_at?: string;
  questions: QuestionListening[];
}

// export const mockExams: Exam[] = [
//   {
//     id: "1",
//     topic: {
//       id: "1",
//       name: "Geography",
//       description: "Geography related questions",
//     },
//     title: "Capital Cities Quiz",
//     description: "Test your knowledge of capital cities around the world.",
//     skill: "Listening",
//     time: 20,
//     created_at: "2021-01-01",
//     updated_at: "2021-01-02",
//     questions: [
//       {
//         id: "1",
//         question: "What is the capital of France?",
//         audio: "https://example.com/audio/france.mp3",
//         type: {
//           id: "C",
//           name: "Choose the correct answer",
//         },

//         options: [
//           {
//             id: "1",
//             symbol: "A",
//             description: "Paris",
//           },
//           {
//             id: "2",
//             symbol: "B",
//             description: "London",
//           },
//           {
//             id: "3",
//             symbol: "C",
//             description: "Berlin",
//           },
//         ],
//       },
//       {
//         id: "2",
//         question: "What is the capital of Japan?",
//         audio: "https://example.com/audio/japan.mp3",
//         type: {
//           id: "C",
//           name: "Choose the correct answer",
//         },
//         options: [
//           {
//             id: "4",
//             symbol: "A",
//             description: "Seoul",
//           },
//           {
//             id: "5",
//             symbol: "B",
//             description: "Tokyo",
//           },
//           {
//             id: "6",
//             symbol: "C",
//             description: "Bangkok",
//           },
//         ],
//       },
//       {
//         id: "3",
//         question: "What is the capital of Germany?",
//         audio: "https://example.com/audio/germany.mp3",
//         type: {
//           id: "F",
//           name: "Fill in the blank",
//         },
//       },
//     ],
//   },
//   {
//     id: "2",
//     topic: { id: "2", name: "Science", description: "Basic science questions" },
//     title: "Basic Science Quiz",
//     description: "Test your basic science knowledge.",
//     skill: "Listening",
//     time: 1,
//     created_at: "2021-02-01",
//     updated_at: "2021-02-02",
//     questions: [
//       {
//         id: "3",
//         question: "What is the chemical symbol for water?",
//         audio: "https://example.com/audio/water.mp3",

//         type: {
//           id: "C",
//           name: "Choose the correct answer",
//         },
//         options: [
//           {
//             id: "7",
//             symbol: "A",
//             description: "H2O",
//           },
//           {
//             id: "8",
//             symbol: "B",
//             description: "CO2",
//           },
//           {
//             id: "9",
//             symbol: "C",
//             description: "O2",
//           },
//         ],
//       },
//       {
//         id: "4",
//         question: "What planet is known as the Red Planet?",
//         audio: "https://example.com/audio/mars.mp3",
//         type: {
//           id: "C",
//           name: "Choose the correct answer",
//         },
//         options: [
//           {
//             id: "10",
//             symbol: "A",
//             description: "Mars",
//           },
//           {
//             id: "11",
//             symbol: "B",
//             description: "Venus",
//           },
//           {
//             id: "12",
//             symbol: "C",
//             description: "Jupiter",
//           },
//         ],
//       },
//     ],
//   },
//   {
//     id: "3",
//     topic: { id: "3", name: "Math", description: "Mathematics questions" },
//     title: "Simple Math Quiz",
//     description: "Test your math skills with simple questions.",
//     skill: "Listening",
//     time: 20,
//     created_at: "2021-03-01",
//     updated_at: "2021-03-02",
//     questions: [
//       {
//         id: "5",
//         question: "What is 2 + 2?",
//         audio: "https://example.com/audio/math.mp3",
//         type: {
//           id: "F",
//           name: "Fill in the blank",
//         },
//         options: [
//           {
//             id: "13",
//             symbol: "A",
//             description: "3",
//           },
//           {
//             id: "14",
//             symbol: "B",
//             description: "4",
//           },
//           {
//             id: "15",
//             symbol: "C",
//             description: "5",
//           },
//         ],
//       },
//       {
//         id: "6",
//         question: "What is the square root of 16?",
//         audio: "https://example.com/audio/math.mp3",
//         type: {
//           id: "F",
//           name: "Fill in the blank",
//         },
//         options: [
//           {
//             id: "16",
//             symbol: "A",
//             description: "4",
//           },
//           {
//             id: "17",
//             symbol: "B",
//             description: "5",
//           },
//           {
//             id: "18",
//             symbol: "C",
//             description: "6",
//           },
//         ],
//       },
//     ],
//   },
//   {
//     id: "4",
//     topic: { id: "4", name: "History", description: "History questions" },
//     title: "World History Quiz",
//     description: "Test your knowledge of world history.",
//     skill: "Listening",
//     time: 20,
//     created_at: "2021-04-01",
//     updated_at: "2021-04-02",
//     questions: [
//       {
//         id: "7",
//         question: "Who was the first president of the United States?",
//         audio: "https://example.com/audio/history.mp3",
//         type: {
//           id: "C",
//           name: "Choose the correct answer",
//         },
//         options: [
//           {
//             id: "19",
//             symbol: "A",
//             description: "George Washington",
//           },
//           {
//             id: "20",
//             symbol: "B",
//             description: "Thomas Jefferson",
//           },
//           {
//             id: "21",
//             symbol: "C",
//             description: "Abraham Lincoln",
//           },
//         ],
//       },
//       {
//         id: "8",
//         question: "In which year did World War II end?",
//         audio: "https://example.com/audio/history.mp3",
//         type: {
//           id: "C",
//           name: "Choose the correct answer",
//         },
//         options: [
//           {
//             id: "22",
//             symbol: "A",
//             description: "1945",
//           },
//           {
//             id: "23",
//             symbol: "B",
//             description: "1939",
//           },
//           {
//             id: "24",
//             symbol: "C",
//             description: "1918",
//           },
//         ],
//       },
//     ],
//   },
//   {
//     id: "5",
//     topic: {
//       id: "5",
//       name: "English",
//       description: "English language questions",
//     },
//     title: "English Grammar Quiz",
//     description: "Test your English grammar skills.",
//     skill: "Listening",
//     time: 20,
//     created_at: "2021-05-01",
//     updated_at: "2021-05-02",
//     questions: [
//       {
//         id: "9",
//         question: "Choose the correct sentence:",
//         audio: "https://example.com/audio/english.mp3",
//         type: {
//           id: "C",
//           name: "Choose the correct answer",
//         },
//         options: [
//           {
//             id: "25",
//             symbol: "A",
//             description: "She don't like apples.",
//           },
//           {
//             id: "26",
//             symbol: "B",
//             description: "She doesn't like apples.",
//           },
//           {
//             id: "27",
//             symbol: "C",
//             description: "She isn't like apples.",
//           },
//         ],
//       },
//       {
//         id: "10",
//         question: "What is the past tense of 'go'?",
//         audio: "https://example.com/audio/english.mp3",
//         type: {
//           id: "C",
//           name: "Choose the correct answer",
//         },
//         options: [
//           {
//             id: "28",
//             symbol: "A",
//             description: "goed",
//           },
//           {
//             id: "29",
//             symbol: "B",
//             description: "went",
//           },
//           {
//             id: "30",
//             symbol: "C",
//             description: "gone",
//           },
//         ],
//       },
//     ],
//   },
// ];
