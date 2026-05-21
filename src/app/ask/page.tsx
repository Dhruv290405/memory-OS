'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { AskMemoryChat } from '@/components/chat/AskMemory';

function AskContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q');

  return <AskMemoryChat key={initialQuery || 'default'} />;
}

export default function AskPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Ask MemoryOS</h1>
          <p className="text-sm text-white/40 mt-1">Query your organizational memory with AI-powered answers</p>
        </div>
        <Suspense fallback={<div className="text-white/40 text-sm">Loading...</div>}>
          <AskContent />
        </Suspense>
      </div>
    </AppShell>
  );
}
