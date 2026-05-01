const mongoose = require("mongoose");
require("dotenv").config();

const TechnicalQuestion = require("../models/TechnicalQuestion");

const questions = [

{
  title: "Reverse String",
  description: "Given a string, return the reversed string.",
  difficulty: "easy",
  sampleInput: "hello",
  sampleOutput: "olleh",

  solution: {
    python: `# Reverse String
s = input().strip()
print(s[::-1])`
  },

  visibleTestCases: [
    { input: "hello", expectedOutput: "olleh" },
    { input: "world", expectedOutput: "dlrow" }
  ],

  hiddenTestCases: [
    { input: "placementor", expectedOutput: "rotnemecalp" }
  ]
},

{
  title: "Palindrome Check",
  description: "Given a string, check whether it is a palindrome.",
  difficulty: "easy",
  sampleInput: "madam",
  sampleOutput: "true",

  solution: {
    python: `# Palindrome Check
s = input().strip()
print(str(s == s[::-1]).lower())`
  },

  visibleTestCases: [
    { input: "madam", expectedOutput: "true" },
    { input: "hello", expectedOutput: "false" }
  ],

  hiddenTestCases: [
    { input: "racecar", expectedOutput: "true" }
  ]
},

{
  title: "Factorial of a Number",
  description: "Given a number n, return the factorial of n.",
  difficulty: "medium",
  sampleInput: "5",
  sampleOutput: "120",

  solution: {
    python: `# Factorial
n = int(input())
fact = 1
for i in range(1, n+1):
    fact *= i
print(fact)`
  },

  visibleTestCases: [
    { input: "5", expectedOutput: "120" },
    { input: "3", expectedOutput: "6" }
  ],

  hiddenTestCases: [
    { input: "7", expectedOutput: "5040" }
  ]
},

{
  title: "Find Second Largest Element",
  description: "Given an array, find the second largest element.",
  difficulty: "medium",
  sampleInput: "5\n1 2 3 4 5",
  sampleOutput: "4",

  solution: {
    python: `# Second Largest
n = int(input())
arr = list(map(int, input().split()))
arr = list(set(arr))
arr.sort()
print(arr[-2])`
  },

  visibleTestCases: [
    { input: "5\n1 2 3 4 5", expectedOutput: "4" }
  ],

  hiddenTestCases: [
    { input: "6\n5 1 9 3 7 9", expectedOutput: "7" }
  ]
},

{
  title: "Check Anagram",
  description: "Check if two strings are anagrams.",
  difficulty: "medium",
  sampleInput: "listen\nsilent",
  sampleOutput: "true",

  solution: {
    python: `# Anagram
a = input().strip()
b = input().strip()
print(str(sorted(a) == sorted(b)).lower())`
  },

  visibleTestCases: [
    { input: "listen\nsilent", expectedOutput: "true" }
  ],

  hiddenTestCases: [
    { input: "triangle\nintegral", expectedOutput: "true" }
  ]
},

{
  title: "Count Vowels in a String",
  description: "Count number of vowels in string.",
  difficulty: "medium",
  sampleInput: "placementor",
  sampleOutput: "4",

  solution: {
    python: `# Count Vowels
s = input().lower()
count = sum(1 for ch in s if ch in "aeiou")
print(count)`
  },

  visibleTestCases: [
    { input: "hello", expectedOutput: "2" }
  ],

  hiddenTestCases: [
    { input: "education", expectedOutput: "5" }
  ]
},

{
  title: "Sum of Digits",
  description: "Return sum of digits of a number.",
  difficulty: "medium",
  sampleInput: "1234",
  sampleOutput: "10",

  solution: {
    python: `# Sum of Digits
n = input().strip()
print(sum(int(d) for d in n))`
  },

  visibleTestCases: [
    { input: "1234", expectedOutput: "10" }
  ],

  hiddenTestCases: [
    { input: "9999", expectedOutput: "36" }
  ]
},

{
  title: "Fibonacci Number",
  description: "Return nth Fibonacci number.",
  difficulty: "medium",
  sampleInput: "6",
  sampleOutput: "8",

  solution: {
    python: `# Fibonacci
n = int(input())
a, b = 0, 1
for _ in range(n):
    a, b = b, a + b
print(a)`
  },

  visibleTestCases: [
    { input: "6", expectedOutput: "8" }
  ],

  hiddenTestCases: [
    { input: "7", expectedOutput: "13" }
  ]
},

{
  title: "Check Prime Number",
  description: "Check if number is prime.",
  difficulty: "medium",
  sampleInput: "7",
  sampleOutput: "true",

  solution: {
    python: `# Prime Check
n = int(input())
if n < 2:
    print("false")
else:
    for i in range(2, int(n**0.5)+1):
        if n % i == 0:
            print("false")
            break
    else:
        print("true")`
  },

  visibleTestCases: [
    { input: "7", expectedOutput: "true" }
  ],

  hiddenTestCases: [
    { input: "10", expectedOutput: "false" }
  ]
},

{
  title: "Reverse Words in a Sentence",
  description: "Reverse order of words.",
  difficulty: "medium",
  sampleInput: "hello world",
  sampleOutput: "world hello",

  solution: {
    python: `# Reverse Words
s = input().split()
print(" ".join(s[::-1]))`
  },

  visibleTestCases: [
    { input: "hello world", expectedOutput: "world hello" }
  ],

  hiddenTestCases: [
    { input: "i love coding", expectedOutput: "coding love i" }
  ]
},

{
  title: "Find Missing Number",
  description: "Find missing number in 0 to n.",
  difficulty: "medium",
  sampleInput: "5\n0 1 2 4 5",
  sampleOutput: "3",

  solution: {
    python: `# Missing Number
n = int(input())
arr = list(map(int, input().split()))
print(sum(range(n+1)) - sum(arr))`
  },

  visibleTestCases: [
    { input: "5\n0 1 2 4 5", expectedOutput: "3" }
  ],

  hiddenTestCases: [
    { input: "4\n0 2 3 4", expectedOutput: "1" }
  ]
},

{
  title: "Remove Duplicates from String",
  description: "Remove duplicate characters.",
  difficulty: "medium",
  sampleInput: "programming",
  sampleOutput: "progamin",

  solution: {
    python: `# Remove Duplicates
s = input()
res = ""
for ch in s:
    if ch not in res:
        res += ch
print(res)`
  },

  visibleTestCases: [
    { input: "hello", expectedOutput: "helo" }
  ],

  hiddenTestCases: [
    { input: "placementor", expectedOutput: "placmentor" }
  ]
}

];

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB Connected");

    await TechnicalQuestion.deleteMany();
    await TechnicalQuestion.insertMany(questions);

    console.log("Questions Inserted ✅");
    process.exit();
  })
  .catch(err => console.log(err));