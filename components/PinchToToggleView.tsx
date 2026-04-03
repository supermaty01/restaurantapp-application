import React, { useCallback } from 'react';
import { StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import { runOnJS } from 'react-native-reanimated';

interface PinchToToggleViewProps {
  children: React.ReactNode;
  isGridView: boolean;
  onToggle: (grid: boolean) => void;
}

export default function PinchToToggleView({
  children,
  isGridView,
  onToggle,
}: PinchToToggleViewProps) {
  const switchToGrid = useCallback(() => {
    if (!isGridView) onToggle(true);
  }, [isGridView, onToggle]);

  const switchToList = useCallback(() => {
    if (isGridView) onToggle(false);
  }, [isGridView, onToggle]);

  const pinch = Gesture.Pinch().onEnd((e) => {
    if (e.scale < 0.75) {
      runOnJS(switchToGrid)();
    } else if (e.scale > 1.35) {
      runOnJS(switchToList)();
    }
  });

  return (
    <GestureDetector gesture={pinch}>
      <Animated.View style={styles.container}>{children}</Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
