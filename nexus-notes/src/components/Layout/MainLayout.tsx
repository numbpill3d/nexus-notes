import React, { useState } from 'react';
import styled from 'styled-components';
import { ResizableBox } from 'react-resizable';
import NoteTree from '../TreeView/NoteTree';
import NoteEditor from '../Editor/NoteEditor';
import { MetadataPanel as MetadataPanelComponent } from '../Metadata/MetadataPanel';
import NoteGraph from '../GraphView/NoteGraph';
import { Note, convertNoteToTreeNode, convertNoteToGraphNode } from '../../types/notes';

const GraphToggle = styled.button`
  background: none;
  border: 1px solid #00ff00;
  color: #00ff00;
  padding: 0.5rem;
  width: 100%;
  margin: 1rem 0;
  font-family: 'Courier New', monospace;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: rgba(0, 255, 0, 0.1);
  }
`;

const GraphContainer = styled.div`
  height: 300px;
  margin-top: 1rem;
  border: 1px solid #00ff00;
  background-color: #0a0a0a;
  overflow: hidden;
`;

const handleStyles = `
  position: absolute;
  width: 10px;
  height: 100%;
  top: 0;
  cursor: col-resize;
  background: #00ff00;
  opacity: 0;
  transition: opacity 0.2s;
  &:hover {
    opacity: 0.5;
  }
`;

const LayoutContainer = styled.div`
  display: flex;
  height: 100vh;
  width: 100vw;
  background-color: #000;
  color: #00ff00;
  font-family: 'Courier New', monospace;
`;

const Sidebar = styled(ResizableBox)`
  background-color: #111;
  border-right: 1px solid #00ff00;
  padding: 1rem;
  overflow-y: auto;

  .react-resizable-handle {
    ${handleStyles}
    right: 0;
  }
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
`;

const EditorSection = styled.div`
  flex: 1;
  padding: 1rem;
  background-color: #0a0a0a;
`;

const MetadataPanelContainer = styled(ResizableBox)`
  background-color: #111;
  border-left: 1px solid #00ff00;
  padding: 1rem;

  .react-resizable-handle {
    ${handleStyles}
    left: 0;
  }
`;

// Sample data for testing
const sampleNote: Note = {
  id: '1',
  title: 'Welcome to Nexus Notes',
  content: 'Start typing your notes here...',
  metadata: {
    created: new Date().toISOString(),
    modified: new Date().toISOString(),
    wordCount: 5,
    characterCount: 27,
    tags: ['welcome', 'getting-started']
  },
  children: []
};

interface MainLayoutProps {
  initialNote?: Note;
}

const MainLayout: React.FC<MainLayoutProps> = ({ initialNote = sampleNote }) => {
  const [activeNote, setActiveNote] = useState<Note>(initialNote);
  const [showGraph, setShowGraph] = useState(false);

  const handleTitleChange = (title: string) => {
    setActiveNote(prev => ({
      ...prev,
      title,
      metadata: {
        ...prev.metadata,
        modified: new Date().toISOString()
      }
    }));
  };

  const handleContentChange = (content: string) => {
    setActiveNote(prev => ({
      ...prev,
      content,
      metadata: {
        ...prev.metadata,
        modified: new Date().toISOString(),
        wordCount: content.trim().split(/\s+/).filter(Boolean).length,
        characterCount: content.length
      }
    }));
  };

  const handleTagsChange = (tags: string[]) => {
    setActiveNote(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        tags,
        modified: new Date().toISOString()
      }
    }));
  };
  return (
    <LayoutContainer>
      <Sidebar
        width={250}
        height={Infinity}
        minConstraints={[200, Infinity]}
        maxConstraints={[500, Infinity]}
        axis="x"
      >
        <NoteTree notes={[convertNoteToTreeNode(activeNote)]} />
        <GraphToggle onClick={() => setShowGraph(!showGraph)}>
          [{showGraph ? '-' : '+'} ] Graph View
        </GraphToggle>
        {showGraph && (
          <GraphContainer>
            <NoteGraph data={convertNoteToGraphNode(activeNote)} />
          </GraphContainer>
        )}
      </Sidebar>
      
      <MainContent>
        <EditorSection>
          <NoteEditor
            initialTitle={activeNote.title}
            initialContent={activeNote.content}
            onTitleChange={handleTitleChange}
            onContentChange={handleContentChange}
          />
        </EditorSection>
        
        <MetadataPanelContainer
          width={300}
          height={Infinity}
          minConstraints={[200, Infinity]}
          maxConstraints={[600, Infinity]}
          axis="x"
        >
          <MetadataPanelComponent
            metadata={activeNote.metadata}
            onTagsChange={handleTagsChange}
          />
        </MetadataPanelContainer>
      </MainContent>
    </LayoutContainer>
  );
};

export default MainLayout;