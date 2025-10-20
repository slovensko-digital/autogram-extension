//
//  ViewController.swift
//  autogram-extension
//
//  Created by Marek Ceľuch on 18.6.2024.
//

#if os(macOS)
import Cocoa
typealias PlatformViewController = NSViewController
#else
import UIKit
typealias PlatformViewController = UIViewController
#endif
import SafariServices
import WebKit

let extensionBundleIdentifier = "digital.slovensko.autogram.autogram-extension.Extension"

class ViewController: PlatformViewController, WKNavigationDelegate, WKScriptMessageHandler {

    @IBOutlet var webView: WKWebView!

    override func viewDidLoad() {
        super.viewDidLoad()

        self.webView.navigationDelegate = self
        
        #if os(iOS)
        // Enable web inspector for debugging (iOS 16.4+)
        if #available(iOS 16.4, *) {
            self.webView.isInspectable = true
        }
        #endif

        self.webView.configuration.userContentController.add(self, name: "controller")

        #if os(iOS)
        // For iOS, load HTML with proper resource paths
        let iconURL = Bundle.main.url(forResource: "Icon", withExtension: "png")
        let cssURL = Bundle.main.url(forResource: "Style", withExtension: "css")
        let jsURL = Bundle.main.url(forResource: "Script", withExtension: "js")
        
        print("Icon URL: \(String(describing: iconURL))")
        print("CSS URL: \(String(describing: cssURL))")
        print("JS URL: \(String(describing: jsURL))")
        
        if let cssURL = cssURL, let jsURL = jsURL {
            let iconPath = iconURL?.absoluteString ?? ""
            
            let htmlContent = """
            <!DOCTYPE html>
            <html>
            <head>
                <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">
                <link rel="stylesheet" href="\(cssURL.absoluteString)">
                <script src="\(jsURL.absoluteString)" defer></script>
            </head>
            <body>
                <img src="\(iconPath)" width="128" height="128" alt="autogram-extension Icon">
                <p class="state-unknown">You can turn on autogram-extension's extension in Safari Extensions preferences.</p>
                <p class="state-on">autogram-extension's extension is currently on. You can turn it off in Safari Extensions preferences.</p>
                <p class="state-off">autogram-extension's extension is currently off. You can turn it on in Safari Extensions preferences.</p>
                <button class="open-preferences">Quit and Open Safari Extensions Preferences…</button>
            </body>
            </html>
            """
            
            self.webView.loadHTMLString(htmlContent, baseURL: Bundle.main.resourceURL)
        } else {
            print("ERROR: Could not find CSS or JS resources")
        }
        #else
        if let htmlURL = Bundle.main.url(forResource: "Main", withExtension: "html"),
           let resourceURL = Bundle.main.resourceURL {
            self.webView.loadFileURL(htmlURL, allowingReadAccessTo: resourceURL)
        } else {
            print("ERROR: Could not find Main.html or resource URL")
        }
        #endif
    }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        #if os(macOS)
        SFSafariExtensionManager.getStateOfSafariExtension(withIdentifier: extensionBundleIdentifier) { (state, error) in
            guard let state = state, error == nil else {
                // Insert code to inform the user that something went wrong.
                return
            }

            DispatchQueue.main.async {
                if #available(macOS 13, *) {
                    webView.evaluateJavaScript("show(\(state.isEnabled), true)")
                } else {
                    webView.evaluateJavaScript("show(\(state.isEnabled), false)")
                }
            }
        }
        #else
        // On iOS, extensions are managed through Settings app
        DispatchQueue.main.async {
            webView.evaluateJavaScript("show(true, true)")
        }
        #endif
    }

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        if (message.body as! String != "open-preferences") {
            return;
        }

        #if os(macOS)
        SFSafariApplication.showPreferencesForExtension(withIdentifier: extensionBundleIdentifier) { error in
            DispatchQueue.main.async {
                NSApplication.shared.terminate(nil)
            }
        }
        #else
        // On iOS, open Settings app
        if let settingsUrl = URL(string: UIApplication.openSettingsURLString) {
            UIApplication.shared.open(settingsUrl)
        }
        #endif
    }

}
