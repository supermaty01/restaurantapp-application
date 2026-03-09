import React, { useRef, useState, useCallback } from 'react';
import { View, ViewStyle, StyleProp } from 'react-native';

const LONG_PRESS_DELAY = 200;

interface PeekablePressableProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  className?: string;
  onPress?: () => void;
  onPeek?: () => void;
  onPeekEnd?: () => void;
  onScaleChange?: (scale: number) => void;
  scaleValue?: number;
  /** Base opacity (e.g. 0.7 for disabled/deleted items). Multiplied with press opacity. */
  baseOpacity?: number;
}

/**
 * A pressable that supports immediate onPress (no delay) and long-press peeking.
 * Uses touch handlers instead of Pressable to avoid the global delay caused by
 * delayLongPress. The setTimeout is only used for long-press detection - onPress
 * fires immediately when the user releases on a quick tap.
 */
const PeekablePressable: React.FC<PeekablePressableProps> = ({
  children,
  style,
  className,
  onPress,
  onPeek,
  onPeekEnd,
  onScaleChange,
  scaleValue = 1.03,
  baseOpacity = 1,
}) => {
  const longPressTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isPeekingRef = useRef(false);
  const [isPressed, setIsPressed] = useState(false);
  const [isPeeking, setIsPeeking] = useState(false);

  const clearLongPressTimeout = useCallback(() => {
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
      longPressTimeoutRef.current = null;
    }
  }, []);

  const handleLongPress = useCallback(() => {
    isPeekingRef.current = true;
    setIsPeeking(true);
    onPeek?.();
    onScaleChange?.(scaleValue);
  }, [onPeek, onScaleChange, scaleValue]);

  const handleTouchStart = useCallback(() => {
    setIsPressed(true);
    clearLongPressTimeout();
    longPressTimeoutRef.current = setTimeout(() => {
      longPressTimeoutRef.current = null;
      handleLongPress();
    }, LONG_PRESS_DELAY);
  }, [clearLongPressTimeout, handleLongPress]);

  const handleTouchEnd = useCallback(() => {
    setIsPressed(false);
    clearLongPressTimeout();

    if (isPeekingRef.current) {
      isPeekingRef.current = false;
      setIsPeeking(false);
      onScaleChange?.(1);
      onPeekEnd?.();
    } else {
      // Fire onPress immediately - no delay. We're in the else branch because
      // long press didn't fire, so we can call onPress right away.
      onPress?.();
    }
  }, [clearLongPressTimeout, onPress, onPeekEnd, onScaleChange]);

  const handleTouchCancel = useCallback(() => {
    setIsPressed(false);
    clearLongPressTimeout();
    if (isPeekingRef.current) {
      isPeekingRef.current = false;
      setIsPeeking(false);
      onScaleChange?.(1);
      onPeekEnd?.();
    }
  }, [clearLongPressTimeout, onScaleChange, onPeekEnd]);

  const handleTouchMove = useCallback(() => {
    // Allow finger movement while holding - preserves peeking functionality.
    // Optional: could add scroll threshold to cancel peek if moved too far.
  }, []);

  return (
    <View
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
      onTouchMove={handleTouchMove}
      style={[
        style,
        { opacity: baseOpacity * (isPressed && !isPeeking ? 0.8 : 1) },
      ]}
      className={className}
    >
      {children}
    </View>
  );
};

export default PeekablePressable;
