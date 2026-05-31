import React from 'react';

export default function Layout({ children }) {
  return (
    <div className="app-root">
      <header className="app-header">
        <h1>Finance App</h1>
      </header>
      <main className="app-main">{children}</main>
    </div>
  );
}
