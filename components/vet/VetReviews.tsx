import React, {
  useEffect,
  useState,
} from 'react';

import { Ionicons } from '@expo/vector-icons';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';

import { useTheme } from '@/hooks/useTheme';

import api from '@/services/api';

interface Review {
  reviewId: string;
  userFirstName: string;
  userLastName: string;
  userAvatarUrl?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface VetReviewsProps {
  vetId: number;
  type?: 'vet' | 'service';
}

export const VetReviews: React.FC<VetReviewsProps> = ({
  vetId,
  type = 'vet',
}) => {
  const { colors, spacing, typography } = useTheme();

  const [text, setText] = useState('');
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    loadReviews();
  }, [vetId]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const res = await api.get('/specialist-service/api/reviews', {
        params: {
          specialistId: vetId,
          specialistType: type === 'service' ? 'SERVICE_PROVIDER' : 'VET',
        },
      });

      const reviewsWithUsers = await Promise.all(
        res.data.map(async (review: any) => {
          try {
            const userRes = await api.get(
              '/pet-management/api/pet-owners/user/${review.userId}'
            );
            return {
              ...review,
              userFirstName: userRes.data.username || 'Anonymous',
              userLastName: userRes.data.lastName || '',
              userAvatarUrl: userRes.data.avatarUrl || null,
            };
          } catch {
            return {
              ...review,
              userFirstName: 'Anonymous',
              userLastName: '',
              userAvatarUrl: null,
            };
          }
        })
      );

      setReviews(reviewsWithUsers);
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!text.trim()) {
      return;
    }

    try {
      setPosting(true);
      await api.post('/specialist-service/api/reviews', {
        specialistId: Number(vetId),
        specialistType: type === 'service' ? 'SERVICE_PROVIDER' : 'VET',
        rating,
        comment: text,
      });
      setText('');
      setRating(5);
      await loadReviews();
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Failed to post review');
    } finally {
      setPosting(false);
    }
  };

  const renderReview = ({ item }: { item: Review }) => (
    <View
      style={{
        backgroundColor: colors.card.default,
        borderRadius: 24,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: colors.border.light,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        marginBottom: spacing.sm,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: spacing.sm,
        }}
      >
        <Image
          source={{
            uri: item.userAvatarUrl ||
              'https://cdn-icons-png.flaticon.com/512/149/149071.png',
          }}
          style={{
            width: 52,
            height: 52,
            borderRadius: 26,
            borderWidth: 2,
            borderColor: colors.primary.light,
          }}
        />

        <View
          style={{
            flex: 1,
            marginLeft: spacing.sm,
          }}
        >
          <Text
            style={[
              typography.body1SemiBold,
              { color: colors.text.primary },
            ]}
          >
            {item.userFirstName} {item.userLastName}
          </Text>

          <Text
            style={{
              fontSize: 12,
              color: colors.text.secondary,
              marginTop: 2,
            }}
          >
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', gap: 2 }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Ionicons
              key={star}
              name={star <= item.rating ? 'star' : 'star-outline'}
              size={16}
              color={star <= item.rating ? '#FFB800' : colors.icon.inactive}
            />
          ))}
        </View>
      </View>

      <Text
        style={[
          typography.body2,
          {
            color: colors.text.primary,
            lineHeight: 22,
          },
        ]}
      >
        {item.comment}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={{ padding: spacing.xl, alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary.main} />
      </View>
    );
  }

  return (
    <View style={{ gap: spacing.md }}>
      {/* 1. КРАСИВЫЙ ЗАГОЛОВОК С БЕЙДЖЕМ */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Text
          style={[
            typography.h4,
            { color: colors.text.primary },
          ]}
        >
          Отзывы
        </Text>

        <View
          style={{
            backgroundColor: colors.primary.light,
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 20,
          }}
        >
          <Text
            style={{
              color: colors.primary.dark,
              fontWeight: '600',
            }}
          >
            {reviews.length}
          </Text>
        </View>
      </View>

      {/* 2. ФОРМА ОТЗЫВА КАК КАРТОЧКА */}
      <View
        style={{
          backgroundColor: colors.card.default,
          borderRadius: 24,
          padding: spacing.md,
          borderWidth: 1,
          borderColor: colors.border.light,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 2,
        }}
      >
        <Text
          style={[
            typography.body2,
            {
              marginBottom: spacing.sm,
              color: colors.text.primary,
            },
          ]}
        >
          Ваша оценка
        </Text>

        {/* 3. ИКОНКИ ВМЕСТО ТЕКСТОВЫХ ЗВЁЗД */}
        <View
          style={{
            flexDirection: 'row',
            gap: spacing.sm,
            marginBottom: spacing.md,
          }}
        >
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity
              key={star}
              onPress={() => setRating(star)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={star <= rating ? 'star' : 'star-outline'}
                size={32}
                color="#FFB800"
              />
            </TouchableOpacity>
          ))}
        </View>

        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Напишите ваш отзыв..."
          placeholderTextColor={colors.text.tertiary}
          multiline
          numberOfLines={4}
          style={{
            backgroundColor: colors.input.background,
            borderRadius: 12,
            padding: spacing.sm,
            minHeight: 100,
            textAlignVertical: 'top',
            color: colors.text.primary,
            borderWidth: 1,
            borderColor: colors.input.border,
          }}
        />

        <TouchableOpacity
          disabled={posting}
          onPress={handleSubmit}
          style={{
            backgroundColor: colors.primary.main,
            padding: spacing.sm,
            borderRadius: 12,
            alignItems: 'center',
            marginTop: spacing.md,
            opacity: posting ? 0.7 : 1,
          }}
        >
          {posting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text
              style={[
                typography.button,
                { color: colors.text.inverse },
              ]}
            >
              Оставить отзыв
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* 4. КРАСИВОЕ ПУСТОЕ СОСТОЯНИЕ */}
      {!reviews.length && !loading && (
        <View
          style={{
            alignItems: 'center',
            paddingVertical: spacing.xl,
          }}
        >
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={48}
            color={colors.text.tertiary}
          />

          <Text
            style={[
              typography.body2,
              {
                color: colors.text.secondary,
                marginTop: spacing.sm,
              },
            ]}
          >
            Пока нет отзывов
          </Text>

          <Text
            style={[
              typography.caption,
              {
                color: colors.text.tertiary,
                marginTop: spacing.xs,
              },
            ]}
          >
            Станьте первым, кто оставит отзыв
          </Text>
        </View>
      )}

      {/* СПИСОК ОТЗЫВОВ */}
      <FlatList
        data={reviews}
        renderItem={renderReview}
        keyExtractor={(item) => item.reviewId}
        scrollEnabled={false}
        contentContainerStyle={{
          gap: spacing.sm,
        }}
      />
    </View>
  );
};