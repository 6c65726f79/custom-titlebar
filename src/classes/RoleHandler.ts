import { Options } from './Options';

export const RoleHandler = {
  invoke(method: (...args: any) => void): void {
    if (Options.values.browserWindow) {
      method(undefined, Options.values.browserWindow, Options.values.browserWindow.webContents);
    }
  },
};
