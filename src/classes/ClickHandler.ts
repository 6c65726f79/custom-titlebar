import { Options } from './Options';

export const ClickHandler = {
  click(menuItem: Record<string, any>, accelerator = false): void {
    if (Options.values.menuItemClickHandler && menuItem.commandId) {
      // Use user-defined handler
      Options.values.menuItemClickHandler(menuItem.commandId);
    } else if (menuItem.click) {
      // Use default handler
      const keyboardEvent = {
        triggeredByAccelerator: accelerator,
      };

      if (menuItem.click.toString().indexOf('ipcRenderer') > 0) {
        // Invoke electron click method
        menuItem.click(
          keyboardEvent, // KeyboardEvent
          Options.values.browserWindow ? Options.values.browserWindow : null, // BrowserWindow
          Options.values.browserWindow ? Options.values.browserWindow.webContents : null, // WebContents
        );
      } else {
        // Invoke custom template click method
        menuItem.click(
          menuItem, // MenuItem
          null, // BrowserWindow
          keyboardEvent, // KeyboardEvent
        );
      }
    }
  },
};
