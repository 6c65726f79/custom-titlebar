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
  onMinimize?: () => void;
  onMaximize?: () => void;
  onClose?: () => void;
  isMaximized?: () => boolean;
  getFocusedWindow?: () => any;
  getFocusedWebContents?: () => any;
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
    onMinimize: undefined,
    onMaximize: undefined,
    onClose: undefined,
    isMaximized: undefined,
    getFocusedWindow: undefined,
    getFocusedWebContents: undefined,
  } as TitleBarOptions,

  update(_options: TitleBarOptions) {
    this.values = Object.assign({}, this.values, _options);
  },
};