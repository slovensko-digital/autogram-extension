export const defaultOptionsStorage = {
  options: {
    extensionEnabled: true,
    restorePointEnabled: true,
    notifyPairedDevices: true,
  },
};

export type ExtensionOptions = typeof defaultOptionsStorage.options;
export type ExtensionOptionsString = string;
