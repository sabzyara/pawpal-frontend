import React from 'react';
import { View, FlatList } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

const SkeletonItem = () => {
  const { colors, spacing } = useTheme();

  return (
    <View
      style={{
        backgroundColor: colors.card.default,
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
      }}
    >
      <View style={{ flexDirection: 'row', gap: 16 }}>
        {/* Avatar skeleton */}
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: colors.background.tertiary,
          }}
        />
        
        {/* Info skeleton */}
        <View style={{ flex: 1, gap: 8 }}>
          {/* Name skeleton */}
          <View
            style={{
              width: '60%',
              height: 20,
              borderRadius: 4,
              backgroundColor: colors.background.tertiary,
            }}
          />
          {/* Specialty skeleton */}
          <View
            style={{
              width: '70%',
              height: 14,
              borderRadius: 4,
              backgroundColor: colors.background.tertiary,
            }}
          />
          {/* Clinic skeleton */}
          <View
            style={{
              width: '50%',
              height: 14,
              borderRadius: 4,
              backgroundColor: colors.background.tertiary,
            }}
          />
          {/* Address skeleton */}
          <View
            style={{
              width: '80%',
              height: 14,
              borderRadius: 4,
              backgroundColor: colors.background.tertiary,
            }}
          />
          {/* Price skeleton */}
          <View
            style={{
              width: '40%',
              height: 24,
              borderRadius: 4,
              backgroundColor: colors.background.tertiary,
              marginTop: 4,
            }}
          />
        </View>
      </View>
    </View>
  );
};

export const VetsListSkeleton = () => {
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background.secondary }}>
      {/* Header skeleton */}
      <View
        style={{
          paddingTop: 60,
          paddingHorizontal: 20,
          paddingBottom: 16,
          backgroundColor: colors.background.primary,
          borderBottomWidth: 1,
          borderBottomColor: colors.border.light,
        }}
      >
        <View
          style={{
            width: '40%',
            height: 32,
            borderRadius: 8,
            backgroundColor: colors.background.tertiary,
            marginBottom: 8,
          }}
        />
        <View
          style={{
            width: '30%',
            height: 16,
            borderRadius: 8,
            backgroundColor: colors.background.tertiary,
          }}
        />
      </View>

      {/* Search bar skeleton */}
      <View
        style={{
          flexDirection: 'row',
          gap: 12,
          paddingHorizontal: 20,
          paddingVertical: 16,
          backgroundColor: colors.background.primary,
        }}
      >
        <View
          style={{
            flex: 1,
            height: 48,
            borderRadius: 14,
            backgroundColor: colors.background.tertiary,
          }}
        />
        <View
          style={{
            width: 100,
            height: 48,
            borderRadius: 14,
            backgroundColor: colors.background.tertiary,
          }}
        />
      </View>

      {/* Filters skeleton */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingVertical: 12,
          backgroundColor: colors.background.primary,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            gap: 10,
          }}
        >
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <View
              key={i}
              style={{
                width: 80,
                height: 40,
                borderRadius: 30,
                backgroundColor: colors.background.tertiary,
              }}
            />
          ))}
        </View>
      </View>

      {/* Results count skeleton */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingVertical: 8,
          backgroundColor: colors.background.tertiary,
        }}
      >
        <View
          style={{
            width: '40%',
            height: 14,
            borderRadius: 4,
            backgroundColor: colors.background.secondary,
          }}
        />
      </View>

      {/* List skeletons */}
      <FlatList
        data={[1, 2, 3, 4]}
        keyExtractor={(item) => item.toString()}
        renderItem={() => <SkeletonItem />}
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};