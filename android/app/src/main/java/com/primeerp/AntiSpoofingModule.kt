package com.primeerp

import android.location.Location
import android.os.Build
import android.util.Log
import com.facebook.react.bridge.*
import com.google.android.gms.location.LocationServices
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.content.Context
import java.net.NetworkInterface

class AntiSpoofingModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
  override fun getName() = "AntiSpoofing"

  @ReactMethod
  fun detect(promise: Promise) {
    val result = Arguments.createMap()
    try {
      // 1) VPN detection
      val vpnActive = isVpnActive()
      result.putBoolean("vpn", vpnActive)

      // 2) Root detection
      val rooted = isRooted()
      result.putBoolean("rooted", rooted)

      // 3) Mock GPS detection
      detectMockLocation(promise, result)
    } catch (e: Exception) {
      promise.reject("ERR_ANTI_SPOOF", e)
    }
  }

  private fun isVpnActive(): Boolean {
    val cm = reactContext.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
      val activeNetwork = cm.activeNetwork
      val caps = cm.getNetworkCapabilities(activeNetwork)
      return caps?.hasTransport(NetworkCapabilities.TRANSPORT_VPN) == true
    }

    // Fallback for older APIs
    try {
      val networks = NetworkInterface.getNetworkInterfaces()
      while (networks.hasMoreElements()) {
        val iface = networks.nextElement()
        if (iface.name.contains("tun") || iface.name.contains("ppp") || iface.name.contains("tap")) {
          return true
        }
      }
    } catch (e: Exception) {
      Log.e("AntiSpoofing", "Error checking network interfaces for VPN", e)
    }
    return false
  }

  private fun isRooted(): Boolean {
    val buildTags = Build.TAGS
    if (buildTags != null && buildTags.contains("test-keys")) {
      return true
    }
    try {
      val paths = arrayOf(
        "/system/app/Superuser.apk", "/sbin/su", "/system/bin/su", "/system/xbin/su",
        "/data/local/xbin/su", "/data/local/bin/su", "/system/sd/xbin/su",
        "/system/bin/failsafe/su", "/data/local/su", "/su/bin/su"
      )
      for (path in paths) {
        if (java.io.File(path).exists()) return true
      }
    } catch (e: Exception) {
      // ignore
    }
    return false
  }

  private fun detectMockLocation(promise: Promise, result: WritableMap) {
    try {
      val fused = LocationServices.getFusedLocationProviderClient(reactContext)
      fused.lastLocation.addOnSuccessListener { location: Location? ->
        val isMock = if (location != null) {
          if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            location.isMock
          } else {
            @Suppress("DEPRECATION")
            location.isFromMockProvider
          }
        } else {
          false
        }
        result.putBoolean("mockLocation", isMock)
        promise.resolve(result)
      }.addOnFailureListener {
        result.putBoolean("mockLocation", false)
        promise.resolve(result)
      }
    } catch (e: SecurityException) {
      Log.w("AntiSpoofing", "Location permission missing", e)
      result.putBoolean("mockLocation", false)
      promise.resolve(result)
    } catch (e: Exception) {
      Log.e("AntiSpoofing", "Error detecting mock location", e)
      result.putBoolean("mockLocation", false)
      promise.resolve(result)
    }
  }
}
