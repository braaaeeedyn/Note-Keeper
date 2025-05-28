// Rich text editor functionality
class NoteEditor {
  constructor(editorElement, toolbarElements) {
    this.editor = editorElement;
    this.toolbar = toolbarElements;
    
    this.setupToolbar();
  }
  
  // Set up the toolbar buttons
  setupToolbar() {
    // Bold button
    this.toolbar.boldBtn.addEventListener('click', () => {
      this.execCommand('bold');
    });
    
    // Italic button
    this.toolbar.italicBtn.addEventListener('click', () => {
      this.execCommand('italic');
    });
    
    // Underline button
    this.toolbar.underlineBtn.addEventListener('click', () => {
      this.execCommand('underline');
    });
    
    // Font size
    this.toolbar.fontSizeSelect.addEventListener('change', () => {
      this.execCommand('fontSize', this.toolbar.fontSizeSelect.value);
    });
    
    // Text color
    this.toolbar.textColorInput.addEventListener('input', () => {
      this.execCommand('foreColor', this.toolbar.textColorInput.value);
    });
  }
  
  // Execute a document edit command
  execCommand(command, value = null) {
    document.execCommand(command, false, value);
    this.editor.focus();
  }
  
  // Set content of the editor
  setContent(content) {
    this.editor.innerHTML = content || '';
  }
  
  // Get content from the editor
  getContent() {
    return this.editor.innerHTML;
  }
  
  // Clear the editor content
  clear() {
    this.editor.innerHTML = '';
  }
}

// Note export functionality
class NoteExporter {
  constructor() {}
  
  // Export a single note as a text file
  exportNote(note) {
    if (!note) return;
    
    // Convert HTML to plain text
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = note.content || '';
    const plainText = tempDiv.textContent || tempDiv.innerText || '';
    
    // Create the content to export
    const content = [
      `Title: ${note.title || 'Untitled Note'}`,
      `Date: ${new Date(note.modifiedAt).toLocaleString()}`,
      '------------------------------',
      plainText
    ].join('\n\n');
    
    // Create the download
    this.downloadText(content, `${note.title || 'note'}.txt`);
  }
  
  // Export multiple notes
  exportNotes(notes) {
    if (!notes || notes.length === 0) return;
    
    if (notes.length === 1) {
      // If only one note, use the single note export
      this.exportNote(notes[0]);
      return;
    }
    
    // For multiple notes, create a combined file
    const contentParts = notes.map(note => {
      // Convert HTML to plain text
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = note.content || '';
      const plainText = tempDiv.textContent || tempDiv.innerText || '';
      
      return [
        `### ${note.title || 'Untitled Note'} ###`,
        `Date: ${new Date(note.modifiedAt).toLocaleString()}`,
        '------------------------------',
        plainText,
        '\n\n====================\n\n'
      ].join('\n\n');
    });
    
    const content = contentParts.join('');
    this.downloadText(content, 'notes_export.txt');
  }
  
  // Download text content as a file
  downloadText(content, filename) {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }
} 