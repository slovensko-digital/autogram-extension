//
//  AppDelegate.swift
//  autogram-extension
//
//  Created by Marek Ceľuch on 18.6.2024.
//

#if os(macOS)
import Cocoa
typealias PlatformApplicationDelegate = NSApplicationDelegate
typealias PlatformApplication = NSApplication
#else
import UIKit
typealias PlatformApplicationDelegate = UIApplicationDelegate
typealias PlatformApplication = UIApplication
#endif

@main
class AppDelegate: NSObject, PlatformApplicationDelegate {

    #if os(macOS)
    func applicationDidFinishLaunching(_ notification: Notification) {
        // Override point for customization after application launch.
    }

    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool {
        return true
    }
    #else
    var window: UIWindow?
    
    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Override point for customization after application launch.
        return true
    }
    #endif

}
