export interface TitleBarOptions {
  backgroundColor?: string;
  title?: string;
  icon?: string;
  condensed?: boolean;
  menu?: Record<string, any>;
  overflow?: string;
  drag?: boolean;
  titleHorizontalAlignment?: string;
  unfocusEffect?: boolean;
  platform?: string;
  hideMenuOnDarwin?: boolean;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onClose?: () => void;
  isMaximized?: () => boolean;
  getFocusedWindow?: () => any;
  getFocusedWebContents?: () => any;
  menuItemClickHandler?: (commandId: string) => void;
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
    platform: 'win',
    hideMenuOnDarwin: true,
    onMinimize: undefined,
    onMaximize: undefined,
    onClose: undefined,
    isMaximized: undefined,
    getFocusedWindow: undefined,
    getFocusedWebContents: undefined,
    menuItemClickHandler: undefined,
  } as TitleBarOptions,

  update(_options: TitleBarOptions) {
    this.values = Object.assign({}, this.values, _options);
  },

  getPlatform() {
    switch (this.values.platform) {
      case 'darwin':
      case 'macos':
        return 'darwin';
      default:
        return 'win';
    }
  },
};
