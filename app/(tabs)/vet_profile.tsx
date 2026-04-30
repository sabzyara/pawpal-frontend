import React, { useState } from 'react';
import { View, ScrollView } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

import { Veterinarian } from '@/types/veterinarian';
import { VetHeader } from '@/components/vet/VetHeader';
import { VetStats } from '@/components/vet/VetStats';
import { VetTabs } from '@/components/vet/VetTabs';
import { VetAbout } from '@/components/vet/VetAbout';
import { VetAvailability } from '@/components/vet/VetAvailability';
import { BookButton } from '@/components/vet/BookButton';

const mockVet: Veterinarian = {
  id: 1,
  firstName: 'Aruzhan',
  lastName: 'Bekova',
  experienceYears: 6,
  rating: 4.8,
  patientsCount: 540,
  about: 'Experienced veterinarian specializing in small animals and preventive care.',
  avatarUrl: 'https://i.pravatar.cc/150?img=5',
  clinicName: 'Almaty Pet Clinic',
};

export const VetProfileScreen = () => {
  const { colors, spacing } = useTheme();
  const [tab, setTab] = useState<'about' | 'availability' | 'reviews'>('about');

  return (
    <View style={{ flex: 1, backgroundColor: colors.background.primary }}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <VetHeader vet={mockVet} />
        <VetStats vet={mockVet} />
        <VetTabs active={tab} onChange={setTab} />

        {tab === 'about' && <VetAbout text={mockVet.about} />}
        {tab === 'availability' && <VetAvailability />}
      </ScrollView>

      <BookButton />
    </View>
  );
};