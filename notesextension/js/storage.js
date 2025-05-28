// Storage functionality for notes

// Create a singleton for note storage
const noteStorage = (() => {
  // Storage keys
  const NOTES_KEY = 'notekeeper_notes';
  const THEME_KEY = 'notekeeper_theme';
  const LAST_ACTIVE_KEY = 'notekeeper_last_active';
  
  // Get all notes from storage
  async function getNotes() {
    return new Promise(resolve => {
      chrome.storage.local.get([NOTES_KEY], result => {
        const notes = result[NOTES_KEY] || [];
        resolve(notes);
      });
    });
  }
  
  // Add a new note
  async function addNote(note) {
    return new Promise(resolve => {
      chrome.storage.local.get([NOTES_KEY], result => {
        const notes = result[NOTES_KEY] || [];
        
        // Ensure the note has an ID
        if (!note.id) {
          note.id = Date.now().toString();
        }
        
        // Add timestamps if not present
        if (!note.createdAt) {
          note.createdAt = new Date().toISOString();
        }
        if (!note.modifiedAt) {
          note.modifiedAt = new Date().toISOString();
        }
        
        // Add the new note
        notes.push(note);
        
        // Save to storage
        chrome.storage.local.set({ [NOTES_KEY]: notes }, () => {
          resolve(note);
        });
      });
    });
  }
  
  // Update an existing note
  async function updateNote(updatedNote) {
    return new Promise(resolve => {
      chrome.storage.local.get([NOTES_KEY], result => {
        const notes = result[NOTES_KEY] || [];
        
        // Find and update the note
        const index = notes.findIndex(note => note.id === updatedNote.id);
        
        if (index !== -1) {
          // Update modifiedAt timestamp
          updatedNote.modifiedAt = new Date().toISOString();
          
          // Update the note
          notes[index] = updatedNote;
          
          // Save to storage
          chrome.storage.local.set({ [NOTES_KEY]: notes }, () => {
            resolve(true);
          });
        } else {
          resolve(false);
        }
      });
    });
  }
  
  // Delete a note
  async function deleteNote(noteId) {
    return new Promise(resolve => {
      chrome.storage.local.get([NOTES_KEY], result => {
        const notes = result[NOTES_KEY] || [];
        
        // Filter out the note to delete
        const filteredNotes = notes.filter(note => note.id !== noteId);
        
        // Save to storage
        chrome.storage.local.set({ [NOTES_KEY]: filteredNotes }, () => {
          resolve(true);
        });
      });
    });
  }
  
  // Get/set theme preference
  async function getTheme() {
    return new Promise(resolve => {
      chrome.storage.local.get([THEME_KEY], result => {
        const isDarkTheme = result[THEME_KEY] || false;
        resolve(isDarkTheme);
      });
    });
  }
  
  async function setTheme(isDarkTheme) {
    return new Promise(resolve => {
      chrome.storage.local.set({ [THEME_KEY]: isDarkTheme }, () => {
        resolve(true);
      });
    });
  }
  
  // Get/set last active note
  async function getLastActiveNote() {
    return new Promise(resolve => {
      chrome.storage.local.get([LAST_ACTIVE_KEY], result => {
        const lastActiveNoteId = result[LAST_ACTIVE_KEY] || null;
        resolve(lastActiveNoteId);
      });
    });
  }
  
  async function setLastActiveNote(noteId) {
    return new Promise(resolve => {
      chrome.storage.local.set({ [LAST_ACTIVE_KEY]: noteId }, () => {
        resolve(true);
      });
    });
  }
  
  // Public API
  return {
    getNotes,
    addNote,
    updateNote,
    deleteNote,
    getTheme,
    setTheme,
    getLastActiveNote,
    setLastActiveNote
  };
})(); 