export interface TitleBarOptions {
  backgroundColor?: string;
  title?: string;
  icon?: string | null;
  condensed?: boolean;
  menu?: Record<string, any> | null;
  overflow?: string;
  drag?: boolean;
  titleHorizontalAlignment?: string;
  unfocusEffect?: boolean;
  backgroundUnfocusEffect?: boolean;
  platform?: string;
  hideMenuOnDarwin?: boolean;
  hideControlsOnDarwin?: boolean;
  browserWindow?: any;
  height?: number;
  windowControlsOverlay?: boolean;
  minimizable?: boolean;
  maximizable?: boolean;
  closeable?: boolean;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onClose?: () => void;
  isMaximized?: () => boolean;
  menuItemClickHandler?: (commandId: number) => void;
}

export const Options = {
  values: {
    backgroundColor: '#fff',
    title: undefined,
    icon: undefined,
    condensed: false,
    menu: undefined,
    overflow: 'auto',
    drag: true,
    titleHorizontalAlignment: 'center',
    unfocusEffect: true,
    backgroundUnfocusEffect: true,
    platform: 'win',
    hideMenuOnDarwin: true,
    hideControlsOnDarwin: false,
    browserWindow: undefined,
    onMinimize: undefined,
    onMaximize: undefined,
    onClose: undefined,
    isMaximized: undefined,
    menuItemClickHandler: undefined,
    height: undefined,
    windowControlsOverlay: false,
    minimizable: true,
    maximizable: true,
    closeable: true,
  } as TitleBarOptions,

  update(_options: TitleBarOptions): void {
    this.values = Object.assign({}, this.values, _options);
  },

  getPlatform(): 'win' | 'darwin' {
    switch (this.values.platform) {
      case 'darwin':
      case 'macos':
        return 'darwin';
      default:
        return 'win';
    }
  },
};
