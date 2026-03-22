'use client';

import dynamic from 'next/dynamic';

const EchoesMap = dynamic(() => import('@/components/EchoesMap'), {
  ssr: false,
  loading: () => (
    <div
      className="w-full h-full flex items-center justify-center"
      style={{ background: '#f0ede8' }}
    >
      <div className="w-8 h-8 rounded-full border border-black/10 border-t-black/30 animate-spin" />
    </div>
  ),
});

interface Props {
  onAcebClick?: () => void;
}

export default function MapShell({ onAcebClick }: Props) {
  return <EchoesMap onAcebClick={onAcebClick} />;
}
