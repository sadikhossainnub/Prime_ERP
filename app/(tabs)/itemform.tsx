import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import ItemForm from '../../components/forms/ItemForm';

const ItemFormScreen = () => {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/(tabs)/itemlist');
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <ItemForm 
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

export default ItemFormScreen;