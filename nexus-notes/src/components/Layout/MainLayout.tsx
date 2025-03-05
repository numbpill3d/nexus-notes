import React, { useState, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { ResizableBox } from 'react-resizable';
import { useHotkeys } from 'react-hotkeys-hook';
import { nanoid } from 'nanoid';
import NoteTree from '../TreeView/NoteTree';
import NoteEditor from '../Editor/NoteEditor';
import { MetadataPanel as MetadataPanelComponent } from '../Metadata/MetadataPanel';
import NoteGraph from '../GraphView/NoteGraph';
import Menu, { MenuGroup } from '../Menu/Menu';
import { Note, BlockType, convertNoteToTreeNode, convertNoteToGraphNode } from '../../types/notes';
import { storageService } from '../../services/storage';
import 'react-resizable/css/styles.css';
import '98.css/dist/98.css';

// Sample note for initial state
const sampleNote: Note = {
  id: '1',
  title: 'Welcome to Nexus Notes',
  content: [{
    id: nanoid(),
    type: BlockType.Text,
    content: 'Start typing your notes here...'
  }],
  metadata: {
    created: new Date().toISOString(),
    modified: new Date().toISOString(),
    wordCount: 5,
    characterCount: 27,
    tags: ['welcome', 'getting-started']
  },
  children: []
};

const Win98Window = styled.div<{ isMaximized?: boolean }>`
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #c0c0c0;
  ${props => props.isMaximized ? `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1000;
  ` : ''}
`;

const TitleBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 3px;
  background: #000080;
  color: white;
`;

const TitleText = styled.div`
  font-weight: bold;
  margin-left: 4px;
`;

const WindowControls = styled.div`
  display: flex;
  gap: 2px;
`;

const WindowButton = styled.button`
  width: 20px;
  height: 18px;
  font-family: "Microsoft Sans Serif", sans-serif;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const GraphToggle = styled.button.attrs({ className: 'button' })`
  background-color: #c0c0c0;
  border: 2px solid;
  border-color: #ffffff #808080 #808080 #ffffff;
  padding: 4px;
  width: 100%;
  margin: 4px 0;
  font-family: "Microsoft Sans Serif", sans-serif;
  font-size: 11px;
  cursor: pointer;

  &:active {
    border-color: #808080 #ffffff #ffffff #808080;
  }
`;

const MainContainer = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const Content = styled.div`
  flex: 1;
  display: flex;
  background: #c0c0c0;
`;

const GraphContainer = styled.div`
  height: 300px;
  margin-top: 4px;
  border: 2px solid;
  border-color: #808080 #ffffff #ffffff #808080;
  background-color: white;
  overflow: hidden;
`;

const handleStyles = `
  position: absolute;
  width: 4px;
  height: 100%;
  top: 0;
  cursor: col-resize;
  background: #c0c0c0;
  border-right: 1px solid #808080;
  border-left: 1px solid #ffffff;
`;

const Sidebar = styled(ResizableBox)`
  background-color: #c0c0c0;
  border-right: 2px solid;
  border-color: #ffffff #808080 #808080 #ffffff;
  padding: 4px;
  overflow-y: auto;

  .react-resizable-handle {
    ${handleStyles}
    right: 0;
  }
`;

const CoverImage = styled.div<{ url?: string }>`
  width: 100%;
  height: ${props => props.url ? '200px' : '0'};
  background-image: ${props => props.url ? `url(${props.url})` : 'none'};
  background-size: cover;
  background-position: center;
  border-bottom: ${props => props.url ? '2px solid #808080' : 'none'};
  transition: height 0.3s ease;
`;

const EditorSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 4px;
  background-color: #c0c0c0;
`;

const MetadataPanelContainer = styled(ResizableBox)`
  background-color: #c0c0c0;
  border-left: 2px solid;
  border-color: #ffffff #808080 #808080 #ffffff;
  padding: 4px;

  .react-resizable-handle {
    ${handleStyles}
    left: 0;
  }
`;

const StatusBar = styled.div`
  height: 20px;
  padding: 2px 4px;
  background: #c0c0c0;
  border-top: 1px solid #808080;
  font-size: 12px;
  display: flex;
  align-items: center;
`;

interface MainLayoutProps {
  initialNote?: Note;
}

const MainLayout: React.FC<MainLayoutProps> = ({ initialNote = sampleNote }) => {
  const [activeNote, setActiveNote] = useState<Note>(initialNote);
  const [notes, setNotes] = useState<Note[]>([initialNote]);
  const [showGraph, setShowGraph] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    // Load notes on mount
    storageService.listNotes().then(loadedNotes => {
      if (loadedNotes.length > 0) {
        setNotes(loadedNotes);
        setActiveNote(loadedNotes[0]);
      } else {
        // Save initial note if no notes exist
        storageService.saveNote(initialNote);
      }
    });
  }, [initialNote]);

  // Auto-save effect
  useEffect(() => {
    const saveTimer = setTimeout(() => {
      storageService.saveNote(activeNote);
    }, 1000);

    return () => clearTimeout(saveTimer);
  }, [activeNote]);

  const handleNewNote = useCallback(() => {
    const newNote: Note = {
      id: nanoid(),
      title: 'Untitled Note',
      content: [{
        id: nanoid(),
        type: BlockType.Text,
        content: ''
      }],
      metadata: {
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
        wordCount: 0,
        characterCount: 0,
        tags: []
      },
      children: []
    };
    setActiveNote(newNote);
    setNotes(prev => [...prev, newNote]);
    storageService.saveNote(newNote);
  }, []);

  const handleSave = useCallback(() => {
    storageService.saveNote(activeNote);
  }, [activeNote]);

  const handleExport = useCallback(async () => {
    const data = await storageService.exportNotes();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nexus-notes-export.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  const handleImport = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const content = e.target?.result as string;
          try {
            await storageService.importNotes(content);
            const loadedNotes = await storageService.listNotes();
            setNotes(loadedNotes);
            if (loadedNotes.length > 0) {
              setActiveNote(loadedNotes[0]);
            }
          } catch (error) {
            alert('Failed to import notes: ' + (error instanceof Error ? error.message : 'Unknown error'));
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }, []);

  const handleDelete = useCallback(async () => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      await storageService.deleteNote(activeNote.id);
      const remainingNotes = await storageService.listNotes();
      setNotes(remainingNotes);
      if (remainingNotes.length > 0) {
        setActiveNote(remainingNotes[0]);
      } else {
        handleNewNote();
      }
    }
  }, [activeNote.id, handleNewNote]);

  const menuGroups: MenuGroup[] = [
    {
      label: 'File',
      items: [
        { label: 'New', action: handleNewNote, shortcut: 'Ctrl+N' },
        { label: 'Save', action: handleSave, shortcut: 'Ctrl+S' },
        'separator',
        { label: 'Import...', action: handleImport },
        { label: 'Export...', action: handleExport },
        'separator',
        { label: 'Exit', action: () => window.close() }
      ]
    },
    {
      label: 'Edit',
      items: [
        { label: 'Delete', action: handleDelete, shortcut: 'Del' },
        'separator',
        { label: 'Select All', action: () => document.execCommand('selectAll'), shortcut: 'Ctrl+A' }
      ]
    },
    {
      label: 'View',
      items: [
        { 
          label: 'Graph View',
          action: () => setShowGraph(!showGraph),
          shortcut: 'Ctrl+G'
        }
      ]
    },
    {
      label: 'Help',
      items: [
        { label: 'About Nexus Notes...', action: () => alert('Nexus Notes v1.0.0\nA Windows 98-style note-taking app') }
      ]
    }
  ];

  // Keyboard shortcuts
  useHotkeys('ctrl+n', handleNewNote, { preventDefault: true });
  useHotkeys('ctrl+s', handleSave, { preventDefault: true });
  useHotkeys('ctrl+g', () => setShowGraph(!showGraph), { preventDefault: true });
  useHotkeys('del', handleDelete, { preventDefault: true });

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
      content: [{
        id: prev.content[0]?.id || nanoid(),
        type: BlockType.Text,
        content: content
      }],
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

  const handleFaviconChange = (favicon: string) => {
    setActiveNote(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        favicon,
        modified: new Date().toISOString()
      }
    }));
  };

  const handleCoverImageChange = (coverImage: string) => {
    setActiveNote(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        coverImage,
        modified: new Date().toISOString()
      }
    }));
  };

  return (
    <Win98Window isMaximized={isMaximized}>
      <TitleBar>
        <TitleText>Nexus Notes - {activeNote.title}</TitleText>
        <WindowControls>
          <WindowButton>_</WindowButton>
          <WindowButton onClick={() => setIsMaximized(!isMaximized)}>
            {isMaximized ? '❐' : '□'}
          </WindowButton>
          <WindowButton>✕</WindowButton>
        </WindowControls>
      </TitleBar>

      <Menu groups={menuGroups} />

      <MainContainer>
        <Sidebar
          width={250}
          height={Infinity}
          minConstraints={[200, Infinity]}
          maxConstraints={[500, Infinity]}
          axis="x"
        >
          <NoteTree 
            notes={notes.map(convertNoteToTreeNode)}
            onSelect={(id) => {
              const note = notes.find(n => n.id === id);
              if (note) setActiveNote(note);
            }}
          />
          <GraphToggle onClick={() => setShowGraph(!showGraph)}>
            {showGraph ? '[-] Graph View' : '[+] Graph View'}
          </GraphToggle>
          {showGraph && (
            <GraphContainer>
              <NoteGraph data={convertNoteToGraphNode(activeNote)} />
            </GraphContainer>
          )}
        </Sidebar>
        
        <Content>
          <EditorSection>
            <CoverImage url={activeNote.metadata.coverImage} />
            <NoteEditor
              initialTitle={activeNote.title}
              initialContent={activeNote.content[0]?.content || ''}
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
              onFaviconChange={handleFaviconChange}
              onCoverImageChange={handleCoverImageChange}
            />
          </MetadataPanelContainer>
        </Content>
      </MainContainer>

      <StatusBar>
        <span>Words: {activeNote.metadata.wordCount}</span>
        <span style={{ marginLeft: 'auto' }}>
          Last modified: {new Date(activeNote.metadata.modified).toLocaleString()}
        </span>
      </StatusBar>
    </Win98Window>
  );
};

export default MainLayout;