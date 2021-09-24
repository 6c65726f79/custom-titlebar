declare namespace StyleScssNamespace {
  export interface IStyleScss {
    accelerator: string;
    active: string;
    arrow: string;
    button: string;
    close: string;
    container: string;
    controls: string;
    dark: string;
    dragregion: string;
    inactive: string;
    maximize: string;
    maximized: string;
    menubar: string;
    restore: string;
    separator: string;
    submenu: string;
    title: string;
    titlebar: string;
  }
}

declare const StyleScssModule: StyleScssNamespace.IStyleScss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: StyleScssNamespace.IStyleScss;
};

export = StyleScssModule;
