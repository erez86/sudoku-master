import React from 'react';
import { Text, StyleSheet, TextProps } from 'react-native';

interface TypographyProps extends TextProps {
  variant?: 'title' | 'body' | 'label' | 'caption';
  children: React.ReactNode;
}

export const Typography: React.FC<TypographyProps> = ({
  variant = 'body',
  style,
  children,
  ...props
}) => {
  return (
    <Text style={[styles[variant], style]} {...props}>
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 32,
    fontFamily: 'Quicksand_700Bold',
    color: '#2c3e50',
    textAlign: 'center',
  },
  body: {
    fontSize: 16,
    fontFamily: 'Quicksand_400Regular',
    color: '#34495e',
    lineHeight: 24,
  },
  label: {
    fontSize: 18,
    fontFamily: 'Quicksand_600SemiBold',
    color: '#2c3e50',
  },
  caption: {
    fontSize: 14,
    fontFamily: 'Quicksand_400Regular',
    color: '#7f8c8d',
  },
});