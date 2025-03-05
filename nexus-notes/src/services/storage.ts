import localforage from 'localforage';
import { Note } from '../types/notes';

// Initialize localforage
localforage.config({
  name: 'nexus-notes',
  storeName: 'notes'
});

export interface StorageService {
  saveNote: (note: Note) => Promise<void>;
  loadNote: (id: string) => Promise<Note | null>;
  listNotes: () => Promise<Note[]>;
  deleteNote: (id: string) => Promise<void>;
  exportNotes: () => Promise<string>;
  importNotes: (data: string) => Promise<void>;
}

class LocalStorageService implements StorageService {
  private async ensureNotesList(): Promise<string[]> {
    const notesList = await localforage.getItem<string[]>('notes-list');
    if (!notesList) {
      await localforage.setItem('notes-list', []);
      return [];
    }
    return notesList;
  }

  async saveNote(note: Note): Promise<void> {
    const notesList = await this.ensureNotesList();
    if (!notesList.includes(note.id)) {
      notesList.push(note.id);
      await localforage.setItem('notes-list', notesList);
    }
    await localforage.setItem(`note-${note.id}`, note);
  }

  async loadNote(id: string): Promise<Note | null> {
    return localforage.getItem<Note>(`note-${id}`);
  }

  async listNotes(): Promise<Note[]> {
    const notesList = await this.ensureNotesList();
    const notes: Note[] = [];
    
    for (const id of notesList) {
      const note = await this.loadNote(id);
      if (note) {
        notes.push(note);
      }
    }
    
    return notes;
  }

  async deleteNote(id: string): Promise<void> {
    const notesList = await this.ensureNotesList();
    const updatedList = notesList.filter(noteId => noteId !== id);
    await localforage.setItem('notes-list', updatedList);
    await localforage.removeItem(`note-${id}`);
  }

  async exportNotes(): Promise<string> {
    const notes = await this.listNotes();
    return JSON.stringify(notes, null, 2);
  }

  async importNotes(data: string): Promise<void> {
    try {
      const notes: Note[] = JSON.parse(data);
      for (const note of notes) {
        await this.saveNote(note);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Invalid notes data format';
      throw new Error(message);
    }
  }
}

export const storageService = new LocalStorageService();