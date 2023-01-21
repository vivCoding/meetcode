import axios from "axios"

import type { QuestionSearchResult } from "@/types/leetcode/question"

// Returns list of questions given filters. Amount of results is set by pageLimit, and starts at page 0
export async function searchQuestions(
  keyword?: string,
  difficulty?: string,
  topic?: string[],
  listId?: string,
  pageLimit = 50,
  page = 0
): Promise<QuestionSearchResult[] | undefined> {
  const filters: Record<string, unknown> = {}
  if (keyword) filters["searchKeywords"] = keyword
  if (
    difficulty &&
    ["EASY", "MEDIUM", "HARD"].includes(difficulty.toUpperCase())
  ) {
    filters["difficulty"] = difficulty.toUpperCase()
  }
  if (topic) filters["tags"] = topic
  if (listId) filters["listId"] = listId
  const res = await axios.post("https://leetcode.com/graphql/", {
    query: `
        query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
          problemsetQuestionList: questionList(
              categorySlug: $categorySlug
              limit: $limit
              skip: $skip
              filters: $filters
          ) {
                  total: totalNum
                  questions: data {
                      paidOnly: isPaidOnly
                      title
                      titleSlug
                      questionId
                  }
              }
          }
      `,
    variables: {
      categorySlug: "",
      filters,
      limit: pageLimit,
      skip: page * pageLimit,
    },
  })

  if (res.status !== 200) {
    console.error("lc bad searchQuestion", res.status)
    return undefined
  }

  return res.data
}
