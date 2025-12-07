import React, { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import './MainLayout.css';

interface MainLayoutProps {
  children: ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
  onSave?: () => void;
  onSaveAndClose?: () => void;
}

export default function MainLayout({
  children,
  showHeader = true,
  showFooter = true,
  onSave,
  onSaveAndClose,
}: MainLayoutProps) {
  return (
    <div className="main-layout">
      {showHeader && <Header onSave={onSave} onSaveAndClose={onSaveAndClose} />}
      <main className="main-content">{children}</main>
      {showFooter && <Footer />}
    </div>
  );
}
