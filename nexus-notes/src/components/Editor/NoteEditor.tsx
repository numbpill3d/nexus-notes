import React, { useState, useEffect, useCallback, useRef } from 'react';
import styled from 'styled-components';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { BlockType } from '../../types/notes';
import CommandMenu from './CommandMenu';

const EditorContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  background-color: #fff;
  border: 2px solid;
  border-color: #808080 #ffffff #ffffff #808080;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const EditorHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 4px;
  background-color: #c0c0c0;
  border-bottom: 1px solid #808080;
`;

const Title = styled.input`
  background: #fff;
  border: 2px solid;
  border-color: #808080 #ffffff #ffffff #808080;
  color: #000;
  font-family: "Microsoft Sans Serif", sans-serif;
  font-size: 14px;
  width: 100%;
  padding: 2px 4px;

  &:focus {
    outline: none;
  }
`;

const Toolbar = styled.div`
  display: flex;
  gap: 2px;
  padding: 4px;
  background-color: #c0c0c0;
  border-bottom: 1px solid #808080;
`;

const ToolbarButton = styled.button`
  padding: 2px 4px;
  min-width: 24px;
  font-size: 12px;
  font-family: "Microsoft Sans Serif", sans-serif;

  &:active {
    border-color: #808080 #ffffff #ffffff #808080;
  }
`;

const EditorContent = styled.textarea`
  flex: 1;
  width: 100%;
  background-color: #fff;
  border: 2px solid;
  border-color: #808080 #ffffff #ffffff #808080;
  color: #000;
  font-family: "Microsoft Sans Serif", sans-serif;
  font-size: 14px;
  padding: 4px;
  resize: none;

  &:focus {
    outline: none;
  }
`;

const PreviewContainer = styled.div`
  flex: 1;
  padding: 4px;
  background-color: #fff;
  border: 2px solid;
  border-color: #808080 #ffffff #ffffff #808080;
  overflow-y: auto;
  font-family: "Microsoft Sans Serif", sans-serif;
  font-size: 14px;
`;

const EditorPane = styled.div<{ showPreview: boolean }>`
  display: flex;
  flex: 1;
  gap: 4px;
  padding: 4px;
  background-color: #c0c0c0;

  ${EditorContent} {
    flex: ${props => props.showPreview ? 1 : 2};
  }
`;

const StatusBar = styled.div`
  padding: 2px 4px;
  background-color: #c0c0c0;
  border-top: 1px solid #808080;
  font-family: "Microsoft Sans Serif", sans-serif;
  font-size: 12px;
  display: flex;
  justify-content: space-between;
`;

interface NoteEditorProps {
  initialTitle?: string;
  initialContent?: string;
  onTitleChange?: (title: string) => void;
  onContentChange?: (content: string) => void;
}

interface CodeBlockProps {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
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
  const [showPreview, setShowPreview] = useState(false);
  useEffect(() => {
    const words = content.trim().split(/\s+/).filter(Boolean).length;
    setWordCount(words);
  }, [content]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    onTitleChange?.(newTitle);
  };

  const [showCommandMenu, setShowCommandMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const editorRef = useRef<HTMLTextAreaElement>(null);

  const getCaretCoordinates = () => {
    const textarea = editorRef.current;
    if (!textarea) return { top: 0, left: 0 };

    const caretPos = textarea.selectionStart;
    const textBeforeCaret = textarea.value.substring(0, caretPos);
    const lineBreaks = textBeforeCaret.match(/\n/g)?.length || 0;

    // Create a temporary div to measure text
    const div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.visibility = 'hidden';
    div.style.whiteSpace = 'pre-wrap';
    div.style.font = window.getComputedStyle(textarea).font;
    div.textContent = textBeforeCaret;
    document.body.appendChild(div);

    const { width } = div.getBoundingClientRect();
    document.body.removeChild(div);

    const lineHeight = parseInt(window.getComputedStyle(textarea).lineHeight);
    const { top: textareaTop, left: textareaLeft } = textarea.getBoundingClientRect();

    return {
      top: textareaTop + lineHeight * lineBreaks + 24, // Add padding
      left: textareaLeft + (width % textarea.clientWidth)
    };
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    const lastChar = newContent[e.target.selectionStart - 1];
    
    if (lastChar === '/') {
      const coords = getCaretCoordinates();
      setMenuPosition(coords);
      setShowCommandMenu(true);
    }
    
    setContent(newContent);
    onContentChange?.(newContent);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Escape' && showCommandMenu) {
      setShowCommandMenu(false);
    }
  };

  const handleCommandSelect = (blockType: BlockType) => {
    const textarea = editorRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const textBeforeCaret = content.substring(0, start);
    const textAfterCaret = content.substring(start);
    
    // Remove the trigger character
    const newTextBefore = textBeforeCaret.slice(0, -1);
    
    let insertedContent = '';
    switch (blockType) {
      case BlockType.Heading1:
        insertedContent = '# ';
        break;
      case BlockType.Heading2:
        insertedContent = '## ';
        break;
      case BlockType.Heading3:
        insertedContent = '### ';
        break;
      case BlockType.BulletList:
        insertedContent = '- ';
        break;
      case BlockType.NumberedList:
        insertedContent = '1. ';
        break;
      case BlockType.TaskList:
        insertedContent = '- [ ] ';
        break;
      case BlockType.Code:
        insertedContent = '```\n\n```';
        break;
      case BlockType.Table:
        insertedContent = '| Column 1 | Column 2 | Column 3 |\n| -------- | -------- | -------- |\n| Cell 1   | Cell 2   | Cell 3   |';
        break;
      case BlockType.Image:
        insertedContent = '![Image description](image_url)';
        break;
      case BlockType.Database:
      case BlockType.GridView:
      case BlockType.GalleryView:
      case BlockType.ListView:
        // These will be handled by a more complex insertion mechanism
        insertedContent = `:::${blockType}\n\n:::`; 
        break;
      default:
        insertedContent = '';
    }

    const newContent = `${newTextBefore}${insertedContent}${textAfterCaret}`;
    setContent(newContent);
    onContentChange?.(newContent);
    setShowCommandMenu(false);
  };

  const insertMarkdown = useCallback((markdown: string) => {
    const textarea = document.querySelector('textarea');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const beforeText = content.substring(0, start);
    const afterText = content.substring(end);

    const newContent = `${beforeText}${markdown.replace('$1', selectedText)}${afterText}`;
    setContent(newContent);
    onContentChange?.(newContent);
  }, [content, onContentChange]);
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
      <Toolbar>
        <ToolbarButton onClick={() => insertMarkdown('**$1**')}>B</ToolbarButton>
        <ToolbarButton onClick={() => insertMarkdown('*$1*')}>I</ToolbarButton>
        <ToolbarButton onClick={() => insertMarkdown('# $1')}>H1</ToolbarButton>
        <ToolbarButton onClick={() => insertMarkdown('## $1')}>H2</ToolbarButton>
        <ToolbarButton onClick={() => insertMarkdown('- $1')}>•</ToolbarButton>
        <ToolbarButton onClick={() => insertMarkdown('1. $1')}>1.</ToolbarButton>
        <ToolbarButton onClick={() => insertMarkdown('[${1}](url)')}>🔗</ToolbarButton>
        <ToolbarButton onClick={() => insertMarkdown('```\n$1\n```')}>{'</>'}</ToolbarButton>
        <ToolbarButton onClick={() => setShowPreview(!showPreview)}>
          {showPreview ? 'Edit' : 'Preview'}
        </ToolbarButton>
      </Toolbar>
      <EditorPane showPreview={showPreview}>
        <EditorContent
          ref={editorRef}
          value={content}
          onChange={handleContentChange}
          onKeyDown={handleKeyDown}
          placeholder="Begin typing your note here..."
        />
        {showCommandMenu && (
          <CommandMenu
            position={menuPosition}
            onSelect={handleCommandSelect}
            onClose={() => setShowCommandMenu(false)}
          />
        )}
        {showPreview && (
          <PreviewContainer>
            <ReactMarkdown
              components={{
                code({ inline, className, children }: CodeBlockProps) {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                    <SyntaxHighlighter
                      language={match[1]}
                      PreTag="div"
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={className}>
                      {children}
                    </code>
                  );
                }
              }}
            >
              {content}
            </ReactMarkdown>
          </PreviewContainer>
        )}
      </EditorPane>
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