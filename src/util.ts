import { ExtensionOptions, ExtensionOptionsString } from "./options/default";

export function TODO(...rest: unknown[]): void {
  // eslint-disable-next-line prefer-rest-params
  console.debug("TODO:", rest, arguments);
}

export function isMobileDevice(): boolean {
  // Check for mobile device using multiple methods
  const userAgent =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    navigator.userAgent || navigator.vendor || (window as any).opera;

  // Method 1: User agent detection
  const mobileRegex =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  const isMobileUA = mobileRegex.test(userAgent);

  // Method 2: Touch capability and screen size
  const isTouchDevice =
    "ontouchstart" in window || navigator.maxTouchPoints > 0;
  const isSmallScreen = window.innerWidth <= 768;

  // Method 3: Check for mobile-specific features
  const hasMobileFeatures =
    "orientation" in window || "DeviceMotionEvent" in window;

  // Consider it mobile if it matches user agent OR (has touch + small screen + mobile features)
  return isMobileUA || (isTouchDevice && isSmallScreen && hasMobileFeatures);
}

export function createAutogramOptionsCustomEvent(
  extensionOptions: ExtensionOptions
) {
  return new CustomEvent<ExtensionOptionsString>("autogram-extension-options", {
    detail: JSON.stringify(extensionOptions),
  });
}
