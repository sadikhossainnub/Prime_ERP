import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import QuotationForm from '../../components/forms/QuotationForm';

const QuotationFormScreen = () => {
  const router = useRouter();
  const { initialData, mode = 'create' } = useLocalSearchParams<{ initialData?: string; mode?: 'create' | 'edit' }>();

  const handleSuccess = () => {
    router.push('/(tabs)/quotationlist');
  };

  const handleCancel = () => {
    router.back();
  };

  const parsedInitialData = initialData ? JSON.parse(initialData) : {};

  return (
    <View style={styles.container}>
      <QuotationForm
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

export default QuotationFormScreen;