import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/useTheme';
import api from '@/services/api';
import { useThemeStore } from '@/store/themeStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import i18n from './i18n';

export default function SettingsScreen() {
  const { colors } = useTheme();

  const styles = createStyles(colors);
  const { t } = useTranslation();

  const [language, setLanguage] =
    useState(i18n.language);

  const [notifications, setNotifications] = useState(true);

  const [showCalendar, setShowCalendar] = useState(true);
  const [showTracker, setShowTracker] =
  useState(true);

  const [showAI, setShowAI] =
    useState(true);

  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);

  const darkMode = theme === 'dark';

  const handleDeleteAccount = () => {
    Alert.alert(
      'Удалить аккаунт?',
      'Это действие нельзя отменить',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token');

              await api.delete('/user-service/users/me', {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });

              await AsyncStorage.removeItem('token');
              router.replace('/login');
            } catch (e: any) {
              console.log(e?.response?.data);
            }
          },
        },
      ]
    );
  };

  React.useEffect(() => {
  loadSettings();
}, []);

const loadSettings = async () => {
  const calendar =
    await AsyncStorage.getItem(
      'showCalendar'
    );

  const tracker =
    await AsyncStorage.getItem(
      'showTracker'
    );

  const ai =
    await AsyncStorage.getItem(
      'showAI'
    );
    const savedLanguage =
  await AsyncStorage.getItem(
    'language'
  );

if (savedLanguage) {
  setLanguage(savedLanguage);

  await i18n.changeLanguage(
    savedLanguage
  );
}

  if (calendar !== null)
    setShowCalendar(
      calendar === 'true'
    );

  if (tracker !== null)
    setShowTracker(
      tracker === 'true'
    );

  if (ai !== null)
    setShowAI(
      ai === 'true'
    );

};
const changeLanguage = async (
  lang: string
) => {
  setLanguage(lang);

  await i18n.changeLanguage(lang);

  await AsyncStorage.setItem(
    'language',
    lang
  );
};

  return (
    <SafeAreaView
  style={{
    flex: 1,
    backgroundColor:
      colors.background.primary,
  }}
>
  <ScrollView
    contentContainerStyle={{
      padding: 16,
      paddingBottom: 40,
    }}
    showsVerticalScrollIndicator={false}
  >
      <View
  style={{
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  }}
>
  <TouchableOpacity
    onPress={() => router.back()}
    style={{
      position: 'absolute',
      left: 0,
      zIndex: 1,
    }}
  >
    <Ionicons
      name="arrow-back"
      size={28}
      color={colors.text.primary}
    />
  </TouchableOpacity>

  <Text
    style={[
      styles.header,
      {
        color: colors.text.primary,
        flex: 1,
        marginBottom: 0,
      },
    ]}
  >
    {t('settings.title')}
  </Text>
</View>

      <Section title={t('settings.preferences')} styles={styles}>
        <SwitchItem
          title={t('settings.darkMode')}
          value={darkMode}
          onValueChange={(value: boolean) =>
            setTheme(value ? 'dark' : 'light')
          }
          colors={colors}
        />

        <SwitchItem
          title={t('settings.notifications')}
          value={notifications}
          onValueChange={setNotifications}
          colors={colors}
        />
      </Section>

      <Section title={t('settings.account')} styles={styles}>
        <Item
          title={t('settings.deleteAccount')}
          danger
          onPress={handleDeleteAccount}
          styles={styles}
        />
      </Section>

      <Section title={t('settings.about')} styles={styles}>
        <Item title={t('settings.privacyPolicy')} styles={styles} />
        <Item title={t('settings.appVersion')} styles={styles} />
      </Section>

      <Section
        title={t('settings.homeScreen')}
        styles={styles}
      >
        <SwitchItem
          title={t('settings.showCalendar')}
          value={showCalendar}
          onValueChange={async (
            value: boolean
          ) => {
            setShowCalendar(value);
      
            await AsyncStorage.setItem(
              'showCalendar',
              String(value)
            );
          }}
          colors={colors}
        />
      
        <SwitchItem
          title={t('settings.showTracker')}
          value={showTracker}
          onValueChange={async (
            value: boolean
          ) => {
            setShowTracker(value);
      
            await AsyncStorage.setItem(
              'showTracker',
              String(value)
            );
          }}
          colors={colors}
        />
      
        <SwitchItem
          title={t('settings.showAI')}
          value={showAI}
          onValueChange={async (
            value: boolean
          ) => {
            setShowAI(value);
      
            await AsyncStorage.setItem(
              'showAI',
              String(value)
            );
          }}
          colors={colors}
        />
      
      </Section>
      <Section
  title={t('settings.language')}
  styles={styles}
>
  <Item
    title={t('settings.english')}
    onPress={() =>
      changeLanguage('en')
    }
    styles={styles}
    rightIcon={
      language === 'en' ? (
        <Ionicons
          name="checkmark-circle"
          size={24}
          color={colors.primary.main}
        />
      ) : null
    }
  />

  <Item
    title={t('settings.russian')}
    onPress={() =>
      changeLanguage('ru')
    }
    styles={styles}
    rightIcon={
      language === 'ru' ? (
        <Ionicons
          name="checkmark-circle"
          size={24}
          color={colors.primary.main}
        />
      ) : null
    }
  />

  <Item
    title={t('settings.kazakh')}
    onPress={() =>
      changeLanguage('kz')
    }
    styles={styles}
    rightIcon={
      language === 'kz' ? (
        <Ionicons
          name="checkmark-circle"
          size={24}
          color={colors.primary.main}
        />
      ) : null
    }
  />
</Section>
    </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children, styles }: any) {
  return (
    <View style={styles.section}>
      <ThemedText style={styles.sectionTitle}>{title}</ThemedText>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

function Item({
  title,
  onPress,
  danger,
  styles,
  rightIcon,
}: any) {
  return (
    <TouchableOpacity
      style={[
        styles.item,
        {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        },
      ]}
      onPress={onPress}
    >
      <ThemedText
        style={[
          styles.itemText,
          danger && styles.dangerText,
        ]}
      >
        {title}
      </ThemedText>

      {rightIcon}
    </TouchableOpacity>
  );
}

function SwitchItem({ title, value, onValueChange, colors }: any) {
  return (
    <View style={[stylesStatic.item, { backgroundColor: colors.card.elevated }]}>
      <ThemedText
        style={[
          stylesStatic.itemText,
          { color: colors.text.primary }
        ]}
      >
        {title}
      </ThemedText>

      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{
          false: colors.border.light,
          true: colors.primary.main,
        }}
        thumbColor="#fff"
      />
    </View>
  );
}

const stylesStatic = StyleSheet.create({
  item: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 15,
  },
});

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
    },

    header: {
      fontSize: 32,
      fontWeight: '800',
      textAlign: 'center',
      marginBottom: 10,
    },

    section: {
      marginBottom: 20,
    },

    sectionTitle: {
      marginBottom: 8,
      fontSize: 13,
      color: colors.text.secondary,
    },

    card: {
      borderRadius: 16,
      backgroundColor: colors.card.default,
      overflow: 'hidden',

      shadowColor: '#000',
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 3,
    },

    item: {
      padding: 16,
      backgroundColor: colors.card.elevated,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.light,
    },

    itemText: {
      fontSize: 15,
      color: colors.text.primary,
    },

    dangerText: {
      color: '#E53935',
      fontWeight: '600',
    },
  });
