import style from './style.scss';
import Menu from './Menu';

export default class MenuItem {
  element: HTMLDivElement;

  constructor(menuItem: Record<string, any>, index: number, parent: Menu, depth = 0) {
    // Create item
    this.element = document.createElement('div');
    this.element.classList.add(style.locals.button);

    if (menuItem.role == 'mainMenu') {
      // Add main menu svg
      this.element.innerHTML =
        '<svg width="10" height="10" viewBox="0 0 384 384"><rect x="0" y="277.333" width="384" height="42.667"/><rect x="0" y="170.667" width="384" height="42.667"/><rect x="0" y="64" width="384" height="42.667"/></svg>';
    }

    if (menuItem.label) {
      // Add label
      const label = document.createElement('div');
      label.classList.add(style.locals.title);
      label.innerText = menuItem.label;
      this.element.append(label);
    }

    let defaultAccelerator;

    if (menuItem.role && !menuItem.accelerator && menuItem.getDefaultRoleAccelerator) {
      // Get default accelerator
      defaultAccelerator = menuItem.getDefaultRoleAccelerator();
    }

    if (menuItem.accelerator || defaultAccelerator || (menuItem.key && menuItem.modifiers)) {
      // Add accelerator
      const accelerator = document.createElement('div');
      accelerator.classList.add(style.locals.accelerator);
      accelerator.innerText =
        menuItem.accelerator || defaultAccelerator
          ? (menuItem.accelerator || defaultAccelerator)
              .replace('CmdOrCtrl', 'Ctrl')
              .replace('CommandOrControl', 'Control')
          : menuItem.modifiers.split('+').map(capitalizeFirstLetter).join('+') +
            '+' +
            capitalizeFirstLetter(menuItem.key);
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
      this.element.innerHTML += `<svg class="${style.locals.check}" version="1.1" width="12px" height="12px" viewBox="0 0 512 512"><path d="M504.502,75.496c-9.997-9.998-26.205-9.998-36.204,0L161.594,382.203L43.702,264.311c-9.997-9.998-26.205-9.997-36.204,0c-9.998,9.997-9.998,26.205,0,36.203l135.994,135.992c9.994,9.997,26.214,9.99,36.204,0L504.502,111.7C514.5,101.703,514.499,85.494,504.502,75.496z"/></svg>`;
    }

    switch (menuItem.type) {
      case 'normal':
      case 'checkbox':
        this.element.onclick = (e) => {
          e.stopPropagation();
          parent.closeSubMenu(true);
          if (menuItem.click) {
            menuItem.click();
          }
        };
        this.element.onmouseenter = () => {
          parent.closeSubMenu();
        };
        break;
      case 'submenu':
        // Add right arrow
        this.element.innerHTML += `<svg class="${style.locals.arrow}" version="1.1" width="20px" height="20px" viewBox="0 0 24 24"><path d="M9.29,6.71L9.29,6.71c-0.39,0.39-0.39,1.02,0,1.41L13.17,12l-3.88,3.88c-0.39,0.39-0.39,1.02,0,1.41l0,0c0.39,0.39,1.02,0.39,1.41,0l4.59-4.59c0.39-0.39,0.39-1.02,0-1.41l-4.59-4.59C10.32,6.32,9.68,6.32,9.29,6.71z" /></svg>`;

        this.element.onclick = (e) => {
          e.stopPropagation();
          if (!parent.isSubMenu) {
            if (parent.isSubMenuOpened() && parent.activeMenu == index) {
              parent.closeSubMenu();
            } else {
              parent.openSubMenu(menuItem.submenu, index, depth);
            }
          }
        };
        this.element.onmouseenter = () => {
          if (parent.isSubMenuOpened() || parent.isSubMenu) {
            parent.openSubMenu(menuItem.submenu, index, depth);
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

const capitalizeFirstLetter = (s: string) => {
  return s.charAt(0).toUpperCase() + s.slice(1);
};
