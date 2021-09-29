import style from './style.scss';
import Menu from './Menu';
import svg from './svg.json';

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
let menuTemplate: Record<string, any>;
let menuSize = 0;
let menuCondensed = false;
let forceCondensed = false;
let isMaximized: () => boolean;

interface TitleBarOptions {
  backgroundColor?: string;
  title?: string;
  icon?: string;
  condensed?: boolean;
  menu?: Record<string, any>;
  overflow?: string;
  drag?: boolean;
  titleHorizontalAlignment?: string;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onClose?: () => void;
  isMaximized?: () => boolean;
}

export default class Titlebar {
  constructor(titleBarOptions?: TitleBarOptions) {
    // Inject style
    (style as any).use();

    // Create titlebar
    titlebar = document.createElement('div');
    titlebar.id = style.locals.titlebar;
    titlebar.oncontextmenu = () => false;

    // Create drag region
    dragregion = document.createElement('div');
    dragregion.id = style.locals.dragregion;
    titlebar.append(dragregion);

    // App icon
    appicon = document.createElement('div');
    appicon.id = style.locals.appicon;
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
    minimizeWindow = document.createElement('div');
    /*minimizeWindow.id = 'minimize';*/
    minimizeWindow.classList.add(style.locals.button);
    minimizeWindow.innerHTML = svg.minimize.windows;
    controls.append(minimizeWindow);
    maximizeWindow = document.createElement('div');
    maximizeWindow.id = style.locals.maximize;
    maximizeWindow.classList.add(style.locals.button);
    maximizeWindow.innerHTML = svg.maximize.windows;
    controls.append(maximizeWindow);
    restoreWindow = document.createElement('div');
    restoreWindow.id = style.locals.restore;
    restoreWindow.classList.add(style.locals.button);
    restoreWindow.innerHTML = svg.restore.windows;
    controls.append(restoreWindow);
    closeWindow = document.createElement('div');
    closeWindow.id = style.locals.close;
    closeWindow.classList.add(style.locals.button);
    closeWindow.innerHTML = svg.close.windows;
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

    // Event listeners
    window.addEventListener('blur', onBlur);
    window.addEventListener('focus', onFocus);
    window.addEventListener('resize', onResize);
    window.addEventListener('click', onClick);
  }

  updateOptions(options: TitleBarOptions): void {
    if (options.backgroundColor) {
      this.updateBackground(options.backgroundColor);
    }
    if (options.title) {
      this.updateTitle(options.title);
    }
    if (options.icon) {
      this.updateIcon(options.icon);
    }
    if (options.onMinimize) {
      minimizeWindow.onclick = options.onMinimize;
    }
    if (options.onMaximize) {
      maximizeWindow.onclick = options.onMaximize;
      restoreWindow.onclick = options.onMaximize;
    }
    if (options.onClose) {
      closeWindow.onclick = options.onClose;
    }
    if (options.isMaximized) {
      isMaximized = options.isMaximized;
      titlebar.classList.toggle(style.locals.maximized, options.isMaximized());
    }
    if (options.menu) {
      this.updateMenu(options.menu);
    }
    if (typeof options.condensed != 'undefined') {
      forceCondensed = options.condensed;
      updateMenuSize();
    }
    if (options.overflow) {
      container.style.overflow = options.overflow;
    }
    if (typeof options.drag != 'undefined') {
      titlebar.classList.toggle(style.locals.nodrag, !options.drag);
    }
    if (options.titleHorizontalAlignment) {
      this.updateHorizontalAlignment(options.titleHorizontalAlignment);
    }
  }

  updateBackground(color: string): void {
    const rgb = parseColor(color);
    const brightness = getBrightness(rgb);
    titlebar.classList.toggle(style.locals.dark, brightness <= 125);
    titlebar.style.backgroundColor = `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
  }

  updateTitle(newTitle?: string): void {
    title.innerText = newTitle || window.document.title;
  }

  updateMenu(template: Record<string, any>): void {
    menuTemplate = parseMenuTemplate(template);
    buildMenu(menuCondensed);
  }

  updateHorizontalAlignment(position: string): void {
    title.classList.toggle(style.locals.left, position == 'left');
    title.classList.toggle(style.locals.right, position == 'right');
  }

  updateIcon(icon: string): void {
    appicon.style.backgroundImage = `url('${icon}')`;
    appicon.style.display = 'block';
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

const onBlur = () => {
  titlebar.classList.add(style.locals.inactive);
  menu.closeSubMenu();
};

const onFocus = () => {
  titlebar.classList.remove(style.locals.inactive);
};

const onClick = () => menu.closeSubMenu();

const onResize = () => resized();

const resized = (timeout = true) => {
  titlebar.classList.toggle(style.locals.maximized, (isMaximized && isMaximized()) || false);
  updateMenuSize();
  // Workaround for NW.js resized event race condition
  if (timeout) {
    setTimeout(() => resized(false), 10);
  }
};

// Check if the menu need to be condensed
const updateMenuSize = () => {
  if (titlebar.clientWidth > 0) {
    if (!menuCondensed) {
      menuSize = menubar.clientWidth;
    }
    if (
      menuSize + appicon.clientWidth + title.clientWidth + controls.clientWidth + 1 > titlebar.clientWidth ||
      forceCondensed
    ) {
      if (!menuCondensed) {
        buildMenu(true);
      }
    } else {
      if (menuCondensed && !forceCondensed) {
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
  menubar.innerHTML = '';
  menu.menuItems.forEach((menuItem) => {
    menubar.append(menuItem.element);
  });

  if (!condensed) {
    updateMenuSize();
  }
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
