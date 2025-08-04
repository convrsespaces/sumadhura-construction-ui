'use client';

import React, { Suspense } from 'react';
import ConstructionEventsManager from '@/components/ConstructionEventsManager';

export default function LeadsPage() {
  return (
    <Suspense fallback={<div>Loading leads...</div>}>
      <ConstructionEventsManager />
    </Suspense>
  );
} 