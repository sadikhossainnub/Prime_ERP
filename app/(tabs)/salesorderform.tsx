import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import SalesOrderForm from '../../components/forms/SalesOrderForm';

const SalesOrderFormScreen = () => {
  const router = useRouter();
  const { initialData, mode = 'create' } = useLocalSearchParams<{ initialData?: string; mode?: 'create' | 'edit' }>();

  const handleSuccess = () => {
    router.push('/(tabs)/orderlist');
  };

  const handleCancel = () => {
    router.back();
  };

  const parsedInitialData = initialData ? JSON.parse(initialData) : {};

  return (
    <View style={styles.container}>
      <SalesOrderForm
        onSuccess={handleSuccess}
        onCancel={handleCancel}
        initialData={parsedInitialData}
        mode={mode as 'create' | 'edit'}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default SalesOrderFormScreen;