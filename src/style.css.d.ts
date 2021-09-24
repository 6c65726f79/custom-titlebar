declare namespace StyleCssNamespace {
  export interface IStyleCss {
    accelerator: string;
    active: string;
    arrow: string;
    button: string;
    close: string;
    controls: string;
    dark: string;
    dragregion: string;
    'electron-container': string;
    'electron-titlebar': string;
    inactive: string;
    maximize: string;
    maximized: string;
    menubar: string;
    restore: string;
    separator: string;
    submenu: string;
    title: string;
  }
}

declare const StyleCssModule: StyleCssNamespace.IStyleCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StyleCssNamespace.IStyleCss;
};

export = StyleCssModule;
