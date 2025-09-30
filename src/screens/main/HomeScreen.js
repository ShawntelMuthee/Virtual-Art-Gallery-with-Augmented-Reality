import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ArtCard from '../../components/art/ArtCard';
import { useTheme } from '../../context/ThemeContext';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = (width - 80) / 2;

// Mock data for demonstration
const mockArtworks = [
  {
    id: '1',
    title: 'Kenyan Sunset',
    artist: 'Maria Wanjiku',
    artistAvatar: 'https://via.placeholder.com/40',
    image: 'https://via.placeholder.com/300x400',
    price: 'KSh 15,000',
    likes: 234,
    category: 'Landscape',
    isLiked: false,
  },
  {
    id: '2',
    title: 'Urban Nairobi',
    artist: 'John Kamau',
    artistAvatar: 'https://via.placeholder.com/40',
    image: 'https://via.placeholder.com/300x500',
    price: 'KSh 25,000',
    likes: 456,
    category: 'Urban',
    isLiked: true,
  },
  {
    id: '3',
    title: 'Maasai Heritage',
    artist: 'Grace Kiprotich',
    artistAvatar: 'https://via.placeholder.com/40',
    image: 'https://via.placeholder.com/300x350',
    price: 'KSh 35,000',
    likes: 789,
    category: 'Cultural',
    isLiked: false,
  },
  {
    id: '4',
    title: 'Wildlife Majesty',
    artist: 'Peter Mwangi',
    artistAvatar: 'https://via.placeholder.com/40',
    image: 'https://via.placeholder.com/300x450',
    price: 'KSh 20,000',
    likes: 321,
    category: 'Wildlife',
    isLiked: true,
  },
];

const categories = ['All', 'Landscape', 'Urban', 'Cultural', 'Wildlife', 'Abstract', 'Portrait'];

export default function HomeScreen({ navigation }) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [refreshing, setRefreshing] = useState(false);
  const flatListRef = useRef(null);
  const { theme, isDarkMode } = useTheme();

  const handleRefresh = () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => setRefreshing(false), 1500);
  };

  const filteredArtworks = activeCategory === 'All' 
    ? mockArtworks 
    : mockArtworks.filter(art => art.category === activeCategory);

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* App Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.logo}>ZuruArt</Text>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="notifications-outline" size={24} color="#333" />
          <View style={styles.notificationBadge} />
        </TouchableOpacity>
      </View>

      {/* Category Filter */}
      <View style={styles.categoryContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                activeCategory === category && styles.activeCategoryButton
              ]}
              onPress={() => setActiveCategory(category)}
            >
              <Text style={[
                styles.categoryText,
                activeCategory === category && styles.activeCategoryText
              ]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Discover Art</Text>
        <TouchableOpacity>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderArtwork = ({ item, index }) => (
    <ArtCard
      artwork={item}
      index={index}
      onPress={() => navigation.navigate('ArtDetail', { artwork: item })}
      cardWidth={CARD_WIDTH}
    />
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={theme.headerBackground} />
      
      <FlatList

        ref={flatListRef}
        data={filteredArtworks}
        renderItem={renderArtwork}
        keyExtractor={(item) => item.id}
        numColumns={2}
        ListHeaderComponent={renderHeader}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        initialNumToRender={6}
        maxToRenderPerBatch={6}
        windowSize={10}
        removeClippedSubviews={true}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 35, // Increased padding to ensure top content is visible
  },
  headerContainer: {
    backgroundColor: '#FFFFFF',
    paddingBottom: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 15,
    marginTop: 10,
  },
  headerLeft: {
    flex: 1,
  },
  logo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000080',
    marginBottom: 2,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#000080',
  },
  categoryContainer: {
    marginBottom: 20,
  },
  categoryScroll: {
    paddingHorizontal: 20,
    paddingVertical: 5,
  },
  categoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: '#F8F8F8',
  },
  activeCategoryButton: {
    backgroundColor: '#000080',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeCategoryText: {
    color: '#FFFFFF',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAll: {
    fontSize: 14,
    color: '#000080',
    fontWeight: '500',
  },
  contentContainer: {
    paddingBottom: 100,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 15,
    alignItems: 'flex-start',
  },
});