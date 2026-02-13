import { View, Pressable } from 'react-native';
import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  onPress?: () => void;
  className?: string;
}

export function Card({ children, onPress, className = '' }: CardProps) {
  const baseClasses = `bg-surface-light rounded-2xl p-4 ${className}`;

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        className={`${baseClasses} active:bg-surface-lighter`}
      >
        {children}
      </Pressable>
    );
  }

  return <View className={baseClasses}>{children}</View>;
}
