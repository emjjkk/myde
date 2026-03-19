# MyDE

MyDE is a lightweight, browser-based web IDE for building simple sites fast.

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

Install dependencies:
npm install

Run locally:
npm run dev

Build for production:
npm run build

Run lint checks:
npm run lint

Preview the production build:
npm run preview

## Contributing

Contributions are welcome.

1. Fork the repository.
2. Create a branch for your change.
3. Keep changes focused and small.
4. Run lint and build locally before opening a PR.
5. Open a pull request with:
	- A short summary of what changed.
	- Why the change is needed.
	- Screenshots or short recordings for UI updates.

Good first contributions:
- UI polish and responsive improvements.
- Better onboarding defaults/templates.
- Bug fixes in editor, preview, and project flows.
