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
        
        // Helper function to convert UIImage to base64 data URL
        func imageToDataURL(_ imageName: String) -> String {
            if let image = UIImage(named: imageName),
               let imageData = image.pngData() {
                return "data:image/png;base64,\(imageData.base64EncodedString())"
            }
            return ""
        }
        
        if let cssURL = cssURL, let jsURL = jsURL {
            let iconPath = iconURL?.absoluteString ?? ""
            let tutorial1 = imageToDataURL("Tutorial1")
            let tutorial2 = imageToDataURL("Tutorial2")
            let tutorial3 = imageToDataURL("Tutorial3")
            let tutorial4 = imageToDataURL("Tutorial4")
            let tutorial5 = imageToDataURL("Tutorial5")
            let tutorial6 = imageToDataURL("Tutorial6")
            let tutorial7 = imageToDataURL("Tutorial7")
            
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
                <img src="\(iconPath)" width="80" height="80" alt="autogram-extension Icon">
                <h2 class="state-ios">Ako zapnúť rozšírenie Autogram na štýtnych weboch</h2>
                <p class="state-unknown">You can turn on autogram-extension's extension in Safari Extensions preferences.</p>
                <p class="state-on">autogram-extension's extension is currently on. You can turn it off in Safari Extensions preferences.</p>
                <p class="state-off">autogram-extension's extension is currently off. You can turn it on in Safari Extensions preferences.</p>
                <div class="state-ios tutorial-container">
                    <div class="tutorial-step">
                        <div class="step-number">1</div>
                        <p class="step-text">Navštívte <strong>slovensko.sk</strong> v Safari a kliknite na ikonu v adresnom riadku</p>
                        \(tutorial1.isEmpty ? "" : "<img src=\"\(tutorial1)\" class=\"tutorial-image\" alt=\"Krok 1\">")
                    </div>
                    <div class="tutorial-step">
                        <div class="step-number">2</div>
                        <p class="step-text">Vyberte <strong>Spravovať rozšírenia</strong></p>
                        \(tutorial2.isEmpty ? "" : "<img src=\"\(tutorial2)\" class=\"tutorial-image\" alt=\"Krok 2\">")
                    </div>
                    <div class="tutorial-step">
                        <div class="step-number">3</div>
                        <p class="step-text">Nájdite rozšírenie <strong>Autogram na štátnych weboch</strong> v zozname</p>
                        \(tutorial3.isEmpty ? "" : "<img src=\"\(tutorial3)\" class=\"tutorial-image\" alt=\"Krok 3\">")
                    </div>
                    <div class="tutorial-step">
                        <div class="step-number">4</div>
                        <p class="step-text">Zapnite prepínač vedľa rozšírenia</p>
                        \(tutorial4.isEmpty ? "" : "<img src=\"\(tutorial4)\" class=\"tutorial-image\" alt=\"Krok 4\">")
                    </div>
                    <div class="tutorial-step">
                        <div class="step-number">5</div>
                        <p class="step-text">Potvrďte, že chcete povoliť rozšírenie</p>
                        \(tutorial5.isEmpty ? "" : "<img src=\"\(tutorial5)\" class=\"tutorial-image\" alt=\"Krok 5\">")
                    </div>
                    <div class="tutorial-step">
                        <div class="step-number">6</div>
                        <p class="step-text">Vyberte <strong>Vždy povoliť na tejto webstránke</strong> alebo <strong>Vždy povoliť na všetkých webových stránkach</strong></p>
                        \(tutorial6.isEmpty ? "" : "<img src=\"\(tutorial6)\" class=\"tutorial-image\" alt=\"Krok 6\">")
                    </div>
                    <div class="tutorial-step">
                        <div class="step-number">7</div>
                        <p class="step-text">Rozšírenie je teraz povolené a pripravené na použitie</p>
                        \(tutorial7.isEmpty ? "" : "<img src=\"\(tutorial7)\" class=\"tutorial-image\" alt=\"Krok 7\">")
                    </div>
                </div>
                <button class="open-preferences">Quit and Open Safari Extensions Preferences…</button>
                <button class="open-safari">Otvoriť slovensko.sk v Safari</button>
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
        // On iOS, extensions are enabled per-site in Safari
        DispatchQueue.main.async {
            webView.evaluateJavaScript("showIOS()")
        }
        #endif
    }

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        guard let messageBody = message.body as? String else {
            return
        }
        
        if messageBody == "open-preferences" {
            #if os(macOS)
            SFSafariApplication.showPreferencesForExtension(withIdentifier: extensionBundleIdentifier) { error in
                DispatchQueue.main.async {
                    NSApplication.shared.terminate(nil)
                }
            }
            #endif
        } else if messageBody == "open-safari" {
            #if os(iOS)
            // Open slovensko.sk in Safari on iOS
            if let slovenkoUrl = URL(string: "https://slovensko.sk") {
                UIApplication.shared.open(slovenkoUrl)
            }
            #endif
        }
    }

}
