import React from 'react';
import { Pressable, Text, View } from 'react-native';

export default function BlockedScreen({ reason, onRetry }: { reason: string; onRetry: () => void }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
      <Text style={{ fontSize: 24, fontWeight: '700', textAlign: 'center', marginBottom: 12 }}>
        App blocked
      </Text>
      <Text style={{ fontSize: 16, textAlign: 'center', marginBottom: 24 }}>
        {reason}\n\nPlease disable VPN, mock location, and remove any security-compromising software, then try again.
      </Text>
      <Pressable onPress={onRetry} style={{ paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, backgroundColor: '#222' }}>
        <Text style={{ color: 'white', fontWeight: '600' }}>Retry</Text>
      </Pressable>
    </View>
  );
}
