# Note Keeper Chrome Extension

A compact Chrome extension for creating and managing notes with rich text editing and custom icons.

## Features

- **Compact design**: Fits more functionality into a smaller space
- **Custom animal icons**: Choose from a variety of cute animal icons for your notes
- **Rich text editing**: Format your notes with bold, italic, underline, font sizes, and colors
- **Dark mode**: Toggle between light and dark themes
- **Search**: Quickly find notes with the built-in search functionality
- **Export**: Export individual notes or multiple notes as text files
- **Auto-save**: Changes are automatically saved as you type
- **Responsive layout**: Optimized for efficient space usage

## Installation

### From Chrome Web Store (Coming Soon)
1. Visit the Chrome Web Store page for Note Keeper
2. Click "Add to Chrome"
3. Confirm the installation

### Manual Installation
1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top-right corner
4. Click "Load unpacked" and select the extension folder
5. The extension is now installed and ready to use

## Usage

### Creating Notes
1. Click the extension icon in your browser toolbar
2. Click the "New" button
3. Enter a title for your note and select an icon
4. Click "Create Note" to start editing

### Editing Notes
- Use the toolbar buttons to format your text (bold, italic, underline)
- Change font size and color with the dropdown and color picker
- All changes are auto-saved

### Managing Notes
- Click the back button to return to the home screen
- Use the search box to find specific notes
- Click the settings icon to access options for each note
- Delete or export notes as needed

### Exporting Notes
- Export a single note by opening the settings menu and selecting "Export Note"
- Export multiple notes by selecting them in the export dialog

## Customization

The extension supports dark mode, which can be toggled by clicking the moon/sun icon in the header.

## File Structure

```
noteextension/
├── css/
│   └── style.css
├── icons/
│   ├── otter_1_24x24.webp
│   ├── fox_24x24.webp
│   └── ... (more icon files)
├── js/
│   ├── popup.js
│   ├── editor.js
│   └── storage.js
├── manifest.json
├── popup.html
└── README.md
```

## Permissions

The extension requires the following permissions:
- `storage`: To save your notes locally in your browser

## License

This project is licensed under the MIT License. 