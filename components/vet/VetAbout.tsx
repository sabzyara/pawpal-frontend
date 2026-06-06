import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/useTheme';

interface VetAboutProps {
  vet: {
    about?: string;
    address?: string;
    education?: string;
    languages?: string[];
    phoneNumber?: string;
    clinicName?: string;
  };
}

export const VetAbout: React.FC<VetAboutProps> = ({
  vet,
}) => {
  const {
    colors,
    spacing,
    typography,
  } = useTheme();

  const handlePhonePress = () => {
    if (!vet.phoneNumber) return;

    const phoneUrl = `tel:${vet.phoneNumber}`;

    Linking.canOpenURL(phoneUrl)
      .then((supported) => {
        if (supported) {
          Linking.openURL(phoneUrl);
        } else {
          Alert.alert(
            'Ошибка',
            'Звонки не поддерживаются'
          );
        }
      })
      .catch((err) =>
        console.error(err)
      );
  };

  const handleLocationPress = () => {
    if (!vet.address) return;

    const mapsUrl = `https://maps.google.com/?q=${encodeURIComponent(
      vet.address
    )}`;

    Linking.openURL(mapsUrl).catch(
      (err) =>
        console.error(
          'Error opening maps:',
          err
        )
    );
  };

  const InfoCard = ({
    icon,
    title,
    value,
    onPress,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    value: string;
    onPress?: () => void;
  }) => (
    <TouchableOpacity
      activeOpacity={onPress ? 0.8 : 1}
      onPress={onPress}
      disabled={!onPress}
      style={{
        backgroundColor:
          colors.background.primary,

        borderRadius: 18,

        padding: spacing.md,

        flexDirection: 'row',

        alignItems: 'center',

        borderWidth: 1,

        borderColor:
          colors.border.light,
      }}
    >
      <View
        style={{
          width: 46,
          height: 46,

          borderRadius: 23,

          backgroundColor:
            colors.primary.light,

          justifyContent:
            'center',

          alignItems:
            'center',

          marginRight:
            spacing.md,
        }}
      >
        <Ionicons
          name={icon}
          size={22}
          color={
            colors.primary.main
          }
        />
      </View>

      <View style={{ flex: 1 }}>
        <Text
          style={[
            typography.caption,
            {
              color:
                colors.text
                  .secondary,
            },
          ]}
        >
          {title}
        </Text>

        <Text
          style={[
            typography.body2SemiBold,
            {
              color:
                colors.text
                  .primary,

              marginTop: 2,
            },
          ]}
        >
          {value}
        </Text>
      </View>

      {onPress && (
        <Ionicons
          name="chevron-forward"
          size={18}
          color={
            colors.text
              .tertiary
          }
        />
      )}
    </TouchableOpacity>
  );

  return (
    <View
      style={{
        gap: spacing.md,
      }}
    >
      {/* ABOUT */}
      <View
        style={{
          backgroundColor:
            colors.card.default,

          borderRadius: 24,

          padding: spacing.md,

          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 2,
        }}
      >
        <Text
          style={[
            typography.body1SemiBold,
            {
              color:
                colors.text
                  .primary,

              marginBottom:
                spacing.sm,
            },
          ]}
        >
          О специалисте
        </Text>

        <Text
          style={[
            typography.body2,
            {
              color:
                colors.text
                  .secondary,

              lineHeight: 24,
            },
          ]}
        >
          {vet.about ||
            'Информация отсутствует'}
        </Text>
      </View>

      {/* CLINIC */}
      <InfoCard
        icon="business-outline"
        title="Клиника"
        value={
          vet.clinicName ||
          'Не указано'
        }
      />

      {/* ADDRESS */}
      <InfoCard
        icon="location-outline"
        title="Адрес"
        value={
          vet.address ||
          'Не указан'
        }
        onPress={
          vet.address
            ? handleLocationPress
            : undefined
        }
      />

      {/* PHONE */}
      <InfoCard
        icon="call-outline"
        title="Телефон"
        value={
          vet.phoneNumber ||
          'Не указан'
        }
        onPress={
          vet.phoneNumber
            ? handlePhonePress
            : undefined
        }
      />

      {/* EDUCATION */}
      <InfoCard
        icon="school-outline"
        title="Образование"
        value={
          vet.education ||
          'Не указано'
        }
      />

      {/* LANGUAGES */}
      {!!vet.languages?.length && (
        <View
          style={{
            backgroundColor:
              colors.card.default,

            borderRadius: 24,

            padding:
              spacing.md,

            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          <Text
            style={[
              typography.body1SemiBold,
              {
                color:
                  colors.text
                    .primary,

                marginBottom:
                  spacing.sm,
              },
            ]}
          >
            Языки общения
          </Text>

          <View
            style={{
              flexDirection:
                'row',

              flexWrap:
                'wrap',

              gap: 8,
            }}
          >
            {vet.languages.map(
              (
                language,
                index
              ) => (
                <View
                  key={index}
                  style={{
                    backgroundColor:
                      colors
                        .primary
                        .light,

                    paddingHorizontal:
                      12,

                    paddingVertical:
                      8,

                    borderRadius:
                      20,
                  }}
                >
                  <Text
                    style={{
                      color:
                        colors
                          .primary
                          .dark,

                      fontWeight:
                        '600',
                    }}
                  >
                    {language}
                  </Text>
                </View>
              )
            )}
          </View>
        </View>
      )}
    </View>
  );
};