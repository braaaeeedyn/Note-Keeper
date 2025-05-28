// Main application logic for NoteKeeper

// Note icons for selection
const NOTE_ICONS = [
  'icons/otter_1_24x24.webp',
  'icons/fox_24x24.webp',
  'icons/pengu_24x24.webp',
  'icons/dog_24x24.webp',
  'icons/cat_24x24.webp',
  'icons/bunbun_24x24.webp',
  'icons/capy_1_24x24.webp',
  'icons/octo_24x24.webp',
  'icons/hamper_24x24.webp',
  'icons/panda_24x24.webp'
];

// DOM Elements
const elements = {
  // Containers
  homeScreen: document.getElementById('home-screen'),
  editorContainer: document.getElementById('editor-container'),
  notesGrid: document.getElementById('notes-grid'),
  
  // Editor elements
  editor: document.getElementById('editor'),
  noteTitle: document.getElementById('note-title'),
  noteIcon: document.getElementById('note-icon'),
  
  // Toolbar buttons
  boldBtn: document.getElementById('bold-btn'),
  italicBtn: document.getElementById('italic-btn'),
  underlineBtn: document.getElementById('underline-btn'),
  fontSizeSelect: document.getElementById('font-size'),
  textColorInput: document.getElementById('text-color'),
  
  // Action buttons
  createNoteBtn: document.getElementById('create-note-btn'),
  deleteNoteBtn: document.getElementById('delete-note-btn'),
  exportNoteBtn: document.getElementById('export-note-btn'),
  themeToggleBtn: document.getElementById('theme-toggle'),
  changeIconBtn: document.getElementById('change-icon-btn'),
  backButton: document.getElementById('back-button'),
  settingsButton: document.getElementById('settings-button'),
  
  // Settings menu
  settingsMenu: document.getElementById('settings-menu'),
  
  // Search
  searchInput: document.getElementById('search-input'),
  
  // Modal
  iconModal: document.getElementById('icon-modal'),
  closeModalBtn: document.querySelector('.close-modal'),
  iconsGrid: document.getElementById('icons-grid'),
  
  // Export modal elements
  exportModal: document.getElementById('export-modal'),
  closeExportModalBtn: document.querySelector('.close-export-modal'),
  exportNotesList: document.getElementById('export-notes-list'),
  exportSelectedBtn: document.getElementById('export-selected-btn'),
  
  // Create note modal elements
  createNoteModal: document.getElementById('create-note-modal'),
  closeCreateModalBtn: document.querySelector('.close-create-modal'),
  newNoteTitleInput: document.getElementById('new-note-title'),
  createIconsGrid: document.getElementById('create-icons-grid'),
  createNoteConfirmBtn: document.getElementById('create-note-confirm')
};

// Create instances of our classes
const editor = new NoteEditor(elements.editor, {
  boldBtn: elements.boldBtn,
  italicBtn: elements.italicBtn,
  underlineBtn: elements.underlineBtn,
  fontSizeSelect: elements.fontSizeSelect,
  textColorInput: elements.textColorInput
});

const exporter = new NoteExporter();

// App state
let notesCache = [];
let activeNoteId = null;
let selectedCreateIconPath = null;

// Initialize the application
async function initializeApp() {
  // Load theme preference
  const isDarkTheme = await noteStorage.getTheme();
  setTheme(isDarkTheme);
  
  // Load notes
  await loadNotes();
  
  // Initialize icon selection grid
  initializeIconGrid();
  
  // Initialize export notes selection modal
  initializeExportModal();
  
  // Initialize create note modal
  initializeCreateNoteModal();
  
  // Set up event listeners
  setupEventListeners();
}

// Load all notes and render the grid
async function loadNotes() {
  notesCache = await noteStorage.getNotes();
  renderNotesGrid();
}

// Render the notes grid
function renderNotesGrid(searchTerm = '') {
  // Clear the current grid
  elements.notesGrid.innerHTML = '';
  
  // Filter notes if search term provided
  const filteredNotes = searchTerm 
    ? notesCache.filter(note => 
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.content.toLowerCase().includes(searchTerm.toLowerCase()))
    : notesCache;
  
  // Show empty state if no notes
  if (filteredNotes.length === 0) {
    const emptyState = document.createElement('div');
    emptyState.className = 'empty-state';
    emptyState.innerHTML = `
      <div class="empty-icon"><i class="fas fa-sticky-note"></i></div>
      <p>${searchTerm ? 'No notes match your search' : 'No notes yet'}</p>
      <p class="empty-hint">Click the + button to create a note</p>
    `;
    elements.notesGrid.appendChild(emptyState);
    return;
  }
  
  // Sort notes by last modified date (newest first)
  const sortedNotes = [...filteredNotes].sort((a, b) => 
    new Date(b.modifiedAt) - new Date(a.modifiedAt)
  );
  
  // Create cards for each note
  sortedNotes.forEach(note => {
    const card = createNoteCard(note);
    elements.notesGrid.appendChild(card);
  });
}

// Create a note card for the grid
function createNoteCard(note) {
  const card = document.createElement('div');
  card.className = 'note-card';
  card.dataset.noteId = note.id;
  
  // Convert HTML content to plain text for preview
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = note.content || '';
  const plainText = tempDiv.textContent || tempDiv.innerText || '';
  const truncatedText = plainText.length > 60 ? plainText.substring(0, 60) + '...' : plainText;
  
  // Format date
  const modifiedDate = new Date(note.modifiedAt);
  const formattedDate = modifiedDate.toLocaleDateString();
  
  card.innerHTML = `
    <div class="note-card-header">
      <img class="note-card-icon" src="${note.iconUrl || NOTE_ICONS[0]}" alt="Note icon">
      <div class="note-card-title">${note.title || 'Untitled Note'}</div>
    </div>
    <div class="note-card-preview">${truncatedText || 'Empty note'}</div>
    <div class="note-card-date">${formattedDate}</div>
  `;
  
  // Add click event to open the note
  card.addEventListener('click', () => {
    const noteToLoad = notesCache.find(n => n.id === note.id);
    if (noteToLoad) {
      setActiveNote(noteToLoad);
    }
  });
  
  return card;
}

// Set active note and open editor
function setActiveNote(note) {
  // Save previous note content if needed
  if (activeNoteId && activeNoteId !== note.id) {
    saveCurrentNote();
  }
  
  // Set the active note
  activeNoteId = note.id;
  noteStorage.setLastActiveNote(note.id);
  
  // Update UI elements
  elements.noteTitle.value = note.title || '';
  elements.noteIcon.src = note.iconUrl || NOTE_ICONS[0];
  editor.setContent(note.content || '');
  
  // Show editor, hide home screen
  elements.homeScreen.classList.add('hidden');
  elements.editorContainer.classList.remove('hidden');
  
  // Set focus to the editor
  elements.editor.focus();
}

// Save the current note
async function saveCurrentNote() {
  if (!activeNoteId) return;
  
  const noteToUpdate = notesCache.find(note => note.id === activeNoteId);
  if (!noteToUpdate) return;
  
  // Get updated content
  const title = elements.noteTitle.value;
  const content = editor.getContent();
  
  // Only save if something changed
  if (title === noteToUpdate.title && content === noteToUpdate.content) return;
  
  // Update note
  noteToUpdate.title = title;
  noteToUpdate.content = content;
  noteToUpdate.modifiedAt = new Date().toISOString();
  
  // Save to storage
  await noteStorage.updateNote(noteToUpdate);
  
  // Refresh the notes list
  await loadNotes();
}

// Return to home screen
function showHomeScreen() {
  // Save current note if needed
  if (activeNoteId) {
    saveCurrentNote();
  }
  
  // Reset active note
  activeNoteId = null;
  
  // Show home screen, hide editor
  elements.homeScreen.classList.remove('hidden');
  elements.editorContainer.classList.add('hidden');
  
  // Hide settings menu if visible
  elements.settingsMenu.classList.remove('visible');
  
  // Update notes grid
  renderNotesGrid();
}

// Initialize icon selection grid
function initializeIconGrid() {
  // Clear grid
  elements.iconsGrid.innerHTML = '';
  
  // Add icon options
  NOTE_ICONS.forEach(iconPath => {
    const iconOption = document.createElement('div');
    iconOption.className = 'icon-option';
    iconOption.innerHTML = `<img src="${iconPath}" alt="Note icon">`;
    
    // Add click event to select icon
    iconOption.addEventListener('click', () => {
      changeNoteIcon(iconPath);
      closeIconModal();
    });
    
    elements.iconsGrid.appendChild(iconOption);
  });
}

// Change the icon of the current note
async function changeNoteIcon(iconPath) {
  if (!activeNoteId) return;
  
  // Update DOM
  elements.noteIcon.src = iconPath;
  
  // Update note object
  const noteToUpdate = notesCache.find(note => note.id === activeNoteId);
  if (!noteToUpdate) return;
  
  noteToUpdate.iconUrl = iconPath;
  noteToUpdate.modifiedAt = new Date().toISOString();
  
  // Save to storage
  await noteStorage.updateNote(noteToUpdate);
  
  // Refresh the notes list
  await loadNotes();
}

// Open icon selection modal
function openIconModal() {
  elements.iconModal.style.display = 'flex';
}

// Close icon selection modal
function closeIconModal() {
  elements.iconModal.style.display = 'none';
}

// Toggle settings menu visibility
function toggleSettingsMenu() {
  elements.settingsMenu.classList.toggle('visible');
}

// Set theme (dark or light)
function setTheme(isDark) {
  if (isDark) {
    document.body.classList.add('dark-theme');
    elements.themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>';
    elements.themeToggleBtn.title = 'Switch to light mode';
  } else {
    document.body.classList.remove('dark-theme');
    elements.themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>';
    elements.themeToggleBtn.title = 'Switch to dark mode';
  }
}

// Toggle between dark and light themes
async function toggleTheme() {
  const currentTheme = document.body.classList.contains('dark-theme');
  const newTheme = !currentTheme;
  
  // Set theme
  setTheme(newTheme);
  
  // Save preference
  await noteStorage.setTheme(newTheme);
}

// Handle search input
function handleSearch() {
  const searchTerm = elements.searchInput.value.trim();
  renderNotesGrid(searchTerm);
}

// Initialize export modal
function initializeExportModal() {
  // Clear the list
  elements.exportNotesList.innerHTML = '';
  
  // Add placeholder
  elements.exportNotesList.innerHTML = '<div class="export-placeholder">Loading notes...</div>';
}

// Populate export modal with notes
function populateExportModal() {
  // Clear the list
  elements.exportNotesList.innerHTML = '';
  
  // Show empty state if no notes
  if (notesCache.length === 0) {
    elements.exportNotesList.innerHTML = '<div class="export-empty">No notes to export</div>';
    return;
  }
  
  // Create a checkbox for each note
  notesCache.forEach(note => {
    const noteItem = document.createElement('div');
    noteItem.className = 'export-note-item';
    
    noteItem.innerHTML = `
      <input type="checkbox" id="export-note-${note.id}" class="export-checkbox" value="${note.id}">
      <img src="${note.iconUrl || NOTE_ICONS[0]}" alt="Note icon">
      <label for="export-note-${note.id}">${note.title || 'Untitled Note'}</label>
    `;
    
    elements.exportNotesList.appendChild(noteItem);
  });
  
  // Add "Select All" checkbox
  const selectAllContainer = document.createElement('div');
  selectAllContainer.className = 'export-select-all';
  
  selectAllContainer.innerHTML = `
    <input type="checkbox" id="export-select-all" class="export-checkbox">
    <label for="export-select-all"><strong>Select All</strong></label>
  `;
  
  elements.exportNotesList.insertBefore(selectAllContainer, elements.exportNotesList.firstChild);
  
  // Add event listener to "Select All" checkbox
  const selectAllCheckbox = document.getElementById('export-select-all');
  selectAllCheckbox.addEventListener('change', () => {
    const checkboxes = elements.exportNotesList.querySelectorAll('.export-checkbox:not(#export-select-all)');
    checkboxes.forEach(checkbox => {
      checkbox.checked = selectAllCheckbox.checked;
    });
  });
}

// Export selected notes
function exportSelectedNotes() {
  // Get selected note IDs
  const selectedCheckboxes = elements.exportNotesList.querySelectorAll('.export-checkbox:checked:not(#export-select-all)');
  const selectedIds = Array.from(selectedCheckboxes).map(checkbox => checkbox.value);
  
  if (selectedIds.length === 0) {
    alert('Please select at least one note to export.');
    return;
  }
  
  // Filter notes by selected IDs
  const notesToExport = notesCache.filter(note => selectedIds.includes(note.id));
  
  // Export notes
  exporter.exportNotes(notesToExport);
  
  // Close modal
  closeExportModal();
}

// Open export modal
function openExportModal() {
  populateExportModal();
  elements.exportModal.style.display = 'flex';
}

// Close export modal
function closeExportModal() {
  elements.exportModal.style.display = 'none';
}

// Initialize create note modal
function initializeCreateNoteModal() {
  // Populate icons grid
  populateCreateIconsGrid();
  
  // Set up event listeners
  elements.newNoteTitleInput.addEventListener('input', validateCreateForm);
  elements.createNoteConfirmBtn.addEventListener('click', handleCreateNoteConfirm);
}

// Populate create note modal icons grid
function populateCreateIconsGrid() {
  // Clear grid
  elements.createIconsGrid.innerHTML = '';
  
  // Add icon options
  NOTE_ICONS.forEach(iconPath => {
    const iconOption = document.createElement('div');
    iconOption.className = 'create-icon-option';
    iconOption.dataset.iconPath = iconPath;
    iconOption.innerHTML = `<img src="${iconPath}" alt="Note icon">`;
    
    // Add click event to select icon
    iconOption.addEventListener('click', () => {
      // Remove selected class from all options
      elements.createIconsGrid.querySelectorAll('.create-icon-option').forEach(option => {
        option.classList.remove('selected');
      });
      
      // Add selected class to clicked option
      iconOption.classList.add('selected');
      
      // Store selected icon path
      selectedCreateIconPath = iconPath;
      
      // Validate form
      validateCreateForm();
    });
    
    elements.createIconsGrid.appendChild(iconOption);
  });
}

// Validate create note form
function validateCreateForm() {
  const titleValid = elements.newNoteTitleInput.value.trim() !== '';
  const iconValid = selectedCreateIconPath !== null;
  
  elements.createNoteConfirmBtn.disabled = !(titleValid && iconValid);
}

// Handle create note button click
async function handleCreateNoteConfirm() {
  const title = elements.newNoteTitleInput.value.trim();
  
  if (!title || !selectedCreateIconPath) {
    alert('Please provide a title and select an icon.');
    return;
  }
  
  // Create new note
  const newNote = {
    id: Date.now().toString(),
    title: title,
    content: '',
    iconUrl: selectedCreateIconPath,
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString()
  };
  
  // Save to storage
  await noteStorage.addNote(newNote);
  
  // Refresh notes list
  await loadNotes();
  
  // Close modal
  closeCreateNoteModal();
  
  // Reset form
  elements.newNoteTitleInput.value = '';
  selectedCreateIconPath = null;
  elements.createIconsGrid.querySelectorAll('.create-icon-option').forEach(option => {
    option.classList.remove('selected');
  });
  
  // Set as active note
  const createdNote = notesCache.find(note => note.id === newNote.id);
  if (createdNote) {
    setActiveNote(createdNote);
  }
}

// Open create note modal
function openCreateNoteModal() {
  // Reset form
  elements.newNoteTitleInput.value = '';
  selectedCreateIconPath = null;
  elements.createIconsGrid.querySelectorAll('.create-icon-option').forEach(option => {
    option.classList.remove('selected');
  });
  elements.createNoteConfirmBtn.disabled = true;
  
  // Select first icon by default
  const firstIcon = elements.createIconsGrid.querySelector('.create-icon-option');
  if (firstIcon) {
    firstIcon.click();
  }
  
  // Show modal
  elements.createNoteModal.style.display = 'flex';
  
  // Focus on title input
  setTimeout(() => {
    elements.newNoteTitleInput.focus();
  }, 100);
}

// Close create note modal
function closeCreateNoteModal() {
  elements.createNoteModal.style.display = 'none';
}

// Handle note title change
async function handleNoteTitleChange() {
  if (!activeNoteId) return;
  
  const noteToUpdate = notesCache.find(note => note.id === activeNoteId);
  if (!noteToUpdate) return;
  
  const newTitle = elements.noteTitle.value;
  
  // Only update if title changed
  if (newTitle === noteToUpdate.title) return;
  
  // Update note
  noteToUpdate.title = newTitle;
  noteToUpdate.modifiedAt = new Date().toISOString();
  
  // Save to storage
  await noteStorage.updateNote(noteToUpdate);
  
  // Refresh the notes list
  await loadNotes();
}

// Delete current note
async function deleteCurrentNote() {
  if (!activeNoteId) return;
  
  // Confirm deletion
  if (!confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
    return;
  }
  
  // Delete from storage
  await noteStorage.deleteNote(activeNoteId);
  
  // Reset active note
  activeNoteId = null;
  
  // Refresh notes list
  await loadNotes();
  
  // Return to home screen
  showHomeScreen();
  
  // Hide settings menu if visible
  elements.settingsMenu.classList.remove('visible');
}

// Set up event listeners
function setupEventListeners() {
  // Note creation
  elements.createNoteBtn.addEventListener('click', openCreateNoteModal);
  elements.closeCreateModalBtn.addEventListener('click', closeCreateNoteModal);
  
  // Theme toggle
  elements.themeToggleBtn.addEventListener('click', toggleTheme);
  
  // Back button
  elements.backButton.addEventListener('click', showHomeScreen);
  
  // Search
  elements.searchInput.addEventListener('input', handleSearch);
  
  // Note title
  elements.noteTitle.addEventListener('blur', handleNoteTitleChange);
  
  // Icon change
  elements.changeIconBtn.addEventListener('click', () => {
    openIconModal();
    elements.settingsMenu.classList.remove('visible');
  });
  elements.closeModalBtn.addEventListener('click', closeIconModal);
  
  // Export note
  elements.exportNoteBtn.addEventListener('click', () => {
    openExportModal();
    elements.settingsMenu.classList.remove('visible');
  });
  elements.closeExportModalBtn.addEventListener('click', closeExportModal);
  elements.exportSelectedBtn.addEventListener('click', exportSelectedNotes);
  
  // Delete note
  elements.deleteNoteBtn.addEventListener('click', () => {
    deleteCurrentNote();
    elements.settingsMenu.classList.remove('visible');
  });
  
  // Settings button
  elements.settingsButton.addEventListener('click', toggleSettingsMenu);
  
  // Auto-save on editor content change
  elements.editor.addEventListener('input', () => {
    // Save after a short delay
    clearTimeout(elements.editor.saveTimeout);
    elements.editor.saveTimeout = setTimeout(() => {
      saveCurrentNote();
    }, 500);
  });
  
  // Close settings menu when clicking elsewhere
  document.addEventListener('click', (event) => {
    if (elements.settingsMenu.classList.contains('visible') && 
        !elements.settingsMenu.contains(event.target) && 
        event.target !== elements.settingsButton) {
      elements.settingsMenu.classList.remove('visible');
    }
  });
  
  // Handle keyboard shortcuts
  document.addEventListener('keydown', (event) => {
    // Escape key
    if (event.key === 'Escape') {
      // Close modals
      if (elements.iconModal.style.display === 'flex') {
        closeIconModal();
      } else if (elements.exportModal.style.display === 'flex') {
        closeExportModal();
      } else if (elements.createNoteModal.style.display === 'flex') {
        closeCreateNoteModal();
      } else if (elements.settingsMenu.classList.contains('visible')) {
        elements.settingsMenu.classList.remove('visible');
      }
    }
    
    // Ctrl+S to save
    if (event.ctrlKey && event.key === 's') {
      event.preventDefault();
      saveCurrentNote();
    }
  });
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp); 