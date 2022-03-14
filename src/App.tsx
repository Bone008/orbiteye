import { HashRouter } from 'react-router-dom';
import { Main } from './components/Main';

// Actual app layout is in Main.tsx so that router utils can be used
export default function App() {
  return (
    <HashRouter>
      <Main />
    </HashRouter>
  );
}
