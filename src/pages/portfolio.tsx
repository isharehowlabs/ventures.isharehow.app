// UNIQUE_BUILD_TEST_2025_OCT_24_V3
import Head from 'next/head';
import AppShell from '../components/AppShell';
import ContentLibraryView from '../components/ContentLibraryView';

function OurPortfolioPage() {
  return (
    <>
      <Head>
        <title>Portfolio - iShareHow Labs</title>
        <link rel="canonical" href="https://ventures.isharehow.app/portfolio" />
        <meta
          name="description"
          content="View our portfolio of creative work, projects, and content library."
        />
      </Head>
      <AppShell active="content">
        <ContentLibraryView />
      </AppShell>
    </>
  );
}

export default OurPortfolioPage;

