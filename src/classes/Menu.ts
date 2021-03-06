import style from '../style/style.scss';
import MenuItem from './MenuItem';

let mainMenu: Menu;

export default class Menu {
  menuItems: Array<MenuItem> = [];
  element: HTMLDivElement;
  subMenu: Menu | null = null;
  isSubMenu = false;
  activeMenu = -1;

  constructor(items: Array<any>, submenu = false) {
    this.isSubMenu = submenu;
    this.element = document.createElement('div');
    this.element.classList.toggle(style.locals.submenu, submenu);
    this.element.classList.toggle('custom-titlebar-submenu', submenu);
    this.element.title = ''; // Hide tooltip from parent item
    for (let i = 0; i < items.length; i++) {
      this.menuItems[i] = new MenuItem(items[i], i, this);
      this.element.append(this.menuItems[i].element);
    }
    if (!submenu) {
      mainMenu = this;
    }
  }

  // Return true if a submenu is opened
  isSubMenuOpened(): boolean {
    return this.subMenu != null;
  }

  openSubMenu(submenu: Record<string, any>, index: number): void {
    if (this.activeMenu == index) return;
    this.closeSubMenu();
    this.activeMenu = index;
    const menuItem = this.menuItems[index];
    this.subMenu = new Menu(submenu.items, true);
    menuItem.element.classList.add(style.locals.active);
    menuItem.element.appendChild(this.subMenu.element);

    // Prevent submenu to get out of window
    const freeSpace = {
      x: window.innerWidth - this.subMenu.element.getBoundingClientRect().right,
      y: window.innerHeight - this.subMenu.element.getBoundingClientRect().bottom,
    };
    if (freeSpace.x < 0) {
      this.subMenu.element.style.marginRight = `${-freeSpace.x}px`;
    }
    if (freeSpace.y < 0) {
      this.subMenu.element.style.marginTop = `${freeSpace.y}px`;
    }
  }

  closeSubMenu(main = false): void {
    if (main) {
      mainMenu.closeSubMenu();
    } else if (this.activeMenu >= 0) {
      const menuItem = this.menuItems[this.activeMenu];
      if (menuItem) {
        menuItem.element.classList.remove(style.locals.active);
        menuItem.element.querySelector(`.${style.locals.submenu}`)?.remove();
        this.subMenu = null;
        this.activeMenu = -1;
      }
    }
  }

  // Uncheck all radio items from the same group in this menu
  uncheckRadioGroup(itemIndex: number): void {
    const group = this.getItemGroup(itemIndex);
    this.getGroupItems(group).forEach((menuItem) => {
      menuItem.unckeckRadio();
    });
  }

  // Return the group index of an item
  private getItemGroup(itemIndex: number) {
    let group = 0;
    for (let i = 0; i < itemIndex; i++) {
      if (this.menuItems[i].item.type == 'separator') {
        group++;
      }
    }
    return group;
  }

  // Return the list of items of a group
  private getGroupItems(groupIndex: number) {
    let count = 0;
    const list: Array<MenuItem> = [];
    this.menuItems.forEach((menuItem) => {
      if (menuItem.item.type == 'separator') {
        count++;
      } else if (count == groupIndex) {
        list.push(menuItem);
      }
    });
    return list;
  }
}
