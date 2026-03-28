/**
 *
 * @returns true if the browser is Safari (heuristic based on navigator.userAgent)
 */
export function isSafari(): boolean {
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
}

export function isMacOS(): boolean {
  return navigator.platform.toUpperCase().indexOf("MAC") >= 0;
}

export function isMobileDevice(): boolean {
  // Check for mobile device using multiple methods
  const userAgent =
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
