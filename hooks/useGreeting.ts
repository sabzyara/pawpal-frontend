import { useState, useEffect } from 'react';

export const useGreeting = () => {
  const [greeting, setGreeting] = useState('');
  const [userName] = useState('Pet Parent');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  return { greeting, userName };
};