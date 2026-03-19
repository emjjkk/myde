<img width="1366" height="768" alt="image" src="https://github.com/user-attachments/assets/8a7be4cc-c36c-4e6b-9001-8211f9d67d07" />

# MyDE - Offline-First Web IDE with LLM Support.

It lets you:
- Manage local projects.
- Edit HTML, CSS, and JavaScript in a Monaco-powered editor.
- Preview changes live.
- Use an AI panel to propose and apply code updates.

Project data and settings are stored locally in the browser.

## How It Was Built

MyDE is built with:
- React for UI and state handling.
- Vite for development and production builds.
- Monaco Editor for code editing.
- LocalStorage for projects, files, and app settings.

The app is structured around a project manager view and an editor view (code, preview, split), with reusable components for toolbar actions, AI interactions, settings, and export helpers.

## Development

Prerequisites:
- Node.js 18+ (recommended)
- npm

