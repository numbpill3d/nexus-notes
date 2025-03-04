import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';

const glitchText = keyframes`
  0% { text-shadow: none; }
  20% { text-shadow: 0 0 2px #00ff00; }
  21% { text-shadow: -1px 0 #00ff00; }
  25% { text-shadow: 1px 0 #00ff00; }
  30% { text-shadow: none; }
`;

const MetadataContainer = styled.div`
  height: 100%;
  background-color: #000;
  color: #00ff00;
  font-family: 'Courier New', monospace;
  padding: 1rem;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 8px;
    background-color: #111;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #00ff00;
    border-radius: 4px;
  }
`;

const Section = styled.div`
  margin-bottom: 2rem;
  border: 1px solid #00ff00;
  padding: 1rem;
  background-color: #0a0a0a;
`;

const SectionTitle = styled.h3`
  margin: 0 0 1rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #00ff00;
  font-size: 1rem;
  display: flex;
  align-items: center;

  &:hover {
    animation: ${glitchText} 0.3s linear;
  }

  &::before {
    content: '[>]';
    margin-right: 0.5rem;
    color: #00ff00;
  }
`;

const MetadataField = styled.div`
  margin-bottom: 1rem;
  font-size: 0.9rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const Label = styled.span`
  color: #008800;
  margin-right: 0.5rem;

  &::after {
    content: ':';
  }
`;

const Value = styled.span`
  color: #00ff00;
`;

const TagContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const Tag = styled.span`
  background-color: #111;
  border: 1px solid #00ff00;
  padding: 0.2rem 0.5rem;
  font-size: 0.8rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background-color: #002200;
    animation: ${glitchText} 0.2s linear;
  }
`;

const AddTagButton = styled.button`
  background: none;
  border: 1px dashed #00ff00;
  color: #00ff00;
  padding: 0.2rem 0.5rem;
  font-family: 'Courier New', monospace;
  font-size: 0.8rem;
  cursor: pointer;

  &:hover {
    background-color: #002200;
    animation: ${glitchText} 0.2s linear;
  }
`;

const TagInput = styled.input`
  background: #111;
  border: 1px solid #00ff00;
  color: #00ff00;
  padding: 0.2rem 0.5rem;
  font-family: 'Courier New', monospace;
  font-size: 0.8rem;
  width: 100%;
  margin-bottom: 0.5rem;

  &:focus {
    outline: none;
    box-shadow: 0 0 5px #00ff00;
  }
`;

interface MetadataPanelProps {
  metadata: {
    created: string;
    modified: string;
    wordCount: number;
    characterCount: number;
    tags: string[];
  };
  onTagsChange?: (tags: string[]) => void;
}

export const MetadataPanel: React.FC<MetadataPanelProps> = ({
  metadata,
  onTagsChange,
}) => {
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTag, setNewTag] = useState('');

  const handleAddTag = () => {
    if (newTag.trim() && !metadata.tags.includes(newTag.trim())) {
      const updatedTags = [...metadata.tags, newTag.trim()];
      onTagsChange?.(updatedTags);
      setNewTag('');
      setIsAddingTag(false);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = metadata.tags.filter(tag => tag !== tagToRemove);
    onTagsChange?.(updatedTags);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTag();
    }
  };

  return (
    <MetadataContainer>
      <Section>
        <SectionTitle>Metadata</SectionTitle>
        <MetadataField>
          <Label>Created</Label>
          <Value>{new Date(metadata.created).toLocaleString()}</Value>
        </MetadataField>
        <MetadataField>
          <Label>Modified</Label>
          <Value>{new Date(metadata.modified).toLocaleString()}</Value>
        </MetadataField>
      </Section>

      <Section>
        <SectionTitle>Statistics</SectionTitle>
        <MetadataField>
          <Label>Words</Label>
          <Value>{metadata.wordCount}</Value>
        </MetadataField>
        <MetadataField>
          <Label>Characters</Label>
          <Value>{metadata.characterCount}</Value>
        </MetadataField>
      </Section>

      <Section>
        <SectionTitle>Tags</SectionTitle>
        <TagContainer>
          {metadata.tags.map(tag => (
            <Tag key={tag} onClick={() => handleRemoveTag(tag)}>
              {tag}
              <span style={{ color: '#008800' }}>×</span>
            </Tag>
          ))}
          {isAddingTag ? (
            <TagInput
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={handleKeyPress}
              onBlur={handleAddTag}
              autoFocus
              placeholder="Enter tag..."
            />
          ) : (
            <AddTagButton onClick={() => setIsAddingTag(true)}>
              + Add Tag
            </AddTagButton>
          )}
        </TagContainer>
      </Section>
    </MetadataContainer>
  );
};
