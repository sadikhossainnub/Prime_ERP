import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import CustomerForm from '../../components/forms/CustomerForm';

const CustomerFormScreen = () => {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/(tabs)/customerlist');
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <CustomerForm 
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

export default CustomerFormScreen;