import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import SalesOrderForm from '../../components/forms/SalesOrderForm';

const SalesOrderFormScreen = () => {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/(tabs)/orderlist');
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <SalesOrderForm 
        onSuccess={handleSuccess}
        onCancel={handleCancel}
        mode="create"
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