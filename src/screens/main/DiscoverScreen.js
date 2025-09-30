import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

// Mock data for vertical feed
const mockDiscoverData = [
  {
    id: '1',
    title: 'Sunset Over Maasai Mara',
    artist: 'Maria Wanjiku',
    artistAvatar: 'https://via.placeholder.com/40',
    image: 'https://via.placeholder.com/400x600',
    video: null, // Could be video URL
    price: 'KSh 25,000',
    likes: 1234,
    comments: 89,
    shares: 45,
    description: 'Captured the golden hour magic over the Maasai Mara. This piece represents the eternal beauty of our homeland. 🌅 #KenyanArt #Landscape',
    isLiked: false,
    tags: ['#Landscape', '#Wildlife', '#Kenya', '#Sunset'],
  },
  {
    id: '2',
    title: 'Urban Dreams',
    artist: 'John Kamau',
    artistAvatar: 'https://via.placeholder.com/40',
    image: 'https://via.placeholder.com/400x700',
    video: null,
    price: 'KSh 18,000',
    likes: 892,
    comments: 56,
    shares: 23,
    description: 'Street art meets gallery art. Nairobi\'s energy flows through every brushstroke. This is where tradition meets modernity. 🏙️',
    isLiked: true,
    tags: ['#Urban', '#StreetArt', '#Nairobi', '#Contemporary'],
  },
  {
    id: '3',
    title: 'Heritage Patterns',
    artist: 'Grace Kiprotich',
    artistAvatar: 'https://via.placeholder.com/40',
    image: 'https://via.placeholder.com/400x650',
    video: null,
    price: 'KSh 35,000',
    likes: 2156,
    comments: 134,
    shares: 78,
    description: 'Weaving stories of our ancestors through contemporary patterns. Each line carries centuries of wisdom and culture. ✨',
    isLiked: false,
    tags: ['#Cultural', '#Heritage', '#Patterns', '#Traditional'],
  },
];

export default function DiscoverScreen({ navigation }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [artworks, setArtworks] = useState(mockDiscoverData);
  const flatListRef = useRef(null);

  const handleLike = useCallback((id) => {
    setArtworks(prev => 
      prev.map(item => 
        item.id === id 
          ? { ...item, isLiked: !item.isLiked, likes: item.isLiked ? item.likes - 1 : item.likes + 1 }
          : item
      )
    );
  }, []);

  const handleViewChange = useCallback(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  }, []);

  const handleARView = (artwork) => {
    navigation.navigate('ARView', { artwork });
  };

  const renderArtwork = ({ item, index }) => (
    <ArtworkItem
      artwork={item}
      isActive={index === currentIndex}
      onLike={() => handleLike(item.id)}
      onARView={() => handleARView(item)}
      onProfilePress={() => console.log('Profile pressed')}
      onCommentPress={() => console.log('Comments pressed')}
      onSharePress={() => console.log('Share pressed')}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      <FlatList
        ref={flatListRef}
        data={artworks}
        renderItem={renderArtwork}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={height}
        snapToAlignment="start"
        decelerationRate="fast"
        onViewableItemsChanged={handleViewChange}
        viewabilityConfig={{
          itemVisiblePercentThreshold: 50,
        }}
        getItemLayout={(data, index) => ({
          length: height,
          offset: height * index,
          index,
        })}
      />
    </SafeAreaView>
  );
}

// Individual artwork item component
function ArtworkItem({ 
  artwork, 
  isActive, 
  onLike, 
  onARView, 
  onProfilePress, 
  onCommentPress, 
  onSharePress 
}) {
  return (
    <View style={styles.artworkContainer}>
      {/* Background Image/Video */}
      <Image
        source={{ uri: artwork.image }}
        style={styles.backgroundImage}
        resizeMode="cover"
      />
      
      {/* Gradient Overlay */}
      <LinearGradient
        colors={['transparent', 'transparent', 'rgba(0,0,0,0.8)']}
        style={styles.gradient}
      />

      {/* Right Action Bar */}
      <View style={styles.rightActions}>
        {/* Profile */}
        <TouchableOpacity style={styles.actionItem} onPress={onProfilePress}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: artwork.artistAvatar }} style={styles.avatar} />
          </View>
        </TouchableOpacity>

        {/* Like */}
        <TouchableOpacity style={styles.actionItem} onPress={onLike}>
          <View style={styles.actionButton}>
            <Ionicons
              name={artwork.isLiked ? 'heart' : 'heart-outline'}
              size={28}
              color={artwork.isLiked ? '#FF6B6B' : '#FFFFFF'}
            />
          </View>
          <Text style={styles.actionText}>
            {artwork.likes > 999 ? `${(artwork.likes / 1000).toFixed(1)}k` : artwork.likes}
          </Text>
        </TouchableOpacity>

        {/* Comment */}
        <TouchableOpacity style={styles.actionItem} onPress={onCommentPress}>
          <View style={styles.actionButton}>
            <Ionicons name="chatbubble-outline" size={26} color="#FFFFFF" />
          </View>
          <Text style={styles.actionText}>
            {artwork.comments}
          </Text>
        </TouchableOpacity>

        {/* AR View */}
        <TouchableOpacity style={styles.actionItem} onPress={onARView}>
          <View style={[styles.actionButton, styles.arButton]}>
            <LinearGradient
              colors={['#FF6B6B', '#FF8E53']}
              style={styles.arGradient}
            >
              <Ionicons name="camera" size={24} color="#FFFFFF" />
            </LinearGradient>
          </View>
          <Text style={styles.actionText}>AR</Text>
        </TouchableOpacity>

        {/* Share */}
        <TouchableOpacity style={styles.actionItem} onPress={onSharePress}>
          <View style={styles.actionButton}>
            <Ionicons name="paper-plane-outline" size={24} color="#FFFFFF" />
          </View>
          <Text style={styles.actionText}>
            {artwork.shares}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Content */}
      <View style={styles.bottomContent}>
        {/* Artist Info */}
        <View style={styles.artistSection}>
          <Text style={styles.artistName}>@{artwork.artist.replace(' ', '').toLowerCase()}</Text>
          <Text style={styles.artTitle}>{artwork.title}</Text>
        </View>

        {/* Description */}
        <Text style={styles.description} numberOfLines={3}>
          {artwork.description}
        </Text>

        {/* Tags */}
        <View style={styles.tagsContainer}>
          {artwork.tags.slice(0, 3).map((tag, index) => (
            <TouchableOpacity key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Price and Action */}
        <View style={styles.bottomRow}>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>{artwork.price}</Text>
            <Text style={styles.priceLabel}>Buy Now</Text>
          </View>
          
          <TouchableOpacity style={styles.previewButton}>
            <BlurView intensity={20} tint="light" style={styles.previewBlur}>
              <Ionicons name="eye-outline" size={16} color="#FFFFFF" />
              <Text style={styles.previewText}>Preview</Text>
            </BlurView>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  artworkContainer: {
    width,
    height,
    position: 'relative',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  gradient: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  rightActions: {
    position: 'absolute',
    right: 15,
    bottom: 100,
    alignItems: 'center',
  },
  actionItem: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    padding: 2,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  actionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arButton: {
    backgroundColor: 'transparent',
  },
  arGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
  bottomContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 80,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  artistSection: {
    marginBottom: 12,
  },
  artistName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  artTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.9,
  },
  description: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
    opacity: 0.9,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  tag: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flex: 1,
  },
  price: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  priceLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
  },
  previewButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  previewBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  previewText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
});