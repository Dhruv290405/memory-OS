import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MemoryOS — AI Organizational Memory',
  description: 'Local-first AI platform for organizational memory, decisions, timelines, and knowledge graphs.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>
        <script dangerouslySetInnerHTML={{
          __html: `fetch('/api/init').catch(() => {})`,
        }} />
        {children}
      </body>
    </html>
  );
}
