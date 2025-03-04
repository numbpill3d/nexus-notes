import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';

// ASCII-style tree connector characters
const TreeConnectors = {
  vertical: '│',
  horizontal: '──',
  branch: '├',
  lastBranch: '└',
  expanded: '[-]',
  collapsed: '[+]'
};

interface NoteNode {
  id: string;
  title: string;
  children?: NoteNode[];
}

interface TreeNodeProps {
  node: NoteNode;
  level: number;
  isLast: boolean;
}

const glitchAnimation = keyframes`
  0% { text-shadow: none; }
  20% { text-shadow: 0 0 2px #00ff00; }
  40% { text-shadow: -1px 0 #00ff00; }
  60% { text-shadow: 1px 0 #00ff00; }
  80% { text-shadow: none; }
`;

const TreeContainer = styled.div`
  font-family: 'Courier New', monospace;
  color: #00ff00;
  background-color: #000;
  padding: 1rem;
  user-select: none;
`;

const NodeContainer = styled.div`
  display: flex;
  align-items: flex-start;
  margin: 0.2rem 0;
  &:hover {
    animation: ${glitchAnimation} 0.2s linear;
  }
`;

const NodeContent = styled.div<{ level: number }>`
  display: flex;
  align-items: center;
  padding-left: ${props => props.level * 16}px;
  cursor: pointer;
`;

const ToggleButton = styled.span`
  margin-right: 8px;
  color: #00ff00;
  font-weight: bold;
`;

const NodeTitle = styled.span`
  &:hover {
    color: #fff;
    text-shadow: 0 0 5px #00ff00;
  }
`;

const TreeNode: React.FC<TreeNodeProps> = ({ node, level, isLast }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const hasChildren = node.children && node.children.length > 0;

  return (
    <>
      <NodeContainer>
        <NodeContent level={level}>
          {hasChildren && (
            <ToggleButton onClick={handleToggle}>
              {isExpanded ? TreeConnectors.expanded : TreeConnectors.collapsed}
            </ToggleButton>
          )}
          {level > 0 && (
            <>
              {isLast ? TreeConnectors.lastBranch : TreeConnectors.branch}
              {TreeConnectors.horizontal}
            </>
          )}
          <NodeTitle>{node.title}</NodeTitle>
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
            />
          ))}
        </div>
      )}
    </>
  );
};

interface NoteTreeProps {
  notes: NoteNode[];
}

const NoteTree: React.FC<NoteTreeProps> = ({ notes }) => {
  return (
    <TreeContainer>
      {notes.map((note, index) => (
        <TreeNode
          key={note.id}
          node={note}
          level={0}
          isLast={index === notes.length - 1}
        />
      ))}
    </TreeContainer>
  );
};

export default NoteTree;