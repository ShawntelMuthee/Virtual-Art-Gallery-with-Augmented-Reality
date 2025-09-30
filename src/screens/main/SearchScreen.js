import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  SafeAreaView,
  StatusBar,
  Modal,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ArtCard from '../../components/art/ArtCard';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 45) / 2;

// Mock search suggestions
const recentSearches = ['Abstract art', 'Wildlife paintings', 'Maria Wanjiku', 'Landscape'];
const trendingSearches = ['Kenyan artists', 'Modern art', 'Cultural heritage', 'Urban scenes'];

const categories = [
  { id: '1', name: 'All', icon: 'grid-outline' },
  { id: '2', name: 'Landscape', icon: 'mountain-outline' },
  { id: '3', name: 'Portrait', icon: 'person-outline' },
  { id: '4', name: 'Abstract', icon: 'color-palette-outline' },
  { id: '5', name: 'Wildlife', icon: 'leaf-outline' },
  { id: '6', name: 'Cultural', icon: 'library-outline' },
];

const priceRanges = [
  { label: 'Any Price', value: 'any' },
  { label: 'Under KSh 10,000', value: '0-10000' },
  { label: 'KSh 10,000 - 25,000', value: '10000-25000' },
  { label: 'KSh 25,000 - 50,000', value: '25000-50000' },
  { label: 'Above KSh 50,000', value: '50000+' },
];

const sortOptions = [
  { label: 'Most Popular', value: 'popular' },
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Most Liked', value: 'likes' },
];

export default function SearchScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPriceRange, setSelectedPriceRange] = useState('any');
  const [selectedSort, setSelectedSort] = useState('popular');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchInputRef = useRef(null);

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.length > 0) {
      setIsSearching(true);
      setShowResults(true);
      // Simulate search API call
      setTimeout(() => {
        setSearchResults(mockSearchResults);
        setIsSearching(false);
      }, 800);
    } else {
      setShowResults(false);
      setSearchResults([]);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setShowResults(false);
    setSearchResults([]);
    searchInputRef.current?.blur();
  };

  const handleRecentSearch = (query) => {
    setSearchQuery(query);
    handleSearch(query);
  };

  const applyFilters = () => {
    setShowFilters(false);
    // Apply filters logic here
    console.log('Applying filters:', { selectedCategory, selectedPriceRange, selectedSort });
  };

  const resetFilters = () => {
    setSelectedCategory('All');
    setSelectedPriceRange('any');
    setSelectedSort('popular');
  };

  const renderSearchSuggestion = (title, items, onPress) => (
    <View style={styles.suggestionSection}>
      <Text style={styles.suggestionTitle}>{title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {items.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.suggestionChip}
            onPress={() => onPress(item)}
          >
            <Text style={styles.suggestionText}>{item}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderCategory = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        selectedCategory === item.name && styles.activeCategoryItem
      ]}
      onPress={() => setSelectedCategory(item.name)}
    >
      <Ionicons
        name={item.icon}
        size={24}
        color={selectedCategory === item.name ? '#FF6B6B' : '#666'}
      />
      <Text style={[
        styles.categoryText,
        selectedCategory === item.name && styles.activeCategoryText
      ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
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
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Search Header */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            ref={searchInputRef}
            style={styles.searchInput}
            placeholder="Search artworks, artists..."
            value={searchQuery}
            onChangeText={handleSearch}
            returnKeyType="search"
            onSubmitEditing={() => handleSearch(searchQuery)}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={handleClearSearch} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <Ionicons name="options-outline" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Categories */}
      <View style={styles.categoriesContainer}>
        <FlatList
          data={categories}
          renderItem={renderCategory}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {!showResults ? (
          <ScrollView showsVerticalScrollIndicator={false}>
            {renderSearchSuggestion('Recent Searches', recentSearches, handleRecentSearch)}
            {renderSearchSuggestion('Trending', trendingSearches, handleRecentSearch)}
            
            {/* Popular Artists */}
            <View style={styles.popularSection}>
              <Text style={styles.sectionTitle}>Popular Artists</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {['Maria W.', 'John K.', 'Grace K.', 'Peter M.'].map((artist, index) => (
                  <TouchableOpacity key={index} style={styles.artistCard}>
                    <View style={styles.artistAvatar}>
                      <Text style={styles.artistInitial}>{artist[0]}</Text>
                    </View>
                    <Text style={styles.artistName}>{artist}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </ScrollView>
        ) : (
          <View style={styles.resultsContainer}>
            {/* Results Header */}
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsText}>
                {isSearching ? 'Searching...' : `${searchResults.length} results for "${searchQuery}"`}
              </Text>
              <TouchableOpacity style={styles.sortButton}>
                <Ionicons name="swap-vertical-outline" size={16} color="#666" />
                <Text style={styles.sortText}>Sort</Text>
              </TouchableOpacity>
            </View>

            {/* Search Results */}
            <FlatList
              data={searchResults}
              renderItem={renderArtwork}
              keyExtractor={(item) => item.id}
              numColumns={2}
              columnWrapperStyle={styles.row}
              contentContainerStyle={styles.resultsList}
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}
      </View>

      {/* Filter Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Filters</Text>
            <TouchableOpacity onPress={resetFilters}>
              <Text style={styles.modalReset}>Reset</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Price Range */}
            <View style={styles.filterSection}>
              <Text style={styles.filterTitle}>Price Range</Text>
              {priceRanges.map((range) => (
                <TouchableOpacity
                  key={range.value}
                  style={[
                    styles.filterOption,
                    selectedPriceRange === range.value && styles.activeFilterOption
                  ]}
                  onPress={() => setSelectedPriceRange(range.value)}
                >
                  <Text style={[
                    styles.filterOptionText,
                    selectedPriceRange === range.value && styles.activeFilterText
                  ]}>
                    {range.label}
                  </Text>
                  {selectedPriceRange === range.value && (
                    <Ionicons name="checkmark" size={20} color="#FF6B6B" />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Sort By */}
            <View style={styles.filterSection}>
              <Text style={styles.filterTitle}>Sort By</Text>
              {sortOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.filterOption,
                    selectedSort === option.value && styles.activeFilterOption
                  ]}
                  onPress={() => setSelectedSort(option.value)}
                >
                  <Text style={[
                    styles.filterOptionText,
                    selectedSort === option.value && styles.activeFilterText
                  ]}>
                    {option.label}
                  </Text>
                  {selectedSort === option.value && (
                    <Ionicons name="checkmark" size={20} color="#FF6B6B" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

// Mock search results data
const mockSearchResults = [
  {
    id: '1',
    title: 'Mountain Vista',
    artist: 'John Doe',
    artistAvatar: 'https://via.placeholder.com/40',
    image: 'https://via.placeholder.com/300x400',
    price: 'KSh 15,000',
    likes: 234,
    category: 'Landscape',
    isLiked: false,
  },
  {
    id: '2',
    title: 'City Lights',
    artist: 'Jane Smith',
    artistAvatar: 'https://via.placeholder.com/40',
    image: 'https://via.placeholder.com/300x350',
    price: 'KSh 22,000',
    likes: 189,
    category: 'Urban',
    isLiked: true,
  },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 25,
    paddingHorizontal: 15,
    marginRight: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
    color: '#333',
  },
  clearButton: {
    padding: 5,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoriesContainer: {
    paddingVertical: 10,
  },
  categoriesList: {
    paddingHorizontal: 20,
  },
  categoryItem: {
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 15,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
  },
  activeCategoryItem: {
    backgroundColor: '#FFE8E8',
  },
  categoryText: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    fontWeight: '500',
  },
  activeCategoryText: {
    color: '#FF6B6B',
  },
  content: {
    flex: 1,
  },
  suggestionSection: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  suggestionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  suggestionChip: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  suggestionText: {
    fontSize: 14,
    color: '#666',
  },
  popularSection: {
    paddingLeft: 20,
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  artistCard: {
    alignItems: 'center',
    marginRight: 20,
    width: 70,
  },
  artistAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  artistInitial: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  artistName: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
    fontWeight: '500',
  },
  resultsContainer: {
    flex: 1,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  resultsText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F8F9FA',
    borderRadius: 15,
  },
  sortText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  resultsList: {
    paddingTop: 15,
    paddingBottom: 100,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  modalCancel: {
    fontSize: 16,
    color: '#666',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  modalReset: {
    fontSize: 16,
    color: '#FF6B6B',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  filterSection: {
    marginVertical: 20,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  activeFilterOption: {
    backgroundColor: '#FFF5F5',
  },
  filterOptionText: {
    fontSize: 16,
    color: '#333',
  },
  activeFilterText: {
    color: '#FF6B6B',
    fontWeight: '500',
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
  },
  applyButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});