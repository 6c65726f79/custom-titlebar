import style from '../style/style.scss';
import svg from '../style/svg.json';
import Menu from './Menu';
import { Accelerator } from './Accelerator';
import { RoleHandler } from './RoleHandler';
import { Options } from './Options';

export default class MenuItem {
  element: HTMLDivElement;

  constructor(menuItem: Record<string, any>, index: number, parent: Menu) {
    // Create item
    this.element = document.createElement('div');
    this.element.classList.add(style.locals.button);
    this.element.classList.add(
      menuItem.type == 'separator'
        ? 'custom-titlebar-separator'
        : parent.isSubMenu
        ? 'custom-titlebar-submenu-item'
        : 'custom-titlebar-menu-item',
    );

    if (menuItem.role == 'mainMenu') {
      // Add main menu svg
      this.element.innerHTML = svg.mainMenu;
    }

    if (menuItem.label) {
      // Add label
      const label = document.createElement('div');
      label.classList.add(style.locals.title);
      label.innerText = menuItem.label;
      this.element.append(label);
    }

    let defaultAccelerator;

    if (menuItem.role && !menuItem.accelerator) {
      // Get default accelerator
      defaultAccelerator = menuItem.getDefaultRoleAccelerator
        ? menuItem.getDefaultRoleAccelerator()
        : menuItem.defaultRoleAccelerator;
    }

    if (menuItem.accelerator || defaultAccelerator || (menuItem.key && menuItem.modifiers)) {
      // Add accelerator
      const accelerator = document.createElement('div');
      accelerator.classList.add(style.locals.accelerator);
      accelerator.innerText =
        menuItem.accelerator || defaultAccelerator
          ? Accelerator.formatElectronAccelerator(menuItem.accelerator || defaultAccelerator)
          : Accelerator.formatNWAccelerator(menuItem.modifiers, menuItem.key);
      this.element.append(accelerator);
    }

    if (menuItem.toolTip || menuItem.tooltip) {
      // Add tooltip
      this.element.title = menuItem.toolTip || menuItem.tooltip;
    }
    if (menuItem.enabled === false) {
      // Disable item
      this.element.classList.add(style.locals.disabled);
    }
    if (menuItem.visible === false) {
      // Hide item
      this.element.style.display = 'none';
    }
    if (menuItem.checked) {
      // Add check mark
      this.element.innerHTML += svg.check.replace('{class}', style.locals.check);
    }
    else if (menuItem.icon) {
      // Add icon
      const icon = document.createElement('img');
      icon.src = menuItem.icon;
      icon.classList.add(style.locals.icon);
      this.element.append(icon);
    }

    switch (menuItem.type) {
      case 'normal':
      case 'checkbox':
      case 'radio':
        this.element.onclick = (e) => {
          e.stopPropagation();
          parent.closeSubMenu(true);

          if (Options.values.menuItemClickHandler && menuItem.commandId) {
            // Use user-defined handler
            Options.values.menuItemClickHandler(menuItem.commandId);
          } else if (menuItem.click) {
            // Use default handler
            menuItem.role ? RoleHandler.invoke(menuItem.click) : menuItem.click();
          }
        };
        this.element.onmouseenter = () => {
          parent.closeSubMenu();
        };
        break;
      case 'submenu':
        // Add right arrow
        this.element.innerHTML += svg.arrow.replace('{class}', style.locals.arrow);

        this.element.onclick = (e) => {
          e.stopPropagation();
          if (!parent.isSubMenu) {
            if (parent.isSubMenuOpened() && parent.activeMenu == index) {
              parent.closeSubMenu();
            } else {
              parent.openSubMenu(menuItem.submenu, index);
            }
          }
        };
        this.element.onmouseenter = () => {
          if (parent.isSubMenuOpened() || parent.isSubMenu) {
            parent.openSubMenu(menuItem.submenu, index);
          }
        };
        this.element.onmouseleave = () => {
          if (parent.isSubMenuOpened() && parent.isSubMenu) {
            parent.closeSubMenu();
          }
        };
        break;
      case 'separator':
        this.element.classList.add(style.locals.separator);
        break;
    }
  }
}
