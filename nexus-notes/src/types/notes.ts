export interface NoteMetadata {
  created: string;
  modified: string;
  wordCount: number;
  characterCount: number;
  tags: string[];
}

export interface Note {
  id: string;
  title: string;
  content: string;
  metadata: NoteMetadata;
  children?: Note[];
}

export interface NoteTreeNode {
  id: string;
  name: string;
  title: string;  // Required by NoteNode
  children?: NoteTreeNode[];
  attributes: {
    id: string;
    created: string;
    modified: string;
    tagList: string;
  };
}

export interface NoteGraphNode {
  name: string;
  attributes: {
    [key: string]: string | number | boolean;
    id: string;
    created: string;
    modified: string;
    tagList: string;
  };
  children?: NoteGraphNode[];
}

export const convertNoteToTreeNode = (note: Note): NoteTreeNode => ({
  id: note.id,
  name: note.title,
  title: note.title,  // Add title property
  children: note.children?.map(convertNoteToTreeNode),
  attributes: {
    id: note.id,
    created: note.metadata.created,
    modified: note.metadata.modified,
    tagList: note.metadata.tags.join(', ')
  }
});

export const convertNoteToGraphNode = (note: Note): NoteGraphNode => ({
  name: note.title,
  attributes: {
    id: note.id,
    created: note.metadata.created,
    modified: note.metadata.modified,
    tagList: note.metadata.tags.join(', ')
  },
  children: note.children?.map(convertNoteToGraphNode)
});