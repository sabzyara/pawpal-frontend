import { useState, useEffect } from 'react';
import "@/app/i18n";
import { useTranslation } from 'react-i18next';

export const useGreeting = () => {
  const [userName] = useState('Pet Parent');
  const {t} = useTranslation();

  const hour = new Date().getHours();

  const greeting =
    hour < 12
      ? t('gr.goodMorning')
      : hour < 17
      ? t('gr.goodAfternoon')
      : t('gr.goodEvening');

  return { greeting, userName };
};
