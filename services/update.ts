import * as Application from 'expo-application';
import * as FileSystem from 'expo-file-system';
import * as IntentLauncher from 'expo-intent-launcher';
import { Alert, Platform } from 'react-native';

const UPDATE_URL = "https://docs.google.com/uc?export=download&id=1q6KW24v02h3g24JzOr3E8v-E2Y2kXJmC";

// A more robust version comparison function
const compareVersions = (v1: string, v2: string) => {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);
    const len = Math.max(parts1.length, parts2.length);

    for (let i = 0; i < len; i++) {
        const p1 = parts1[i] || 0;
        const p2 = parts2[i] || 0;
        if (p1 > p2) return 1;
        if (p1 < p2) return -1;
    }
    return 0;
};

export const checkForUpdate = async () => {
    if (__DEV__) {
        console.log("Skipping update check in development mode.");
        return;
    }

    try {
        const response = await fetch(UPDATE_URL);
        const data = await response.json();

        const latestVersion = data.latest_version;
        const apkUrl = data.apk_url;
        const releaseNotes = data.release_notes || "No release notes provided.";

        const currentAppVersion = Application.nativeApplicationVersion;

        if (!currentAppVersion) {
            console.warn("Could not determine current app version.");
            return;
        }

        if (Platform.OS === 'android' && compareVersions(latestVersion, currentAppVersion) > 0) {
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
        }
    } catch (error) {
        console.error("Update check failed", error);
    }
};

const downloadAndInstall = async (apkUrl: string) => {
    try {
        const filename = apkUrl.split('/').pop() || 'update.apk';
        const downloadPath = `${FileSystem.cacheDirectory}${filename}`;

        console.log(`Downloading update from ${apkUrl} to ${downloadPath}`);
        const { uri } = await FileSystem.downloadAsync(apkUrl, downloadPath);
        console.log('Finished downloading to ', uri);

        if (Platform.OS === 'android') {
            const contentUri = await FileSystem.getContentUriAsync(uri);
            console.log('Got content URI:', contentUri);
            
            IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
                data: contentUri,
                flags: 1, // FLAG_GRANT_READ_URI_PERMISSION
                type: 'application/vnd.android.package-archive',
            });
        }

    } catch (error) {
        console.error("APK Download or installation error", error);
        Alert.alert("Update Failed", "Could not download or install the update. Please try again later.");
    }
};