import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';

const { width } = Dimensions.get('window');

export default function ArtCard({ artwork, onPress, cardWidth, index }) {
  const [liked, setLiked] = useState(artwork.isLiked);
  const [imageHeight, setImageHeight] = useState(200);
  const { theme, isDarkMode } = useTheme();

  // Use fixed height for symmetrical layout
  const fixedHeight = 280;

  const handleLike = () => {
    setLiked(!liked);
  };

  return (
    <TouchableOpacity
      style={[styles.container, { width: cardWidth }]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={[styles.card, { height: fixedHeight }]}>
        {/* Art Image */}
        <Image
          source={{ uri: artwork.image }}
          style={styles.artImage}
          resizeMode="cover"
        />

        {/* Gradient Overlay */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.gradient}
        />

        {/* Like Button */}
        <TouchableOpacity
          style={styles.likeButton}
          onPress={handleLike}
          activeOpacity={0.7}
        >
          <Ionicons
            name={liked ? 'heart' : 'heart-outline'}
            size={20}
            color={liked ? '#000080' : '#FFFFFF'}
          />
        </TouchableOpacity>

        {/* AR Button */}
        <TouchableOpacity style={styles.arButton} activeOpacity={0.7}>
          <View style={styles.arIconContainer}>
            <Ionicons name="camera-outline" size={16} color="#000080" />
          </View>
        </TouchableOpacity>

        {/* Art Info Overlay */}
        <View style={styles.artInfo}>
          <Text style={styles.artTitle} numberOfLines={1}>
            {artwork.title}
          </Text>
          <View style={styles.artistContainer}>
            <Image
              source={{ uri: artwork.artistAvatar }}
              style={styles.artistAvatar}
            />
            <Text style={styles.artistName} numberOfLines={1}>
              {artwork.artist}
            </Text>
          </View>
          <View style={styles.bottomRow}>
            <Text style={styles.price}>{artwork.price}</Text>
            <View style={styles.likesContainer}>
              <Ionicons name="heart" size={12} color="#000080" />
              <Text style={styles.likesCount}>{artwork.likes}</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  card: {
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  artImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '60%',
  },
  likeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  arButton: {
    position: 'absolute',
    top: 12,
    left: 12,
  },
  arIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  artInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  artTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  artistContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  artistAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 6,
  },
  artistName: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.9,
    flex: 1,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  likesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likesCount: {
    fontSize: 12,
    color: '#FFFFFF',
    marginLeft: 4,
  },
});