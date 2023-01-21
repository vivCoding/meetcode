import axios from "axios"

import type {
  CodeSnippet,
  Question as QuestionType,
} from "@/types/leetcode/question"

// Gets specific question given slug
export async function pickQuestion(
  questionSlug: string
): Promise<QuestionType | undefined> {
  try {
    // eslint-disable-next-line no-var
    var res = await axios.post(
      "https://leetcode.com/graphql/",
      {
        query: `
        query questionContent($titleSlug: String!) {
          question(titleSlug: $titleSlug) {
              title
              titleSlug
              questionId
              questionFrontendId
              isPaidOnly
              difficulty
              likes
              dislikes
              acRate
  
              content
              hints
  
              exampleTestcaseList
              codeSnippets {
                  langSlug
                  lang
                  code
              }
              mysqlSchemas
          }
        }
      `,
        variables: {
          titleSlug: questionSlug,
        },
      },
      {
        headers: {
          Referer: `https://leetcode.com/problems/${questionSlug}/`,
          // https://github.com/axios/axios/issues/5346
          "Accept-Encoding": "gzip,deflate,compress",
        },
      }
    )
  } catch (e) {
    console.log("bad axios", e)
    return undefined
  }

  if (res.status !== 200) {
    console.error("bad pickQuestion", res.status)
    return undefined
  }

  const question = res.data?.data?.question
  const newCodeSnippets: Record<string, CodeSnippet> = {}
  question.codeSnippets.forEach((snippet: CodeSnippet) => {
    newCodeSnippets[snippet.langSlug] = snippet
  })
  question.codeSnippets = newCodeSnippets
  return question
}

export async function pickRandomQuestion(
  difficulty: string,
  topic: string[],
  listId: string
): Promise<QuestionType | undefined> {
  const filters: Record<string, any> = {}
  if (
    difficulty &&
    ["EASY", "MEDIUM", "HARD"].includes(difficulty.toUpperCase())
  ) {
    filters["difficulty"] = difficulty.toUpperCase()
  }
  if (topic) filters["tags"] = topic
  if (listId) filters["listId"] = listId

  // pick random until we get a free (non-premium) question
  do {
    // eslint-disable-next-line no-var
    var res = await axios.post("https://leetcode.com/graphql/", {
      query: `
        query randomQuestion($categorySlug: String, $filters: QuestionListFilterInput) {
          randomQuestion(categorySlug: $categorySlug, filters: $filters) {
            title
            titleSlug
            questionId
            questionFrontendId
            isPaidOnly
            difficulty
            likes
            dislikes
            acRate

            content
            hints

            exampleTestcaseList
            codeSnippets {
                langSlug
                lang
                code
            }
            mysqlSchemas
          }
        }
      `,
      variables: {
        categorySlug: "",
        filters,
      },
    })

    if (res.status !== 200) {
      console.error("bad pickRandomQuestion", res.status)
      return undefined
    }
  } while (res.data?.data.randomQuestion.isPaidOnly)

  const question = res.data?.data?.randomQuestion
  const newCodeSnippets: Record<string, CodeSnippet> = {}
  question.codeSnippets.forEach((snippet: CodeSnippet) => {
    newCodeSnippets[snippet.langSlug] = snippet
  })
  question.codeSnippets = newCodeSnippets
  return question
}
