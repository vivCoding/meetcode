export type CodeSnippet = {
  langSlug: string
  lang: string
  code: string
}

export type Question = {
  title: string
  titleSlug: string
  questionId: string
  difficulty: string
  likes: number
  dislikes: number
  content: string
  hints: string[]
  exampleTestcaseList: string[]
  codeSnippets: Record<string, CodeSnippet>
  // unsure what this is (yet)
  mysqlSchemas: any
}

export type QuestionSearchResult = {
  title: string
  titleSlug: string
  questionId: string
}
