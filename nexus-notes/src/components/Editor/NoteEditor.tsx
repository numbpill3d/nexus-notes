import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

const glitchAnimation = keyframes`
  0% {
    text-shadow: none;
  }
  20% {
    text-shadow: 0 0 2px #00ff00;
  }
  40% {
    text-shadow: -1px 0 #00ff00;
  }
  60% {
    text-shadow: 1px 0 #00ff00;
  }
  80% {
    text-shadow: none;
  }
`;

const scanlineAnimation = keyframes`
  from {
    transform: translateY(-100%);
  }
  to {
    transform: translateY(100%);
  }
`;

const EditorContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  background-color: #000;
  padding: 1rem;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 2px;
    background: rgba(0, 255, 0, 0.1);
    animation: ${scanlineAnimation} 6s linear infinite;
    pointer-events: none;
  }
`;

const EditorHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  padding: 0.5rem;
  border: 1px solid #00ff00;
  background-color: #111;
`;

const Title = styled.input`
  background: transparent;
  border: none;
  color: #00ff00;
  font-family: 'Courier New', monospace;
  font-size: 1.2rem;
  width: 100%;
  padding: 0.5rem;

  &:focus {
    outline: none;
    animation: ${glitchAnimation} 0.2s linear;
  }
`;

const EditorContent = styled.textarea`
  width: 100%;
  height: calc(100% - 4rem);
  background-color: #000;
  border: 1px solid #00ff00;
  color: #00ff00;
  font-family: 'Courier New', monospace;
  font-size: 1rem;
  padding: 1rem;
  resize: none;

  &:focus {
    outline: none;
    border-color: #00ff00;
    box-shadow: 0 0 10px rgba(0, 255, 0, 0.2);
  }

  &::selection {
    background-color: rgba(0, 255, 0, 0.3);
  }
`;

const StatusBar = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 0.5rem;
  background-color: #111;
  color: #00ff00;
  font-family: 'Courier New', monospace;
  font-size: 0.8rem;
  display: flex;
  justify-content: space-between;
`;

interface NoteEditorProps {
  initialTitle?: string;
  initialContent?: string;
  onTitleChange?: (title: string) => void;
  onContentChange?: (content: string) => void;
}

const NoteEditor: React.FC<NoteEditorProps> = ({
  initialTitle = '',
  initialContent = '',
  onTitleChange,
  onContentChange,
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [wordCount, setWordCount] = useState(0);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    const words = content.trim().split(/\s+/).filter(Boolean).length;
    setWordCount(words);
  }, [content]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    onTitleChange?.(newTitle);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    onContentChange?.(newContent);
  };

  // Simulate auto-save
  useEffect(() => {
    const timer = setTimeout(() => {
      setLastSaved(new Date());
    }, 2000);

    return () => clearTimeout(timer);
  }, [content, title]);

  return (
    <EditorContainer>
      <EditorHeader>
        <Title
          value={title}
          onChange={handleTitleChange}
          placeholder="Enter note title..."
        />
      </EditorHeader>
      <EditorContent
        value={content}
        onChange={handleContentChange}
        placeholder="Begin typing your note here..."
      />
      <StatusBar>
        <span>Words: {wordCount}</span>
        <span>
          {lastSaved
            ? `Last saved: ${lastSaved.toLocaleTimeString()}`
            : 'Not saved yet'}
        </span>
      </StatusBar>
    </EditorContainer>
  );
};

export default NoteEditor;