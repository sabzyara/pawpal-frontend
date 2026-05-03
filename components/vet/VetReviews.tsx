import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, FlatList } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

interface Review {
  id: string;
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  date: string;
}

interface VetReviewsProps {
  vetId: string;
}

export const VetReviews: React.FC<VetReviewsProps> = ({ vetId }) => {
  const { colors, spacing, typography } = useTheme();
  const [text, setText] = useState('');
  const [rating, setRating] = useState(5);
  const [reviews, setReviews] = useState<Review[]>([
    {
      id: '1',
      userName: 'Sarah Johnson',
      userAvatar: 'https://i.pravatar.cc/100?img=1',
      rating: 5,
      comment: 'Dr. Ross is amazing! Very professional and caring with my dog. Highly recommend!',
      date: '2 days ago',
    },
    {
      id: '2',
      userName: 'Mike Peterson',
      userAvatar: 'https://i.pravatar.cc/100?img=2',
      rating: 4,
      comment: 'Great experience, the staff was friendly and helpful.',
      date: '1 week ago',
    },
    {
      id: '3',
      userName: 'Emily Chen',
      userAvatar: 'https://i.pravatar.cc/100?img=3',
      rating: 5,
      comment: 'Best vet in town! Took great care of my cat.',
      date: '2 weeks ago',
    },
  ]);

  const handleSubmit = () => {
    if (!text.trim()) return;
    const newReview: Review = {
      id: Date.now().toString(),
      userName: 'You',
      userAvatar: 'https://i.pravatar.cc/100?img=4',
      rating,
      comment: text,
      date: 'Just now',
    };
    setReviews([newReview, ...reviews]);
    setText('');
    setRating(5);
  };

  const renderReview = ({ item }: { item: Review }) => (
    <View style={{ 
      backgroundColor: colors.card.default, 
      padding: spacing.md, 
      borderRadius: 16, 
      marginBottom: spacing.sm,
      ...(colors.card.default === '#FFFFFF' && {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
      }),
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }}>
        <Image 
          source={{ uri: item.userAvatar }} 
          style={{ width: 40, height: 40, borderRadius: 20, marginRight: spacing.sm }} 
        />
        <View style={{ flex: 1 }}>
          <Text style={[typography.body2SemiBold, { color: colors.text.primary }]}>
            {item.userName}
          </Text>
          <Text style={{ fontSize: 11, color: colors.text.tertiary }}>
            {item.date}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 2 }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Text key={star} style={{ fontSize: 14, color: star <= item.rating ? '#FFB800' : '#E0E0E0' }}>
              ★
            </Text>
          ))}
        </View>
      </View>
      <Text style={[typography.body2, { color: colors.text.primary }]}>
        {item.comment}
      </Text>
    </View>
  );

  return (
    <View style={{ gap: spacing.md }}>
      <Text style={[typography.h4, { color: colors.text.primary }]}>
        Reviews ({reviews.length})
      </Text>

      {/* Write review section */}
      <View style={{ 
        backgroundColor: colors.input.background, 
        borderRadius: 16, 
        padding: spacing.md,
        borderWidth: 1,
        borderColor: colors.border.light,
      }}>
        <Text style={[typography.body2, { marginBottom: spacing.sm, color: colors.text.primary }]}>
          Your Rating
        </Text>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: spacing.md }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity key={star} onPress={() => setRating(star)}>
              <Text style={{ fontSize: 28, color: star <= rating ? '#FFB800' : '#E0E0E0' }}>
                ★
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Write your review..."
          placeholderTextColor={colors.text.tertiary}
          multiline
          numberOfLines={4}
          style={{
            backgroundColor: colors.background.primary,
            borderRadius: 12,
            padding: spacing.sm,
            minHeight: 100,
            textAlignVertical: 'top',
            color: colors.text.primary,
            borderWidth: 1,
            borderColor: colors.border.light,
          }}
        />

        <TouchableOpacity
          onPress={handleSubmit}
          style={{
            backgroundColor: colors.primary.main,
            padding: spacing.sm,
            borderRadius: 12,
            alignItems: 'center',
            marginTop: spacing.sm,
          }}
        >
          <Text style={[typography.button, { color: colors.text.inverse }]}>
            Post Review
          </Text>
        </TouchableOpacity>
      </View>

      {/* Reviews list */}
      <FlatList
        data={reviews}
        renderItem={renderReview}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        contentContainerStyle={{ gap: spacing.sm }}
      />
    </View>
  );
};