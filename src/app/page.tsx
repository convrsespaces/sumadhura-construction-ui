'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import UserRegistrationForm from '@/components/ConstructionProgressUI';

export default function HomePage() {
  const router = useRouter();

  const handleLeadCreated = (leadId: string, salesPersonId: string) => {
    // Navigate to leads page with the specific sales person selected
    router.push(`/leads?salesPersonId=${salesPersonId}&leadId=${leadId}`);
  };

  return (
    <div>
      {/* @ts-expect-error: onLeadCreated is a required prop for UserRegistrationForm */}
      <UserRegistrationForm onLeadCreated={handleLeadCreated} />
    </div>
  );
} 