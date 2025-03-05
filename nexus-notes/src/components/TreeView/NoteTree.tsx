import React, { useState, useCallback } from 'react';
import styled from 'styled-components';

// Windows 98 tree icons (using Unicode characters)
const TreeIcons = {
  expanded: '▼',
  collapsed: '►',
  folder: '📁',
  folderOpen: '📂',
  verticalLine: '│',
  horizontalLine: '─',
  branchLine: '├',
  lastBranchLine: '└'
};

interface NoteNode {
  id: string;
  title: string;
  favicon?: string | null;
  children?: NoteNode[];
}

interface TreeNodeProps {
  node: NoteNode;
  level: number;
  isLast: boolean;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onContextMenu: (e: React.MouseEvent, id: string) => void;
}

interface NoteTreeProps {
  notes: NoteNode[];
  onSelect?: (id: string) => void;
  onContextMenu?: (e: React.MouseEvent, id: string) => void;
}

const TreeContainer = styled.div`
  font-family: "Microsoft Sans Serif", sans-serif;
  color: #000;
  background-color: #fff;
  padding: 4px;
  user-select: none;
  font-size: 12px;
  border: 2px solid;
  border-color: #808080 #ffffff #ffffff #808080;
  height: 100%;
  overflow: auto;

  &::-webkit-scrollbar {
    width: 16px;
    background-color: #c0c0c0;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #c0c0c0;
    border: 1px solid;
    border-color: #ffffff #808080 #808080 #ffffff;
  }

  &::-webkit-scrollbar-track {
    background-color: #c0c0c0;
    border: 1px solid;
    border-color: #808080 #ffffff #ffffff #808080;
  }
`;

const NodeContainer = styled.div`
  display: flex;
  align-items: flex-start;
  margin: 1px 0;
`;

const NodeContent = styled.div<{ level: number; isSelected: boolean }>`
  display: flex;
  align-items: center;
  padding: 1px 2px;
  padding-left: ${props => props.level * 16}px;
  cursor: pointer;
  background-color: ${props => props.isSelected ? '#000080' : 'transparent'};
  color: ${props => props.isSelected ? '#fff' : '#000'};

  &:hover {
    background-color: ${props => props.isSelected ? '#000080' : '#e0e0e0'};
  }
`;

const ToggleButton = styled.span`
  width: 16px;
  height: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 8px;
  color: inherit;
`;

const FolderIcon = styled.span`
  margin-right: 4px;
  font-size: 14px;
`;

const TreeLines = styled.span`
  color: #808080;
  margin-right: 4px;
  font-family: monospace;
`;

const NodeTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Favicon = styled.span`
  font-size: 14px;
  min-width: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;

const Title = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TreeNode: React.FC<TreeNodeProps> = ({
  node,
  level,
  isLast,
  isSelected,
  onSelect,
  onContextMenu
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(node.id);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onContextMenu(e, node.id);
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const hasChildren = node.children && node.children.length > 0;

  return (
    <>
      <NodeContainer>
        <NodeContent
          level={level}
          isSelected={isSelected}
          onClick={handleClick}
          onContextMenu={handleContextMenu}
        >
          {level > 0 && (
            <TreeLines>
              {isLast ? TreeIcons.lastBranchLine : TreeIcons.branchLine}
              {TreeIcons.horizontalLine}
            </TreeLines>
          )}
          {hasChildren && (
            <ToggleButton onClick={handleToggle}>
              {isExpanded ? TreeIcons.expanded : TreeIcons.collapsed}
            </ToggleButton>
          )}
          <FolderIcon>
            {hasChildren ? (isExpanded ? TreeIcons.folderOpen : TreeIcons.folder) : TreeIcons.folder}
          </FolderIcon>
          <NodeTitle>
            {!hasChildren && node.favicon && (
              <Favicon>{node.favicon}</Favicon>
            )}
            <Title>{node.title}</Title>
          </NodeTitle>
        </NodeContent>
      </NodeContainer>
      
      {isExpanded && hasChildren && (
        <div>
          {node.children!.map((child, index) => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              isLast={index === node.children!.length - 1}
              isSelected={isSelected}
              onSelect={onSelect}
              onContextMenu={onContextMenu}
            />
          ))}
        </div>
      )}
    </>
  );
};

const NoteTree: React.FC<NoteTreeProps> = ({ notes, onSelect, onContextMenu }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelect = useCallback((id: string) => {
    setSelectedId(id);
    onSelect?.(id);
  }, [onSelect]);

  const handleContextMenu = useCallback((e: React.MouseEvent, id: string) => {
    setSelectedId(id);
    onContextMenu?.(e, id);
  }, [onContextMenu]);

  return (
    <TreeContainer>
      {notes.map((note, index) => (
        <TreeNode
          key={note.id}
          node={note}
          level={0}
          isLast={index === notes.length - 1}
          isSelected={selectedId === note.id}
          onSelect={handleSelect}
          onContextMenu={handleContextMenu}
        />
      ))}
    </TreeContainer>
  );
};

export default NoteTree;