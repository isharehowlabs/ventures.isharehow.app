import React from 'react';
import Head from 'next/head';
import AppShell from '../components/AppShell';
import GameLobby from '../components/lookupcafe/GameLobby';

function LookUpCafePage() {
  return (
    <>
      <Head>
        <title>LookUp Cafe - iShareHow Labs</title>
        <link rel="canonical" href="https://ventures.isharehow.app/lookupcafe" />
        <meta
          name="description"
          content="Join LookUp Cafe for interactive gaming and community activities."
        />
      </Head>
      <AppShell active="lookupcafe">
        <GameLobby />
      </AppShell>
    </>
  );
}

export default LookUpCafePage;
