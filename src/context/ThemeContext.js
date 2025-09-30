import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define theme colors
export const lightTheme = {
  background: '#FFFFFF',
  text: '#1A1A1A',
  secondaryText: '#666666',
  accent: '#000080', // Navy blue
  card: '#FFFFFF',
  border: '#E9ECEF',
  statusBar: 'dark-content',
  headerBackground: '#FFFFFF',
  tabBarBackground: '#FFFFFF',
  tabBarInactive: '#999999',
};

export const darkTheme = {
  background: '#121212',
  text: '#FFFFFF',
  secondaryText: '#AAAAAA',
  accent: '#3366CC', // Lighter blue for dark mode
  card: '#1E1E1E',
  border: '#333333',
  statusBar: 'light-content',
  headerBackground: '#1A1A1A',
  tabBarBackground: '#1A1A1A',
  tabBarInactive: '#777777',
};

// Create the context
const ThemeContext = createContext();

// Theme provider component
export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [theme, setTheme] = useState(lightTheme);

  // Load saved theme preference on app start
  useEffect(() => {
    loadThemePreference();
  }, []);

  // Save theme preference when it changes
  useEffect(() => {
    saveThemePreference();
    setTheme(isDarkMode ? darkTheme : lightTheme);
  }, [isDarkMode]);

  // Load theme preference from storage
  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('isDarkMode');
      if (savedTheme !== null) {
        setIsDarkMode(JSON.parse(savedTheme));
      }
    } catch (error) {
      console.log('Error loading theme preference:', error);
    }
  };

  // Save theme preference to storage
  const saveThemePreference = async () => {
    try {
      await AsyncStorage.setItem('isDarkMode', JSON.stringify(isDarkMode));
    } catch (error) {
      console.log('Error saving theme preference:', error);
    }
  };

  // Toggle theme function
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use the theme context
export const useTheme = () => useContext(ThemeContext);