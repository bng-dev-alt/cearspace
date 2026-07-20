import React from 'react';

interface BoardPanelProps {
  children: React.ReactNode;
  projectName: string;
}

export default function BoardPanel({ children, projectName }: BoardPanelProps) {
  return (
    <div className="board-panel-card">
      <div className="board-panel-header">
        <div className="panel-header-left">
          <span className="panel-subtitle">YOUR WORKSPACE</span>
          <h2 className="panel-title">{projectName}</h2>
        </div>
        <div className="panel-header-right">
          <span className="live-status-dot" />
          <span className="live-status-text">Live board</span>
        </div>
      </div>

      <main className="board-container" data-testid="board-container">
        {children}
      </main>
    </div>
  );
}
