
import React from 'react';

interface HeaderProps {
  title: string;
}

export const Header: React.FC<HeaderProps> = ({ title }) => {
  return (
    <header className="bg-slate-900 shadow-md p-4">
      <h1 className="text-2xl font-semibold text-cyan-400">{title}</h1>
    </header>
  );
};
