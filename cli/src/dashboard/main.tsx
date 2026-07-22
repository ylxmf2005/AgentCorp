import { createRoot } from 'react-dom/client';
import { App } from './app/App';

const container = document.getElementById('root');
if (!container) throw new Error('dashboard root element missing');

const root = createRoot(container);
root.render(<App />);
