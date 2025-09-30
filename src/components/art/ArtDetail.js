import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

export default function ArtDetailScreen({ navigation, route }) {
  const { artwork } = route.params;
  const [liked, setLiked] = useState(artwork.isLiked);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  const description = "This stunning piece captures the essence of Kenyan landscape with vibrant colors and intricate details. The artist masterfully blends traditional techniques with contemporary vision, creating a piece that speaks to both heritage and innovation. Perfect for modern homes seeking authentic African art.";

  const handleLike = () => {
    setLiked(!liked);
  };

  const handleARView = () => {
    navigation.navigate('ARView', { artwork });
  };

  const handleShare = () => {
    // Implement share functionality
    console.log('Share artwork');
  };

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Animated Header */}
      <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
        <BlurView intensity={100} tint="dark" style={styles.headerBlur}>
          <View style={styles.headerContent}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {artwork.title}
            </Text>
            <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
              <Ionicons name="share-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </BlurView>
      </Animated.View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* Hero Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: artwork.image }}
            style={styles.artImage}
            resizeMode="cover"
          />
          
          {/* Gradient Overlay */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
            style={styles.imageGradient}
          />

          {/* Floating Back Button */}
          <TouchableOpacity 
            style={styles.floatingBackButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Floating Action Buttons */}
          <View style={styles.floatingActions}>
            <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
              <Ionicons
                name={liked ? 'heart' : 'heart-outline'}
                size={24}
                color={liked ? '#FF6B6B' : '#FFFFFF'}
              />
              <Text style={styles.actionText}>{artwork.likes}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
              <Ionicons name="share-outline" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.arActionButton} onPress={handleARView}>
              <LinearGradient
                colors={['#FF6B6B', '#FF8E53']}
                style={styles.arGradient}
              >
                <Ionicons name="camera" size={20} color="#FFFFFF" />
                <Text style={styles.arText}>AR View</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Content Container */}
        <View style={styles.contentContainer}>
          {/* Art Information */}
          <View style={styles.artInfo}>
            <Text style={styles.artTitle}>{artwork.title}</Text>
            <Text style={styles.price}>{artwork.price}</Text>
            
            <View style={styles.artistSection}>
              <Image
                source={{ uri: artwork.artistAvatar }}
                style={styles.artistAvatar}
              />
              <View style={styles.artistInfo}>
                <Text style={styles.artistName}>{artwork.artist}</Text>
                <Text style={styles.artistLocation}>Nairobi, Kenya</Text>
              </View>
              <TouchableOpacity style={styles.followButton}>
                <Text style={styles.followText}>Follow</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Description */}
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionTitle}>About This Artwork</Text>
            <Text 
              style={styles.description}
              numberOfLines={showFullDescription ? undefined : 3}
            >
              {description}
            </Text>
            <TouchableOpacity onPress={() => setShowFullDescription(!showFullDescription)}>
              <Text style={styles.readMore}>
                {showFullDescription ? 'Show Less' : 'Read More'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Specifications */}
          <View style={styles.specsContainer}>
            <Text style={styles.specsTitle}>Specifications</Text>
            <View style={styles.specsList}>
              <View style={styles.specItem}>
                <Text style={styles.specLabel}>Medium</Text>
                <Text style={styles.specValue}>Oil on Canvas</Text>
              </View>
              <View style={styles.specItem}>
                <Text style={styles.specLabel}>Dimensions</Text>
                <Text style={styles.specValue}>60cm × 80cm</Text>
              </View>
              <View style={styles.specItem}>
                <Text style={styles.specLabel}>Year</Text>
                <Text style={styles.specValue}>2024</Text>
              </View>
              <View style={styles.specItem}>
                <Text style={styles.specLabel}>Style</Text>
                <Text style={styles.specValue}>{artwork.category}</Text>
              </View>
            </View>
          </View>

          {/* Similar Artworks */}
          <View style={styles.similarContainer}>
            <Text style={styles.similarTitle}>More from this Artist</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.similarScroll}
            >
              {[1,2,3,4].map((item) => (
                <TouchableOpacity key={item} style={styles.similarItem}>
                  <Image
                    source={{ uri: `https://via.placeholder.com/120x150` }}
                    style={styles.similarImage}
                  />
                  <Text style={styles.similarPrice}>KSh 12,000</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Animated.ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.chatButton}>
          <Ionicons name="chatbubble-outline" size={20} color="#666" />
          <Text style={styles.chatText}>Message Artist</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.buyButton}>
          <LinearGradient
            colors={['#FF6B6B', '#FF8E53']}
            style={styles.buyGradient}
          >
            <Text style={styles.buyText}>Buy Now</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  headerBlur: {
    paddingTop: StatusBar.currentHeight || 44,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginHorizontal: 10,
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    height: height * 0.6,
    position: 'relative',
  },
  artImage: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  floatingBackButton: {
    position: 'absolute',
    top: (StatusBar.currentHeight || 44) + 15,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingActions: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    alignItems: 'center',
  },
  actionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  arActionButton: {
    marginTop: 8,
  },
  arGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 25,
  },
  arText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  contentContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    marginTop: -25,
    paddingTop: 30,
    paddingBottom: 100,
  },
  artInfo: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  artTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  price: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FF6B6B',
    marginBottom: 20,
  },
  artistSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  artistAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  artistInfo: {
    flex: 1,
  },
  artistName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  artistLocation: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  followButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  followText: {
    color: '#FF6B6B',
    fontSize: 14,
    fontWeight: '500',
  },
  descriptionContainer: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: '#666',
    marginBottom: 8,
  },
  readMore: {
    fontSize: 14,
    color: '#FF6B6B',
    fontWeight: '500',
  },
  specsContainer: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  specsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  specsList: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
  },
  specItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  specLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  specValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  similarContainer: {
    paddingLeft: 20,
    marginBottom: 25,
  },
  similarTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  similarScroll: {
    paddingRight: 20,
  },
  similarItem: {
    marginRight: 15,
    width: 120,
  },
  similarImage: {
    width: 120,
    height: 150,
    borderRadius: 12,
    marginBottom: 8,
  },
  similarPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
    paddingBottom: 30,
  },
  chatButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 25,
    marginRight: 12,
  },
  chatText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    marginLeft: 6,
  },
  buyButton: {
    flex: 2,
  },
  buyGradient: {
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
  },
  buyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});