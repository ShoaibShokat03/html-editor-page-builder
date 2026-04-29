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
        this.container.style.cssText = `
            width: 100%; max-width: 100%; min-height: 600px;
            position: relative; overflow: visible; border: 1px solid #e2e8f0; 
            border-radius: 16px; z-index: ${isInline ? '10' : '9999'}; 
            box-sizing: border-box; background: #f8fafc;
        `;

        this.onUpdate = null;
        this.changeCallbacks = [];
        this.selectedElement = null;
        this.history = [];
        this.historyIndex = -1;
        this.isSidebarOpen = false;

        this.elements = [
            // Basic
            { id: 'section', label: 'Section', icon: 'fa-square', desc: 'Main container', html: '<section style="padding: 60px 40px; margin: 20px 0; background: white; border-radius: 12px; border: 1px solid #e2e8f0; min-height: 100px;"></section>' },
            { id: 'heading', label: 'Heading', icon: 'fa-heading', desc: 'Title text', html: '<h2 style="margin: 0 0 20px 0; font-size: 2.5rem; font-weight: 800; color: #1e293b;">New Page Section</h2>' },
            { id: 'text', label: 'Paragraph', icon: 'fa-align-left', desc: 'Text block', html: '<p style="margin: 0 0 20px 0; line-height: 1.8; color: #475569; font-size: 1.1rem;">Build your story here. Double click to edit any text directly.</p>' },
            { id: 'button', label: 'Button', icon: 'fa-mouse-pointer', desc: 'Call to action', html: '<button style="background: #6366f1; color: white; padding: 14px 32px; border: none; border-radius: 10px; font-weight: 700; cursor: pointer; transition: 0.3s;">Get Started</button>' },
            
            // Media
            { id: 'image', label: 'Image', icon: 'fa-image', desc: 'Visual media', html: '<img src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800" style="width: 100%; border-radius: 16px; margin-bottom: 25px;">' },
            { id: 'video', label: 'Video', icon: 'fa-video', desc: 'Player', html: '<video controls style="width: 100%; border-radius: 16px; margin-bottom: 25px;"><source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4"></video>' },
            { id: 'audio', label: 'Audio', icon: 'fa-music', desc: 'Sound clip', html: '<audio controls style="width: 100%; margin-bottom: 20px;"><source src="https://www.w3schools.com/html/horse.mp3" type="audio/mpeg"></audio>' },
            { id: 'icon', label: 'Icon', icon: 'fa-star', desc: 'Visual icon', html: '<i class="fa fa-star fa-3x" style="color: #fbbf24; margin-bottom: 15px;"></i>' },

            // Layout
            { id: 'grid2', label: '2-Col Grid', icon: 'fa-columns', desc: 'Balanced split', html: '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; margin: 30px 0;"><div style="padding: 20px; border: 1px dashed #cbd5e1; border-radius: 10px;">Column 1</div><div style="padding: 20px; border: 1px dashed #cbd5e1; border-radius: 10px;">Column 2</div></div>' },
            { id: 'grid3', label: '3-Col Grid', icon: 'fa-th-large', desc: 'Feature list', html: '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 30px 0;"><div style="padding: 20px; border: 1px dashed #cbd5e1; border-radius: 10px;">Item 1</div><div style="padding: 20px; border: 1px dashed #cbd5e1; border-radius: 10px;">Item 2</div><div style="padding: 20px; border: 1px dashed #cbd5e1; border-radius: 10px;">Item 3</div></div>' },
            { id: 'spacer', label: 'Spacer', icon: 'fa-arrows-alt-v', desc: 'Vertical space', html: '<div style="height: 60px; width: 100%;"></div>' },
            { id: 'divider', label: 'Divider', icon: 'fa-minus', desc: 'Separation line', html: '<hr style="border: none; border-top: 2px solid #f1f5f9; margin: 40px 0;">' },

            // Components
            { id: 'card', label: 'Feature Card', icon: 'fa-id-card', desc: 'Styled box', html: '<div style="padding: 30px; background: white; border-radius: 20px; border: 1px solid #e2e8f0; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); margin-bottom: 25px;"><div style="width: 50px; height: 50px; background: #e0e7ff; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px;"><i class="fa fa-rocket" style="color: #6366f1;"></i></div><h3 style="margin: 0 0 10px 0;">Smart Features</h3><p style="color: #64748b; margin: 0; line-height: 1.6;">Build faster with our pre-styled components.</p></div>' },
            { id: 'alert', label: 'Alert Box', icon: 'fa-bell', desc: 'Notification', html: '<div style="padding: 15px 25px; background: #ecfdf5; border-left: 5px solid #10b981; color: #064e3b; border-radius: 8px; margin: 25px 0; display: flex; align-items: center; gap: 15px;"><i class="fa fa-check-circle"></i> <span>Action successful! Your page is updated.</span></div>' },
            { id: 'quote', label: 'Testimonial', icon: 'fa-quote-right', desc: 'User review', html: '<div style="padding: 40px; background: #f8fafc; border-radius: 20px; text-align: center; margin: 40px 0;"><i class="fa fa-quote-left fa-2x" style="color: #cbd5e1; margin-bottom: 20px;"></i><p style="font-size: 1.25rem; font-style: italic; color: #1e293b; margin-bottom: 20px;">"This is the best editor I have ever used. Simple yet powerful."</p><div style="font-weight: 700; color: #6366f1;">John Doe</div><div style="font-size: 0.85rem; color: #94a3b8;">CEO at TechCorp</div></div>' },
            { id: 'checklist', label: 'Checklist', icon: 'fa-list-check', desc: 'Feature points', html: '<ul style="list-style: none; padding: 0; margin: 25px 0;"><li style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;"><i class="fa fa-check" style="color: #10b981; background: #d1fae5; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px;"></i> Visual Builder</li><li style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;"><i class="fa fa-check" style="color: #10b981; background: #d1fae5; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px;"></i> Responsive Design</li></ul>' },
            { id: 'cta', label: 'Banner CTA', icon: 'fa-bullhorn', desc: 'Full width call', html: '<div style="padding: 50px; background: linear-gradient(135deg, #6366f1, #a855f7); color: white; border-radius: 20px; text-align: center; margin: 40px 0;"><h2 style="margin: 0 0 15px 0;">Ready to launch?</h2><p style="margin: 0 0 30px 0; opacity: 0.9;">Join 10,000+ users today.</p><button style="background: white; color: #6366f1; padding: 12px 30px; border: none; border-radius: 8px; font-weight: 700; cursor: pointer;">Sign Up Now</button></div>' },
            { id: 'faq', label: 'FAQ Item', icon: 'fa-question-circle', desc: 'Question box', html: '<div style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 15px; background: white;"><div style="font-weight: 700; display: flex; justify-content: space-between; align-items: center;">How does it work? <i class="fa fa-chevron-down" style="font-size: 12px; color: #94a3b8;"></i></div><div style="margin-top: 10px; color: #64748b; font-size: 0.95rem; line-height: 1.5;">Our visual builder uses a simple drag-and-drop mechanism to help you create stunning layouts in minutes.</div></div>' },
            
            // Form Basic
            { id: 'input', label: 'Input Field', icon: 'fa-edit', desc: 'Form text input', html: '<div style="margin-bottom: 20px;"><label style="display: block; font-weight: 600; margin-bottom: 8px; font-size: 14px;">Label Name</label><input type="text" placeholder="Enter text..." style="width: 100%; padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; box-sizing: border-box;"></div>' },
            { id: 'textarea', label: 'Message Box', icon: 'fa-align-justify', desc: 'Large text area', html: '<div style="margin-bottom: 20px;"><label style="display: block; font-weight: 600; margin-bottom: 8px; font-size: 14px;">Your Message</label><textarea placeholder="Type here..." style="width: 100%; min-height: 120px; padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px; box-sizing: border-box; font-family: inherit;"></textarea></div>' }
        ];

        this.styleOptions = {
            'Layout': [
                { label: 'Display', prop: 'display', type: 'select', options: ['block', 'flex', 'grid', 'inline-block', 'none'] },
                { label: 'Padding', prop: 'padding' },
                { label: 'Margin', prop: 'margin' },
                { label: 'Width', prop: 'width' },
                { label: 'Height', prop: 'height' },
                { label: 'Max Width', prop: 'maxWidth' },
                { label: 'Z-Index', prop: 'zIndex' }
            ],
            'Typography': [
                { label: 'Font Size', prop: 'fontSize' },
                { label: 'Font Weight', prop: 'fontWeight', type: 'select', options: ['100', '200', '300', '400', '500', '600', '700', '800', '900'] },
                { label: 'Line Height', prop: 'lineHeight' },
                { label: 'Text Color', prop: 'color', type: 'color' },
                { label: 'Text Align', prop: 'textAlign', type: 'select', options: ['left', 'center', 'right', 'justify'] },
                { label: 'Letter Spacing', prop: 'letterSpacing' },
                { label: 'Text Transform', prop: 'textTransform', type: 'select', options: ['none', 'uppercase', 'lowercase', 'capitalize'] }
            ],
            'Decoration': [
                { label: 'Background', prop: 'backgroundColor', type: 'color' },
                { label: 'Background Image', prop: 'backgroundImage' },
                { label: 'Border', prop: 'border' },
                { label: 'Border Radius', prop: 'borderRadius' },
                { label: 'Box Shadow', prop: 'boxShadow' },
                { label: 'Opacity', prop: 'opacity', type: 'range', min: 0, max: 1, step: 0.1 },
                { label: 'Cursor', prop: 'cursor', type: 'select', options: ['default', 'pointer', 'move', 'text', 'not-allowed'] }
            ],
            'Flexbox (Advanced)': [
                { label: 'Flex Dir', prop: 'flexDirection', type: 'select', options: ['row', 'column', 'row-reverse', 'column-reverse'] },
                { label: 'Justify', prop: 'justifyContent', type: 'select', options: ['flex-start', 'center', 'flex-end', 'space-between', 'space-around'] },
                { label: 'Align Items', prop: 'alignItems', type: 'select', options: ['flex-start', 'center', 'flex-end', 'stretch'] },
                { label: 'Gap', prop: 'gap' }
            ]
        };

        this.init();
    }

    init() {
        this.setupStyles();
        this.renderUI();
        this.setupEventListeners();
        this.saveToHistory();
    }

    setupStyles() {
        // Dynamically inject external dependencies if missing
        const deps = [
            { id: 'he-fa', url: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css', type: 'css' },
            { id: 'he-font', url: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap', type: 'css' }
        ];

        deps.forEach(dep => {
            if (!document.querySelector(`link[href*="${dep.id}"]`) && !document.querySelector(`link[href*="${dep.url}"]`)) {
                const l = document.createElement('link');
                l.rel = 'stylesheet';
                l.href = dep.url;
                if (dep.id) l.id = dep.id;
                document.head.appendChild(l);
            }
        });

        const s = document.createElement('style');
        s.textContent = `
            :root { --he-p: #6366f1; --he-bg: #f8fafc; --he-t: #1e293b; --he-b: #e2e8f0; }
            .he-main { display: flex; flex-direction: column; width: 100%; font-family: 'Inter', sans-serif; background: var(--he-bg); position: relative; }
            .he-center { flex: 1; display: flex; flex-direction: column; min-width: 0; }
            .he-toolbar { background: white; border-bottom: 1px solid var(--he-b); padding: 12px 16px; display: flex; align-items: center; gap: 10px; z-index: 100; flex-wrap: wrap; position: sticky; top: 0; }
            .he-group { display: flex; gap: 4px; padding-right: 10px; border-right: 1px solid var(--he-b); align-items: center; }
            .he-group:last-child { border-right: none; }
            .he-btn { background: transparent; border: 1px solid transparent; padding: 8px; border-radius: 6px; cursor: pointer; color: var(--he-t); font-size: 14px; display: flex; align-items: center; gap: 6px; transition: 0.2s; }
            .he-btn:hover { background: #f1f5f9; color: var(--he-p); }
            .he-btn.active { background: #eef2ff; color: var(--he-p); border-color: #c7d2fe; }
            
            .he-dropdown { position: relative; }
            .he-dropdown-content { 
                opacity: 0; visibility: hidden; position: absolute; top: 100%; left: 0; 
                background: white; width: 450px; max-height: 500px; overflow-y: auto;
                box-shadow: 0 15px 40px rgba(0,0,0,0.15); border-radius: 16px; border: 1px solid var(--he-b); 
                padding: 16px; z-index: 1000; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; 
                transition: 0.25s cubic-bezier(0.4, 0, 0.2, 1); transform: translateY(10px); 
                scrollbar-width: thin;
            }
            .he-dropdown-content::-webkit-scrollbar { width: 5px; }
            .he-dropdown-content::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
            
            .he-dropdown:hover .he-dropdown-content { opacity: 1; visibility: visible; transform: translateY(8px); }
            
            .he-item { display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 10px; cursor: pointer; border: 1px solid transparent; transition: all 0.2s; }
            .he-item:hover { background: #f8fafc; border-color: var(--he-b); transform: translateY(-2px); }
            .he-item i { width: 32px; height: 32px; background: #e0e7ff; color: var(--he-p); border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 16px; }
            
            .he-workspace { padding: 40px 20px; display: flex; flex-direction: column; align-items: center; background: #f1f5f9; min-height: 500px; }
            .he-canvas { width: 100%; max-width: 1000px; min-height: 400px; background: white; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.03); padding: 40px; position: relative; outline: none; box-sizing: border-box; }
            .he-canvas.tablet { max-width: 768px; }
            .he-canvas.mobile { max-width: 390px; }
            .he-canvas *:hover:not(.he-overlay) { outline: 2px solid var(--he-p); outline-offset: 4px; }
            .he-selected { outline: 2px solid var(--he-p) !important; outline-offset: 4px; }

            .he-overlay { position: absolute; top: -45px; right: 0; background: var(--he-p); display: none; gap: 4px; padding: 6px; border-radius: 8px 8px 0 0; z-index: 50; }
            .he-selected > .he-overlay { display: flex; }
            .he-ctrl { color: white; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; cursor: pointer; border-radius: 5px; }
            .he-ctrl:hover { background: rgba(255,255,255,0.2); }

            .he-sidebar { width: 380px; background: white; border-left: 1px solid var(--he-b); position: fixed; right: 0; top: 0; bottom: 0; transform: translateX(100%); transition: 0.3s; z-index: 10000; display: flex; flex-direction: column; box-shadow: -10px 0 30px rgba(0,0,0,0.05); }
            .he-sidebar.open { transform: translateX(0); }
            .he-sidebar-head { padding: 15px 20px; border-bottom: 1px solid var(--he-b); display: flex; justify-content: space-between; align-items: center; }
            .he-sidebar-body { flex: 1; overflow-y: auto; padding: 20px; }
            
            .he-s-group { margin-bottom: 25px; }
            .he-s-title { font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; margin-bottom: 12px; letter-spacing: 0.05em; display: flex; align-items: center; gap: 10px; }
            .he-s-title::after { content: ''; flex: 1; height: 1px; background: var(--he-b); }
            .he-field { margin-bottom: 15px; }
            .he-label { display: block; font-size: 12px; font-weight: 600; margin-bottom: 6px; color: #64748b; }
            .he-input { width: 100%; padding: 10px 12px; border: 1px solid var(--he-b); border-radius: 8px; font-size: 13px; outline: none; box-sizing: border-box; }
            .he-input:focus { border-color: var(--he-p); }
            .he-textarea { width: 100%; min-height: 100px; font-family: monospace; font-size: 12px; }

            .he-placeholder { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; color: #cbd5e1; pointer-events: none; }
            .he-indicator { height: 4px; background: var(--he-p); border-radius: 2px; margin: 10px 0; }
        `;
        document.head.appendChild(s);
    }

    renderUI() {
        this.container.innerHTML = `
            <div class="he-main">
                <div class="he-center">
                    <header class="he-toolbar">
                        <div class="he-group">
                            <button type="button" class="he-btn" id="he-u"><i class="fa fa-undo"></i></button>
                            <button type="button" class="he-btn" id="he-r"><i class="fa fa-redo"></i></button>
                        </div>
                        <div class="he-group">
                            <button type="button" class="he-btn" data-cmd="bold"><i class="fa fa-bold"></i></button>
                            <button type="button" class="he-btn" data-cmd="italic"><i class="fa fa-italic"></i></button>
                            <button type="button" class="he-btn" data-cmd="underline"><i class="fa fa-underline"></i></button>
                        </div>
                        <div class="he-group">
                            <div class="he-dropdown">
                                <button type="button" class="he-btn active" style="background: var(--he-p); color: white; padding: 8px 16px; border-radius: 10px;"><i class="fa fa-plus-circle"></i> Components</button>
                                <div class="he-dropdown-content">
                                    ${this.elements.map(el => `<div class="he-item" data-el="${el.id}"><i class="fa ${el.icon}"></i> <div><div style="font-weight:700;font-size:13px">${el.label}</div><div style="font-size:10px;color:#94a3b8">${el.desc}</div></div></div>`).join('')}
                                </div>
                            </div>
                        </div>
                        <div class="he-group"><button type="button" class="he-btn" id="he-ts"><i class="fa fa-paint-brush"></i> Inspector</button></div>
                        <div class="he-group">
                            <button type="button" class="he-btn active" data-d="desktop"><i class="fa fa-desktop"></i></button>
                            <button type="button" class="he-btn" data-d="tablet"><i class="fa fa-tablet-alt"></i></button>
                            <button type="button" class="he-btn" data-d="mobile"><i class="fa fa-mobile-alt"></i></button>
                        </div>
                        <div class="he-group" style="margin-left:auto;border:none">
                            <button type="button" class="he-btn" id="he-pv"><i class="fa fa-eye"></i></button>
                            <button type="button" class="he-btn" id="he-ex" style="background:var(--he-p);color:white;font-weight:700;padding:8px 20px;border-radius:10px">Export HTML</button>
                        </div>
                    </header>
                    <div class="he-workspace">
                        <div class="he-canvas" id="he-canvas" contenteditable="true">
                            <div class="he-placeholder"><i class="fa fa-rocket fa-4x" style="margin-bottom:20px;display:block;color:#e2e8f0"></i><p style="font-weight:800;font-size:24px;color:#cbd5e1">Build Something Great</p><p style="color:#e2e8f0;margin-top:10px">Drag components or type anywhere</p></div>
                        </div>
                    </div>
                </div>
                <aside class="he-sidebar" id="he-sidebar">
                    <div class="he-sidebar-head"><span style="font-weight:700">Design Inspector</span><button type="button" class="he-btn" id="he-cs"><i class="fa fa-times"></i></button></div>
                    <div class="he-sidebar-body" id="he-props"><div style="text-align:center;margin-top:50px;color:#94a3b8"><p>Select an element to inspect</p></div></div>
                </aside>
            </div>
        `;
        this.canvas = document.getElementById('he-canvas');
        this.sidebar = document.getElementById('he-sidebar');
        this.props = document.getElementById('he-props');
    }

    setupEventListeners() {
        this.container.querySelectorAll('[data-el]').forEach(i => i.addEventListener('click', () => {
            this.insertElement(this.elements.find(el => el.id === i.dataset.el).html);
        }));
        document.getElementById('he-ts').addEventListener('click', () => {
            this.isSidebarOpen = !this.isSidebarOpen;
            this.sidebar.classList.toggle('open', this.isSidebarOpen);
            if (this.isSidebarOpen && this.selectedElement) this.renderProps();
        });
        document.getElementById('he-cs').addEventListener('click', () => { this.isSidebarOpen = false; this.sidebar.classList.remove('open'); });
        this.container.querySelectorAll('[data-cmd]').forEach(b => b.addEventListener('click', (e) => { e.preventDefault(); document.execCommand(b.dataset.cmd); this.saveToHistory(); }));
        this.container.querySelectorAll('[data-d]').forEach(b => b.addEventListener('click', () => {
            this.container.querySelectorAll('[data-d]').forEach(x => x.classList.remove('active'));
            b.classList.add('active'); this.canvas.className = 'he-canvas ' + b.dataset.d;
        }));
        this.canvas.addEventListener('click', (e) => {
            if (e.target === this.canvas) { this.deselect(); return; }
            let t = e.target; while (t && t.parentNode !== this.canvas && t !== this.canvas) { if (t.classList.contains('he-overlay')) return; t = t.parentNode; }
            if (t && t !== this.canvas) this.select(t);
        });

        // Right-click to open inspector
        this.canvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            let t = e.target;
            while (t && t.parentNode !== this.canvas && t !== this.canvas) {
                if (t.classList.contains('he-overlay')) return;
                t = t.parentNode;
            }
            if (t && t !== this.canvas) {
                this.select(t);
                this.isSidebarOpen = true;
                this.sidebar.classList.add('open');
                this.renderProps();
            }
        });
        this.canvas.addEventListener('input', () => { this.toggleP(); this.triggerC(); });
        document.getElementById('he-u').addEventListener('click', () => this.undo());
        document.getElementById('he-r').addEventListener('click', () => this.redo());
        document.getElementById('he-ex').addEventListener('click', () => {
            const b = new Blob([this.getContent()], { type: 'text/html' });
            const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'export.html'; a.click();
        });
        this.setupDnD();
    }

    insertElement(h) {
        const d = document.createElement('div'); d.innerHTML = h; const e = d.firstElementChild;
        this.addC(e); this.toggleP(false);
        const s = window.getSelection();
        if (s.rangeCount > 0 && this.canvas.contains(s.anchorNode)) { s.getRangeAt(0).insertNode(e); }
        else { this.canvas.appendChild(e); }
        this.select(e); this.saveToHistory(); this.triggerC();
    }

    addC(e) {
        if (e.classList.contains('he-overlay')) return;
        e.setAttribute('draggable', 'true');
        const o = document.createElement('div'); o.className = 'he-overlay'; o.contentEditable = "false";
        o.innerHTML = `<div class="he-ctrl" data-a="up"><i class="fa fa-arrow-up"></i></div><div class="he-ctrl" data-a="down"><i class="fa fa-arrow-down"></i></div><div class="he-ctrl" data-a="clone"><i class="fa fa-copy"></i></div><div class="he-ctrl" data-a="del" style="color:#ffbaba"><i class="fa fa-trash"></i></div>`;
        e.appendChild(o);
        o.addEventListener('click', (ev) => {
            ev.stopPropagation(); const a = ev.target.closest('.he-ctrl').dataset.a;
            if (a === 'del') { e.remove(); this.deselect(); this.toggleP(); }
            else if (a === 'clone') { const c = e.cloneNode(true); c.classList.remove('he-selected'); this.addC(c); e.after(c); this.select(c); }
            else if (a === 'up' && e.previousElementSibling) e.parentNode.insertBefore(e, e.previousElementSibling);
            else if (a === 'down' && e.nextElementSibling) e.parentNode.insertBefore(e.nextElementSibling, e);
            this.saveToHistory(); this.triggerC();
        });
    }

    select(e) { this.deselect(); this.selectedElement = e; e.classList.add('he-selected'); if (this.isSidebarOpen) this.renderProps(); }
    deselect() { this.container.querySelectorAll('.he-selected').forEach(x => x.classList.remove('he-selected')); this.selectedElement = null; this.props.innerHTML = '<div style="text-align:center;margin-top:50px;color:#94a3b8"><p>Select an element to inspect</p></div>'; }

    renderProps() {
        if (!this.selectedElement) return;
        let h = '';
        h += `<div class="he-s-group"><div class="he-s-title">Content & Attributes</div>`;
        const tag = this.selectedElement.tagName;
        if (['IMG', 'VIDEO', 'AUDIO'].includes(tag)) {
            h += this.renderF({ label: 'Media Source (URL)', prop: 'src', attr: true });
            if (tag === 'IMG') h += this.renderF({ label: 'Alt Text', prop: 'alt', attr: true });
        }
        if (tag === 'A') {
            h += this.renderF({ label: 'Link URL (href)', prop: 'href', attr: true });
            h += this.renderF({ label: 'Target', prop: 'target', type: 'select', options: ['_self', '_blank'], attr: true });
        }
        h += this.renderF({ label: 'ID Attribute', prop: 'id', attr: true });
        h += this.renderF({ label: 'CSS Classes', prop: 'className', attr: true });
        h += `</div>`;
        h += `<div class="he-s-group"><div class="he-s-title">Raw Content</div>`;
        h += `<div class="he-field"><label class="he-label">Inner Text</label><textarea class="he-input he-textarea" data-content="innerText">${this.selectedElement.innerText}</textarea></div>`;
        h += `<div class="he-field"><label class="he-label">Raw HTML</label><textarea class="he-input he-textarea" data-content="innerHTML">${this.getCleanHTML(this.selectedElement)}</textarea></div>`;
        h += `</div>`;
        for (const [g, ps] of Object.entries(this.styleOptions)) {
            h += `<div class="he-s-group"><div class="he-s-title">${g}</div>${ps.map(p => this.renderStyleF(p)).join('')}</div>`;
        }
        this.props.innerHTML = h;
        this.props.querySelectorAll('.he-input').forEach(i => {
            i.addEventListener('input', (ev) => {
                const val = ev.target.value;
                if (i.dataset.attr) {
                    if (i.dataset.prop === 'className') this.selectedElement.className = val + ' he-selected';
                    else if (i.dataset.prop === 'src' && (tag === 'VIDEO' || tag === 'AUDIO')) {
                        const s = this.selectedElement.querySelector('source') || this.selectedElement;
                        s.src = val; this.selectedElement.load();
                    }
                    else this.selectedElement.setAttribute(i.dataset.prop, val);
                }
                else if (i.dataset.content) {
                    if (i.dataset.content === 'innerHTML') {
                        const overlay = this.selectedElement.querySelector('.he-overlay')?.outerHTML || '';
                        this.selectedElement.innerHTML = val + overlay;
                        if (overlay) this.addC(this.selectedElement);
                    } else {
                        this.selectedElement.innerText = val;
                    }
                }
                else this.selectedElement.style[i.dataset.prop] = val;
                this.triggerC();
            });
            i.addEventListener('change', () => this.saveToHistory());
        });
    }

    getCleanHTML(el) {
        const c = el.cloneNode(true);
        const o = c.querySelector('.he-overlay'); if (o) o.remove();
        c.classList.remove('he-selected');
        return c.innerHTML.trim();
    }

    renderF(p) {
        const cur = p.attr ? (this.selectedElement.getAttribute(p.prop) || this.selectedElement[p.prop] || '') : (this.selectedElement.style[p.prop] || '');
        let i = '';
        if (p.type === 'select') i = `<select class="he-input" data-prop="${p.prop}" ${p.attr ? 'data-attr="true"' : ''}>${p.options.map(o => `<option value="${o}" ${cur === o ? 'selected' : ''}>${o}</option>`).join('')}</select>`;
        else i = `<input type="text" class="he-input" data-prop="${p.prop}" value="${cur}" ${p.attr ? 'data-attr="true"' : ''}>`;
        return `<div class="he-field"><label class="he-label">${p.label}</label>${i}</div>`;
    }

    renderStyleF(p) {
        const cur = this.selectedElement.style[p.prop] || '';
        let i = '';
        if (p.type === 'color') i = `<input type="color" class="he-input" data-prop="${p.prop}" value="${this.rgbToHex(cur) || '#000000'}">`;
        else if (p.type === 'select') i = `<select class="he-input" data-prop="${p.prop}">${p.options.map(o => `<option value="${o}" ${cur === o ? 'selected' : ''}>${o}</option>`).join('')}</select>`;
        else if (p.type === 'range') i = `<input type="range" class="he-input" data-prop="${p.prop}" min="${p.min}" max="${p.max}" step="${p.step}" value="${cur || 1}">`;
        else i = `<input type="text" class="he-input" data-prop="${p.prop}" value="${cur}" placeholder="e.g. 10px, 100%">`;
        return `<div class="he-field"><label class="he-label">${p.label}</label>${i}</div>`;
    }

    rgbToHex(rgb) { if (!rgb || rgb.startsWith('#')) return rgb; const m = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/); if (!m) return null; return "#" + ((1 << 24) + (parseInt(m[1]) << 16) + (parseInt(m[2]) << 8) + parseInt(m[3])).toString(16).slice(1); }

    setupDnD() {
        let d = null;
        this.canvas.addEventListener('dragstart', (e) => { let r = e.target; while (r && r.parentNode !== this.canvas) r = r.parentNode; if (r) { d = r; d.style.opacity = '0.4'; } });
        this.canvas.addEventListener('dragend', () => { if (d) d.style.opacity = '1'; const i = this.canvas.querySelector('.he-indicator'); if (i) i.remove(); });
        this.canvas.addEventListener('dragover', (e) => {
            e.preventDefault(); const a = this.getD(this.canvas, e.clientY);
            const i = this.canvas.querySelector('.he-indicator') || document.createElement('div');
            i.className = 'he-indicator'; if (a) this.canvas.insertBefore(i, a); else this.canvas.appendChild(i);
        });
        this.canvas.addEventListener('drop', (e) => { e.preventDefault(); const i = this.canvas.querySelector('.he-indicator'); if (i && d) { i.parentNode.replaceChild(d, i); this.saveToHistory(); this.triggerC(); } });
    }

    getD(c, y) {
        const es = [...c.querySelectorAll('.he-canvas > *:not(.he-indicator):not(.he-placeholder)')];
        return es.reduce((cl, ch) => { const b = ch.getBoundingClientRect(); const o = y - b.top - b.height / 2; if (o < 0 && o > cl.offset) return { offset: o, element: ch }; return cl; }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    toggleP(f) { const p = this.canvas.querySelector('.he-placeholder'); if (!p) return; const h = this.canvas.children.length > 1 || (this.canvas.textContent.trim().length > 0 && this.canvas.innerText !== p.innerText); p.style.display = (f === false || h) ? 'none' : 'block'; }
    getContent() { const cl = this.canvas.cloneNode(true); cl.querySelectorAll('.he-overlay, .he-placeholder, .he-indicator').forEach(x => x.remove()); cl.querySelectorAll('*').forEach(x => { x.classList.remove('he-selected'); x.removeAttribute('draggable'); x.removeAttribute('contenteditable'); }); cl.removeAttribute('contenteditable'); return cl.innerHTML.trim(); }
    
    // Utility Methods
    getText() { return this.canvas.innerText.trim(); }
    getContentLength() { return this.getContent().length; }
    getTextLength() { return this.getText().length; }
    getElementCount() { return [...this.canvas.children].filter(c => !c.classList.contains('he-placeholder')).length; }

    onChange(cb) { this.changeCallbacks.push(cb); }
    triggerC() { const h = this.getContent(); if (this.targetTextarea) this.targetTextarea.value = h; this.changeCallbacks.forEach(x => x(h)); if (this.onUpdate) this.onUpdate(h); }
    saveToHistory() { const h = this.canvas.innerHTML; if (this.history[this.historyIndex] === h) return; this.history = this.history.slice(0, this.historyIndex + 1); this.history.push(h); if (this.history.length > 50) this.history.shift(); this.historyIndex = this.history.length - 1; }
    undo() { if (this.historyIndex > 0) { this.historyIndex--; this.applyH(); } }
    redo() { if (this.historyIndex < this.history.length - 1) { this.historyIndex++; this.applyH(); } }
    applyH() { this.canvas.innerHTML = this.history[this.historyIndex]; this.toggleP(); [...this.canvas.children].forEach(c => { if (!c.classList.contains('he-placeholder')) this.addC(c); }); this.triggerC(); }
    setValue(h) { this.canvas.innerHTML = h; if (this.targetTextarea) this.targetTextarea.value = this.getContent(); this.toggleP(); [...this.canvas.children].forEach(c => { if (!c.classList.contains('he-placeholder')) this.addC(c); }); this.saveToHistory(); }
}
