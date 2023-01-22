import Head from "next/head"

type HelmetProps = {
  title: string
}

const Helmet = ({ title }: HelmetProps) => {
  return (
    <Head>
      <title key="title">{title}</title>
      <meta name="title" content="MeetCode" />
      <meta
        name="description"
        content="MeetCode: A collaborate platform to learn LeetCode problems"
      />
    </Head>
  )
}

export default Helmet
