import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { BlockType } from '../../types/notes';

const MenuContainer = styled.div<{ position: { top: number; left: number } }>`
  position: absolute;
  top: ${props => props.position.top}px;
  left: ${props => props.position.left}px;
  background: #c0c0c0;
  border: 2px solid;
  border-color: #ffffff #808080 #808080 #ffffff;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.2);
  width: 280px;
  max-height: 400px;
  overflow-y: auto;
  z-index: 1000;
`;

const SearchInput = styled.input`
  width: calc(100% - 16px);
  margin: 8px;
  padding: 4px;
  border: 2px solid;
  border-color: #808080 #ffffff #ffffff #808080;
  font-family: "Microsoft Sans Serif", sans-serif;
  font-size: 14px;

  &:focus {
    outline: none;
  }
`;

const CommandList = styled.div`
  padding: 4px;
`;

const CommandGroup = styled.div`
  margin-bottom: 8px;
`;

const GroupTitle = styled.div`
  padding: 2px 8px;
  font-family: "Microsoft Sans Serif", sans-serif;
  font-size: 12px;
  color: #000080;
  font-weight: bold;
`;

const CommandItem = styled.div<{ selected: boolean }>`
  padding: 4px 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  background: ${props => props.selected ? '#000080' : 'transparent'};
  color: ${props => props.selected ? '#ffffff' : '#000000'};
  font-family: "Microsoft Sans Serif", sans-serif;
  font-size: 14px;

  &:hover {
    background: ${props => props.selected ? '#000080' : '#d4d0c8'};
  }
`;

const CommandIcon = styled.span`
  font-size: 16px;
  width: 20px;
  text-align: center;
`;

interface Command {
  type: BlockType;
  icon: string;
  label: string;
  description: string;
  group: string;
}

const commands: Command[] = [
  // Basic Formatting
  { type: BlockType.Heading1, icon: 'H1', label: 'Heading 1', description: 'Large heading', group: 'Basic Formatting' },
  { type: BlockType.Heading2, icon: 'H2', label: 'Heading 2', description: 'Medium heading', group: 'Basic Formatting' },
  { type: BlockType.Heading3, icon: 'H3', label: 'Heading 3', description: 'Small heading', group: 'Basic Formatting' },
  { type: BlockType.Text, icon: '¶', label: 'Text', description: 'Plain text', group: 'Basic Formatting' },
  
  // Lists
  { type: BlockType.BulletList, icon: '•', label: 'Bullet List', description: 'Unordered list', group: 'Lists' },
  { type: BlockType.NumberedList, icon: '1.', label: 'Numbered List', description: 'Ordered list', group: 'Lists' },
  { type: BlockType.TaskList, icon: '☐', label: 'Task List', description: 'Checklist', group: 'Lists' },
  
  // Content Blocks
  { type: BlockType.Code, icon: '<>', label: 'Code Block', description: 'Code with syntax highlighting', group: 'Content' },
  { type: BlockType.Table, icon: '▦', label: 'Table', description: 'Data in rows and columns', group: 'Content' },
  { type: BlockType.Image, icon: '🖼', label: 'Image', description: 'Insert an image', group: 'Content' },
  
  // Views
  { type: BlockType.Database, icon: '🗄', label: 'Database', description: 'Structured data', group: 'Views' },
  { type: BlockType.GridView, icon: '▤', label: 'Grid View', description: 'Card-based grid layout', group: 'Views' },
  { type: BlockType.GalleryView, icon: '🖼', label: 'Gallery View', description: 'Image-focused grid', group: 'Views' },
  { type: BlockType.ListView, icon: '📋', label: 'List View', description: 'Compact list layout', group: 'Views' },
];

interface CommandMenuProps {
  position: { top: number; left: number };
  onSelect: (type: BlockType) => void;
  onClose: () => void;
}

const CommandMenu: React.FC<CommandMenuProps> = ({ position, onSelect, onClose }) => {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  const filteredCommands = commands.filter(command =>
    command.label.toLowerCase().includes(search.toLowerCase()) ||
    command.description.toLowerCase().includes(search.toLowerCase())
  );

  const groupedCommands = filteredCommands.reduce((acc, command) => {
    if (!acc[command.group]) {
      acc[command.group] = [];
    }
    acc[command.group].push(command);
    return acc;
  }, {} as Record<string, Command[]>);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(0, prev - 1));
        break;
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(filteredCommands.length - 1, prev + 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          onSelect(filteredCommands[selectedIndex].type);
        }
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
    }
  };

  return (
    <MenuContainer ref={menuRef} position={position}>
      <SearchInput
        value={search}
        onChange={e => setSearch(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Search for a block type..."
        autoFocus
      />
      <CommandList>
        {Object.entries(groupedCommands).map(([group, commands]) => (
          <CommandGroup key={group}>
            <GroupTitle>{group}</GroupTitle>
            {commands.map(command => {
              const globalIndex = filteredCommands.indexOf(command);
              return (
                <CommandItem
                  key={command.type}
                  selected={globalIndex === selectedIndex}
                  onClick={() => onSelect(command.type)}
                  onMouseEnter={() => setSelectedIndex(globalIndex)}
                >
                  <CommandIcon>{command.icon}</CommandIcon>
                  <div>
                    <div>{command.label}</div>
                    <div style={{ fontSize: '12px', opacity: 0.7 }}>{command.description}</div>
                  </div>
                </CommandItem>
              );
            })}
          </CommandGroup>
        ))}
      </CommandList>
    </MenuContainer>
  );
};

export default CommandMenu;