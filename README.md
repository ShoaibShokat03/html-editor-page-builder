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

## 🎨 Component Library

Includes 20+ premium components out of the box:
-   **Hero Sections**: Dark mode headers, CTA banners, and center-aligned features.
-   **Grid Systems**: Auto-responsive 2, 3, and 4-column layouts.
-   **Media Hub**: Interactive Video players, Audio clips, and Image galleries.
-   **Logic Components**: Form inputs, Buttons, and dynamic UI elements.

## 📄 License
MIT License. Optimized for high-performance professional web projects.
