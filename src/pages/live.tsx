import React from 'react';
import Head from 'next/head';
import AppShell from '../components/AppShell';
import StreamingPanel from '../components/dashboard/StreamingPanel';

function LiveStreamPage() {
  return (
    <>
      <Head>
        <title>Live Stream - iShareHow Labs</title>
        <link rel="canonical" href="https://ventures.isharehow.app/live" />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-0501888641420535"
          crossOrigin="anonymous"
        />
      </Head>
      <AppShell active="live">
        <StreamingPanel />
      </AppShell>
    </>
  );
}

export default LiveStreamPage;
