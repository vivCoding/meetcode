import Head from "next/head"

type HelmetProps = {
  title: string
}

const Helment = ({ title }: HelmetProps) => {
  return (
    <Head>
      <title key="title">{title}</title>
      <meta name="title" content="TernarySearch" />
      <meta
        name="description"
        content="TernarySearch is basically multiplayer LeetCode"
      />
    </Head>
  )
}

export default Helment
