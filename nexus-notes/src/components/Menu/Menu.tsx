import React, { useState } from 'react';
import styled from 'styled-components';

const MenuBar = styled.div`
  display: flex;
  padding: 1px;
  background: #c0c0c0;
  border-bottom: 1px solid #808080;
`;

const MenuItem = styled.div`
  position: relative;
  padding: 2px 6px;
  font-size: 12px;
  font-family: "Microsoft Sans Serif", sans-serif;
  cursor: default;

  &:hover, &.active {
    background: #000080;
    color: white;
  }
`;

const MenuDropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  min-width: 200px;
  background: #c0c0c0;
  border: 2px solid;
  border-color: #ffffff #808080 #808080 #ffffff;
  padding: 2px;
  z-index: 1000;
`;

const MenuOption = styled.div<{ disabled?: boolean }>`
  padding: 4px 24px 4px 8px;
  font-size: 12px;
  font-family: "Microsoft Sans Serif", sans-serif;
  color: ${props => props.disabled ? '#808080' : '#000'};
  cursor: ${props => props.disabled ? 'default' : 'pointer'};
  display: flex;
  align-items: center;
  gap: 24px;

  &:hover {
    background: ${props => props.disabled ? 'transparent' : '#000080'};
    color: ${props => props.disabled ? '#808080' : '#fff'};
  }

  .shortcut {
    margin-left: auto;
    color: inherit;
  }
`;

const Separator = styled.div`
  height: 1px;
  margin: 3px 2px;
  background-color: #808080;
  border-bottom: 1px solid #ffffff;
`;

export interface MenuAction {
  label: string;
  action?: () => void;
  shortcut?: string;
  disabled?: boolean;
}

export interface MenuGroup {
  label: string;
  items: (MenuAction | 'separator')[];
}

interface MenuProps {
  groups: MenuGroup[];
}

export const Menu: React.FC<MenuProps> = ({ groups }) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const handleMenuClick = (label: string) => {
    setActiveMenu(activeMenu === label ? null : label);
  };

  const handleOptionClick = (action?: () => void) => {
    if (action) {
      action();
    }
    setActiveMenu(null);
  };

  const handleMouseLeave = () => {
    setActiveMenu(null);
  };

  return (
    <MenuBar onMouseLeave={handleMouseLeave}>
      {groups.map(group => (
        <MenuItem
          key={group.label}
          className={activeMenu === group.label ? 'active' : ''}
          onClick={() => handleMenuClick(group.label)}
        >
          {group.label}
          {activeMenu === group.label && (
            <MenuDropdown>
              {group.items.map((item, index) => 
                item === 'separator' ? (
                  <Separator key={`sep-${index}`} />
                ) : (
                  <MenuOption
                    key={item.label}
                    disabled={item.disabled}
                    onClick={() => !item.disabled && handleOptionClick(item.action)}
                  >
                    {item.label}
                    {item.shortcut && <span className="shortcut">{item.shortcut}</span>}
                  </MenuOption>
                )
              )}
            </MenuDropdown>
          )}
        </MenuItem>
      ))}
    </MenuBar>
  );
};

export default Menu;