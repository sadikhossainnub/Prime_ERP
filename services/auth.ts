import AsyncStorage from "@react-native-async-storage/async-storage";

const SESSION_KEY = "user_session";

export const login = async (fullName: string, cookies: string | null) => {
  if (!cookies) return; // Or handle the error appropriately

  // Parse cookies to extract sid and system_user
  const sid = cookies.match(/sid=([^;]+)/)?.[1];
  const systemUser = cookies.match(/system_user=([^;]+)/)?.[1];

  const session = {
    fullName,
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
