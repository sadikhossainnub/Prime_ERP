# App Update Instructions for Google Drive

This document provides instructions on how to manage and publish updates for your mobile application using Google Drive as the update server.

## Overview

The application is configured to check for updates by fetching a JSON file from a Google Drive link. This file contains information about the latest version of the app, a link to the downloadable APK file, and release notes.

**Update URL:** `https://docs.google.com/uc?export=download&id=1q6KW24v02h3g24JzOr3E8v-E2Y2kXJmC`

---

## How to Publish a New Update

Follow these steps each time you want to release a new version of your application.

### Step 1: Prepare Your Update Files

For each new update, you will need two essential files:

1.  **The APK File:** The new version of your Android application package (e.g., `my-app-v1.1.0.apk`).
2.  **The JSON Configuration File:** A file named `app-updates.json` that informs the app about the new update.

### Step 2: Upload the APK File to Google Drive

1.  Upload your new APK file (e.g., `my-app-v1.1.0.apk`) to a folder in your Google Drive.
2.  Get the shareable link for the uploaded APK file. Make sure the link is set to "Anyone with the link can view."
3.  Convert the shareable link to a direct download link. A standard Google Drive shareable link looks like this: `https://drive.google.com/file/d/FILE_ID/view?usp=sharing`. You need to transform it into this format: `https://docs.google.com/uc?export=download&id=FILE_ID`.

### Step 3: Create and Upload the `app-updates.json` File

1.  On your local computer, create a new file and name it `app-updates.json`.
2.  Open the file in a text editor and add the following content. **Remember to replace the placeholder values with your actual data.**

    ```json
    {
      "latest_version": "1.0.1",
      "apk_url": "https://docs.google.com/uc?export=download&id=1LkL5hNB5j-bV-g9t5jFp-F-M9E8d4C3b",
      "release_notes": "The app now fetches updates from Google Drive. This release includes improvements to the update mechanism and other minor bug fixes."
    }
    ```

    **Field Descriptions:**
    *   `latest_version`: The new version number of your app (e.g., "1.1.0"). This **must be higher** than the current app version to trigger the update prompt.
    *   `apk_url`: The direct download link of the APK file you uploaded to Google Drive in Step 2.
    *   `release_notes`: A description of the changes in the new version. Use `\n` for line breaks.

3.  Upload the `app-updates.json` file to Google Drive and get a direct download link for it, just as you did with the APK file. This link should be used as the `UPDATE_URL` in the application's source code.

---

## Verification

Once both files are correctly uploaded and the links are properly configured, the application will automatically detect the new version on the next launch and prompt users to update.
