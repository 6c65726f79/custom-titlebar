import { Options } from './Options';

export const ClickHandler = {
  click(menuItem: Record<string,any>): void {
    if (Options.values.menuItemClickHandler && menuItem.commandId) {
      // Use user-defined handler
      Options.values.menuItemClickHandler(menuItem.commandId);
    } else if (menuItem.click) {
      // Use default handler
      if(menuItem.click.toString().indexOf('ipcRenderer') > 0) {
        // Invoke electron click method
        menuItem.click(
          {}, // KeyboardEvent
          Options.values.browserWindow ? Options.values.browserWindow : null // BrowserWindow
        );
      }
      else {
        // Invoke custom template click method
        menuItem.click(
          menuItem, // MenuItem
          null, // BrowserWindow
          {}, // KeyboardEvent
        );
      }
    }
  }
};
