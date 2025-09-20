import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle, TextStyle, View } from 'react-native';
import { Typography } from './Typography';
import { Icon } from './Icon';

interface IconConfig {
  library: 'ionicons' | 'material' | 'fontawesome' | 'antdesign' | 'feather';
  name: string;
}

interface ButtonProps {
  title?: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning';
  size?: 'small' | 'medium' | 'large';
  icon?: IconConfig;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  iconOnly?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  icon,
  iconPosition = 'left',
  disabled = false,
  style,
  textStyle,
  iconOnly = false,
}) => {
  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'primary':
        return { backgroundColor: '#3498db' };
      case 'secondary':
        return { backgroundColor: '#95a5a6' };
      case 'danger':
        return { backgroundColor: '#e74c3c' };
      case 'success':
        return { backgroundColor: '#27ae60' };
      case 'warning':
        return { backgroundColor: '#f39c12' };
      default:
        return { backgroundColor: '#3498db' };
    }
  };

  const getSizeStyle = (): ViewStyle => {
    if (iconOnly) {
      switch (size) {
        case 'small':
          return { padding: 8 };
        case 'medium':
          return { padding: 12 };
        case 'large':
          return { padding: 16 };
        default:
          return { padding: 12 };
      }
    }

    switch (size) {
      case 'small':
        return { paddingVertical: 8, paddingHorizontal: 16 };
      case 'medium':
        return { paddingVertical: 12, paddingHorizontal: 24 };
      case 'large':
        return { paddingVertical: 16, paddingHorizontal: 32 };
      default:
        return { paddingVertical: 12, paddingHorizontal: 24 };
    }
  };

  const getTextSize = (): 'caption' | 'label' => {
    return size === 'small' ? 'caption' : 'label';
  };

  const buttonStyle = [
    styles.button,
    getVariantStyle(),
    getSizeStyle(),
    disabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.text,
    textStyle,
  ];

  const getIconSize = (): number => {
    switch (size) {
      case 'small': return 16;
      case 'medium': return 20;
      case 'large': return 24;
      default: return 20;
    }
  };

  const renderContent = () => {
    if (!icon) {
      return (
        <Typography variant={getTextSize()} style={textStyles}>
          {title}
        </Typography>
      );
    }

    const iconComponent = (
      <Icon
        library={icon.library}
        name={icon.name}
        size={getIconSize()}
        color="#fff"
      />
    );

    if (iconOnly) {
      return iconComponent;
    }

    if (iconPosition === 'left') {
      return (
        <View style={styles.contentContainer}>
          <View style={styles.iconContainer}>
            {iconComponent}
          </View>
          <Typography variant={getTextSize()} style={[textStyles, styles.textWithIcon]}>
            {title}
          </Typography>
        </View>
      );
    }

    return (
      <View style={styles.contentContainer}>
        <Typography variant={getTextSize()} style={[textStyles, styles.textWithIcon]}>
          {title}
        </Typography>
        <View style={styles.iconContainer}>
          {iconComponent}
        </View>
      </View>
    );
  };

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginHorizontal: 8,
  },
  text: {
    color: '#fff',
    textAlign: 'center',
  },
  textWithIcon: {
    flex: 1,
  },
  disabled: {
    backgroundColor: '#bdc3c7',
    opacity: 0.6,
  },
});