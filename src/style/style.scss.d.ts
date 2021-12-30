declare namespace StyleScssNamespace {
  export interface IStyleScss {
    accelerator: string;
    active: string;
    appicon: string;
    arrow: string;
    button: string;
    check: string;
    close: string;
    'close-only': string;
    container: string;
    controls: string;
    dark: string;
    darwin: string;
    disabled: string;
    dragregion: string;
    'hide-menu': string;
    icon: string;
    inactive: string;
    left: string;
    maximize: string;
    maximized: string;
    menubar: string;
    minimize: string;
    nodrag: string;
    restore: string;
    right: string;
    separator: string;
    submenu: string;
    title: string;
    titlebar: string;
    win: string;
  }
}

declare const StyleScssModule: StyleScssNamespace.IStyleScss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StyleScssNamespace.IStyleScss;
};

export = StyleScssModule;
