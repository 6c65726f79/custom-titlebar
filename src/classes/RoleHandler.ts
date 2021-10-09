let getFocusedWindow: () => any;
let getFocusedWebContents: () => any;

export const RoleHandler = {
  init(_getFocusedWindow: () => any, _getFocusedWebContents: () => any): void {
    getFocusedWindow = _getFocusedWindow;
    getFocusedWebContents = _getFocusedWebContents;
  },

  invoke(method: (...args: any) => void): void {
    if (typeof getFocusedWindow != 'undefined' && typeof getFocusedWebContents != 'undefined') {
      const focusedWindow = getFocusedWindow();
      const focusedWebContents = getFocusedWebContents();
      method(undefined, focusedWindow, focusedWebContents);
    }
  },
};
