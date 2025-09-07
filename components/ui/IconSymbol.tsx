// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolViewProps, SymbolWeight } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Partial<Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>>;
export type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'cart': 'shopping-cart',
  'archive': 'inventory',
  'users': 'group',
  'dollar-sign': 'currency-bdt',
  'briefcase': 'business-center',
  'banknote.fill': 'attach_money',
  'plus': 'add', // Mapping for "plus" icon
  'customers': 'group', // Mapping for "customers" icon, re-using 'group'
  'items': 'inventory', // Mapping for "items" icon, re-using 'inventory'
  'revenue': 'attach_money', // For total revenue
  'calendar': 'calendar_today', // For "This Month"
  'orders': 'description', // For "Orders" card
  'quotes': 'receipt_long', // For "Quotes" card
  'arrow.right': 'arrow_forward', // For navigation arrow
  'chart.line.up': 'show_chart', // For positive trend, using show_chart
  'checkmark.circle.fill': 'check_circle', // For completed status
  'recent.activity.order': 'description', // For recent order activity
  'recent.activity.quote': 'receipt_long', // For recent quote activity
  'attention': 'info', // For attention needed icon
};

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name] as any || 'help'} style={style} />;
}
