class HtmlEditor {
    constructor(selector) {
        const target = document.querySelector(selector);
        if (!target) throw new Error(`Element ${selector} not found`);

        if (target.tagName === 'TEXTAREA') {
            this.targetTextarea = target;
            this.targetTextarea.style.display = 'none';
            this.container = document.createElement('div');
            this.targetTextarea.parentNode.insertBefore(this.container, this.targetTextarea.nextSibling);
        } else {
            this.container = target;
        }

        const isInline = target.tagName === 'TEXTAREA' || this.container.parentNode !== document.body;
        this.container.style.cssText = `width: 100%; max-width: 100%; min-height: 700px; position: relative; overflow: visible; border: 1px solid #e2e8f0; border-radius: 16px; z-index: ${isInline ? '10' : '9999'}; box-sizing: border-box; background: #f8fafc;`;

        this.onUpdate = null;
        this.changeCallbacks = [];
        this.selectedElement = null;
        this.history = [];
        this.historyIndex = -1;
        this.isSidebarOpen = false;

        this.elements = [
            // Layout & Structure
            { id: 'section', label: 'Main Section', icon: 'fa-square', cat: 'Layout', desc: 'Full width box', html: '<section style="padding: 80px 40px; background: white; border: 1px solid #e2e8f0; min-height: 100px;"></section>' },
            { id: 'grid2', label: '2 Columns', icon: 'fa-columns', cat: 'Layout', desc: '50/50 split', html: '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; margin: 30px 0;"><div style="padding: 20px; border: 1px dashed #cbd5e1; border-radius: 8px;">Column A</div><div style="padding: 20px; border: 1px dashed #cbd5e1; border-radius: 8px;">Column B</div></div>' },
            { id: 'grid3', label: '3 Columns', icon: 'fa-th-large', cat: 'Layout', desc: 'Triple split', html: '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 30px 0;"><div style="padding: 15px; border: 1px dashed #cbd5e1; border-radius: 8px;">Col 1</div><div style="padding: 15px; border: 1px dashed #cbd5e1; border-radius: 8px;">Col 2</div><div style="padding: 15px; border: 1px dashed #cbd5e1; border-radius: 8px;">Col 3</div></div>' },
            { id: 'divider', label: 'Divider', icon: 'fa-minus', cat: 'Layout', desc: 'Line break', html: '<hr style="border: 0; height: 1px; background: #e2e8f0; margin: 40px 0;">' },
            { id: 'spacer', label: 'Spacer', icon: 'fa-arrows-alt-v', cat: 'Layout', desc: 'Empty space', html: '<div style="height: 50px; width: 100%;"></div>' },
            
            // Content Elements
            { id: 'heading', label: 'Giant Title', icon: 'fa-heading', cat: 'Content', desc: 'H1 Header', html: '<h1 style="margin-bottom: 20px; font-size: 3.5rem; font-weight: 800; color: #1e293b; line-height: 1.1;">Premium Title</h1>' },
            { id: 'text', label: 'Paragraph', icon: 'fa-align-left', cat: 'Content', desc: 'Body text', html: '<p style="margin-bottom: 20px; line-height: 1.8; color: #475569; font-size: 1.1rem;">Build your story here with rich text and custom styles.</p>' },
            { id: 'button', label: 'Action Button', icon: 'fa-mouse-pointer', cat: 'Content', desc: 'Clickable CTA', html: '<button style="background: #6366f1; color: white; padding: 16px 36px; border: none; border-radius: 12px; font-weight: 700; cursor: pointer; transition: 0.2s;">Get Started Free</button>' },
            { id: 'list', label: 'Feature List', icon: 'fa-list-ul', cat: 'Content', desc: 'Bullet points', html: '<ul style="margin-bottom: 25px; padding-left: 20px; color: #475569;"><li style="margin-bottom: 10px;">High Performance Core</li><li style="margin-bottom: 10px;">Fully Responsive</li><li style="margin-bottom: 10px;">SEO Optimized</li></ul>' },
            
            // Media Elements
            { id: 'image', label: 'Styled Image', icon: 'fa-image', cat: 'Media', desc: 'Full image', html: '<div class="he-media-wrap" style="margin-bottom: 30px;"><img src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1000" style="width: 100%; border-radius: 20px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);"></div>' },
            { id: 'video', label: 'Video Player', icon: 'fa-video', cat: 'Media', desc: 'Embed player', html: '<div class="he-media-wrap" style="margin-bottom: 30px;"><video controls style="width: 100%; border-radius: 20px;"><source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4"></video></div>' },
            { id: 'audio', label: 'Audio Clip', icon: 'fa-music', cat: 'Media', desc: 'Sound file', html: '<div class="he-media-wrap" style="margin-bottom: 25px; background: white; padding: 20px; border-radius: 15px; border: 1px solid #e2e8f0;"><audio controls style="width: 100%;"><source src="https://www.w3schools.com/html/horse.mp3" type="audio/mpeg"></audio></div>' },
            
            // Components
            { id: 'hero', label: 'Hero Banner', icon: 'fa-star', cat: 'Components', desc: 'Page top', html: '<div style="padding: 100px 50px; background: linear-gradient(135deg, #6366f1, #a855f7); color: white; border-radius: 30px; text-align: center; margin-bottom: 40px;"><h1>Future of Web Design</h1><p style="opacity: 0.9; margin: 20px 0 30px;">Build amazing pages in minutes with our visual tools.</p><button style="background: white; color: #6366f1; padding: 14px 40px; border: none; border-radius: 10px; font-weight: 700;">Join Us Now</button></div>' },
            { id: 'card', label: 'Feature Card', icon: 'fa-id-card', cat: 'Components', desc: 'Shadow box', html: '<div style="padding: 40px; background: white; border-radius: 24px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); margin-bottom: 30px;"><div style="width: 50px; height: 50px; background: #eef2ff; color: #6366f1; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px;"><i class="fa fa-rocket"></i></div><h3>Fast Launch</h3><p style="color: #64748b;">Deploy your project instantly to the cloud with one click.</p></div>' },
            { id: 'testimonial', label: 'Testimonial', icon: 'fa-quote-left', cat: 'Components', desc: 'User review', html: '<div style="padding: 30px; background: #f8fafc; border-radius: 20px; border: 1px solid #e2e8f0; font-style: italic; color: #1e293b; margin-bottom: 25px;">"This is the best builder I have ever used. Highly recommended!"<div style="margin-top: 15px; font-style: normal; font-weight: 700; color: #6366f1;">— John Doe, Designer</div></div>' },
            { id: 'faq', label: 'FAQ Item', icon: 'fa-question-circle', cat: 'Components', desc: 'Q&A Block', html: '<div style="margin-bottom: 15px; border-bottom: 1px solid #e2e8f0; padding-bottom: 15px;"><h4 style="margin-bottom: 8px; color: #1e293b;">How does it work?</h4><p style="color: #64748b; font-size: 0.95rem;">It is a fully visual, drag-and-drop system designed for speed.</p></div>' },
            
            // Marketing
            { id: 'pricing', label: 'Pricing Table', icon: 'fa-tags', cat: 'Marketing', desc: 'Plan grid', html: '<div style="padding: 40px; background: white; border: 2px solid #6366f1; border-radius: 24px; text-align: center; margin-bottom: 30px;"><div style="font-size: 14px; font-weight: 800; color: #6366f1; text-transform: uppercase;">Pro Plan</div><div style="font-size: 48px; font-weight: 800; margin: 15px 0;">$29<span style="font-size: 16px; color: #94a3b8;">/mo</span></div><ul style="list-style:none; padding:0; margin: 20px 0; color: #64748b;"><li>Unlimited Pages</li><li>Custom Domain</li><li>24/7 Support</li></ul><button style="width:100%; background: #6366f1; color: white; padding: 12px; border: none; border-radius: 8px; font-weight: 700;">Select Plan</button></div>' },
            { id: 'cta_banner', label: 'CTA Ribbon', icon: 'fa-bullhorn', cat: 'Marketing', desc: 'Small call', html: '<div style="background: #1e293b; color: white; padding: 20px 40px; border-radius: 12px; display: flex; align-items: center; justify-content: space-between; gap: 20px; margin-bottom: 30px;"><div><h4 style="margin:0">Flash Sale! 50% Off</h4><p style="margin:0; opacity: 0.7; font-size: 13px;">Limited time offer on all premium plans.</p></div><button style="background: #6366f1; color: white; padding: 10px 20px; border: none; border-radius: 6px; font-weight: 700;">Claim Now</button></div>' }
        ];

        this.styleOptions = {
            'Layout': [{ label: 'Display', prop: 'display' }, { label: 'Padding', prop: 'padding' }, { label: 'Margin', prop: 'margin' }, { label: 'Width', prop: 'width' }, { label: 'Height', prop: 'height' }, { label: 'Z-Index', prop: 'zIndex' }],
            'Typography': [{ label: 'Font Size', prop: 'fontSize' }, { label: 'Weight', prop: 'fontWeight' }, { label: 'Color', prop: 'color', type: 'color' }, { label: 'Align', prop: 'textAlign', type: 'select', options: ['left', 'center', 'right', 'justify'] }, { label: 'Line Height', prop: 'lineHeight' }],
            'Decor': [{ label: 'BG Color', prop: 'backgroundColor', type: 'color' }, { label: 'Border', prop: 'border' }, { label: 'Radius', prop: 'borderRadius' }, { label: 'Shadow', prop: 'boxShadow' }, { label: 'Opacity', prop: 'opacity' }]
        };

        this.init();
    }

    init() { this.setupStyles(); this.renderUI(); this.setupEventListeners(); this.saveToHistory(); }

    setupStyles() {
        const deps = [{ id: 'he-fa', url: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css' }, { id: 'he-font', url: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap' }];
        deps.forEach(d => { if (!document.querySelector(`link[href*="${d.url}"]`)) { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = d.url; document.head.appendChild(l); } });

        const s = document.createElement('style');
        s.textContent = `
            :root { --he-p: #6366f1; --he-bg: #f8fafc; --he-t: #1e293b; --he-b: #e2e8f0; }
            .he-main { display: flex; flex-direction: column; width: 100%; font-family: 'Inter', sans-serif; background: var(--he-bg); position: relative; height: 100%; overflow: hidden; }
            .he-toolbar { min-height: 60px; background: white; border-bottom: 1px solid var(--he-b); padding: 8px 16px; display: flex; align-items: center; gap: 8px; z-index: 1000; position: sticky; top: 0; flex-shrink: 0; flex-wrap: wrap; box-sizing: border-box; }
            .he-group { display: flex; gap: 4px; padding-right: 8px; border-right: 1px solid var(--he-b); align-items: center; }
            .he-group:last-child { border-right: none; }
            .he-btn { background: transparent; border: 1px solid transparent; padding: 8px 10px; border-radius: 6px; cursor: pointer; color: var(--he-t); font-size: 14px; transition: 0.2s; display: flex; align-items: center; gap: 6px; }
            .he-btn:hover { background: #f1f5f9; color: var(--he-p); }
            
            .he-dropdown { position: relative; }
            .he-dropdown-content { 
                opacity: 0; visibility: hidden; position: absolute; top: 100%; left: 0; background: white; width: 480px; max-height: 550px; overflow-y: auto;
                box-shadow: 0 25px 60px rgba(0,0,0,0.2); border-radius: 16px; border: 1px solid var(--he-b); padding: 20px; z-index: 10000; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; transition: 0.25s; transform: translateY(10px);
            }
            .he-dropdown:hover .he-dropdown-content { opacity: 1; visibility: visible; transform: translateY(8px); }
            .he-item { display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 12px; cursor: pointer; transition: 0.2s; border: 1px solid transparent; }
            .he-item:hover { background: #f8fafc; border-color: var(--he-b); transform: translateY(-2px); }
            .he-item i { width: 32px; height: 32px; background: #eef2ff; color: var(--he-p); border-radius: 8px; display: flex; align-items: center; justify-content: center; }
            .he-cat-tag { grid-column: 1 / -1; font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin: 10px 0 5px; }

            .he-workspace { display: flex; flex-direction: column; align-items: center; background: #f1f5f9; min-height: 600px; overflow: auto; padding: 60px 5px 5px 5px; position: relative; z-index: 1; }
            .he-canvas { width: 100%; min-height: 600px; background: white; border-radius: 0; padding: 5px; position: relative; outline: none; box-sizing: border-box; }
            
            .he-hover-box { position: absolute; pointer-events: none; border: 1px dashed var(--he-p); z-index: 99999; display: none; }
            .he-floating-overlay { position: absolute; display: none; pointer-events: none; z-index: 100000; outline: 2px solid var(--he-p); outline-offset: 2px; }
            .he-floating-controls { position: absolute; top: -42px; right: -2px; background: var(--he-p); display: flex; gap: 4px; padding: 6px; border-radius: 6px 6px 0 0; pointer-events: auto; }
            .he-ctrl-btn { color: white; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; cursor: pointer; border-radius: 4px; font-size: 12px; }
            .he-ctrl-btn:hover { background: rgba(255,255,255,0.2); }

            .he-sidebar { width: 400px; background: white; border-left: 1px solid var(--he-b); position: fixed; right: 0; top: 0; bottom: 0; transform: translateX(100%); transition: 0.3s; z-index: 1000000; display: flex; flex-direction: column; box-shadow: -20px 0 50px rgba(0,0,0,0.05); }
            .he-sidebar.open { transform: translateX(0); }
            .he-sidebar-head { padding: 20px; border-bottom: 1px solid var(--he-b); display: flex; justify-content: space-between; align-items: center; background: #f8fafc; }
            .he-sidebar-body { flex: 1; overflow-y: auto; padding: 25px; }
            
            .he-field { margin-bottom: 18px; }
            .he-label { display: block; font-size: 12px; font-weight: 700; margin-bottom: 8px; color: #64748b; }
            .he-input { width: 100%; padding: 12px; border: 1px solid var(--he-b); border-radius: 10px; font-size: 13px; outline: none; transition: 0.2s; }
            .he-input:focus { border-color: var(--he-p); box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1); }
            .he-placeholder { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; color: #cbd5e1; pointer-events: none; }
            .he-media-wrap { position: relative; }
            .he-media-wrap::after { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 10; cursor: pointer; }
            .he-selected::after { display: none; }
            
            /* Fullscreen Mode */
            .he-fullscreen { position: fixed !important; top: 0 !important; left: 0 !important; width: 100vw !important; height: 100vh !important; z-index: 2147483647 !important; margin: 0 !important; border-radius: 0 !important; display: flex; flex-direction: column; overflow: hidden; background: #f1f5f9; }
            .he-fullscreen .he-workspace { flex: 1; min-height: 0; overflow-y: auto !important; display: block; padding: 40px 0; }
            .he-fullscreen .he-canvas { margin: 0 auto; min-height: 100%; }
        `;
        document.head.appendChild(s);
    }

    renderUI() {
        const cats = [...new Set(this.elements.map(e => e.cat))];
        this.container.innerHTML = `
            <div class="he-main">
                <header class="he-toolbar">
                    <div class="he-group">
                        <button type="button" class="he-btn" id="he-fs" title="Full Screen"><i class="fa fa-expand"></i></button>
                        <button type="button" class="he-btn" id="he-u" title="Undo"><i class="fa fa-undo"></i></button>
                        <button type="button" class="he-btn" id="he-r" title="Redo"><i class="fa fa-redo"></i></button>
                    </div>
                    <div class="he-group">
                        <button type="button" class="he-btn" data-cmd="bold" title="Bold"><i class="fa fa-bold"></i></button>
                        <button type="button" class="he-btn" data-cmd="italic" title="Italic"><i class="fa fa-italic"></i></button>
                        <button type="button" class="he-btn" data-cmd="underline" title="Underline"><i class="fa fa-underline"></i></button>
                    </div>
                    <div class="he-group">
                        <button type="button" class="he-btn" data-cmd="justifyLeft" title="Align Left"><i class="fa fa-align-left"></i></button>
                        <button type="button" class="he-btn" data-cmd="justifyCenter" title="Align Center"><i class="fa fa-align-center"></i></button>
                        <button type="button" class="he-btn" data-cmd="justifyRight" title="Align Right"><i class="fa fa-align-right"></i></button>
                    </div>
                    <div class="he-group">
                        <button type="button" class="he-btn" data-cmd="insertUnorderedList" title="Bullets"><i class="fa fa-list-ul"></i></button>
                        <button type="button" class="he-btn" data-cmd="insertOrderedList" title="Numbers"><i class="fa fa-list-ol"></i></button>
                    </div>
                    <div class="he-group">
                        <div class="he-dropdown">
                            <button type="button" class="he-btn" style="background: var(--he-p); color: white; font-weight: 700; border-radius: 10px; padding: 8px 16px;"><i class="fa fa-plus-circle"></i> Components Library</button>
                            <div class="he-dropdown-content">
                                ${cats.map(cat => `
                                    <div class="he-cat-tag">${cat}</div>
                                    ${this.elements.filter(e => e.cat === cat).map(el => `
                                        <div class="he-item" data-el="${el.id}">
                                            <i class="fa ${el.icon}"></i>
                                            <div>
                                                <div style="font-weight:700;font-size:13px">${el.label}</div>
                                                <div style="font-size:10px;color:#94a3b8">${el.desc}</div>
                                            </div>
                                        </div>
                                    `).join('')}
                                `).join('')}
                            </div>
                        </div>
                    </div>
                    <div class="he-group"><button type="button" class="he-btn" id="he-ts"><i class="fa fa-sliders-h"></i> Inspector</button></div>
                    <div class="he-group" style="margin-left:auto;border:none"><button type="button" class="he-btn" id="he-ex" style="background:var(--he-p);color:white;font-weight:800;padding:8px 20px;border-radius:10px">Export Project</button></div>
                </header>
                <div class="he-workspace">
                    <div class="he-canvas" id="he-canvas" contenteditable="true">
                        <div class="he-placeholder"><i class="fa fa-magic fa-4x" style="margin-bottom:20px;display:block"></i><p style="font-size:24px;font-weight:800">Build Your Vision</p><p style="opacity:0.6;margin-top:10px">Click "Components Library" to start</p></div>
                    </div>
                    <div class="he-hover-box" id="he-hover-box"></div>
                    <div class="he-floating-overlay" id="he-floating-overlay">
                        <div class="he-floating-controls">
                            <div class="he-ctrl-btn" data-a="up"><i class="fa fa-arrow-up"></i></div>
                            <div class="he-ctrl-btn" data-a="down"><i class="fa fa-arrow-down"></i></div>
                            <div class="he-ctrl-btn" data-a="clone"><i class="fa fa-copy"></i></div>
                            <div class="he-ctrl-btn" data-a="del" style="color:#ffbaba"><i class="fa fa-trash"></i></div>
                        </div>
                    </div>
                </div>
                <aside class="he-sidebar" id="he-sidebar">
                    <div class="he-sidebar-head"><span style="font-weight:800;font-size:16px;color:var(--he-t)">Advanced Inspector</span><button type="button" class="he-btn" id="he-cs"><i class="fa fa-times"></i></button></div>
                    <div class="he-sidebar-body" id="he-props"></div>
                </aside>
            </div>
        `;
        this.canvas = document.getElementById('he-canvas'); this.sidebar = document.getElementById('he-sidebar'); this.props = document.getElementById('he-props'); this.floatingOverlay = document.getElementById('he-floating-overlay'); this.hoverBox = document.getElementById('he-hover-box');
    }

    setupEventListeners() {
        this.container.querySelectorAll('[data-el]').forEach(i => i.addEventListener('click', () => this.insertElement(this.elements.find(el => el.id === i.dataset.el).html)));
        document.getElementById('he-ts').addEventListener('click', () => { this.isSidebarOpen = !this.isSidebarOpen; this.sidebar.classList.toggle('open', this.isSidebarOpen); if (this.isSidebarOpen && this.selectedElement) this.renderProps(); });
        document.getElementById('he-cs').addEventListener('click', () => { this.isSidebarOpen = false; this.sidebar.classList.remove('open'); });
        document.getElementById('he-fs').addEventListener('click', () => this.toggleFullScreen());
        
        this.container.querySelectorAll('[data-cmd]').forEach(b => b.addEventListener('mousedown', (e) => { e.preventDefault(); this.canvas.focus(); document.execCommand(b.dataset.cmd, false, null); this.saveToHistory(); }));

        this.canvas.addEventListener('mousedown', (e) => { e.stopPropagation(); this.select(e.target); });
        this.canvas.addEventListener('mousemove', (e) => { let t = e.target; if (t === this.canvas || !this.canvas.contains(t)) { this.hoverBox.style.display = 'none'; return; } this.updateOverlayPos(t, this.hoverBox); });
        this.canvas.addEventListener('contextmenu', (e) => { e.preventDefault(); this.select(e.target); this.openSidebar(); });

        this.floatingOverlay.querySelectorAll('[data-a]').forEach(btn => {
            btn.addEventListener('click', (ev) => {
                ev.stopPropagation(); const a = btn.dataset.a; const e = this.selectedElement;
                if (!e || e === this.canvas) return;
                if (a === 'del') { e.remove(); this.deselect(); }
                else if (a === 'clone') { const c = e.cloneNode(true); e.after(c); this.select(c); }
                else if (a === 'up' && e.previousElementSibling) e.parentNode.insertBefore(e, e.previousElementSibling);
                else if (a === 'down' && e.nextElementSibling) e.parentNode.insertBefore(e.nextElementSibling, e);
                this.updateOverlay(); this.saveToHistory(); this.triggerC();
            });
        });

        window.addEventListener('resize', () => this.updateOverlay());
        this.canvas.addEventListener('input', () => { this.triggerC(); this.updateOverlay(); });
        document.getElementById('he-u').addEventListener('click', () => this.undo());
        document.getElementById('he-r').addEventListener('click', () => this.redo());
        document.getElementById('he-ex').addEventListener('click', () => { const b = new Blob([this.getContent()], { type: 'text/html' }); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'export.html'; a.click(); });
    }

    insertElement(h) {
        const d = document.createElement('div'); d.innerHTML = h; const e = d.firstElementChild;
        const p = this.canvas.querySelector('.he-placeholder'); if (p) p.remove();
        
        if (this.selectedElement && this.selectedElement !== this.canvas) {
            const sel = this.selectedElement;
            // If it's a media wrap or a void element, insert after it
            if (sel.classList.contains('he-media-wrap') || ['IMG', 'VIDEO', 'AUDIO', 'HR', 'BR'].includes(sel.tagName)) {
                sel.after(e);
            } else {
                // Otherwise append as a child
                sel.appendChild(e);
            }
        } else {
            this.canvas.appendChild(e);
        }
        
        this.select(e); this.saveToHistory(); this.triggerC();
    }

    openSidebar() { this.isSidebarOpen = true; this.sidebar.classList.add('open'); this.renderProps(); }
    toggleFullScreen() {
        this.container.classList.toggle('he-fullscreen');
        const btn = document.getElementById('he-fs');
        const icon = btn.querySelector('i');
        if (this.container.classList.contains('he-fullscreen')) {
            icon.className = 'fa fa-compress';
            btn.title = 'Exit Full Screen';
            document.body.style.overflow = 'hidden';
        } else {
            icon.className = 'fa fa-expand';
            btn.title = 'Full Screen';
            document.body.style.overflow = '';
        }
        this.updateOverlay();
    }
    select(e) { this.selectedElement = e; this.container.querySelectorAll('.he-selected').forEach(x => x.classList.remove('he-selected')); e.classList.add('he-selected'); this.updateOverlay(); if (this.isSidebarOpen) this.renderProps(); }
    deselect() { this.selectedElement = null; this.floatingOverlay.style.display = 'none'; this.props.innerHTML = ''; }
    updateOverlay() { if (!this.selectedElement || this.selectedElement === this.canvas) { this.floatingOverlay.style.display = 'none'; return; } this.updateOverlayPos(this.selectedElement, this.floatingOverlay); }
    updateOverlayPos(e, overlay) { const rect = e.getBoundingClientRect(); const ws = this.canvas.parentNode.getBoundingClientRect(); overlay.style.display = 'block'; overlay.style.width = rect.width + 'px'; overlay.style.height = rect.height + 'px'; overlay.style.top = (rect.top - ws.top + this.canvas.parentNode.scrollTop) + 'px'; overlay.style.left = (rect.left - ws.left + this.canvas.parentNode.scrollLeft) + 'px'; }

    renderProps() {
        if (!this.selectedElement) return;
        const e = this.selectedElement;
        let el = e; if (e.classList.contains('he-media-wrap')) el = e.querySelector('audio, video, img') || e;
        let h = `<div class="he-s-group"><div class="he-s-title">Attributes</div>`;
        if (el.tagName === 'IMG' || el.tagName === 'VIDEO' || el.tagName === 'AUDIO') h += this.renderF(el, { label: 'Source URL', prop: 'src', attr: true });
        if (el.tagName === 'A') h += this.renderF(el, { label: 'Link URL', prop: 'href', attr: true });
        h += this.renderF(el, { label: 'Element ID', prop: 'id', attr: true });
        h += this.renderF(el, { label: 'CSS Classes', prop: 'className', attr: true });
        h += `</div><div class="he-s-group"><div class="he-s-title">Design Engine</div>`;
        for (const [g, ps] of Object.entries(this.styleOptions)) {
            h += `<div style="font-size:11px;font-weight:800;margin-top:15px;color:#94a3b8;text-transform:uppercase">${g}</div>${ps.map(p => this.renderStyleF(el, p)).join('')}`;
        }
        h += `</div><div class="he-s-group"><div class="he-s-title">Raw Content</div><textarea class="he-input" style="height:120px;font-family:monospace" data-content="innerHTML">${el.innerHTML.trim()}</textarea></div>`;
        this.props.innerHTML = h;
        this.props.querySelectorAll('.he-input').forEach(i => { i.addEventListener('input', (ev) => { if (i.dataset.attr) el.setAttribute(i.dataset.prop, ev.target.value); else if (i.dataset.content) el.innerHTML = ev.target.value; else el.style[i.dataset.prop] = ev.target.value; this.updateOverlay(); this.triggerC(); }); });
    }

    renderF(el, p) { return `<div class="he-field"><label class="he-label">${p.label}</label><input type="text" class="he-input" data-prop="${p.prop}" data-attr="true" value="${el.getAttribute(p.prop) || ''}"></div>`; }
    renderStyleF(el, p) {
        const cur = el.style[p.prop] || '';
        let i = '';
        if (p.type === 'color') i = `<input type="color" class="he-input" style="height:40px;padding:5px" data-prop="${p.prop}" value="${this.rgbToHex(cur) || '#000000'}">`;
        else if (p.type === 'select') i = `<select class="he-input" data-prop="${p.prop}">${p.options.map(o => `<option value="${o}" ${cur === o ? 'selected' : ''}>${o}</option>`).join('')}</select>`;
        else i = `<input type="text" class="he-input" data-prop="${p.prop}" placeholder="e.g. 20px" value="${cur}">`;
        return `<div class="he-field"><label class="he-label">${p.label}</label>${i}</div>`;
    }

    rgbToHex(rgb) { if (!rgb || rgb.startsWith('#')) return rgb; const m = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/); if (!m) return null; return "#" + ((1 << 24) + (parseInt(m[1]) << 16) + (parseInt(m[2]) << 8) + parseInt(m[3])).toString(16).slice(1); }
    getContent() { const cl = this.canvas.cloneNode(true); cl.querySelectorAll('.he-floating-overlay, .he-hover-box, .he-placeholder').forEach(x => x.remove()); cl.querySelectorAll('.he-media-wrap').forEach(w => { const media = w.querySelector('audio, video, img'); if (media) w.replaceWith(media); }); cl.querySelectorAll('*').forEach(x => { x.classList.remove('he-selected'); x.removeAttribute('contenteditable'); }); return cl.innerHTML.trim(); }
    onChange(cb) { this.changeCallbacks.push(cb); }
    triggerC() { const h = this.getContent(); if (this.targetTextarea) this.targetTextarea.value = h; this.changeCallbacks.forEach(x => x(h)); }
    saveToHistory() { const h = this.canvas.innerHTML; if (this.history[this.historyIndex] === h) return; this.history = this.history.slice(0, this.historyIndex + 1); this.history.push(h); if (this.history.length > 50) this.history.shift(); this.historyIndex = this.history.length - 1; }
    undo() { if (this.historyIndex > 0) { this.historyIndex--; this.canvas.innerHTML = this.history[this.historyIndex]; this.triggerC(); } }
    redo() { if (this.historyIndex < this.history.length - 1) { this.historyIndex++; this.canvas.innerHTML = this.history[this.historyIndex]; this.triggerC(); } }
    setValue(h) { this.canvas.innerHTML = h; this.saveToHistory(); }
}
