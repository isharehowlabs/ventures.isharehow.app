import AppShell from '../components/AppShell';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import Web3Panel from '../components/dashboard/Web3Panel';

function App() {
  return (
    <ProtectedRoute>
      <AppShell active="web3">
        <Web3Panel />
      </AppShell>
    </ProtectedRoute>
  );
}

export default App;
