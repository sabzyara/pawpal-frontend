import React, {
  useEffect,
  useState,
} from 'react';

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

export const VetReviews: React.FC<
  VetReviewsProps
> = ({
  vetId,
  type = 'vet',
}) => {
  const {
    colors,
    spacing,
    typography,
  } = useTheme();

  const [text, setText] =
    useState('');

  const [rating, setRating] =
    useState(5);

  const [loading, setLoading] =
    useState(true);

  const [posting, setPosting] =
    useState(false);

  const [reviews, setReviews] =
    useState<Review[]>([]);

  useEffect(() => {
    loadReviews();
  }, [vetId]);

  const loadReviews = async () => {
  try {
    setLoading(true);

    const res = await api.get(
      '/specialist-service/api/reviews',
      {
        params: {
          specialistId: vetId,

          specialistType:
            type === 'service'
              ? 'SERVICE_PROVIDER'
              : 'VET',
        },
      }
    );

    const reviewsWithUsers =
      await Promise.all(
        res.data.map(
          async (review: any) => {
            try {
              const userRes =
                await api.get(
                  `/pet-management/api/pet-owners/user/${review.userId}`
                );

              return {
                ...review,

                userFirstName:
                  userRes.data.username ||
                  'Anonymous',


                userAvatarUrl:
                  userRes.data.avatarUrl ||
                  null,
              };
            } catch {
              return {
                ...review,

                userFirstName:
                  'Anonymous',

                userLastName: '',

                userAvatarUrl:
                  null,
              };
            }
          }
        )
      );

    setReviews(
      reviewsWithUsers
    );

  } catch (error) {
    console.log(error);

    Alert.alert(
      'Error',
      'Failed to load reviews'
    );
  } finally {
    setLoading(false);
  }
};

  const handleSubmit =
    async () => {
      if (!text.trim()) {
        return;
      }

      try {
        setPosting(true);

        await api.post(
          '/specialist-service/api/reviews',
          {
            specialistId:
              Number(vetId),

            specialistType:
              type === 'service'
                ? 'SERVICE_PROVIDER'
                : 'VET',

            rating,

            comment: text,
          }
        );

        setText('');

        setRating(5);

        await loadReviews();

      } catch (error) {
        console.log(error);

        Alert.alert(
          'Error',
          'Failed to post review'
        );
      } finally {
        setPosting(false);
      }
    };

  const renderReview = ({
    item,
  }: {
    item: Review;
  }) => (
    <View
      style={{
        backgroundColor:
          colors.card.default,

        padding: spacing.md,

        borderRadius: 16,

        marginBottom:
          spacing.sm,

        ...(colors.card.default ===
          '#FFFFFF' && {
          shadowColor: '#000',

          shadowOffset: {
            width: 0,
            height: 1,
          },

          shadowOpacity: 0.05,

          shadowRadius: 2,

          elevation: 1,
        }),
      }}
    >
      <View
        style={{
          flexDirection: 'row',

          alignItems: 'center',

          marginBottom:
            spacing.sm,
        }}
      >
        <Image
          source={{
            uri:
              item.userAvatarUrl ||
              'https://cdn-icons-png.flaticon.com/512/149/149071.png',
          }}
          style={{
            width: 40,

            height: 40,

            borderRadius: 20,

            marginRight:
              spacing.sm,
          }}
        />

        <View style={{ flex: 1 }}>
          <Text
            style={[
              typography.body2SemiBold,
              {
                color:
                  colors.text
                    .primary,
              },
            ]}
          >
            {
              item.userFirstName
            }{' '}
            {
              item.userLastName
            }
          </Text>

          <Text
            style={{
              fontSize: 11,

              color:
                colors.text
                  .tertiary,
            }}
          >
            {new Date(
              item.createdAt
            ).toLocaleDateString()}
          </Text>
        </View>

        <View
          style={{
            flexDirection:
              'row',

            gap: 2,
          }}
        >
          {[1, 2, 3, 4, 5].map(
            (star) => (
              <Text
                key={star}
                style={{
                  fontSize: 14,

                  color:
                    star <=
                    item.rating
                      ? '#FFB800'
                      : '#E0E0E0',
                }}
              >
                ★
              </Text>
            )
          )}
        </View>
      </View>

      <Text
        style={[
          typography.body2,
          {
            color:
              colors.text
                .primary,
          },
        ]}
      >
        {item.comment}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View
        style={{
          padding: 40,

          alignItems:
            'center',
        }}
      >
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View
      style={{
        gap: spacing.md,
      }}
    >
      <Text
        style={[
          typography.h4,
          {
            color:
              colors.text
                .primary,
          },
        ]}
      >
        Reviews (
        {reviews.length})
      </Text>

      {/* CREATE REVIEW */}
      <View
        style={{
          backgroundColor:
            colors.input
              .background,

          borderRadius: 16,

          padding: spacing.md,

          borderWidth: 1,

          borderColor:
            colors.border.light,
        }}
      >
        <Text
          style={[
            typography.body2,
            {
              marginBottom:
                spacing.sm,

              color:
                colors.text
                  .primary,
            },
          ]}
        >
          Your Rating
        </Text>

        <View
          style={{
            flexDirection:
              'row',

            gap: 8,

            marginBottom:
              spacing.md,
          }}
        >
          {[1, 2, 3, 4, 5].map(
            (star) => (
              <TouchableOpacity
                key={star}
                onPress={() =>
                  setRating(
                    star
                  )
                }
              >
                <Text
                  style={{
                    fontSize: 28,

                    color:
                      star <=
                      rating
                        ? '#FFB800'
                        : '#E0E0E0',
                  }}
                >
                  ★
                </Text>
              </TouchableOpacity>
            )
          )}
        </View>

        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Write your review..."
          placeholderTextColor={
            colors.text
              .tertiary
          }
          multiline
          numberOfLines={4}
          style={{
            backgroundColor:
              colors
                .background
                .primary,

            borderRadius: 12,

            padding:
              spacing.sm,

            minHeight: 100,

            textAlignVertical:
              'top',

            color:
              colors.text
                .primary,

            borderWidth: 1,

            borderColor:
              colors.border
                .light,
          }}
        />

        <TouchableOpacity
          disabled={posting}
          onPress={
            handleSubmit
          }
          style={{
            backgroundColor:
              colors.primary
                .main,

            padding:
              spacing.sm,

            borderRadius: 12,

            alignItems:
              'center',

            marginTop:
              spacing.sm,

            opacity:
              posting
                ? 0.7
                : 1,
          }}
        >
          {posting ? (
            <ActivityIndicator
              color="#fff"
            />
          ) : (
            <Text
              style={[
                typography.button,
                {
                  color:
                    colors
                      .text
                      .inverse,
                },
              ]}
            >
              Post Review
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* EMPTY */}
      {!reviews.length && (
        <Text
          style={[
            typography.body2,
            {
              color:
                colors.text
                  .secondary,

              textAlign:
                'center',
            },
          ]}
        >
          No reviews yet
        </Text>
      )}

      {/* LIST */}
      <FlatList
        data={reviews}
        renderItem={
          renderReview
        }
        keyExtractor={(
          item
        ) =>
          item.reviewId
        }
        scrollEnabled={false}
        contentContainerStyle={{
          gap: spacing.sm,
        }}
      />
    </View>
  );
};