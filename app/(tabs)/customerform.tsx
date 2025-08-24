import { apiRequest } from '@/services/api';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import CustomerForm from '../../components/forms/CustomerForm';

const CustomerFormScreen = () => {
  const router = useRouter();
  const { name, mode: routeMode } = useLocalSearchParams<{ name?: string; mode?: 'create' | 'edit' | 'view' }>();
  const [initialData, setInitialData] = useState<Record<string, any> | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mode = routeMode || 'create';

  useEffect(() => {
    if (name && (mode === 'edit' || mode === 'view')) {
      const fetchDoc = async () => {
        setLoading(true);
        setError(null);
        try {
          const response = await apiRequest(`Customer/${name}`);
          setInitialData(response.data);
        } catch (err) {
          setError('Failed to fetch document data.');
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchDoc();
    }
  }, [name, mode]);

  const handleSuccess = () => {
    router.push('/(tabs)/customerlist');
  };

  const handleCancel = () => {
    router.back();
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text>{error}</Text>
      </View>
    );
  }
  
  if ((mode === 'edit' || mode === 'view') && !initialData) {
    return (
      <View style={styles.centered}>
        <Text>Document not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CustomerForm
        onSuccess={handleSuccess}
        onCancel={handleCancel}
        mode={mode as 'create' | 'edit' | 'view'}
        initialData={initialData}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CustomerFormScreen;