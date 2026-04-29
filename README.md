# Premium HTML Page Builder & Visual Editor

A powerful, lightweight, and fully customizable visual page builder written in vanilla JavaScript. Designed to turn any standard `<textarea>` or `<div>` into a high-end drag-and-drop editor for modern web projects.

## 🚀 Features

-   **Visual Drag & Drop**: Over 20+ pre-styled components (Sections, Grids, Cards, CTAs, FAQs, Forms).
-   **Rich Text Editing**: Direct inline editing for all text elements with toolbar support (Bold, Italic, Underline).
-   **Advanced Inspector**: Deep-level customization of any element's styles, attributes (src, href, id, classes), and raw HTML.
-   **Auto-Height Support**: The editor grows naturally with your content, featuring a sticky toolbar for easy access.
-   **Textarea Synchronization**: Seamlessly replaces `<textarea>` elements in forms and keeps the `value` updated in real-time.
-   **Responsive Design**: Built-in device toggles (Desktop, Tablet, Mobile) to ensure your design looks perfect everywhere.
-   **History Management**: Full Undo/Redo support for a worry-free design process.
-   **Zero Dependencies**: Built with pure Vanilla JS and FontAwesome.

## 📦 Installation

Simply include the `html-editor.js` in your project. The editor will automatically handle FontAwesome and Google Font dependencies for you:

```html
<script src="html-editor.js"></script>
```

## 🛠 Usage

### Replace a Textarea (Form Integration)
Turn any form field into a visual builder. The content is automatically synced for form submission.

```html
<textarea id="my-editor" name="content"></textarea>

<script>
    const builder = new HtmlEditor('#my-editor');
    
    // Set initial content
    builder.setValue('<h1>Hello World</h1>');
    
    // Get Data
    const html = builder.getContent();       // Full clean HTML
    const text = builder.getText();          // Just plain text
    const count = builder.getElementCount(); // Number of top-level elements
    const len = builder.getContentLength();  // Total HTML character count
    
    // Listen for changes
    builder.onChange(html => {
        console.log('Updated HTML:', html);
    });
</script>
```

### Direct Division Usage
Use it as a standalone page builder container.

```html
<div id="builder-container"></div>

<script>
    const builder = new HtmlEditor('#builder-container');
</script>
```

## 🎨 Component Library
The builder comes packed with essential components:
-   **Layouts**: Responsive Grids (2, 3, 4 columns), Sections, Spacers, Dividers.
-   **Content**: Headings, Paragraphs, Buttons, Links.
-   **Media**: Images, Video players, Audio clips, Icons.
-   **Marketing**: Feature Cards, Testimonials, CTA Banners, FAQ Items.
-   **Forms**: Styled Inputs, Textareas, Labels.

## 🔍 The Inspector
Right-click any element on the canvas to open the **Design Inspector**. From here, you can:
1.  **Modify Styles**: Adjust layout, typography, colors, and flexbox settings.
2.  **Edit Attributes**: Change image sources, link URLs, and CSS classes.
3.  **Tweak Code**: Edit the raw HTML or inner text directly for pixel-perfect control.

## 📄 License
MIT License. Free to use in any personal or commercial project.
