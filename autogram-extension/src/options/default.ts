export const defaultOptionsStorage = {
  options: {
    extensionEnabled: true,
    restorePointEnabled: false,
  },
};

export type ExtensionOptions = typeof defaultOptionsStorage.options;
export type ExtensionOptionsString = string;