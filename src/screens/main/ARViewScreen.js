// src/screens/main/ArtDetailScreen.js - Temporary placeholder
import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ArtDetailScreen({ navigation, route }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <TouchableOpacity 
          style={{ 
            position: 'absolute', 
            top: 50, 
            left: 20, 
            zIndex: 1,
            backgroundColor: '#FF6B6B',
            width: 40,
            height: 40,
            borderRadius: 20,
            justifyContent: 'center',
            alignItems: 'center'
          }}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
          Art Detail Screen
        </Text>
        <Text style={{ textAlign: 'center', color: '#666' }}>
          This is a placeholder. Replace with the full ArtDetailScreen component.
        </Text>
      </View>
    </SafeAreaView>
  );
}