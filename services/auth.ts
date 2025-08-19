import AsyncStorage from "@react-native-async-storage/async-storage";

const SESSION_KEY = "user_session";

export const login = async (userData: any) => {
  // Extract cookies from the response headers if available
  const cookies = userData.cookies || '';
  const sid = cookies.match(/sid=([^;]+)/)?.[1] || userData.sid;
  const systemUser = cookies.match(/system_user=([^;]+)/)?.[1] || userData.system_user;

  const session = {
    name: userData.name || userData.email,
    email: userData.email,
    full_name: userData.full_name,
    sid,
    system_user: systemUser,
  };
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
};

export const logout = async () => {
  await AsyncStorage.removeItem(SESSION_KEY);
};

export const getSession = async () => {
  const sessionData = await AsyncStorage.getItem(SESSION_KEY);
  if (sessionData) {
    return JSON.parse(sessionData);
  }
  return null;
};

export default {};
