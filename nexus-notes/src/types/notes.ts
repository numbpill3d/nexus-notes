import { RawNodeDatum } from 'react-d3-tree';

export enum BlockType {
  Text = 'text',
  Heading1 = 'heading1',
  Heading2 = 'heading2',
  Heading3 = 'heading3',
  BulletList = 'bullet_list',
  NumberedList = 'numbered_list',
  TaskList = 'task_list',
  Code = 'code',
  Table = 'table',
  Image = 'image',
  Database = 'database',
  GridView = 'grid_view',
  GalleryView = 'gallery_view',
  ListView = 'list_view'
}

export interface Block {
  id: string;
  type: BlockType;
  content: string;
  properties?: Record<string, unknown>;
}

export interface NoteMetadata {
  created: string;
  modified: string;
  wordCount: number;
  characterCount: number;
  tags: string[];
  favicon?: string;  // URL or emoji for the note's icon
  coverImage?: string;  // URL for the note's cover image
}

export interface Note {
  id: string;
  title: string;
  content: Block[];  // Changed from string to Block[] to support rich content
  metadata: NoteMetadata;
  children?: Note[];
}

// Tree node type
export interface NoteNode {
  id: string;
  title: string;
  favicon?: string | null;
  children?: NoteNode[];
}

// Graph node type
export interface GraphNodeAttributes {
  [key: string]: string | number | boolean;
  id: string;
  created: string;
  modified: string;
  tagList: string;
  type: string;
  favicon: string;
  coverImage: string;
}

export interface NoteGraphNode extends RawNodeDatum {
  name: string;
  attributes: GraphNodeAttributes;
  children?: NoteGraphNode[];
}

export const convertNoteToTreeNode = (note: Note): NoteNode => ({
  id: note.id,
  title: note.title,
  favicon: note.metadata.favicon || null,
  children: note.children?.map(convertNoteToTreeNode)
});

export const convertNoteToGraphNode = (note: Note): NoteGraphNode => ({
  name: note.title,
  attributes: {
    id: note.id,
    created: note.metadata.created,
    modified: note.metadata.modified,
    tagList: note.metadata.tags.join(', '),
    type: 'note',
    favicon: note.metadata.favicon || '',
    coverImage: note.metadata.coverImage || ''
  } as GraphNodeAttributes,
  children: note.children?.map(convertNoteToGraphNode)
});