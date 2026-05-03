import React, { useState } from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

import { VetHeader } from '@/components/vet/VetHeader';
import { VetStats } from '@/components/vet/VetStats';
import { VetTabs } from '@/components/vet/VetTabs';
import { VetAbout } from '@/components/vet/VetAbout';
import { VetAvailability } from '@/components/vet/VetAvailability';
import { VetReviews } from '@/components/vet/VetReviews';
import { BookButton } from '@/components/vet/BookButton';

const vet = {
  id: '1',
  firstName: 'Ross',
  lastName: 'David',
  experienceYears: 12,
  rating: 4.8,
  patientsCount: 1000,
  avatarUrl: 'https://i.pravatar.cc/150?img=12',
  about: 'Dedicated veterinarian focused on preventive care and animal wellbeing with over 12 years of experience. Passionate about providing the best care for your furry friends.',
  address: '123 Main Street, Seattle, WA 98101',
  clinicName: 'Seattle Pet Wellness Center',
  phoneNumber: '+1 (206) 555-0123',
  education: 'DVM - Cornell University College of Veterinary Medicine',
  languages: ['English', 'Spanish'],
};

export default function VetProfileScreen() {
  const { colors, spacing } = useTheme();
  const [tab, setTab] = useState<'about' | 'availability' | 'reviews'>('about');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    // Здесь загружаем данные с сервера
    await new Promise(resolve => setTimeout(resolve, 1500));
    setRefreshing(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background.secondary }}>
      <ScrollView
        contentContainerStyle={{
          padding: spacing.lg,
          paddingBottom: 120,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            tintColor={colors.primary.main}
            colors={[colors.primary.main]}
          />
        }
      >
        <VetHeader vet={vet} />
        <VetStats vet={vet} />
        <VetTabs active={tab} onChange={setTab} />

        {tab === 'about' && <VetAbout vet={vet} />}
        {tab === 'availability' && <VetAvailability />}
        {tab === 'reviews' && <VetReviews vetId={vet.id} />}
      </ScrollView>

      <BookButton vetId={vet.id} />
    </View>
  );
}