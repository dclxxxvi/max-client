import { useState } from 'react';
import type { Credentials } from './api';
import { LoginScreen, Messenger } from './components';
import './App.css';

const CREDENTIALS_KEY = 'max-client:credentials';

function loadCredentials(): Credentials | null {
  try {
    const saved = localStorage.getItem(CREDENTIALS_KEY);
    return saved ? (JSON.parse(saved) as Credentials) : null;
  } catch {
    return null;
  }
}

function App() {
  const [credentials, setCredentials] = useState(loadCredentials);

  const login = (value: Credentials) => {
    try {
      localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(value));
    } catch {
      // без сохранения сессии
    }
    setCredentials(value);
  };

  const logout = () => {
    try {
      localStorage.removeItem(CREDENTIALS_KEY);
    } catch {
      // ignore
    }
    setCredentials(null);
  };

  return credentials ? <Messenger credentials={credentials} onLogout={logout} /> : <LoginScreen onLogin={login} />;
}

export default App;
