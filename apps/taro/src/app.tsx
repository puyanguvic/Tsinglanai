import { PropsWithChildren, useEffect } from 'react';
import './app.css';

function App({ children }: PropsWithChildren) {
  useEffect(() => {
    // place global init here if needed
  }, []);

  return children;
}

export default App;
