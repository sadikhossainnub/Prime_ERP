import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import QuotationForm from '../../components/forms/QuotationForm';

const QuotationFormScreen = () => {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/(tabs)/quotationlist');
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <QuotationForm 
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

export default QuotationFormScreen;