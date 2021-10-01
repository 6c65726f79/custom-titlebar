let getFocusedWindow: () => any;
let getFocusedWebContents: () => any;

export const RoleHandler = {
  init(_getFocusedWindow: () => any, _getFocusedWebContents: () => any) {
    getFocusedWindow = _getFocusedWindow;
    getFocusedWebContents = _getFocusedWebContents;
  },

  invoke(method: (...args: any) => void) {
    if (typeof getFocusedWindow != 'undefined' && typeof getFocusedWebContents != 'undefined') {
      const focusedWindow = getFocusedWindow();
      const focusedWebContents = getFocusedWebContents();
      method(undefined, focusedWindow, focusedWebContents);
    }
  },
};
