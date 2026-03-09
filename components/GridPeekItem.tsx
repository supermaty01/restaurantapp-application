import React, { useRef, useState, useCallback } from 'react';
import { Pressable, Animated, ViewStyle, StyleProp } from 'react-native';

interface GridPeekItemProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  onPeek?: () => void;
  onPeekEnd?: () => void;
}

const GridPeekItem: React.FC<GridPeekItemProps> = ({
  children,
  style,
  onPress,
  onPeek,
  onPeekEnd,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [isPeeking, setIsPeeking] = useState(false);
  const isPeekingRef = useRef(false);

  const handleLongPress = useCallback(() => {
    isPeekingRef.current = true;
    setIsPeeking(true);
    Animated.spring(scaleAnim, {
      toValue: 1.05,
      friction: 8,
      tension: 100,
      useNativeDriver: true,
    }).start();
    onPeek?.();
  }, [onPeek, scaleAnim]);

  const handlePressOut = useCallback(() => {
    if (isPeekingRef.current) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 100,
        useNativeDriver: true,
      }).start();
      setIsPeeking(false);
      isPeekingRef.current = false;
      onPeekEnd?.();
    }
  }, [onPeekEnd, scaleAnim]);

  const handlePress = useCallback(() => {
    if (!isPeekingRef.current) {
      onPress?.();
    }
  }, [onPress]);

  return (
    <Animated.View style={[style, { transform: [{ scale: scaleAnim }] }]}>
      <Pressable
        onPress={handlePress}
        onLongPress={handleLongPress}
        delayLongPress={150}
        onPressOut={handlePressOut}
        pressRetentionOffset={{ top: 2000, bottom: 2000, left: 2000, right: 2000 }}
        style={({ pressed }) => ({ opacity: pressed && !isPeeking ? 0.8 : 1 })}
        className="bg-card dark:bg-dark-card rounded-xl mb-2 overflow-hidden"
      >
        {children}
      </Pressable>
    </Animated.View>
  );
};

export default GridPeekItem;

