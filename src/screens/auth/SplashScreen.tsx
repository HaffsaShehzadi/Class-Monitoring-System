import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function SplashScreen() {
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.7)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const dotAnims = useRef([
    new Animated.Value(0.3),
    new Animated.Value(0.3),
    new Animated.Value(0.3),
  ]).current;
  const activeDotIndex = useRef(0);

  useEffect(() => {

    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.timing(textOpacity, {
      toValue: 1,
      duration: 600,
      delay: 300,
      useNativeDriver: true,
    }).start();

    const interval = setInterval(() => {
      const nextIndex = (activeDotIndex.current + 1) % 3;
      dotAnims.forEach((anim, index) => {
        Animated.timing(anim, {
          toValue: index === nextIndex ? 1 : 0.3,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
      activeDotIndex.current = nextIndex;
    }, 700);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      {/* Official App Logo */}
      <Animated.View
        style={[
          styles.logoContainer,
          { opacity: logoOpacity, transform: [{ scale: logoScale }] },
        ]}
      >
        <Image
          source={require('../../../assets/logo-white.png')}
          style={styles.splashLogo}
          resizeMode="contain"
        />
      </Animated.View>

      <Animated.Text
        style={[
          styles.appName,
          { opacity: textOpacity },
        ]}
      >
        Class Monitoring System
      </Animated.Text>

      <View style={styles.dotsContainer}>
        {dotAnims.map((anim, index) => (
          <Animated.View
            key={index}
            style={[
              styles.dot,
              {
                opacity: anim,
                transform: [{ scale: anim }],
              },
            ]}
          />
        ))}
      </View>

      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A237E',
  },
  logoContainer: {
    marginBottom: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashLogo: {
    width: 130,
    height: 119,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 1.5,
    marginBottom: 50,
    paddingHorizontal: 20,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginHorizontal: 8,
    backgroundColor: '#4CAF50',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 10,
    opacity: 0.8,
  },
});