import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { apiRequest } from '@/services/api';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import QuotationForm from '../../components/forms/QuotationForm';

const QuotationFormScreen = () => {
  const router = useRouter();
  const { name, mode: routeMode } = useLocalSearchParams<{ name?: string; mode?: 'create' | 'edit' | 'view' }>();
  const [initialData, setInitialData] = useState<Record<string, any> | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  const mode = routeMode || 'create';

  useEffect(() => {
    if (name && (mode === 'edit' || mode === 'view')) {
      const fetchDoc = async () => {
        setLoading(true);
        setError(null);
        try {
          const response = await apiRequest(`Quotation/${name}`);
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
    router.push('/(tabs)/quotationlist');
  };

  const handleCancel = () => {
    router.back();
  };

  const styles = getStyles({
    background: backgroundColor,
    text: textColor,
  });

  if (loading) {
    return (
      <ThemedView style={styles.centered}>
        <Text style={styles.text}>Loading...</Text>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.centered}>
        <Text style={styles.text}>{error}</Text>
      </ThemedView>
    );
  }
  
  if ((mode === 'edit' || mode === 'view') && !initialData) {
    return (
      <ThemedView style={styles.centered}>
        <Text style={styles.text}>Document not found.</Text>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <QuotationForm
        onSuccess={handleSuccess}
        onCancel={handleCancel}
        mode={mode as 'create' | 'edit' | 'view'}
        initialData={initialData}
      />
    </ThemedView>
  );
};

const getStyles = (theme: { background: string; text: string }) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.background,
    },
    text: {
      color: theme.text,
    },
  });

export default QuotationFormScreen;
