import React from 'react';
import AppShell from '../components/AppShell';
import GameLobby from '../components/lookupcafe/GameLobby';

function LookUpCafePage() {
  return (
    <AppShell active="lookupcafe">
      <GameLobby />
    </AppShell>
  );
}

export default LookUpCafePage;
