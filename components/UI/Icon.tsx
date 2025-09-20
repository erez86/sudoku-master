import React from 'react';
import {
  Ionicons,
  MaterialIcons,
  FontAwesome,
  AntDesign,
  Feather
} from '@expo/vector-icons';

type IconLibrary = 'ionicons' | 'material' | 'fontawesome' | 'antdesign' | 'feather';

interface IconProps {
  library: IconLibrary;
  name: string;
  size?: number;
  color?: string;
}

export const Icon: React.FC<IconProps> = ({
  library,
  name,
  size = 24,
  color = '#000'
}) => {
  const IconComponent = {
    ionicons: Ionicons,
    material: MaterialIcons,
    fontawesome: FontAwesome,
    antdesign: AntDesign,
    feather: Feather,
  }[library];

  return <IconComponent name={name as any} size={size} color={color} />;
};