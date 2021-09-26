import style from './style.scss';

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
let menu: Record<string, any>;
let menuSize = 0;
let menuCondensed = false;
let forceCondensed = false;
let subMenuOpened = false;
let activeMenu: Array<number> = [-1];

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
    minimizeWindow.innerHTML =
      '<svg x="0px" y="0px" viewBox="0 0 10.2 1"><rect x="0" y="50%" width="10.2" height="1" /></svg>';
    controls.append(minimizeWindow);
    maximizeWindow = document.createElement('div');
    maximizeWindow.id = style.locals.maximize;
    maximizeWindow.classList.add(style.locals.button);
    maximizeWindow.innerHTML = '<svg viewBox="0 0 10 10"><path d="M0,0v10h10V0H0z M9,9H1V1h8V9z" /></svg>';
    controls.append(maximizeWindow);
    restoreWindow = document.createElement('div');
    restoreWindow.id = style.locals.restore;
    restoreWindow.classList.add(style.locals.button);
    restoreWindow.innerHTML =
      '<svg viewBox="0 0 10.2 10.1"><path d="M2.1,0v2H0v8.1h8.2v-2h2V0H2.1z M7.2,9.2H1.1V3h6.1V9.2z M9.2,7.1h-1V2H3.1V1h6.1V7.1z" /></svg>';
    controls.append(restoreWindow);
    closeWindow = document.createElement('div');
    closeWindow.id = style.locals.close;
    closeWindow.classList.add(style.locals.button);
    closeWindow.innerHTML =
      '<svg viewBox="0 0 10 10"><polygon points="10.2,0.7 9.5,0 5.1,4.4 0.7,0 0,0.7 4.4,5.1 0,9.5 0.7,10.2 5.1,5.8 9.5,10.2 10.2,9.5 5.8,5.1" /></svg>';
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
    window.addEventListener('blur', () => {
      titlebar.classList.add(style.locals.inactive);
      closeSubMenu();
    });

    window.addEventListener('focus', () => {
      titlebar.classList.remove(style.locals.inactive);
    });

    window.addEventListener('resize', () => {
      titlebar.classList.toggle(
        style.locals.maximized,
        (titleBarOptions?.isMaximized && titleBarOptions.isMaximized()) || false,
      );
      updateMenuSize();
    });

    window.addEventListener('click', () => {
      closeSubMenu();
    });
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
      titlebar.classList.toggle(style.locals.maximized, options.isMaximized());
    }
    if (typeof options.condensed != 'undefined') {
      menuCondensed = options.condensed;
      forceCondensed = options.condensed;
    }
    if (options.menu) {
      this.updateMenu(options.menu);
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
    const brightness = hexToRgb(color)?.reduce((a, b) => a + b, 0);
    if (brightness !== undefined) {
      titlebar.classList.toggle(style.locals.dark, brightness <= 382);
    }
    titlebar.style.backgroundColor = color;
  }

  updateTitle(newTitle?: string): void {
    title.innerText = newTitle || window.document.title;
  }

  updateMenu(newMenu: Record<string, any>): void {
    menu = parseMenuObject(newMenu);
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
    titlebar.remove();
    container.remove();
  }
}

// Check if the menu need to be condensed
const updateMenuSize = () => {
  if (titlebar.clientWidth > 0) {
    if (!menuCondensed) {
      menuSize = menubar.clientWidth;
    }
    if (menuSize + appicon.clientWidth + title.clientWidth + controls.clientWidth + 1 > titlebar.clientWidth) {
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

const parseMenuObject = (menuObject: Record<string, any>): Record<string, any> => {
  if (typeof menuObject.items == 'object') {
    return menuObject;
  } else {
    const result = { items: [] as Array<any> };
    for (const itemIndex in menuObject) {
      const item = menuObject[itemIndex];
      if (typeof item.submenu == 'object') {
        item.submenu = parseMenuObject(item.submenu);
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
  const menuItems: Array<HTMLDivElement> = [];
  if (!condensed) {
    for (let i = 0; i < menu.items.length; i++) {
      menuItems.push(buildMenuItem(menu.items[i], i, menubar));
    }
  } else {
    const item = {
      role: 'mainMenu',
      type: 'submenu',
      submenu: {
        items: menu.items,
      },
    };
    menuItems.push(buildMenuItem(item, 0, menubar));
  }

  menubar.innerHTML = '';
  menuItems.forEach((menuItem) => {
    menubar.append(menuItem);
  });
  if (!condensed) {
    updateMenuSize();
  }
};

const buildMenuItem = (
  menuItem: Record<string, any>,
  index: number,
  parent: HTMLDivElement,
  depth = 0,
): HTMLDivElement => {
  const item = document.createElement('div');
  item.classList.add(style.locals.button);
  if (menuItem.role == 'mainMenu') {
    item.innerHTML =
      '<svg width="10" height="10" viewBox="0 0 384 384"><rect x="0" y="277.333" width="384" height="42.667"/><rect x="0" y="170.667" width="384" height="42.667"/><rect x="0" y="64" width="384" height="42.667"/></svg>';
  }
  if (menuItem.label) {
    const label = document.createElement('div');
    label.classList.add(style.locals.title);
    label.innerText = menuItem.label;
    item.append(label);
  }
  if (menuItem.accelerator) {
    const accelerator = document.createElement('div');
    accelerator.classList.add(style.locals.accelerator);
    accelerator.innerText = menuItem.accelerator.replace('CmdOrCtrl', 'Ctrl').replace('CommandOrControl', 'Control');
    item.append(accelerator);
  }
  switch (menuItem.type) {
    case 'normal':
      item.onclick = (e) => {
        e.stopPropagation();
        closeSubMenu();
        menuItem.click();
      };
      item.onmouseenter = () => {
        closeSubMenu(parent, depth);
      };
      break;
    case 'submenu':
      item.innerHTML += `<svg class="${style.locals.arrow}" version="1.1" width="20px" height="20px" viewBox="0 0 24 24"><path d="M9.29,6.71L9.29,6.71c-0.39,0.39-0.39,1.02,0,1.41L13.17,12l-3.88,3.88c-0.39,0.39-0.39,1.02,0,1.41l0,0c0.39,0.39,1.02,0.39,1.41,0l4.59-4.59c0.39-0.39,0.39-1.02,0-1.41l-4.59-4.59C10.32,6.32,9.68,6.32,9.29,6.71z" /></svg>`;

      item.onclick = (e) => {
        e.stopPropagation();
        if (depth == 0) {
          if (subMenuOpened && activeMenu[depth] == index) {
            closeSubMenu(parent, depth);
          } else {
            openSubMenu(menuItem.submenu, index, parent, depth);
          }
        }
      };
      item.onmouseenter = () => {
        if (subMenuOpened) {
          openSubMenu(menuItem.submenu, index, parent, depth);
        }
      };
      item.onmouseleave = () => {
        if (subMenuOpened && depth > 0) {
          closeSubMenu(parent, depth);
        }
      };
      break;
    case 'separator':
      item.classList.add(style.locals.separator);
      break;
  }
  return item;
};

const openSubMenu = (submenu: Array<any>, index: number, parent: HTMLDivElement, depth: number): void => {
  if (depth == 0 && activeMenu[depth] == index) return;
  closeSubMenu(parent, depth);
  activeMenu[depth] = index;
  subMenuOpened = true;
  const menuItem = parent.children[index];
  const subMenu = buildSubMenu(submenu, depth + 1);
  menuItem.classList.add(style.locals.active);
  menuItem.appendChild(subMenu);
};

const closeSubMenu = (parent?: HTMLDivElement, depth = 0) => {
  if (activeMenu[depth] >= 0) {
    const menuItem = parent ? parent.children[activeMenu[depth]] : menubar.children[activeMenu[depth]];
    if (menuItem) {
      menuItem.classList.remove(style.locals.active);
      menuItem.querySelector(`.${style.locals.submenu}`)?.remove();
      if (depth === 0) {
        subMenuOpened = false;
      }
      activeMenu = activeMenu.slice(0, depth);
      activeMenu[depth] = -1;
    }
  }
};

const buildSubMenu = (submenu: Record<string, any>, depth: number): HTMLDivElement => {
  const subMenu = document.createElement('div');
  subMenu.classList.add(style.locals.submenu);
  for (let i = 0; i < submenu.items.length; i++) {
    const menuItem = buildMenuItem(submenu.items[i], i, subMenu, depth);
    subMenu.append(menuItem);
  }
  return subMenu;
};

const hexToRgb = (hex: string): Array<number> | undefined =>
  hex
    .replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i, (m, r, g, b) => '#' + r + r + g + g + b + b)
    .substring(1)
    .match(/.{2}/g)
    ?.map((x) => parseInt(x, 16));
