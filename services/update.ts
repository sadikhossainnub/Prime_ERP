import * as Application from 'expo-application';
import * as FileSystem from 'expo-file-system';
import * as Linking from 'expo-linking';
import { Alert, Platform } from 'react-native';

const UPDATE_URL = "https://primetechbd.xyz/wp-content/uploads/App/app-updates.json";

export const checkForUpdate = async () => {
    try {
        const response = await fetch(UPDATE_URL);
        const data = await response.json();

        const latestVersion = data.latest_version;
        const apkUrl = data.apk_url;
        const releaseNotes = data.release_notes || "No release notes provided.";

        const currentAppVersion = Application.nativeApplicationVersion || "1.0.0"; // Fallback

        if (Platform.OS === 'android' && latestVersion !== currentAppVersion) {
            Alert.alert(
                "Update Available",
                `A new version (${latestVersion}) is available.\n\n${releaseNotes}`,
                [
                    { text: "Later", style: "cancel" },
                    {
                        text: "Update Now",
                        onPress: () => downloadAndInstall(apkUrl),
                    },
                ]
            );
        } else if (Platform.OS === 'ios') {
            // For iOS, typically you'd redirect to the App Store.
            // You'd need to get the App Store URL from your WordPress JSON or hardcode it.
            // For now, we'll just log a message.
            console.log("iOS updates are typically handled via the App Store.");
        }
    } catch (error) {
        console.error("Update check failed", error);
    }
};

const downloadAndInstall = async (apkUrl: string) => {
    const filename = apkUrl.split('/').pop() || 'update.apk';
    const downloadPath = `${FileSystem.cacheDirectory}${filename}`;

    try {
        const { uri } = await FileSystem.downloadAsync(apkUrl, downloadPath);
        console.log('Finished downloading to ', uri);

        // This part is tricky. Directly installing an APK requires specific permissions
        // and intent handling on Android. Expo's Linking.openURL might not directly
        // trigger an APK installation intent for arbitrary files.
        // For a more robust solution outside of Play Store, you might need to
        // eject from Expo or use a custom native module.
        // However, for basic prompting, we can try to open the file,
        // which might prompt the user to choose an installer.

        await Linking.openURL(uri);

        // Alternatively, if you want to direct the user to enable "Install unknown apps"
        // before attempting installation, you might use Linking.openSettings() first,
        // but this can be disruptive.
        // Linking.openSettings();

    } catch (error) {
        console.error("APK Download or installation error", error);
        Alert.alert("Update Failed", "Could not download or install the update.");
    }
};