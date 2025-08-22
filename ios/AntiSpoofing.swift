import Foundation
import UIKit

@objc(AntiSpoofing)
class AntiSpoofing: NSObject {

  @objc func detect(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    var result: [String: Any] = [:]
    result["vpn"] = isVpnActive()
    result["rooted"] = isJailbroken()
    result["mockLocation"] = false // iOS doesn't have a direct mock location API like Android

    resolve(result)
  }

  private func isVpnActive() -> Bool {
    var ifaddr: UnsafeMutablePointer<ifaddrs>?
    guard getifaddrs(&ifaddr) == 0 else { return false }
    var cursor = ifaddr
    var vpnConnected = false
    while cursor != nil {
      guard let ifa = cursor?.pointee else { continue }
      let name = String(cString: ifa.ifa_name)
      if name.contains("utun") || name.contains("ppp") || name.contains("tap") || name.contains("tun") {
        vpnConnected = true
        break
      }
      cursor = cursor?.pointee.ifa_next
    }
    freeifaddrs(ifaddr)
    return vpnConnected
  }

  private func isJailbroken() -> Bool {
    #if targetEnvironment(simulator)
    return false
    #else
    let fileManager = FileManager.default
    let paths = [
      "/Applications/Cydia.app",
      "/Library/MobileSubstrate/MobileSubstrate.dylib",
      "/bin/bash",
      "/usr/sbin/sshd",
      "/etc/apt",
      "/private/var/lib/apt/",
      "/usr/bin/ssh"
    ]

    for path in paths {
      if fileManager.fileExists(atPath: path) {
        return true
      }
    }

    if let cydiaURL = URL(string: "cydia://package/com.example.package") {
      if UIApplication.shared.canOpenURL(cydiaURL) {
        return true
      }
    }
    
    do {
      let stringToWrite = "Jailbreak Test"
      try stringToWrite.write(toFile: "/private/jailbreak.txt", atomically: true, encoding: .utf8)
      try fileManager.removeItem(atPath: "/private/jailbreak.txt")
      return true
    } catch {
      return false
    }
    #endif
  }

  @objc static func requiresMainQueueSetup() -> Bool {
    return true
  }
}
