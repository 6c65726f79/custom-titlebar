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
  }
};

const capitalizeFirstLetter = (s: string): string => {
  return s.charAt(0).toUpperCase() + s.slice(1);
};
