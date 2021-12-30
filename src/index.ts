import style from './style/style.scss';
import svg from './style/svg.json';
import Menu from './classes/Menu';
import { Options, TitleBarOptions } from './classes/Options';

let container: HTMLDivElement;
let titlebar: HTMLDivElement;
let dragregion: HTMLDivElement;
let appicon: HTMLDivElement;
let menubar: HTMLDivElement;
let title: HTMLDivElement;
let controls: HTMLDivElement;
let minimizeWindow: HTMLDivElement;
let maximizeWindow: HTMLDivElement;
let restoreWindow: HTMLDivElement;
let closeWindow: HTMLDivElement;
let menu: Menu;
let menuTemplate: Record<string, any> | null;
let menuSize = 0;
let menuCondensed = false;
let titlebarHeight = 30;

export default class Titlebar {
  constructor(titleBarOptions?: TitleBarOptions) {
    // Inject style
    (style as any).use();

    // Create titlebar
    titlebar = document.createElement('div');
    titlebar.id = style.locals.titlebar;
    titlebar.classList.add('custom-titlebar');
    titlebar.oncontextmenu = () => false;
    titlebar.classList.add(style.locals['hide-menu']);

    // Create drag region
    dragregion = document.createElement('div');
    dragregion.id = style.locals.dragregion;
    titlebar.append(dragregion);

    // App icon
    appicon = document.createElement('div');
    appicon.id = style.locals.appicon;
    appicon.classList.add('custom-titlebar-appicon');
    titlebar.append(appicon);

    // Create menubar
    menubar = document.createElement('div');
    menubar.id = style.locals.menubar;
    titlebar.append(menubar);

    // Create title
    title = document.createElement('div');
    title.id = style.locals.title;
    this.updateTitle();
    titlebar.append(title);

    // Create controls
    controls = document.createElement('div');
    controls.id = style.locals.controls;
    controls.classList.add('custom-titlebar-controls');
    minimizeWindow = document.createElement('div');
    minimizeWindow.id = style.locals.minimize;
    minimizeWindow.classList.add(style.locals.button);
    minimizeWindow.title = 'Minimize';
    controls.append(minimizeWindow);
    maximizeWindow = document.createElement('div');
    maximizeWindow.id = style.locals.maximize;
    maximizeWindow.classList.add(style.locals.button);
    maximizeWindow.title = 'Maximize';
    controls.append(maximizeWindow);
    restoreWindow = document.createElement('div');
    restoreWindow.id = style.locals.restore;
    restoreWindow.classList.add(style.locals.button);
    restoreWindow.title = 'Restore';
    controls.append(restoreWindow);
    closeWindow = document.createElement('div');
    closeWindow.id = style.locals.close;
    closeWindow.classList.add(style.locals.button);
    closeWindow.title = 'Close';
    controls.append(closeWindow);
    titlebar.append(controls);

    // Create container
    container = document.createElement('div');
    container.id = style.locals.container;
    container.classList.add('custom-titlebar-container');

    // Move body inside a container
    while (document.body.firstChild) {
      container.append(document.body.firstChild);
    }

    // Insert container
    document.body.append(container);
    document.body.style.overflow = 'hidden';
    document.body.style.margin = '0';

    // Insert titlebar
    document.body.insertBefore(titlebar, container);

    // Apply options
    if (titleBarOptions) {
      this.updateOptions(titleBarOptions);
    }

    windowControlsOverlayListener();

    // Apply theme
    applyTheme();

    // Event listeners
    window.addEventListener('blur', onBlur);
    window.addEventListener('focus', onFocus);
    window.addEventListener('resize', onResize);
    window.addEventListener('click', onClick);
  }

  updateOptions(titleBarOptions: TitleBarOptions): void {
    Options.update(titleBarOptions);
    applyOptions(titleBarOptions, this);
  }

  updateTitle(newTitle?: string): void {
    title.innerText = newTitle || window.document.title;
  }

  updateMenu(template?: Record<string, any> | null): void {
    // Deprecated warning
    // eslint-disable-next-line no-console
    console.warn('Warning: updateMenu is deprecated and will be removed in v1.0.0, use updateOptions instead.');
    updateMenu(template);
  }

  getMenuItemById(id: number): Record<string, any> | null {
    return getMenuItemById(id);
  }

  dispose(): void {
    while (container.firstChild) {
      document.body.append(container.firstChild);
    }
    window.removeEventListener('blur', onBlur);
    window.removeEventListener('focus', onFocus);
    window.removeEventListener('resize', onResize);
    window.removeEventListener('click', onClick);
    titlebar.remove();
    container.remove();
  }
}

const debounce = (func: (...args: any[]) => void, wait: number) => {
  let timeout: any;
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

const onBlur = () => {
  if (Options.values.unfocusEffect) {
    titlebar.classList.add(style.locals.inactive);
  }
  menu?.closeSubMenu();
};

const onFocus = () => {
  titlebar.classList.remove(style.locals.inactive);
};

const onClick = () => menu?.closeSubMenu();

const onResize = debounce(() => resized(), 100);

const resized = () => {
  titlebar.classList.toggle(
    style.locals.maximized,
    (Options.values.isMaximized && Options.values.isMaximized()) || false,
  );
  updateMenuSize();
};

const updateBackground = (color: string): void => {
  const rgb = parseColor(color);
  const brightness = getBrightness(rgb);
  titlebar.classList.toggle(style.locals.dark, brightness <= 125);
  titlebar.style.backgroundColor = `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
};

const updateHorizontalAlignment = (position: string): void => {
  title.classList.toggle(style.locals.left, position == 'left');
  title.classList.toggle(style.locals.right, position == 'right');
};

const updateIcon = (icon: string | null): void => {
  appicon.style.backgroundImage = icon ? `url('${icon}')` : 'unset';
  appicon.style.display = icon ? 'block' : 'none';
};

const updateMenu = (template?: Record<string, any> | null): void => {
  menuTemplate = template ? parseMenuTemplate(template) : null;
  buildMenu(menuCondensed);
};

const getMenuItemById = (id: number, menu = menuTemplate): Record<string, any> | null => {
  if (!menu) return null;
  let found = menu.items.find((item: Record<string, any>) => item.id === id) || null;
  for (let i = 0; !found && i < menu.items.length; i++) {
    if (menu.items[i].submenu) {
      found = getMenuItemById(id, menu.items[i].submenu);
    }
  }
  return found;
};

const applyOptions = (o: TitleBarOptions, context: Titlebar) => {
  if (o.backgroundColor) {
    updateBackground(o.backgroundColor);
  }
  if (o.title) {
    context.updateTitle(o.title);
  }
  if (typeof o.icon != 'undefined') {
    updateIcon(o.icon);
  }
  if (typeof o.minimizable != 'undefined') {
    minimizeWindow.classList.toggle(style.locals.disabled, !o.minimizable);
  }
  if (typeof o.maximizable != 'undefined') {
    maximizeWindow.classList.toggle(style.locals.disabled, !o.maximizable);
  }
  if (typeof o.closeable != 'undefined') {
    closeWindow.classList.toggle(style.locals.disabled, !o.closeable);
  }
  if (typeof o.minimizable != 'undefined' || typeof o.maximizable != 'undefined') {
    controls.classList.toggle(style.locals['close-only'], !Options.values.minimizable && !Options.values.maximizable);
  }
  if (o.onMinimize && Options.values.minimizable) {
    minimizeWindow.onclick = o.onMinimize;
  }
  if (o.onMaximize && Options.values.maximizable) {
    maximizeWindow.onclick = o.onMaximize;
    restoreWindow.onclick = o.onMaximize;
  }
  if (o.onClose && Options.values.closeable) {
    closeWindow.onclick = o.onClose;
  }
  if (o.isMaximized) {
    titlebar.classList.toggle(style.locals.maximized, o.isMaximized());
  }
  if (typeof o.menu != 'undefined') {
    updateMenu(o.menu);
  }
  if (typeof o.condensed != 'undefined') {
    updateMenuSize();
  }
  if (o.overflow) {
    container.style.overflow = o.overflow;
  }
  if (typeof o.drag != 'undefined') {
    titlebar.classList.toggle(style.locals.nodrag, !o.drag);
  }
  if (o.titleHorizontalAlignment) {
    updateHorizontalAlignment(o.titleHorizontalAlignment);
  }
  if (o.platform) {
    applyTheme();
  }
  if (typeof o.hideMenuOnDarwin != 'undefined') {
    titlebar.classList.toggle(style.locals['hide-menu'], o.hideMenuOnDarwin);
  }
  if (o.height) {
    titlebarHeight = o.height;
    updateHeight(o.height);
  }
  if (typeof o.backgroundUnfocusEffect != 'undefined') {
    dragregion.style.opacity = o.backgroundUnfocusEffect ? '1' : '0';
  }
};

const applyTheme = () => {
  const platform = Options.getPlatform();
  const svgs = svg[platform];
  titlebar.classList.toggle(style.locals.win, platform == 'win');
  titlebar.classList.toggle(style.locals.darwin, platform == 'darwin');
  minimizeWindow.innerHTML = svgs.minimize;
  maximizeWindow.innerHTML = svgs.maximize;
  restoreWindow.innerHTML = svgs.restore;
  closeWindow.innerHTML = svgs.close;
};

const updateHeight = (height: number) => {
  titlebar.style.height = height + 'px';
  container.style.height = `calc(100vh - ${height}px)`;
};

// Check if the menu need to be condensed
const updateMenuSize = () => {
  if (titlebar.clientWidth > 0) {
    if (!menuCondensed) {
      menuSize = menubar.clientWidth;
    }
    if (
      menuSize + appicon.clientWidth + title.clientWidth + controls.clientWidth + 1 > titlebarWidth() ||
      Options.values.condensed
    ) {
      if (!menuCondensed) {
        buildMenu(true);
      }
    } else {
      if (menuCondensed && !Options.values.condensed) {
        buildMenu(false);
      }
    }
  } else {
    setTimeout(() => updateMenuSize(), 10);
  }
};

const parseMenuTemplate = (template: Record<string, any>): Record<string, any> => {
  if (typeof template.items == 'object') {
    return template;
  } else {
    const result = { items: [] as Array<any> };
    for (const itemIndex in template) {
      const item = template[itemIndex];
      if (typeof item.submenu == 'object') {
        item.submenu = parseMenuTemplate(item.submenu);
        item.type = 'submenu';
      } else if (typeof item.type == 'undefined') {
        item.type = 'normal';
      }
      result.items.push(item);
    }
    return result;
  }
};

const buildMenu = (condensed = false): void => {
  menuCondensed = condensed;
  menubar.innerHTML = '';

  if (!menuTemplate) return;

  let items = menuTemplate.items;
  if (condensed) {
    items = [
      {
        role: 'mainMenu',
        type: 'submenu',
        submenu: {
          items: menuTemplate.items,
        },
      },
    ];
  }
  menu = new Menu(items);

  // Insert menu items
  menu.menuItems.forEach((menuItem) => {
    menubar.append(menuItem.element);
  });

  if (!condensed) {
    updateMenuSize();
  }
};

const windowControlsOverlayListener = () => {
  const nav: Record<string, any> = window.navigator;

  // Hide the controls if windowControlsOverlay option is enabled
  controls.style.display = Options.values.windowControlsOverlay ? 'none' : 'flex';

  if ('windowControlsOverlay' in nav) {
    windowControlsOverlayHandler(nav.windowControlsOverlay.visible, nav.windowControlsOverlay.getBoundingClientRect());

    nav.windowControlsOverlay.addEventListener(
      'geometrychange',
      debounce((e: Record<string, any>) => {
        windowControlsOverlayHandler(e.visible, e.boundingRect);
      }, 10),
    );
  }
};

const windowControlsOverlayHandler = (visible: boolean, size: DOMRect) => {
  // Update titlebar height
  updateHeight(visible ? size.height : titlebarHeight);

  // Update controls visibility
  controls.style.display = visible || Options.values.windowControlsOverlay ? 'none' : 'flex';
};

const titlebarWidth = (): number => {
  const computedStyle = getComputedStyle(titlebar);
  return titlebar.clientWidth - (parseFloat(computedStyle.paddingLeft) + parseFloat(computedStyle.paddingRight));
};

const parseColor = (input: string): Array<number> => {
  const div = document.createElement('div');
  div.style.display = 'none';
  div.style.color = input;
  document.body.append(div);
  const m = getComputedStyle(div).color.match(/^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i);
  div.remove();
  if (m) return [parseInt(m[1]), parseInt(m[2]), parseInt(m[3])];
  else return [255, 255, 255];
};

const getBrightness = (rgb: Array<number>): number => {
  return (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
};
