import React, { useRef, useCallback } from 'react';
import { Animated, ViewStyle, StyleProp } from 'react-native';
import PeekablePressable from './PeekablePressable';

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

  const handleScaleChange = useCallback(
    (scale: number) => {
      Animated.spring(scaleAnim, {
        toValue: scale,
        friction: 8,
        tension: 100,
        useNativeDriver: true,
      }).start();
    },
    [scaleAnim]
  );

  return (
    <Animated.View style={[style, { transform: [{ scale: scaleAnim }] }]}>
      <PeekablePressable
        onPress={onPress}
        onPeek={onPeek}
        onPeekEnd={onPeekEnd}
        onScaleChange={handleScaleChange}
        scaleValue={1.05}
        className="bg-card dark:bg-dark-card rounded-xl mb-2 overflow-hidden"
      >
        {children}
      </PeekablePressable>
    </Animated.View>
  );
};

export default GridPeekItem;
