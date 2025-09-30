import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Mock data for artist stories
const artistStories = [
  {
    id: '1',
    name: 'Your Story',
    avatar: 'https://via.placeholder.com/60',
    hasStory: false,
    isOwn: true,
  },
  {
    id: '2',
    name: 'Maria W.',
    avatar: 'https://via.placeholder.com/60',
    hasStory: true,
    hasNewStory: true,
  },
  {
    id: '3',
    name: 'John K.',
    avatar: 'https://via.placeholder.com/60',
    hasStory: true,
    hasNewStory: false,
  },
  {
    id: '4',
    name: 'Grace K.',
    avatar: 'https://via.placeholder.com/60',
    hasStory: true,
    hasNewStory: true,
  },
  {
    id: '5',
    name: 'Peter M.',
    avatar: 'https://via.placeholder.com/60',
    hasStory: true,
    hasNewStory: false,
  },
  {
    id: '6',
    name: 'Sarah L.',
    avatar: 'https://via.placeholder.com/60',
    hasStory: true,
    hasNewStory: true,
  },
];

export default function StoryHeader() {
  const renderStoryItem = (item) => {
    const StoryWrapper = ({ children }) => {
      if (item.hasStory && !item.isOwn) {
        return (
          <LinearGradient
            colors={item.hasNewStory ? ['#FF6B6B', '#FF8E53', '#FF6B6B'] : ['#E0E0E0', '#E0E0E0']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.storyGradient}
          >
            {children}
          </LinearGradient>
        );
      }
      return children;
    };

    return (
      <TouchableOpacity key={item.id} style={styles.storyContainer}>
        <StoryWrapper>
          <View style={[
            styles.avatarContainer,
            item.isOwn && styles.ownAvatarContainer
          ]}>
            <Image
              source={{ uri: item.avatar }}
              style={styles.avatar}
            />
            {item.isOwn && (
              <View style={styles.addButton}>
                <Ionicons name="add" size={16} color="#FFFFFF" />
              </View>
            )}
          </View>
        </StoryWrapper>
        <Text style={styles.storyName} numberOfLines={1}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {artistStories.map(renderStoryItem)}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    paddingHorizontal: 20,
  },
  storyContainer: {
    alignItems: 'center',
    marginRight: 16,
    width: 70,
  },
  storyGradient: {
    borderRadius: 32,
    padding: 2,
  },
  avatarContainer: {
    position: 'relative',
    borderRadius: 30,
    padding: 2,
  },
  ownAvatarContainer: {
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F0F0F0',
  },
  addButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  storyName: {
    fontSize: 12,
    color: '#333',
    marginTop: 6,
    textAlign: 'center',
    fontWeight: '500',
  },
});