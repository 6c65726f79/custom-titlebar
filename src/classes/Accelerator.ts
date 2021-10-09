import { Options } from './Options';

export const Accelerator = {
  formatElectronAccelerator(accelerator: string): string {
    const platform = Options.getPlatform();
    return accelerator
      .replace('CmdOrCtrl', platform == 'darwin' ? 'Cmd' : 'Ctrl')
      .replace('CommandOrControl', platform == 'darwin' ? 'Cmd' : 'Ctrl')
      .replace('Command', 'Cmd')
      .replace('Control', 'Ctrl');
  },

  formatNWAccelerator(modifiers: string, key: string): string {
    return modifiers.split('+').map(capitalizeFirstLetter).join('+') + '+' + capitalizeFirstLetter(key);
  },

  getDefaultRoleAccelerator(role: string): string | undefined {
    const platform = Options.getPlatform();
    switch (role) {
      case 'close':
        return 'CommandOrControl+W';
      case 'copy':
        return 'CommandOrControl+C';
      case 'cut':
        return 'CommandOrControl+X';
      case 'forcereload':
        return 'Shift+CmdOrCtrl+R';
      case 'hide':
        return 'Command+H';
      case 'hideothers':
        return 'Command+Alt+H';
      case 'minimize':
        return 'CommandOrControl+M';
      case 'paste':
        return 'CommandOrControl+V';
      case 'pasteandmatchstyle':
        return platform == 'darwin' ? 'Cmd+Option+Shift+V' : 'Shift+CommandOrControl+V';
      case 'quit':
        return platform == 'win' ? undefined : 'CommandOrControl+Q';
      case 'redo':
        return platform == 'win' ? 'Control+Y' : 'Shift+CommandOrControl+Z';
      case 'reload':
        return 'CmdOrCtrl+R';
      case 'resetzoom':
        return 'CommandOrControl+0';
      case 'selectall':
        return 'CommandOrControl+A';
      case 'toggledevtools':
        return platform == 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I';
      case 'togglefullscreen':
        return platform == 'darwin' ? 'Control+Command+F' : 'F11';
      case 'undo':
        return 'CommandOrControl+Z';
      case 'zoomin':
        return 'CommandOrControl+Plus';
      case 'zoomout':
        return 'CommandOrControl+-';
      default:
        break;
    }
  },
};

const capitalizeFirstLetter = (s: string): string => {
  return s.charAt(0).toUpperCase() + s.slice(1);
};
