import React, { useState } from 'react';
import styled from 'styled-components';

const MetadataContainer = styled.div`
  height: 100%;
  background-color: #c0c0c0;
  color: #000;
  font-family: "Microsoft Sans Serif", sans-serif;
  padding: 8px;
  overflow-y: auto;

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

const Section = styled.fieldset`
  margin-bottom: 12px;
  border: 2px solid;
  border-color: #808080 #ffffff #ffffff #808080;
  padding: 8px;
  background-color: #c0c0c0;
`;

const SectionTitle = styled.legend`
  padding: 0 4px;
  font-size: 12px;
  font-weight: bold;
`;

const MetadataField = styled.div`
  margin-bottom: 8px;
  font-size: 12px;
  display: flex;
  align-items: center;

  &:last-child {
    margin-bottom: 0;
  }
`;

const Label = styled.span`
  color: #000;
  margin-right: 8px;
  min-width: 80px;

  &::after {
    content: ':';
  }
`;

const Value = styled.span`
  color: #000;
`;

const TagContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
`;

const Tag = styled.button`
  background-color: #c0c0c0;
  border: 2px solid;
  border-color: #ffffff #808080 #808080 #ffffff;
  padding: 2px 6px;
  font-size: 11px;
  font-family: "Microsoft Sans Serif", sans-serif;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;

  &:active {
    border-color: #808080 #ffffff #ffffff #808080;
  }
`;

const AddTagButton = styled.button`
  background-color: #c0c0c0;
  border: 2px solid;
  border-color: #ffffff #808080 #808080 #ffffff;
  padding: 2px 6px;
  font-family: "Microsoft Sans Serif", sans-serif;
  font-size: 11px;
  cursor: pointer;

  &:active {
    border-color: #808080 #ffffff #ffffff #808080;
  }
`;

const TagInput = styled.input`
  background: #fff;
  border: 2px solid;
  border-color: #808080 #ffffff #ffffff #808080;
  color: #000;
  padding: 2px 4px;
  font-family: "Microsoft Sans Serif", sans-serif;
  font-size: 11px;
  width: calc(100% - 16px);
  margin: 4px 0;

  &:focus {
    outline: none;
  }
`;

const ImageInput = styled.input`
  background: #fff;
  border: 2px solid;
  border-color: #808080 #ffffff #ffffff #808080;
  color: #000;
  padding: 2px 4px;
  font-family: "Microsoft Sans Serif", sans-serif;
  font-size: 11px;
  width: calc(100% - 16px);
  margin: 4px 0;

  &:focus {
    outline: none;
  }
`;

const EmojiPicker = styled.div`
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 4px;
  margin-top: 4px;
`;

const EmojiButton = styled.button`
  background: #c0c0c0;
  border: 2px solid;
  border-color: #ffffff #808080 #808080 #ffffff;
  padding: 2px;
  font-size: 16px;
  cursor: pointer;

  &:active {
    border-color: #808080 #ffffff #ffffff #808080;
  }
`;

const commonEmojis = ['📝', '📚', '💡', '⭐', '📌', '📎', '🔖', '📋', '📁', '🗂️', '📊', '📈', '🎯', '⚡', '🔍', '🎨'];

interface MetadataPanelProps {
  metadata: {
    created: string;
    modified: string;
    wordCount: number;
    characterCount: number;
    tags: string[];
    favicon?: string;
    coverImage?: string;
  };
  onTagsChange?: (tags: string[]) => void;
  onFaviconChange?: (favicon: string) => void;
  onCoverImageChange?: (coverImage: string) => void;
}

export const MetadataPanel: React.FC<MetadataPanelProps> = ({
  metadata,
  onTagsChange,
  onFaviconChange,
  onCoverImageChange,
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

      <Section>
        <SectionTitle>Appearance</SectionTitle>
        <MetadataField>
          <Label>Favicon</Label>
          <Value>{metadata.favicon || 'None'}</Value>
        </MetadataField>
        <EmojiPicker>
          {commonEmojis.map(emoji => (
            <EmojiButton
              key={emoji}
              onClick={() => onFaviconChange?.(emoji)}
              style={{
                background: metadata.favicon === emoji ? '#ffffff' : '#c0c0c0',
              }}
            >
              {emoji}
            </EmojiButton>
          ))}
        </EmojiPicker>
        <MetadataField style={{ marginTop: '8px' }}>
          <Label>Cover Image</Label>
          {metadata.coverImage ? (
            <div style={{ width: '100%' }}>
              <img
                src={metadata.coverImage}
                alt="Note cover"
                style={{
                  width: '100%',
                  height: '100px',
                  objectFit: 'cover',
                  marginBottom: '4px',
                  border: '2px solid',
                  borderColor: '#808080 #ffffff #ffffff #808080',
                }}
              />
              <button
                onClick={() => onCoverImageChange?.('')}
                style={{
                  fontSize: '11px',
                  padding: '2px 6px',
                  marginTop: '4px',
                }}
              >
                Remove
              </button>
            </div>
          ) : (
            <ImageInput
              type="text"
              placeholder="Enter image URL..."
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  onCoverImageChange?.((e.target as HTMLInputElement).value);
                }
              }}
            />
          )}
        </MetadataField>
      </Section>
    </MetadataContainer>
  );
};
