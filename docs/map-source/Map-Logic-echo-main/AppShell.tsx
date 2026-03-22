'use client';

import { useState } from 'react';
import MapShell from '@/components/MapShell';
import MapHUD from '@/components/MapHUD';
import AcebFlow from '@/components/AcebFlow';

export default function AppShell() {
  const [acebOpen, setAcebOpen] = useState(false);

  return (
    <>
      <MapShell onAcebClick={() => setAcebOpen(true)} />
      <MapHUD />
      {acebOpen && <AcebFlow onClose={() => setAcebOpen(false)} />}
    </>
  );
}
