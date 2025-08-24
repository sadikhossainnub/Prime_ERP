# App Update Instructions for WordPress

This document provides instructions on how to manage and publish updates for your mobile application using your WordPress site as the update server.

## Overview

The application is configured to check for updates by fetching a JSON file from your WordPress server. This file contains information about the latest version of the app, a link to the downloadable APK file, and release notes.

**Update URL:** `https://primetechbd.xyz/wp-content/uploads/App/app-updates.json`

---

## How to Publish a New Update

Follow these steps each time you want to release a new version of your application.

### Step 1: Prepare Your Update Files

For each new update, you will need two essential files:

1.  **The APK File:** The new version of your Android application package (e.g., `my-app-v1.1.0.apk`).
2.  **The JSON Configuration File:** A file named `app-updates.json` that informs the app about the new update.

### Step 2: Upload the APK File to WordPress

1.  Log in to your WordPress admin dashboard.
2.  Navigate to **Media > Add New**.
3.  Upload your new APK file (e.g., `my-app-v1.1.0.apk`).
4.  After the upload is complete, go to the **Media Library**, click on the newly uploaded APK file to view its details, and copy the **File URL**. You will need this URL for the next step.

### Step 3: Create and Upload the `app-updates.json` File

1.  On your local computer, create a new file and name it `app-updates.json`.
2.  Open the file in a text editor and add the following content. **Remember to replace the placeholder values with your actual data.**

    ```json
    {
      "latest_version": "1.1.0",
      "apk_url": "https://primetechbd.xyz/wp-content/uploads/2025/08/my-app-v1.1.0.apk",
      "release_notes": "- New feature: Users can now customize their profiles.\\n- Bug fix: Resolved a crash issue on the main screen.\\n- Performance improvements."
    }
    ```

    **Field Descriptions:**
    *   `latest_version`: The new version number of your app (e.g., "1.1.0"). This **must be higher** than the current app version to trigger the update prompt.
    *   `apk_url`: The full URL of the APK file you uploaded to your WordPress Media Library in Step 2.
    *   `release_notes`: A description of the changes in the new version. Use `\n` for line breaks.

3.  Upload the `app-updates.json` file to your WordPress site in the following directory: `wp-content/uploads/App/`.

    You can do this using an FTP client (like FileZilla) or a file manager plugin from your WordPress dashboard. Ensure the final URL of this file is exactly the one specified in the "Overview" section.

---

## Verification

Once both files are correctly uploaded, the application will automatically detect the new version on the next launch and prompt users to update.
