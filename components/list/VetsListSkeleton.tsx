import React, { useEffect, useRef } from 'react';
import { View, FlatList, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/hooks/useTheme';

const ShimmerItem = ({ style }: { style: any }) => {
  const { colors } = useTheme();
  const shimmerValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmerAnimation = Animated.loop(
      Animated.timing(shimmerValue, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    );
    shimmerAnimation.start();
    return () => shimmerAnimation.stop();
  }, []);

  const translateX = shimmerValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-200, 200],
  });

  return (
    <View style={[style, { overflow: 'hidden', backgroundColor: colors.background.tertiary }]}>
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          transform: [{ translateX }],
        }}
      >
        <LinearGradient
          colors={[
            'transparent',
            'rgba(255,255,255,0.3)',
            'transparent',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ flex: 1 }}
        />
      </Animated.View>
    </View>
  );
};

const SkeletonItem = () => {
  const { colors, spacing } = useTheme();

  return (
    <View
      style={{
        backgroundColor: colors.card.default,
        borderRadius: 28,
        padding: 20, 
        marginBottom: 16,
        
       
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
      }}
    >
      <View style={{ flexDirection: 'row', gap: 16 }}>
        {/* Avatar skeleton - bigger */}
        <ShimmerItem
          style={{
            width: 90, 
            height: 90, 
            borderRadius: 45, 
          }}
        />
        
        {/* Info skeleton */}
        <View style={{ flex: 1, gap: 8 }}>
          {/* Name skeleton */}
          <ShimmerItem
            style={{
              width: '60%',
              height: 20,
              borderRadius: 8, 
            }}
          />
          {/* Specialty skeleton */}
          <ShimmerItem
            style={{
              width: '70%',
              height: 14,
              borderRadius: 8, 
            }}
          />
          {/* Clinic skeleton */}
          <ShimmerItem
            style={{
              width: '50%',
              height: 14,
              borderRadius: 8, 
            }}
          />
          {/* Address skeleton */}
          <ShimmerItem
            style={{
              width: '80%',
              height: 14,
              borderRadius: 8, 
            }}
          />
          {/* Price skeleton */}
          <ShimmerItem
            style={{
              width: '40%',
              height: 24,
              borderRadius: 8, 
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
        <ShimmerItem
          style={{
            width: '40%',
            height: 32,
            borderRadius: 8,
            marginBottom: 8,
          }}
        />
        <ShimmerItem
          style={{
            width: '30%',
            height: 16,
            borderRadius: 8,
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
        <ShimmerItem
          style={{
            flex: 1,
            height: 52, 
            borderRadius: 999, 
          }}
        />
        <ShimmerItem
          style={{
            width: 120,
            height: 52, 
            borderRadius: 999, 
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
            gap: 12, 
          }}
        >
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <ShimmerItem
              key={i}
              style={{
                width: 90, 
                height: 42, 
                borderRadius: 999, 
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
        <ShimmerItem
          style={{
            width: '40%',
            height: 14,
            borderRadius: 8,
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