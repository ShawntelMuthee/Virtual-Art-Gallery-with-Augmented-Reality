import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  Dimensions,
  PanResponder,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Camera } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import * as ScreenOrientation from 'expo-screen-orientation';

const { width, height } = Dimensions.get('window');

export default function ARViewScreen({ navigation, route }) {
  const { artwork } = route.params;
  const [hasPermission, setHasPermission] = useState(null);
  const [isPlacing, setIsPlacing] = useState(false);
  const [artworkPlaced, setArtworkPlaced] = useState(false);
  const [artPosition, setArtPosition] = useState({ x: width / 2, y: height / 2 });
  const [artScale, setArtScale] = useState(1);
  const [flashMode, setFlashMode] = useState(Camera.Constants.FlashMode.off);
  const cameraRef = useRef(null);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
      
      // Lock orientation to portrait
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    })();

    return () => {
      ScreenOrientation.unlockAsync();
    };
  }, []);

  // Pan responder for dragging artwork
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => artworkPlaced,
    onMoveShouldSetPanResponder: () => artworkPlaced,
    onPanResponderMove: (evt, gestureState) => {
      setArtPosition({
        x: gestureState.moveX,
        y: gestureState.moveY,
      });
    },
  });

  const handlePlaceArt = () => {
    setIsPlacing(true);
    setTimeout(() => {
      setArtworkPlaced(true);
      setIsPlacing(false);
    }, 1000);
  };

  const handleResetPosition = () => {
    setArtPosition({ x: width / 2, y: height / 2 });
    setArtScale(1);
  };

  const handleScaleUp = () => {
    setArtScale(prev => Math.min(prev + 0.1, 2));
  };

  const handleScaleDown = () => {
    setArtScale(prev => Math.max(prev - 0.1, 0.3));
  };

  const handleTakePhoto = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false,
        });
        Alert.alert(
          'Photo Saved!',
          'Your AR preview has been saved to your gallery.',
          [{ text: 'OK' }]
        );
      } catch (error) {
        Alert.alert('Error', 'Failed to take photo');
      }
    }
  };

  const toggleFlash = () => {
    setFlashMode(
      flashMode === Camera.Constants.FlashMode.off
        ? Camera.Constants.FlashMode.torch
        : Camera.Constants.FlashMode.off
    );
  };

  if (hasPermission === null) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.permissionContainer}>
        <Ionicons name="camera-outline" size={64} color="#666" />
        <Text style={styles.permissionText}>Camera access is needed for AR view</Text>
        <TouchableOpacity 
          style={styles.permissionButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.permissionButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Camera View */}
      <Camera
        ref={cameraRef}
        style={styles.camera}
        type={Camera.Constants.Type.back}
        flashMode={flashMode}
      >
        {/* AR Artwork Overlay */}
        {artworkPlaced && (
          <View
            style={[
              styles.artworkOverlay,
              {
                left: artPosition.x - (120 * artScale) / 2,
                top: artPosition.y - (150 * artScale) / 2,
                transform: [{ scale: artScale }],
              },
            ]}
            {...panResponder.panHandlers}
          >
            <View style={styles.artworkFrame}>
              <View style={styles.artworkPlaceholder}>
                <Text style={styles.artworkTitle}>{artwork.title}</Text>
                <Text style={styles.artworkArtist}>{artwork.artist}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Placement Guide */}
        {!artworkPlaced && (
          <View style={styles.placementGuide}>
            <View style={styles.crosshair}>
              <View style={styles.crosshairLine} />
              <View style={[styles.crosshairLine, styles.crosshairLineVertical]} />
            </View>
            <Text style={styles.guideText}>
              {isPlacing ? 'Placing artwork...' : 'Tap "Place Art" to position artwork'}
            </Text>
          </View>
        )}

        {/* Top Controls */}
        <View style={styles.topControls}>
          <TouchableOpacity 
            style={styles.controlButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="close" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          
          <View style={styles.topCenter}>
            <Text style={styles.artworkInfo}>{artwork.title}</Text>
            <Text style={styles.artistInfo}>by {artwork.artist}</Text>
          </View>

          <TouchableOpacity style={styles.controlButton} onPress={toggleFlash}>
            <Ionicons 
              name={flashMode === Camera.Constants.FlashMode.off ? "flash-off" : "flash"} 
              size={24} 
              color="#FFFFFF" 
            />
          </TouchableOpacity>
        </View>

        {/* Instructions */}
        {!artworkPlaced && (
          <View style={styles.instructions}>
            <Text style={styles.instructionTitle}>AR Art Preview</Text>
            <Text style={styles.instructionText}>
              Point your camera at a wall and tap "Place Art" to see how this artwork looks in your space
            </Text>
          </View>
        )}

        {/* Bottom Controls */}
        <View style={styles.bottomControls}>
          {!artworkPlaced ? (
            <TouchableOpacity 
              style={styles.placeButton}
              onPress={handlePlaceArt}
              disabled={isPlacing}
            >
              <LinearGradient
                colors={isPlacing ? ['#999', '#666'] : ['#FF6B6B', '#FF8E53']}
                style={styles.placeGradient}
              >
                {isPlacing ? (
                  <Text style={styles.placeText}>Placing...</Text>
                ) : (
                  <>
                    <Ionicons name="add" size={20} color="#FFFFFF" />
                    <Text style={styles.placeText}>Place Art</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            <View style={styles.artControls}>
              {/* Scale Controls */}
              <View style={styles.scaleControls}>
                <TouchableOpacity style={styles.scaleButton} onPress={handleScaleDown}>
                  <Ionicons name="remove" size={20} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.scaleText}>{Math.round(artScale * 100)}%</Text>
                <TouchableOpacity style={styles.scaleButton} onPress={handleScaleUp}>
                  <Ionicons name="add" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.actionButton} onPress={handleResetPosition}>
                  <Ionicons name="refresh" size={20} color="#FFFFFF" />
                  <Text style={styles.actionText}>Reset</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.photoButton} onPress={handleTakePhoto}>
                  <LinearGradient
                    colors={['#FF6B6B', '#FF8E53']}
                    style={styles.photoGradient}
                  >
                    <Ionicons name="camera" size={24} color="#FFFFFF" />
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => {
                    setArtworkPlaced(false);
                    handleResetPosition();
                  }}
                >
                  <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.actionText}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Artwork Info Panel */}
        {artworkPlaced && (
          <View style={styles.infoPanel}>
            <Text style={styles.infoPanelText}>
              Drag to move • Use +/- to resize • Tap photo to capture
            </Text>
          </View>
        )}
      </Camera>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  camera: {
    flex: 1,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  permissionText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  permissionButton: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    backgroundColor: '#FF6B6B',
    borderRadius: 25,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  topControls: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: StatusBar.currentHeight || 44,
    paddingBottom: 20,
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 20,
  },
  artworkInfo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  artistInfo: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.8,
    marginTop: 2,
  },
  placementGuide: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
    alignItems: 'center',
  },
  crosshair: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  crosshairLine: {
    position: 'absolute',
    width: 30,
    height: 2,
    backgroundColor: '#FFFFFF',
    opacity: 0.8,
  },
  crosshairLineVertical: {
    width: 2,
    height: 30,
  },
  guideText: {
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.9,
  },
  instructions: {
    position: 'absolute',
    top: '25%',
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 12,
    padding: 20,
  },
  instructionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    lineHeight: 20,
  },
  artworkOverlay: {
    position: 'absolute',
    width: 120,
    height: 150,
  },
  artworkFrame: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 8,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  artworkPlaceholder: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  artworkTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  artworkArtist: {
    fontSize: 8,
    color: '#666',
    textAlign: 'center',
  },
  bottomControls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
  },
  placeButton: {
    alignSelf: 'center',
  },
  placeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 30,
  },
  placeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  artControls: {
    alignItems: 'center',
  },
  scaleControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginBottom: 15,
  },
  scaleButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scaleText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginHorizontal: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  actionButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 12,
    marginTop: 4,
  },
  photoButton: {
    alignSelf: 'center',
  },
  photoGradient: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoPanel: {
    position: 'absolute',
    bottom: 140,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  infoPanelText: {
    color: '#FFFFFF',
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.9,
  },
});