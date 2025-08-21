import AsyncStorage from '@react-native-async-storage/async-storage';

const getSid = async () => {
  try {
    const sid = await AsyncStorage.getItem('prime_erp_sid');
    console.log(sid);
  } catch (error) {
    console.error('Error retrieving SID:', error);
  }
};

getSid();
