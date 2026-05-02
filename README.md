# Premium HTML Page Builder & Visual Editor

A high-density, professional-grade visual page builder written in vanilla JavaScript. Designed to transform any standard `<textarea>` or `<div>` into a sophisticated, Unity-inspired design environment for modern web applications.

## 🚀 Key Features

-   **Unity-Style Logic Engine**: Define complex cross-element interactions visually. Link events like "Click" or "Hover" to target-specific actions with zero code.
-   **Context-Aware Inspector**: The sidebar automatically adapts to your selection, offering specific controls for Images, Videos, Form Elements, and more.
-   **Visual Drop Indicator**: Experience precision reordering with a high-fidelity "Purple Line" insertion system that shows you exactly where your content will land.
-   **Persistent Workspace**: Built-in `localStorage` synchronization ensuring your design survives page refreshes and browser crashes.
-   **Inspector Pin (Lock)**: Pin the property panel to one element while you browse and drag other elements as logic targets.
-   **Responsive Master Toggles**: Instantly switch between Desktop, Tablet, and Mobile views with a single click.
-   **Raw Content Engine**: Real-time attribute and HTML editing for power users who need pixel-perfect control.
-   **History Management**: Robust Undo/Redo stack protecting every design decision.
-   **Zero Dependencies**: Pure Vanilla JS architecture. No frameworks, no bloat.

## 📦 Quick Start

Simply include the `html-editor.js` script. All styling and font dependencies are managed automatically by the editor.

```html
<script src="html-editor.js"></script>
<script>
    const editor = new HtmlEditor('#my-element');
    
    // Restore saved session or load demo
    editor.setValue(editor.getStored() || '<h1>My Design</h1>');
</script>
```

## 🧩 Visual Logic Building

The builder features a revolutionary **Target Slot** logic system. Orchestrating interactions is as simple as:

1.  **Choose a Trigger**: Select from common events like `Click`, `MouseEnter`, or `Change`.
2.  **Assign a Target**: Drag any element from the canvas directly into the Logic Slot.
3.  **Perform an Action**: The editor provides a curated list of actions specific to your target (e.g., "Change Video Source" or "Toggle Section Visibility").
4.  **Value Mapping**: Bind static values or map live data between components (e.g., "Set Heading Text from Input Value").

## 🛠 Advanced API

Take full control of the editor's lifecycle:

```javascript
const editor = new HtmlEditor('#editor');

// Persistence
const savedData = editor.getStored();      // Retrieve from localStorage
editor.triggerC();                         // Manually trigger a save

// Content Management
editor.setValue('...');                    // Update the canvas
const html = editor.getContent();          // Get clean, export-ready HTML

// Events
editor.onChange(html => {
    console.log('Canvas modified:', html);
});
```

## 🖼 External Image Library

Wire any image-list endpoint into the Inspector. Once a library is loaded, selecting an `<img>` element exposes a **Library** button next to **Upload** that opens a searchable thumbnail dropdown — clicking a thumbnail sets the image's `src`.

### Usage

```javascript
const editor = new HtmlEditor('#editor');

// Most basic — endpoint that returns a JSON list of images
await editor.getImagesLibrary('https://api.example.com/images');

// With auth token (sent as `Authorization: Bearer <token>`)
await editor.getImagesLibrary('https://api.example.com/images', {
    token: 'YOUR_API_TOKEN'
});

// Custom headers + query params
await editor.getImagesLibrary('https://api.example.com/v1/media', {
    headers: { 'X-Api-Key': 'abc123' },
    params:  { folder: 'hero', per_page: 100 }
});

// POST with body
await editor.getImagesLibrary('https://api.example.com/search', {
    method: 'POST',
    body:   { type: 'image', limit: 200 },
    token:  'YOUR_API_TOKEN'
});

// Adapt a non-standard response shape with `transform`
await editor.getImagesLibrary('https://my.cms/api/files', {
    transform: (raw) => raw.payload.media.map(m => ({
        url:   m.cdnUrl,
        thumb: m.cdnUrl + '?w=200',
        title: m.fileName,
        tags:  m.labels
    }))
});

// Or skip the network entirely and feed images directly
editor.setImagesLibrary([
    { url: 'https://cdn.example.com/a.jpg', title: 'Hero A', tags: ['hero'] },
    { url: 'https://cdn.example.com/b.png', title: 'Logo',  tags: ['brand'] }
]);
```

### Accepted API response shapes

The client is flexible — any of the following will work without a `transform`:

```jsonc
// 1) Plain array of URLs
["https://cdn.example.com/a.jpg", "https://cdn.example.com/b.jpg"]

// 2) Array of objects (recommended — enables search by title/tags)
[
    {
        "url":   "https://cdn.example.com/a.jpg",
        "thumb": "https://cdn.example.com/a-200.jpg",
        "title": "Mountain Hero",
        "alt":   "Snowy peaks at sunset",
        "tags":  ["hero", "nature", "outdoor"]
    }
]

// 3) Wrapped in any of: images / items / data / results
{ "images": [ /* ... */ ] }
```

**Per-item field aliases** (so most CMS / DAM responses work out of the box):

| Canonical | Also accepted                                |
| --------- | -------------------------------------------- |
| `url`     | `src`, `image`, `full`, `original`           |
| `thumb`   | `thumbnail`, `preview` (falls back to `url`) |
| `title`   | `name`, `caption`                            |
| `alt`     | `title`, `name`                              |
| `tags`    | array of strings, **or** comma/space-separated string |

### Method signature

```typescript
editor.getImagesLibrary(url: string, options?: {
    headers?:   Record<string, string>;     // extra HTTP headers
    params?:    Record<string, any>;        // merged into query string
    method?:    'GET' | 'POST';             // default 'GET'
    body?:      object | string;            // POST body (objects are JSON-encoded)
    token?:     string;                     // shorthand → Authorization: Bearer <token>
    transform?: (raw: any) => any;          // map a custom response shape
}): Promise<Array<{ url, thumb, title, alt, tags }>>

editor.setImagesLibrary(items: Array): Array  // direct (no fetch)
```

The Inspector's image picker reacts live: refresh the library at any point and the dropdown will pick up the new list the next time it's opened.

## 🎨 Component Library

Includes 20+ premium components out of the box:
-   **Hero Sections**: Dark mode headers, CTA banners, and center-aligned features.
-   **Grid Systems**: Auto-responsive 2, 3, and 4-column layouts.
-   **Media Hub**: Interactive Video players, Audio clips, and Image galleries.
-   **Logic Components**: Form inputs, Buttons, and dynamic UI elements.

## 📄 License
MIT License. Optimized for high-performance professional web projects.
