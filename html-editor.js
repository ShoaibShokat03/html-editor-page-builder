/**
 * Premium Event Manager for HTML Page Builder
 * Provides Unity-like Event Triggers and Multi-Target Actions
 */
class HtmlEventManager {
  constructor(editor) {
    this.editor = editor;
    this.triggers = [
      "click",
      "mouseenter",
      "mouseleave",
      "focus",
      "blur",
      "change",
      "submit",
    ];
    this.generalActions = [
      { id: "toggle", label: "Toggle Visibility" },
      { id: "show", label: "Show Element" },
      { id: "hide", label: "Hide Element" },
      { id: "addClass", label: "Add Class" },
      { id: "removeClass", label: "Remove Class" },
    ];
  }

  getActionsForTarget(targetSelector) {
    if (!targetSelector) return this.generalActions;
    const target = document.querySelector(targetSelector);
    if (!target) return this.generalActions;

    const tag = target.tagName;
    const attrs = this.editor.tagAttributes[tag] || [];
    const list = [...this.generalActions];

    // Add Attribute Actions
    attrs.forEach(a => {
        list.push({ id: `attr:${a.prop}`, label: `Set ${a.label}` });
    });

    // Add Common Style Actions
    const commonStyles = [
        { id: 'style:color', label: 'Set Text Color' },
        { id: 'style:backgroundColor', label: 'Set Background' },
        { id: 'style:display', label: 'Set Display' },
        { id: 'style:opacity', label: 'Set Opacity' }
    ];
    return [...list, ...commonStyles];
  }

  render(el) {
    let events = [];
    try {
      events = JSON.parse(el.getAttribute("data-he-events") || "[]");
    } catch (e) {
      events = [];
    }

    let h = `
        <div class="he-s-group">
            <div class="he-s-title">Logic Interactions</div>`;

    events.forEach((ev, idx) => {
      const isDyn = ev.vmode === "dynamic";
      const hasTarget = !!ev.target;
      const targetActions = hasTarget ? this.getActionsForTarget(ev.target) : [];
      
      h += `
            <div class="he-event-card" style="background:white; border:1px solid var(--he-b); padding:16px; border-radius:20px; margin-bottom:16px; position:relative; box-shadow:0 10px 15px -3px rgba(0,0,0,0.04)">
                <div class="he-field">
                    <label class="he-label">1. When this happens...</label>
                    <select class="he-input he-ev-type" data-idx="${idx}">
                        ${this.triggers.map((t) => `<option value="${t}" ${ev.type === t ? "selected" : ""}>${t.toUpperCase()}</option>`).join("")}
                    </select>
                </div>

                <div style="margin-top:14px">
                    <label class="he-label">2. Target Element</label>
                    <div class="he-ev-drop" data-idx="${idx}" data-field="target" style="width:100%; height:80px; border:2px dashed ${hasTarget ? 'var(--he-p)' : '#e2e8f0'}; border-radius:14px; display:flex; flex-direction:column; align-items:center; justify-content:center; font-size:12px; color:${hasTarget ? 'var(--he-p)' : '#94a3b8'}; background:${hasTarget ? 'var(--he-p-light)' : '#f8fafc'}; cursor:crosshair; transition:0.2s">
                        ${hasTarget ? `
                            <i class="fa fa-check-circle" style="font-size:20px; margin-bottom:8px"></i>
                            <span style="font-weight:800; text-transform:uppercase; letter-spacing:1px">${ev.target}</span>
                            <span style="font-size:10px; opacity:0.6; margin-top:4px">Drag new element to replace</span>
                        ` : `
                            <i class="fa fa-plus-circle" style="font-size:24px; margin-bottom:8px; opacity:0.2"></i>
                            <span style="font-weight:700">DRAG TARGET ELEMENT HERE</span>
                        `}
                    </div>
                </div>

                ${hasTarget ? `
                    <div style="margin-top:16px; padding-top:16px; border-top:1px solid var(--he-b)">
                        <div class="he-grid-2">
                            <div>
                                <label class="he-label">3. Perform Action</label>
                                <select class="he-input he-ev-action" data-idx="${idx}">
                                    ${targetActions.map((a) => `<option value="${a.id}" ${ev.action === a.id ? "selected" : ""}>${a.label}</option>`).join("")}
                                </select>
                            </div>
                            <div>
                                <label class="he-label">4. Value Mode</label>
                                <select class="he-input he-ev-vmode" data-idx="${idx}">
                                    <option value="static" ${!isDyn ? "selected" : ""}>Static Value</option>
                                    <option value="dynamic" ${isDyn ? "selected" : ""}>Live Mapping</option>
                                </select>
                            </div>
                        </div>

                        <div style="margin-top:12px; background:var(--he-bg); padding:14px; border-radius:12px; border:1px solid var(--he-b)">
                            ${isDyn ? `
                                <div class="he-grid-2">
                                    <div>
                                        <label class="he-label">Source Data</label>
                                        <div class="he-ev-drop" data-idx="${idx}" data-field="source" style="height:36px; border:2px dashed #10b981; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:11px; color:#10b981; background:white; cursor:crosshair; font-weight:800">
                                            <i class="fa fa-database" style="margin-right:6px"></i> ${ev.source || "DRAG SOURCE"}
                                        </div>
                                    </div>
                                    <div>
                                        <label class="he-label">Source Property</label>
                                        <input type="text" class="he-input he-ev-sprop" data-idx="${idx}" value="${ev.sprop || "value"}" placeholder="e.g. value">
                                    </div>
                                </div>
                            ` : `
                                <label class="he-label">Target Value / Parameter</label>
                                <input type="text" class="he-input he-ev-val" data-idx="${idx}" value="${ev.val || ""}" placeholder="e.g. active-class or #ff0000">
                            `}
                        </div>
                    </div>
                ` : ''}

                <button class="he-ev-del" data-idx="${idx}" style="position:absolute; top:16px; right:16px; background:none; border:none; color:#fda4af; cursor:pointer; font-size:16px; transition:0.2s" onmouseover="this.style.color='#ef4444'" onmouseout="this.style.color='#fda4af'">
                    <i class="fa fa-trash"></i>
                </button>
            </div>`;
    });

    h += `
            <button type="button" class="he-btn" id="he-add-event" style="width:100%; background:var(--he-p); color:white; font-weight:700; border-radius:10px; padding:10px">
                <i class="fa fa-plus-lightning"></i> Add New Interaction
            </button>
        </div>`;

    return h;
  }

  attachEvents(el, container) {
    const getEvents = () =>
      JSON.parse(el.getAttribute("data-he-events") || "[]");
    const saveEvents = (evs) => {
      el.setAttribute("data-he-events", JSON.stringify(evs));
      this.editor.saveToHistory();
      this.editor.triggerC(); // Persist changes
      this.editor.renderProps();
    };

    container.querySelector("#he-add-event").onclick = () => {
      const evs = getEvents();
      evs.push({ type: "click", target: "", action: "toggle", val: "" });
      saveEvents(evs);
    };

    container.querySelectorAll(".he-ev-type, .he-ev-action, .he-ev-vmode").forEach((s) => {
      s.onchange = () => {
        const evs = getEvents();
        const field = s.classList.contains("he-ev-type") ? "type" : (s.classList.contains("he-ev-action") ? "action" : "vmode");
        evs[s.dataset.idx][field] = s.value;
        saveEvents(evs);
      };
    });

    container.querySelectorAll(".he-ev-val, .he-ev-sprop").forEach((i) => {
      i.oninput = () => {
        const evs = getEvents();
        const field = i.classList.contains("he-ev-val") ? "val" : "sprop";
        evs[i.dataset.idx][field] = i.value;
        el.setAttribute("data-he-events", JSON.stringify(evs));
      };
      i.onblur = () => this.editor.saveToHistory();
    });

    container.querySelectorAll(".he-ev-del").forEach((b) => {
      b.onclick = () => {
        const evs = getEvents();
        evs.splice(b.dataset.idx, 1);
        saveEvents(evs);
      };
    });

    // Drag & Drop Handling
    container.querySelectorAll(".he-ev-drop").forEach((box) => {
      box.addEventListener("dragover", (e) => {
        e.preventDefault();
        box.style.background = "var(--he-p-light)";
      });
      box.addEventListener("dragleave", () => {
        box.style.background = "white";
      });
      box.addEventListener("drop", (e) => {
        e.preventDefault();
        box.style.background = "white";
        const dragged = this.editor.draggedElForEvent;
        if (dragged) {
          if (!dragged.id)
            dragged.id = "he-el-" + Math.random().toString(36).substr(2, 9);
          const evs = getEvents();
          const field = box.dataset.field; // 'target' or 'source'
          evs[box.dataset.idx][field] = "#" + dragged.id;
          saveEvents(evs);
        }
      });
    });
  }
}

class HtmlEditor {
  constructor(selector) {
    const target = document.querySelector(selector);
    if (!target) throw new Error(`Element ${selector} not found`);

    if (target.tagName === "TEXTAREA") {
      this.targetTextarea = target;
      this.targetTextarea.style.display = "none";
      this.container = document.createElement("div");
      this.targetTextarea.parentNode.insertBefore(
        this.container,
        this.targetTextarea.nextSibling,
      );
    } else {
      this.container = target;
    }

    const isInline =
      target.tagName === "TEXTAREA" ||
      this.container.parentNode !== document.body;
    this.container.style.cssText = `width: 100%; max-width: 100%; min-height: 700px; position: relative; overflow: visible; border: 1px solid #e2e8f0; border-radius: 20px; z-index: ${isInline ? "10" : "9999"}; box-sizing: border-box; background: #ffffff; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);`;

    this.onUpdate = null;
    this.changeCallbacks = [];
    this.selectedElement = null;
    this.history = [];
    this.historyIndex = -1;
    this.isSidebarOpen = false;
    this.isInspectorLocked = false;
    this.inspectedElement = null; // Track pinned element
    this.searchQuery = "";
    this.draggedElForEvent = null;
    this.eventManager = new HtmlEventManager(this);

    this.elements = [
      // Basic HTML Elements
      {
        id: "section",
        label: "Section Container",
        icon: "fa-square",
        cat: "Basic Elements",
        desc: "Main content wrapper",
        html: '<section style="padding: 60px 20px; background: #ffffff; border: 1px solid #f1f5f9; min-height: 100px; border-radius: 12px; margin-bottom: 20px;"></section>',
      },
      {
        id: "grid2",
        label: "2 Col Grid",
        icon: "fa-columns",
        cat: "Basic Elements",
        desc: "Responsive 2 columns",
        html: '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; margin: 20px 0;"><div style="padding: 24px; border: 1px dashed #e2e8f0; border-radius: 12px; min-height: 100px;">Column A</div><div style="padding: 24px; border: 1px dashed #e2e8f0; border-radius: 12px; min-height: 100px;">Column B</div></div>',
      },
      {
        id: "grid3",
        label: "3 Col Grid",
        icon: "fa-th-large",
        cat: "Basic Elements",
        desc: "Responsive 3 columns",
        html: '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 20px 0;"><div style="padding: 20px; border: 1px dashed #e2e8f0; border-radius: 12px; min-height: 80px;">Col 1</div><div style="padding: 20px; border: 1px dashed #e2e8f0; border-radius: 12px; min-height: 80px;">Col 2</div><div style="padding: 20px; border: 1px dashed #e2e8f0; border-radius: 12px; min-height: 80px;">Col 3</div></div>',
      },
      {
        id: "h1",
        label: "Heading H1",
        icon: "fa-heading",
        cat: "Basic Elements",
        desc: "Main title",
        html: '<h1 style="font-size: 2.5rem; font-weight: 800; color: #0f172a; margin-bottom: 1rem;">Heading 1</h1>',
      },
      {
        id: "h2",
        label: "Heading H2",
        icon: "fa-header",
        cat: "Basic Elements",
        desc: "Section title",
        html: '<h2 style="font-size: 2rem; font-weight: 700; color: #1e293b; margin-bottom: 0.8rem;">Heading 2</h2>',
      },
      {
        id: "h3",
        label: "Heading H3",
        icon: "fa-header",
        cat: "Basic Elements",
        desc: "Subsection title",
        html: '<h3 style="font-size: 1.5rem; font-weight: 700; color: #334155; margin-bottom: 0.6rem;">Heading 3</h3>',
      },
      {
        id: "h4",
        label: "Heading H4",
        icon: "fa-header",
        cat: "Basic Elements",
        desc: "Small title",
        html: '<h4 style="font-size: 1.25rem; font-weight: 600; color: #475569; margin-bottom: 0.5rem;">Heading 4</h4>',
      },
      {
        id: "h5",
        label: "Heading H5",
        icon: "fa-header",
        cat: "Basic Elements",
        desc: "Mini title",
        html: '<h5 style="font-size: 1rem; font-weight: 600; color: #64748b; margin-bottom: 0.4rem;">Heading 5</h5>',
      },
      {
        id: "h6",
        label: "Heading H6",
        icon: "fa-header",
        cat: "Basic Elements",
        desc: "Tiny title",
        html: '<h6 style="font-size: 0.875rem; font-weight: 600; color: #94a3b8; margin-bottom: 0.4rem;">Heading 6</h6>',
      },
      {
        id: "heading",
        label: "Heading H1",
        icon: "fa-heading",
        cat: "Basic Elements",
        desc: "Large title text",
        html: '<h1 style="margin-bottom: 16px; font-size: 2.5rem; font-weight: 800; color: #0f172a; line-height: 1.2;">Enter Your Title Here</h1>',
      },
      {
        id: "subheading",
        label: "Heading H2",
        icon: "fa-header",
        cat: "Basic Elements",
        desc: "Medium section title",
        html: '<h2 style="margin-bottom: 12px; font-size: 1.8rem; font-weight: 700; color: #1e293b;">Section Subtitle</h2>',
      },
      {
        id: "text",
        label: "Paragraph",
        icon: "fa-align-left",
        cat: "Basic Elements",
        desc: "Standard body text",
        html: '<p style="margin-bottom: 16px; line-height: 1.7; color: #475569; font-size: 1rem;">Start typing your content here. You can customize styles in the inspector.</p>',
      },
      {
        id: "button",
        label: "Button",
        icon: "fa-mouse-pointer",
        cat: "Basic Elements",
        desc: "Standard call to action",
        html: '<button style="background: #4f46e5; color: white; padding: 12px 24px; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; transition: 0.2s;">Action Button</button>',
      },
      {
        id: "divider",
        label: "Divider",
        icon: "fa-minus",
        cat: "Basic Elements",
        desc: "Horizontal separator",
        html: '<hr style="border: 0; height: 1px; background: #e2e8f0; margin: 32px 0;">',
      },
      {
        id: "spacer",
        label: "Spacer",
        icon: "fa-arrows-alt-v",
        cat: "Basic Elements",
        desc: "Vertical empty space",
        html: '<div style="height: 40px; width: 100%;"></div>',
      },
      {
        id: "image",
        label: "Image",
        icon: "fa-image",
        cat: "Basic Elements",
        desc: "Image placeholder",
        html: '<div class="he-media-wrap" style="margin-bottom: 24px;"><img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800" style="width: 100%; border-radius: 12px;"></div>',
      },
      {
        id: "link",
        label: "Link (Anchor)",
        icon: "fa-link",
        cat: "Basic Elements",
        desc: "Clickable URL",
        html: '<a href="#" style="color: #4f46e5; text-decoration: none; font-weight: 600; border-bottom: 1px solid transparent; transition: 0.2s;">Learn More <i class="fa fa-arrow-right" style="font-size: 10px;"></i></a>',
      },
      {
        id: "ul",
        label: "Bullet List",
        icon: "fa-list-ul",
        cat: "Basic Elements",
        desc: "Unordered bullet points",
        html: '<ul style="padding-left: 20px; color: #475569; line-height: 1.8; margin-bottom: 20px;"><li>First list item</li><li>Second list item</li><li>Third list item</li></ul>',
      },
      {
        id: "ol",
        label: "Numbered List",
        icon: "fa-list-ol",
        cat: "Basic Elements",
        desc: "Sequential list",
        html: '<ol style="padding-left: 20px; color: #475569; line-height: 1.8; margin-bottom: 20px;"><li>Step one here</li><li>Step two here</li><li>Step three here</li></ol>',
      },
      {
        id: "icon",
        label: "Icon Element",
        icon: "fa-star",
        cat: "Basic Elements",
        desc: "FontAwesome icon",
        html: '<div style="padding: 10px; display: inline-block;"><i class="fa fa-rocket" style="color: #4f46e5; font-size: 24px;"></i></div>',
      },
      {
        id: "quote",
        label: "Blockquote",
        icon: "fa-quote-left",
        cat: "Basic Elements",
        desc: "Featured text/quote",
        html: '<blockquote style="border-left: 4px solid #4f46e5; padding: 16px 24px; background: #f8fafc; font-style: italic; color: #334155; margin: 24px 0; border-radius: 0 12px 12px 0;">"The best design is the one that solves the problem elegantly."</blockquote>',
      },
      // Forms
      {
        id: "form",
        label: "Form Container",
        icon: "fa-wpforms",
        cat: "Forms",
        desc: "Form wrapper",
        html: '<form style="padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;"></form>',
      },
      {
        id: "label",
        label: "Label",
        icon: "fa-font",
        cat: "Forms",
        desc: "Input label",
        html: '<label style="display: block; font-size: 14px; font-weight: 600; color: #334155; margin-bottom: 8px;">Field Label</label>',
      },
      {
        id: "input",
        label: "Text Input",
        icon: "fa-i-cursor",
        cat: "Forms",
        desc: "Single line text",
        html: '<input type="text" placeholder="Type here..." style="width: 100%; padding: 10px 14px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; color: #1e293b; outline: none; transition: 0.2s; margin-bottom: 16px;">',
      },
      {
        id: "textarea",
        label: "Textarea",
        icon: "fa-paragraph",
        cat: "Forms",
        desc: "Multi-line text",
        html: '<textarea placeholder="Write something..." style="width: 100%; padding: 10px 14px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; color: #1e293b; outline: none; min-height: 100px; resize: vertical; margin-bottom: 16px;"></textarea>',
      },
      {
        id: "select",
        label: "Select Dropdown",
        icon: "fa-chevron-down",
        cat: "Forms",
        desc: "Choice menu",
        html: '<select style="width: 100%; padding: 10px 14px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; color: #1e293b; outline: none; cursor: pointer; margin-bottom: 16px;"><option value="">Select an option</option><option value="1">Option 1</option><option value="2">Option 2</option></select>',
      },
      {
        id: "checkbox_group",
        label: "Checkbox",
        icon: "fa-check-square",
        cat: "Forms",
        desc: "Binary choice",
        html: '<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;"><input type="checkbox" style="width: 18px; height: 18px; cursor: pointer;"><span style="font-size: 14px; color: #475569;">Check this option</span></div>',
      },
      {
        id: "radio_group",
        label: "Radio Button",
        icon: "fa-dot-circle",
        cat: "Forms",
        desc: "Single choice",
        html: '<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;"><input type="radio" style="width: 18px; height: 18px; cursor: pointer;"><span style="font-size: 14px; color: #475569;">Select this option</span></div>',
      },

      // Premium UI/UX Components
      {
        id: "hero",
        label: "Hero Section",
        icon: "fa-star",
        cat: "Premium Blocks",
        desc: "High-impact top section",
        html: '<div style="padding: 100px 40px; background: linear-gradient(to right, #4f46e5, #7c3aed); color: white; border-radius: 24px; text-align: center; margin-bottom: 40px;"> <h1 style="font-size: 3.5rem; font-weight: 900; margin-bottom: 20px;">The Next Generation</h1> <p style="font-size: 1.25rem; opacity: 0.9; max-width: 700px; margin: 0 auto 32px;">Transform your workflow with our advanced visual building tools.</p> <div style="display: flex; gap: 16px; justify-content: center;"> <button style="background: white; color: #4f46e5; padding: 14px 32px; border: none; border-radius: 10px; font-weight: 700;">Get Started</button> <button style="background: rgba(255,255,255,0.1); color: white; border: 1px solid rgba(255,255,255,0.3); padding: 14px 32px; border-radius: 10px; font-weight: 600;">Learn More</button> </div> </div>',
      },
      {
        id: "feature_card",
        label: "Feature Card",
        icon: "fa-id-card",
        cat: "Premium Blocks",
        desc: "Modern card with icon",
        html: '<div style="padding: 32px; background: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); margin-bottom: 24px; transition: 0.3s;"> <div style="width: 48px; height: 48px; background: #eef2ff; color: #4f46e5; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; font-size: 20px;"><i class="fa fa-rocket"></i></div> <h3 style="margin-bottom: 12px; color: #0f172a;">Lightning Fast</h3> <p style="color: #64748b; line-height: 1.6;">Optimized for speed and performance right out of the box.</p> </div>',
      },
      {
        id: "testimonial",
        label: "Testimonial",
        icon: "fa-quote-left",
        cat: "Premium Blocks",
        desc: "User review block",
        html: '<div style="padding: 32px; background: #f8fafc; border-radius: 20px; border-left: 4px solid #4f46e5; margin-bottom: 24px;"> <p style="font-size: 1.1rem; font-style: italic; color: #1e293b; margin-bottom: 20px; line-height: 1.6;">"This platform has completely changed how we build and deploy our landing pages."</p> <div style="display: flex; align-items: center; gap: 12px;"> <div style="width: 40px; height: 40px; border-radius: 50%; background: #4f46e5;"></div> <div><div style="font-weight: 700; color: #0f172a;">Sarah Jenkins</div><div style="font-size: 12px; color: #64748b;">Product Designer at TechFlow</div></div> </div> </div>',
      },
      {
        id: "pricing_table",
        label: "Pricing Plan",
        icon: "fa-tags",
        cat: "Premium Blocks",
        desc: "Clean pricing card",
        html: '<div style="padding: 48px 32px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 24px; text-align: center; margin-bottom: 24px; position: relative; overflow: hidden;"> <div style="font-size: 14px; font-weight: 800; color: #4f46e5; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px;">Professional</div> <div style="font-size: 48px; font-weight: 800; color: #0f172a; margin-bottom: 24px;">$49<span style="font-size: 18px; color: #64748b; font-weight: 500;">/mo</span></div> <ul style="list-style: none; padding: 0; margin-bottom: 32px; color: #475569; line-height: 2.2;"> <li><i class="fa fa-check" style="color: #10b981; margin-right: 8px;"></i> Unlimited Projects</li> <li><i class="fa fa-check" style="color: #10b981; margin-right: 8px;"></i> Priority Support</li> <li><i class="fa fa-check" style="color: #10b981; margin-right: 8px;"></i> Custom Domains</li> </ul> <button style="width: 100%; background: #0f172a; color: white; padding: 14px; border: none; border-radius: 12px; font-weight: 700; cursor: pointer;">Select Plan</button> </div>',
      },
      {
        id: "cta_banner",
        label: "CTA Banner",
        icon: "fa-bullhorn",
        cat: "Premium Blocks",
        desc: "Call to action ribbon",
        html: '<div style="background: #0f172a; color: white; padding: 40px; border-radius: 20px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 24px; margin-bottom: 32px;"> <div> <h3 style="margin: 0 0 8px; font-size: 1.5rem;">Ready to start building?</h3> <p style="margin: 0; color: #94a3b8;">Join over 10,000 creators using our tools today.</p> </div> <button style="background: #4f46e5; color: white; padding: 14px 32px; border: none; border-radius: 10px; font-weight: 700;">Get Started Now</button> </div>',
      },
      {
        id: "faq_item",
        label: "FAQ Accordion",
        icon: "fa-question-circle",
        cat: "Premium Blocks",
        desc: "Question & answer pair",
        html: '<div style="margin-bottom: 12px; background: white; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;"> <div style="padding: 20px; font-weight: 600; color: #0f172a; display: flex; justify-content: space-between; align-items: center; cursor: pointer;"> <span>How secure is my data?</span> <i class="fa fa-chevron-down" style="font-size: 12px; color: #64748b;"></i> </div> <div style="padding: 0 20px 20px; color: #64748b; font-size: 0.95rem; line-height: 1.6;"> We use industry-standard encryption to ensure your data is always safe and private. </div> </div>',
      },
    ];

    this.styleOptions = {
      "Sizing & Display": [
        {
          label: "Display",
          prop: "display",
          type: "select",
          options: [
            "block",
            "flex",
            "grid",
            "inline-block",
            "inline-flex",
            "none",
          ],
        },
        {
          label: "Overflow",
          prop: "overflow",
          type: "select",
          options: ["visible", "hidden", "scroll", "auto"],
        },
        { label: "Width", prop: "width", unit: true },
        { label: "Height", prop: "height", unit: true },
        { label: "Z-Index", prop: "zIndex" },
      ],
      "Colors & Appearance": [
        { label: "Text", prop: "color", type: "color" },
        { label: "Background", prop: "backgroundColor", type: "color" },
        { label: "Border", prop: "borderColor", type: "color" },
        { label: "Opacity", prop: "opacity", placeholder: "0 to 1" },
      ],
      Spacing: [
        {
          label: "Padding",
          type: "quad",
          props: ["paddingTop", "paddingRight", "paddingBottom", "paddingLeft"],
          unit: true,
        },
        {
          label: "Margin",
          type: "quad",
          props: ["marginTop", "marginRight", "marginBottom", "marginLeft"],
          unit: true,
        },
      ],
      "Flexbox (Active if Flex)": [
        {
          label: "Direction",
          prop: "flexDirection",
          type: "select",
          options: ["row", "row-reverse", "column", "column-reverse"],
        },
        {
          label: "Flex Wrap",
          prop: "flexWrap",
          type: "select",
          options: ["nowrap", "wrap", "wrap-reverse"],
        },
        {
          label: "Justify Content",
          prop: "justifyContent",
          type: "select",
          options: [
            "flex-start",
            "flex-end",
            "center",
            "space-between",
            "space-around",
            "space-evenly",
          ],
        },
        {
          label: "Align Items",
          prop: "alignItems",
          type: "select",
          options: ["stretch", "flex-start", "flex-end", "center", "baseline"],
        },
        { label: "Gap", prop: "gap", placeholder: "e.g. 20px" },
      ],
      Typography: [
        { label: "Size", prop: "fontSize", unit: true },
        {
          label: "Weight",
          prop: "fontWeight",
          type: "select",
          options: [
            "100",
            "200",
            "300",
            "400",
            "500",
            "600",
            "700",
            "800",
            "900",
          ],
        },
        {
          label: "Align",
          prop: "textAlign",
          type: "select",
          options: ["left", "center", "right", "justify"],
        },
        { label: "Line Height", prop: "lineHeight" },
        {
          label: "Transform",
          prop: "textTransform",
          type: "select",
          options: ["none", "capitalize", "uppercase", "lowercase"],
        },
        {
          label: "Style",
          prop: "fontStyle",
          type: "select",
          options: ["normal", "italic"],
        },
        {
          label: "Decoration",
          prop: "textDecoration",
          type: "select",
          options: ["none", "underline", "line-through"],
        },
      ],
      "Effects & Borders": [
        { label: "Radius", prop: "borderRadius", unit: true },
        {
          label: "Shadow",
          prop: "boxShadow",
          placeholder: "0 4px 6px rgba(0,0,0,0.1)",
        },
        { label: "B-Width", prop: "borderWidth", unit: true },
        {
          label: "B-Style",
          prop: "borderStyle",
          type: "select",
          options: [
            "none",
            "solid",
            "dashed",
            "dotted",
            "double",
            "groove",
            "ridge",
            "inset",
            "outset",
          ],
        },
      ],
    };

    this.tagAttributes = {
      IMG: [
        { label: "Source", prop: "src", type: "textarea" },
        { label: "Alt Text", prop: "alt" },
        { label: "Title", prop: "title" },
      ],
      A: [
        { label: "Link URL", prop: "href" },
        {
          label: "Target",
          prop: "target",
          type: "select",
          options: ["_self", "_blank", "_parent", "_top"],
        },
        { label: "Title", prop: "title" },
      ],
      INPUT: [
        {
          label: "Type",
          prop: "type",
          type: "select",
          options: [
            "text",
            "password",
            "email",
            "number",
            "tel",
            "url",
            "date",
            "checkbox",
            "radio",
            "file",
          ],
        },
        { label: "Placeholder", prop: "placeholder" },
        { label: "Value", prop: "value" },
        { label: "Name", prop: "name" },
        { label: "Required", prop: "required", type: "checkbox" },
      ],
      TEXTAREA: [
        { label: "Placeholder", prop: "placeholder" },
        { label: "Rows", prop: "rows" },
        { label: "Name", prop: "name" },
        { label: "Required", prop: "required", type: "checkbox" },
      ],
      SELECT: [
        { label: "Name", prop: "name" },
        { label: "Required", prop: "required", type: "checkbox" },
      ],
      FORM: [
        { label: "Action", prop: "action" },
        {
          label: "Method",
          prop: "method",
          type: "select",
          options: ["get", "post"],
        },
      ],
      LABEL: [{ label: "For (ID)", prop: "htmlFor" }],
      VIDEO: [
        { label: "Source", prop: "src", type: "textarea" },
        { label: "Poster URL", prop: "poster" },
        { label: "Autoplay", prop: "autoplay", type: "checkbox" },
        { label: "Controls", prop: "controls", type: "checkbox" },
        { label: "Loop", prop: "loop", type: "checkbox" },
      ],
      AUDIO: [
        { label: "Source", prop: "src", type: "textarea" },
        { label: "Autoplay", prop: "autoplay", type: "checkbox" },
        { label: "Controls", prop: "controls", type: "checkbox" },
      ],
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
    const deps = [
      {
        id: "he-fa",
        url: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",
      },
      {
        id: "he-font",
        url: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap",
      },
    ];
    deps.forEach((d) => {
      if (!document.querySelector(`link[href*="${d.url}"]`)) {
        const l = document.createElement("link");
        l.rel = "stylesheet";
        l.href = d.url;
        document.head.appendChild(l);
      }
    });

    const s = document.createElement("style");
    s.textContent = `
            :root { --he-p: #4f46e5; --he-p-light: #eef2ff; --he-bg: #f8fafc; --he-t: #0f172a; --he-ts: #64748b; --he-b: #e2e8f0; --he-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); }
            .he-main { display: flex; flex-direction: column; width: 100%; font-family: 'Plus Jakarta Sans', sans-serif; background: var(--he-bg); position: relative; height: 100%; overflow: hidden; border-radius: 20px; }
            .he-toolbar { min-height: 72px; background: white; border-bottom: 1px solid var(--he-b); padding: 0 24px; display: flex; align-items: center; gap: 12px; z-index: 1000; position: sticky; top: 0; flex-shrink: 0; flex-wrap: wrap; box-sizing: border-box; }
            .he-group { display: flex; gap: 6px; padding-right: 12px; border-right: 1px solid var(--he-b); align-items: center; }
            .he-group:last-child { border-right: none; }
            .he-btn { background: transparent; border: 1px solid transparent; padding: 10px; border-radius: 8px; cursor: pointer; color: var(--he-ts); font-size: 14px; transition: 0.2s; display: flex; align-items: center; gap: 6px; }
            .he-btn:hover { background: var(--he-p-light); color: var(--he-p); }
            .he-btn.active { background: var(--he-p-light); color: var(--he-p); border-color: rgba(79, 70, 229, 0.2); }
            
            .he-modal-overlay { 
                position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(8px);
                z-index: 2000001; display: none; align-items: center; justify-content: center; opacity: 0; transition: 0.3s;
            }
            .he-modal-overlay.active { display: flex; opacity: 1; }
            .he-modal { 
                background: white; width: 800px; max-width: 90%; height: 650px; border-radius: 24px; box-shadow: var(--he-shadow);
                display: flex; flex-direction: column; overflow: hidden; transform: scale(0.95); transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
            .he-modal-overlay.active .he-modal { transform: scale(1); }
            
            .he-modal-head { padding: 24px 32px; border-bottom: 1px solid var(--he-b); display: flex; justify-content: space-between; align-items: center; }
            .he-modal-title { font-size: 20px; font-weight: 800; color: var(--he-t); }

            .he-search-wrap { padding: 20px 32px; border-bottom: 1px solid var(--he-b); background: #f8fafc; position: relative; }
            .he-search-input { width: 100%; padding: 14px 18px 14px 44px; border: 1px solid var(--he-b); border-radius: 14px; font-size: 14px; outline: none; background: white; transition: 0.2s; box-sizing: border-box; }
            .he-search-input:focus { border-color: var(--he-p); box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1); }
            .he-search-icon { position: absolute; left: 48px; top: 35px; color: var(--he-ts); pointer-events: none; font-size: 15px; }

            .he-elements-list { flex: 1; overflow-y: auto; padding: 24px 32px 40px; display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; }
            .he-item { display: flex; align-items: center; gap: 16px; padding: 16px; border-radius: 18px; cursor: pointer; transition: 0.2s; border: 1px solid var(--he-b); background: #fff; }
            .he-item:hover { background: var(--he-p-light); border-color: var(--he-p); transform: translateY(-3px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); }
            .he-item i { width: 44px; height: 44px; background: var(--he-bg); color: var(--he-p); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 18px; border: 1px solid var(--he-b); flex-shrink: 0; }
            .he-item:hover i { background: var(--he-p); color: white; border-color: var(--he-p); }
            .he-cat-tag { grid-column: 1 / -1; font-size: 11px; font-weight: 800; color: var(--he-ts); text-transform: uppercase; letter-spacing: 2px; margin: 30px 0 10px; padding-left: 4px; }
            .he-cat-tag:first-child { margin-top: 0; }

            .he-workspace { display: flex; flex: 1; flex-direction: column; align-items: center; background: #f1f5f9; overflow: auto; padding: 0; position: relative; z-index: 1; scroll-behavior: smooth; width: 100%; }
            .he-canvas { width: 100%;min-height:100%;margin-bottom:50px; background: white; border-radius: 0; padding: 40px; position: relative; outline: none; box-sizing: border-box; box-shadow: none; transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
            
            .he-inspected { outline: 2px solid var(--he-p) !important; outline-offset: -2px !important; box-shadow: inset 0 0 0 1000px rgba(79, 70, 229, 0.05) !important; }
            
            .he-hover-box { position: absolute; pointer-events: none; border: 2px solid var(--he-p); border-style: dashed; z-index: 99999; display: none; border-radius: 4px; }
            .he-floating-overlay { position: absolute; display: none; pointer-events: none; z-index: 100000; outline: 2px solid var(--he-p); outline-offset: 4px; border-radius: 4px; }
            .he-floating-controls { position: absolute; top: -48px; right: -4px; background: var(--he-p); display: flex; gap: 4px; padding: 6px; border-radius: 10px 10px 0 0; pointer-events: auto; box-shadow: var(--he-shadow); }
            .he-ctrl-btn { color: white; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; cursor: pointer; border-radius: 6px; font-size: 13px; transition: 0.2s; }
            .he-ctrl-btn:hover { background: rgba(255,255,255,0.2); transform: scale(1.1); }

            .he-sidebar { width: 380px; background: white; border-left: 1px solid var(--he-b); position: fixed; right: 0; top: 0; bottom: 0; transform: translateX(100%); transition: 0.4s cubic-bezier(0.4, 0, 0.2, 1); z-index: 1000000; display: flex; flex-direction: column; box-shadow: -20px 0 50px rgba(0,0,0,0.05); }
            .he-sidebar.open { transform: translateX(0); }
            .he-sidebar-head { padding: 16px 20px; border-bottom: 1px solid var(--he-b); display: flex; justify-content: space-between; align-items: center; background: white; }
            .he-sidebar-body { flex: 1; overflow-y: auto; padding: 16px; }
            
            .he-s-group { margin-bottom: 20px; }
            .he-s-title { font-size: 11px; font-weight: 800; color: var(--he-t); margin-bottom: 14px; display: flex; align-items: center; gap: 8px; text-transform: uppercase; letter-spacing: 1px; opacity: 0.8; }
            .he-s-title::after { content: ''; flex: 1; height: 1px; background: var(--he-b); opacity: 0.5; }
            
            .he-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
            .he-field { margin-bottom: 10px; }
            .he-label { display: block; font-size: 9px; font-weight: 800; margin-bottom: 6px; color: var(--he-ts); text-transform: uppercase; letter-spacing: 0.8px; }
            
            .he-input-group { display: flex; border: 1px solid var(--he-b); border-radius: 8px; overflow: hidden; background: white; transition: 0.2s; height: 32px; box-sizing: border-box; }
            .he-input-group:hover { border-color: #cbd5e1; }
            .he-input-group:focus-within { border-color: var(--he-p); box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.08); }
            
            .he-input { width: 100%; height: 32px; padding: 6px 12px; border: 1px solid var(--he-b); border-radius: 8px; font-size: 12px; outline: none; transition: 0.2s; font-family: inherit; background: white; box-sizing: border-box; color: var(--he-t); }
            .he-input::placeholder { color: #94a3b8; }
            .he-input:hover { border-color: #cbd5e1; }
            .he-input:focus { border-color: var(--he-p); background: white; box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.08); }
            
            .he-group-input { border: none !important; border-radius: 0 !important; box-shadow: none !important; padding: 4px 10px !important; flex: 1; height: 100% !important; background: transparent !important; }
            .he-unit-select { border: none !important; background: transparent !important; padding: 0 6px !important; font-size: 10px !important; font-weight: 700 !important; color: var(--he-ts) !important; cursor: pointer; width: auto !important; border-left: 1px solid var(--he-b) !important; outline: none !important; height: 100% !important; }

            /* Color Tool - High End Refinement */
            .he-color-tool { display: flex; align-items: center; background: white; border: 1px solid var(--he-b); padding: 0; border-radius: 8px; transition: 0.2s; height: 32px; box-sizing: border-box; overflow: hidden; }
            .he-color-tool:hover { border-color: #cbd5e1; }
            .he-color-tool:focus-within { border-color: var(--he-p); box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.08); }
            .he-color-swatch-wrap { position: relative; width: 34px; height: 100%; cursor: pointer; flex-shrink: 0; border-right: 1px solid var(--he-b); }
            .he-color-input-native { position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; cursor: pointer; border: none; padding: 0; background: none; opacity: 0; }
            .he-color-hex { font-size: 11px; font-weight: 700; color: var(--he-t); text-transform: uppercase; border: none !important; background: transparent !important; outline: none !important; width: 100%; flex: 1; padding: 0 12px; height: 100%; box-shadow: none !important; margin: 0 !important; }

            /* Quad Layout */
            .he-quad-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px; }
            .he-quad-item { display: flex; flex-direction: column; gap: 2px; }
            .he-quad-label { font-size: 9px; font-weight: 800; color: #94a3b8; text-transform: uppercase; }
            .he-quad-input { height: 28px !important; padding: 4px 6px !important; font-size: 11px !important; }

            .he-canvas-placeholder { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; color: #cbd5e1; pointer-events: none; width: 80%; max-width: 600px; user-select: none; z-index: 1; }
            .he-canvas-placeholder i { background: linear-gradient(135deg, #e2e8f0, #cbd5e1); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 80px; margin-bottom: 24px; }
            .he-canvas-placeholder.hidden { display: none; }
            
            /* Responsive Toggles */
            .he-device-toggles { display: flex; gap: 4px; background: var(--he-bg); padding: 4px; border-radius: 10px; border: 1px solid var(--he-b); }
            .he-d-btn { width: 36px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 6px; cursor: pointer; color: var(--he-ts); transition: 0.2s; }
            .he-d-btn:hover { color: var(--he-p); }
            .he-d-btn.active { background: white; color: var(--he-p); box-shadow: 0 2px 4px rgba(0,0,0,0.05); }

            /* Context Menu */
            .he-context-menu { position: fixed; background: white; border: 1px solid var(--he-b); border-radius: 12px; box-shadow: var(--he-shadow); padding: 8px; z-index: 2000000; display: none; min-width: 200px; }
            .he-context-item { padding: 10px 16px; border-radius: 8px; cursor: pointer; color: var(--he-t); font-size: 13px; font-weight: 600; display: flex; align-items: center; gap: 10px; transition: 0.2s; }
            .he-context-item:hover { background: var(--he-p-light); color: var(--he-p); }
            .he-context-item i { width: 20px; text-align: center; font-size: 14px; }

            .he-fullscreen { position: fixed !important; top: 0 !important; left: 0 !important; width: 100vw !important; height: 100vh !important; z-index: 2147483647 !important; margin: 0 !important; border-radius: 0 !important; }
            
            .he-drop-indicator { position: absolute; height: 4px; background: var(--he-p); border-radius: 2px; z-index: 100000; pointer-events: none; display: none; transition: top 0.1s, left 0.1s, width 0.1s; }
            body.he-dragging * { cursor: grabbing !important; }

            /* Raw Content Maximize */
            .he-s-group.maximized { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: white; z-index: 100; padding: 16px; margin: 0; display: flex; flex-direction: column; }
            .he-s-group.maximized textarea { flex: 1; height: 100% !important; margin-top: 10px; font-size: 13px !important; line-height: 1.5; }
        `;
    document.head.appendChild(s);
  }

  renderUI() {
    this.container.innerHTML = `
            <div class="he-main">
                <header class="he-toolbar">
                    <div class="he-group">
                        <button type="button" class="he-btn" id="he-fs" title="Full Screen"><i class="fa fa-expand-arrows-alt"></i></button>
                        <button type="button" class="he-btn" id="he-u" title="Undo"><i class="fa fa-undo-alt"></i></button>
                        <button type="button" class="he-btn" id="he-r" title="Redo"><i class="fa fa-redo-alt"></i></button>
                    </div>
                    <div class="he-group">
                        <div class="he-device-toggles">
                            <div class="he-d-btn active" data-device="desktop" title="Desktop View"><i class="fa fa-desktop"></i></div>
                            <div class="he-d-btn" data-device="tablet" title="Tablet View"><i class="fa fa-tablet-alt"></i></div>
                            <div class="he-d-btn" data-device="mobile" title="Mobile View"><i class="fa fa-mobile-alt"></i></div>
                        </div>
                    </div>
                    <div class="he-group">
                        <button type="button" class="he-btn" data-cmd="bold" title="Bold"><i class="fa fa-bold"></i></button>
                        <button type="button" class="he-btn" data-cmd="italic" title="Italic"><i class="fa fa-italic"></i></button>
                        <button type="button" class="he-btn" data-cmd="underline" title="Underline"><i class="fa fa-underline"></i></button>
                    </div>
                    <div class="he-group">
                        <button type="button" class="he-btn" id="he-el-trigger" style="background: var(--he-p); color: white; font-weight: 700; border-radius: 12px; padding: 10px 20px; border: none;"><i class="fa fa-plus-circle" style="margin-right: 4px;"></i> Add Elements</button>
                    </div>
                    <div class="he-group" style="margin-left:auto; border: none;">
                        <button type="button" class="he-btn" id="he-clear" title="Clear Canvas" style="color:#ef4444"><i class="fa fa-trash-alt"></i> Clear</button>
                        <button type="button" class="he-btn" id="he-ts" title="Open Inspector"><i class="fa fa-sliders-h"></i> Inspector</button>
                        <button type="button" class="he-btn" id="he-ex" style="background: var(--he-t); color: white; font-weight: 700; padding: 10px 24px; border-radius: 12px; border: none;">Export</button>
                    </div>
                </header>
                <div class="he-workspace">
                    <div class="he-canvas" id="he-canvas" contenteditable="true"></div>
                    <div class="he-canvas-placeholder" id="he-canvas-placeholder">
                        <i class="fa fa-layer-group"></i>
                        <h2 style="font-size: 28px; font-weight: 800; color: #0f172a; margin: 0 0 12px;">Build Something Beautiful</h2>
                        <p style="font-size: 16px; color: #64748b; margin: 0;">Click "Add Elements" to start dragging components onto your canvas.</p>
                    </div>
                    <div class="he-hover-box" id="he-hover-box"></div>
                    <div class="he-drop-indicator" id="he-drop-indicator"></div>
                    <div class="he-floating-overlay" id="he-floating-overlay">
                        <div class="he-floating-controls">
                            <div class="he-ctrl-btn" id="he-drag-handle" draggable="true" title="Drag to Move"><i class="fa fa-arrows-alt"></i></div>
                            <div class="he-ctrl-btn" data-a="up" title="Move Up"><i class="fa fa-arrow-up"></i></div>
                            <div class="he-ctrl-btn" data-a="down" title="Move Down"><i class="fa fa-arrow-down"></i></div>
                            <div class="he-ctrl-btn" data-a="clone" title="Duplicate"><i class="fa fa-copy"></i></div>
                            <div class="he-ctrl-btn" data-a="del" style="color: #fda4af;" title="Delete"><i class="fa fa-trash-alt"></i></div>
                        </div>
                    </div>
                </div>
                <aside class="he-sidebar" id="he-sidebar">
                    <div class="he-sidebar-head">
                        <div style="display:flex;align-items:center;gap:8px">
                            <button type="button" class="he-btn" id="he-lock" title="Lock Inspector" style="padding:4px 8px;font-size:12px"><i class="fa fa-thumbtack"></i></button>
                            <span style="font-weight: 800; font-size: 16px; color: var(--he-t)">Inspector</span>
                        </div>
                        <button type="button" class="he-btn" id="he-cs"><i class="fa fa-times"></i></button>
                    </div>
                    <div class="he-sidebar-body" id="he-props"></div>
                </aside>

                <div class="he-modal-overlay" id="he-library-modal">
                    <div class="he-modal">
                        <div class="he-modal-head">
                            <div class="he-modal-title">Components Library</div>
                            <button type="button" class="he-btn" id="he-close-modal"><i class="fa fa-times"></i></button>
                        </div>
                        <div class="he-search-wrap">
                            <i class="fa fa-search he-search-icon"></i>
                            <input type="text" class="he-search-input" id="he-element-search" placeholder="Search for components (e.g. Hero, Grid, Button)...">
                        </div>
                        <div class="he-elements-list" id="he-elements-list">
                            ${this.renderElementsList()}
                        </div>
                    </div>
                </div>

                <div class="he-context-menu" id="he-context-menu">
                    <div class="he-context-item" data-action="inspect"><i class="fa fa-sliders-h"></i> Open Inspector</div>
                    <div class="he-context-item" data-action="add"><i class="fa fa-plus-circle"></i> Add Element</div>
                    <div style="height: 1px; background: var(--he-b); margin: 4px 0;"></div>
                    <div class="he-context-item" data-action="del" style="color: #ef4444;"><i class="fa fa-trash-alt"></i> Delete Element</div>
                </div>
            </div>
        `;
    this.canvas = document.getElementById("he-canvas");
    this.canvasPlaceholder = document.getElementById("he-canvas-placeholder");
    this.sidebar = document.getElementById("he-sidebar");
    this.props = document.getElementById("he-props");
    this.floatingOverlay = document.getElementById("he-floating-overlay");
    this.hoverBox = document.getElementById("he-hover-box");
    this.elementsList = document.getElementById("he-elements-list");
    this.libraryModal = document.getElementById("he-library-modal");
    this.contextMenu = document.getElementById("he-context-menu");
    this.dropIndicator = document.getElementById("he-drop-indicator");
  }

  renderElementsList() {
    const query = this.searchQuery.toLowerCase();
    const filtered = this.elements.filter(
      (e) =>
        e.label.toLowerCase().includes(query) ||
        e.desc.toLowerCase().includes(query) ||
        e.cat.toLowerCase().includes(query),
    );
    const cats = [...new Set(filtered.map((e) => e.cat))];
    cats.sort((a, b) => (a === "Basic Elements" ? -1 : 1));
    if (filtered.length === 0)
      return `<div style="grid-column: 1/-1; text-align: center; padding: 60px; color: #94a3b8;"><i class="fa fa-search fa-3x" style="display:block;margin-bottom:20px;opacity:0.2"></i>No elements found for "${this.searchQuery}"</div>`;
    return cats
      .map(
        (cat) => `
            <div class="he-cat-tag">${cat}</div>
            ${filtered
              .filter((e) => e.cat === cat)
              .map(
                (el) => `
                <div class="he-item" data-el="${el.id}">
                    <i class="fa ${el.icon}"></i>
                    <div>
                        <div style="font-weight: 700; font-size: 14px; color: var(--he-t)">${el.label}</div>
                        <div style="font-size: 11px; color: var(--he-ts)">${el.desc}</div>
                    </div>
                </div>
            `,
              )
              .join("")}
        `,
      )
      .join("");
  }

  setupEventListeners() {
    document.getElementById("he-el-trigger").addEventListener("click", (e) => {
      e.stopPropagation();
      this.openLibrary();
    });
    document
      .getElementById("he-close-modal")
      .addEventListener("click", () => this.closeLibrary());
    this.libraryModal.addEventListener("click", (e) => {
      if (e.target === this.libraryModal) this.closeLibrary();
    });

    const searchInput = document.getElementById("he-element-search");
    searchInput.addEventListener("input", (e) => {
      this.searchQuery = e.target.value;
      this.elementsList.innerHTML = this.renderElementsList();
      this.attachItemEvents();
    });

    this.attachItemEvents();

    document.getElementById("he-ts").addEventListener("click", () => {
      this.isSidebarOpen = !this.isSidebarOpen;
      this.sidebar.classList.toggle("open", this.isSidebarOpen);
      if (this.isSidebarOpen && this.selectedElement) this.renderProps();
    });
    document.getElementById("he-cs").addEventListener("click", () => {
      this.isSidebarOpen = false;
      this.sidebar.classList.remove("open");
    });
    document.getElementById("he-lock").addEventListener("click", () => {
      this.isInspectorLocked = !this.isInspectorLocked;
      document.getElementById("he-lock").classList.toggle("active", this.isInspectorLocked);
    });
    document
      .getElementById("he-fs")
      .addEventListener("click", () => this.toggleFullScreen());

    this.container.querySelectorAll("[data-cmd]").forEach((b) =>
      b.addEventListener("mousedown", (e) => {
        e.preventDefault();
        this.canvas.focus();
        document.execCommand(b.dataset.cmd, false, null);
        this.saveToHistory();
      }),
    );

    this.canvas.addEventListener("mousedown", (e) => {
      e.stopPropagation();
      this.select(e.target);
    });
    this.canvas.addEventListener("mousemove", (e) => {
      let t = e.target;
      if (t === this.canvas || !this.canvas.contains(t)) {
        this.hoverBox.style.display = "none";
        return;
      }
      this.updateOverlayPos(t, this.hoverBox);
    });

    this.canvas.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      this.select(e.target);
      this.contextMenu.style.display = "block";
      this.contextMenu.style.top = e.clientY + "px";
      this.contextMenu.style.left = e.clientX + "px";
    });

    this.contextMenu.querySelectorAll("[data-action]").forEach((item) => {
      item.addEventListener("click", (ev) => {
        ev.stopPropagation();
        const action = item.dataset.action;
        if (action === "inspect") this.openSidebar();
        if (action === "add") this.openLibrary();
        if (
          action === "del" &&
          this.selectedElement &&
          this.selectedElement !== this.canvas
        ) {
          this.selectedElement.remove();
          this.deselect();
          this.saveToHistory();
          this.triggerC();
        }
        this.contextMenu.style.display = "none";
      });
    });

    document.addEventListener("click", () => {
      this.contextMenu.style.display = "none";
    });

    this.floatingOverlay.querySelectorAll("[data-a]").forEach((btn) => {
      btn.addEventListener("click", (ev) => {
        ev.stopPropagation();
        const a = btn.dataset.a;
        const e = this.selectedElement;
        if (!e || e === this.canvas) return;
        if (a === "del") {
          e.remove();
          this.deselect();
        } else if (a === "clone") {
          const c = e.cloneNode(true);
          e.after(c);
          this.select(c);
        } else if (a === "up" && e.previousElementSibling)
          e.parentNode.insertBefore(e, e.previousElementSibling);
        else if (a === "down" && e.nextElementSibling)
          e.parentNode.insertBefore(e.nextElementSibling, e);
        this.updateOverlay();
        this.saveToHistory();
        this.triggerC();
      });
    });

    this.container.querySelectorAll("[data-device]").forEach((btn) => {
      btn.addEventListener("click", () => {
        this.container
          .querySelectorAll("[data-device]")
          .forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        const device = btn.dataset.device;
        if (device === "mobile") this.canvas.style.width = "375px";
        else if (device === "tablet") this.canvas.style.width = "768px";
        else this.canvas.style.width = "100%";
        setTimeout(() => this.updateOverlay(), 350);
      });
    });

    window.addEventListener("resize", () => this.updateOverlay());
    this.canvas.addEventListener("input", () => {
      this.triggerC();
      this.updateOverlay();
    });

    this.canvas.addEventListener("paste", (e) => {
      e.preventDefault();
      const cd = e.clipboardData || window.clipboardData;
      if (!cd) return;
      const html = cd.getData("text/html");
      const text = cd.getData("text/plain");
      const cleaned = this.sanitizePastedHtml(html, text);
      document.execCommand("insertHTML", false, cleaned);
      this.saveToHistory();
      this.triggerC();
    });
    document
      .getElementById("he-u")
      .addEventListener("click", () => this.undo());
    document
      .getElementById("he-r")
      .addEventListener("click", () => this.redo());
    document.getElementById("he-ex").addEventListener("click", () => {
      const b = new Blob([this.getContent()], { type: "text/html" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(b);
      a.download = "export.html";
      a.click();
    });

    document.getElementById("he-clear").addEventListener("click", () => {
      if (
        confirm(
          "Are you sure you want to clear the entire canvas? This cannot be undone.",
        )
      ) {
        this.canvas.innerHTML = "";
        this.deselect();
        this.saveToHistory();
        this.triggerC();
        localStorage.removeItem("he-autosave");
      }
    });

    // Drag & Drop Reordering Logic
    let draggedEl = null;
    let dropTarget = null;
    let dropPosition = 'after'; // 'before' or 'after'
    
    const dragHandle = document.getElementById("he-drag-handle");
    dragHandle.addEventListener("dragstart", (e) => {
      if (!this.selectedElement) return;
      draggedEl = this.selectedElement;
      this.draggedElForEvent = draggedEl;
      draggedEl.style.opacity = "0.4";
      document.body.classList.add('he-dragging');
      e.dataTransfer.setDragImage(draggedEl, 10, 10);
    });

    dragHandle.addEventListener("dragend", () => {
      if (draggedEl) draggedEl.style.opacity = "1";
      document.body.classList.remove('he-dragging');
      this.dropIndicator.style.display = 'none';
      draggedEl = null;
      this.updateOverlay();
    });

    this.canvas.addEventListener("dragover", (e) => {
      e.preventDefault();
      if (!draggedEl) return;
      const target = e.target.closest("#he-canvas > *");
      if (target && target !== draggedEl && target !== this.canvas) {
        const rect = target.getBoundingClientRect();
        const ws = this.canvas.parentNode.getBoundingClientRect();
        const isAfter = e.clientY - rect.top > rect.height / 2;
        
        dropTarget = target;
        dropPosition = isAfter ? 'after' : 'before';

        this.dropIndicator.style.display = 'block';
        this.dropIndicator.style.width = rect.width + 'px';
        this.dropIndicator.style.left = rect.left - ws.left + this.canvas.parentNode.scrollLeft + 'px';
        const top = isAfter ? rect.bottom : rect.top;
        this.dropIndicator.style.top = top - ws.top + this.canvas.parentNode.scrollTop - 2 + 'px';
      }
    });

    this.canvas.addEventListener("drop", (e) => {
      e.preventDefault();
      if (draggedEl && dropTarget) {
        if (dropPosition === 'after') dropTarget.after(draggedEl);
        else dropTarget.before(draggedEl);
        
        this.saveToHistory();
        this.triggerC();
        this.updateOverlay();
      }
      this.dropIndicator.style.display = 'none';
    });
  }

  openLibrary() {
    this.libraryModal.classList.add("active");
    document.getElementById("he-element-search").focus();
  }
  closeLibrary() {
    this.libraryModal.classList.remove("active");
  }

  attachItemEvents() {
    this.container.querySelectorAll("[data-el]").forEach((i) => {
      i.onclick = null;
      i.addEventListener("click", (e) => {
        e.stopPropagation();
        this.insertElement(
          this.elements.find((el) => el.id === i.dataset.el).html,
        );
        this.libraryModal.classList.remove("active");
      });
    });
  }

  insertElement(h) {
    const d = document.createElement("div");
    d.innerHTML = h;
    const e = d.firstElementChild;
    if (this.selectedElement && this.selectedElement !== this.canvas) {
      const sel = this.selectedElement;
      if (
        sel.classList.contains("he-media-wrap") ||
        ["IMG", "VIDEO", "AUDIO", "HR", "BR"].includes(sel.tagName)
      )
        sel.after(e);
      else sel.appendChild(e);
    } else {
      this.canvas.appendChild(e);
    }
    this.select(e);
    e.scrollIntoView({ behavior: "smooth", block: "center" });
    this.saveToHistory();
    this.triggerC();
  }

  openSidebar() {
    this.isSidebarOpen = true;
    this.sidebar.classList.add("open");
    this.renderProps();
  }
  toggleFullScreen() {
    this.container.classList.toggle("he-fullscreen");
    const btn = document.getElementById("he-fs");
    const icon = btn.querySelector("i");
    if (this.container.classList.contains("he-fullscreen")) {
      icon.className = "fa fa-compress-arrows-alt";
      btn.title = "Exit Full Screen";
      document.body.style.overflow = "hidden";
    } else {
      icon.className = "fa fa-expand-arrows-alt";
      btn.title = "Full Screen";
      document.body.style.overflow = "";
    }
    this.updateOverlay();
  }
  select(e) {
    this.selectedElement = e;
    this.updateOverlay();

    if (!this.isInspectorLocked) {
      this.inspectedElement = e;
      this.container
        .querySelectorAll(".he-inspected")
        .forEach((x) => x.classList.remove("he-inspected"));
      e.classList.add("he-inspected");
      if (this.isSidebarOpen) this.renderProps();
    }
  }
  deselect() {
    this.selectedElement = null;
    this.inspectedElement = null;
    this.floatingOverlay.style.display = "none";
    this.container
      .querySelectorAll(".he-inspected")
      .forEach((x) => x.classList.remove("he-inspected"));
    this.props.innerHTML = "";
  }
  updateOverlay() {
    if (!this.selectedElement || this.selectedElement === this.canvas) {
      this.floatingOverlay.style.display = "none";
      return;
    }
    this.updateOverlayPos(this.selectedElement, this.floatingOverlay);
  }
  updateOverlayPos(e, overlay) {
    const rect = e.getBoundingClientRect();
    const ws = this.canvas.parentNode.getBoundingClientRect();
    overlay.style.display = "block";
    overlay.style.width = rect.width + "px";
    overlay.style.height = rect.height + "px";
    overlay.style.top =
      rect.top - ws.top + this.canvas.parentNode.scrollTop + "px";
    overlay.style.left =
      rect.left - ws.left + this.canvas.parentNode.scrollLeft + "px";
  }

  renderProps() {
    if (!this.inspectedElement) return;
    const e = this.inspectedElement;
    let el = e;
    if (e.classList.contains("he-media-wrap"))
      el = e.querySelector("audio, video, img") || e;
    const tag = el.tagName;
    let h = `<div class="he-s-group"><div class="he-s-title">Attributes</div>`;

    const attrs = this.tagAttributes[tag] || [];
    attrs.forEach((a) => {
      const val =
        a.type === "checkbox"
          ? el.hasAttribute(a.prop)
            ? "checked"
            : ""
          : el.getAttribute(a.prop) || "";
      if (a.prop === "src") {
        h += `<div class="he-field">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
                            <label class="he-label" style="margin:0">${a.label}</label>
                            <button type="button" class="he-btn" id="he-upload-trigger" style="padding:2px 8px;font-size:10px;height:20px;background:var(--he-p-light);color:var(--he-p)"><i class="fa fa-upload"></i> Upload</button>
                        </div>
                        <textarea class="he-input" style="height:60px;padding:8px;resize:none" data-prop="src" data-attr="true">${val}</textarea>
                        <input type="file" id="he-hidden-file" style="display:none" accept="image/*,video/*,audio/*">
                      </div>`;
      } else if (a.type === "select") {
        h += `<div class="he-field"><label class="he-label">${a.label}</label><select class="he-input" data-prop="${a.prop}" data-attr="true" style="height:32px;padding:4px">${a.options.map((o) => `<option value="${o}" ${val === o ? "selected" : ""}>${o}</option>`).join("")}</select></div>`;
      } else if (a.type === "checkbox") {
        h += `<div style="display:flex;align-items:center;gap:8px;margin-bottom:12px"><input type="checkbox" class="he-attr-check" data-prop="${a.prop}" ${val} style="width:16px;height:16px;cursor:pointer"><span style="font-size:11px;font-weight:700;color:var(--he-ts);text-transform:uppercase">${a.label}</span></div>`;
      } else if (a.type === "textarea") {
        h += `<div class="he-field"><label class="he-label">${a.label}</label><textarea class="he-input" style="height:60px;padding:8px;resize:none" data-prop="${a.prop}" data-attr="true">${val}</textarea></div>`;
      } else {
        h += `<div class="he-field"><label class="he-label">${a.label}</label><input type="text" class="he-input" data-prop="${a.prop}" data-attr="true" value="${val}"></div>`;
      }
    });

    h += `<div class="he-grid-2">`;
    h += this.renderF(el, { label: "ID", prop: "id", attr: true });
    h += this.renderF(el, { label: "Class", prop: "className", attr: true });
    h += `</div></div>`;

    // Child Manager for SELECT
    if (tag === "SELECT") {
      h += `<div class="he-s-group"><div class="he-s-title">Options Manager</div>`;
      const options = Array.from(el.querySelectorAll("option"));
      options.forEach((opt, idx) => {
        h += `<div class="he-field" style="background:var(--he-bg);padding:10px;border-radius:8px;margin-bottom:8px">
                        <div class="he-grid-2">
                            <div><label class="he-label">Label</label><input type="text" class="he-input he-opt-label" data-idx="${idx}" value="${opt.textContent}"></div>
                            <div><label class="he-label">Value</label><input type="text" class="he-input he-opt-value" data-idx="${idx}" value="${opt.value}"></div>
                        </div>
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px">
                            <label style="display:flex;align-items:center;gap:6px;font-size:10px;font-weight:700;color:var(--he-ts);text-transform:uppercase;cursor:pointer">
                                <input type="radio" name="he-opt-selected" class="he-opt-selected" data-idx="${idx}" ${opt.selected ? "checked" : ""}> Selected
                            </label>
                            <button class="he-btn he-opt-del" data-idx="${idx}" style="color:#ef4444;padding:4px"><i class="fa fa-trash-alt"></i></button>
                        </div>
                      </div>`;
      });
      h += `<button class="he-btn" id="he-add-opt" style="width:100%;background:var(--he-p-light);color:var(--he-p);font-weight:700;margin-top:8px"><i class="fa fa-plus-circle"></i> Add New Option</button></div>`;
    }

    for (const [g, ps] of Object.entries(this.styleOptions)) {
      h += `<div class="he-s-group"><div class="he-s-title">${g}</div><div class="${g === "Spacing" ? "" : "he-grid-2"}">${ps.map((p) => this.renderStyleF(el, p)).join("")}</div></div>`;
    }
    h += this.eventManager.render(el);
    h += `<div class="he-s-group" id="he-raw-wrap">
                <div class="he-s-title" style="display:flex;justify-content:space-between;align-items:center">
                    <span>Raw Content</span>
                    <button type="button" class="he-btn" id="he-raw-toggle" style="padding:2px 8px;font-size:10px;height:20px;background:var(--he-p-light);color:var(--he-p)"><i class="fa fa-expand"></i></button>
                </div>
                <textarea class="he-input" style="height:100px;font-family:monospace;font-size:11px" data-content="innerHTML">${el.innerHTML.trim()}</textarea>
              </div>`;
    this.props.innerHTML = h;

    const rawToggle = this.props.querySelector("#he-raw-toggle");
    const rawWrap = this.props.querySelector("#he-raw-wrap");
    if (rawToggle && rawWrap) {
      rawToggle.addEventListener("click", () => {
        const isMax = rawWrap.classList.toggle("maximized");
        rawToggle.innerHTML = isMax
          ? '<i class="fa fa-compress"></i>'
          : '<i class="fa fa-expand"></i>';
        this.props.style.overflow = isMax ? "hidden" : "auto";
      });
    }

    this.props
      .querySelectorAll(
        ".he-input, .he-unit-select, .he-color-input-native, .he-color-hex, .he-attr-check",
      )
      .forEach((i) => {
        i.addEventListener("input", (ev) => {
          const prop = i.dataset.prop || i.dataset.unitFor;
          if (!prop && !i.dataset.content) return;
          const inp = prop
            ? this.props.querySelector(
                `input[data-prop="${prop}"]:not(.he-color-input-native):not(.he-attr-check), textarea[data-prop="${prop}"], select[data-prop="${prop}"]`,
              )
            : null;
          const sel = this.props.querySelector(
            `select[data-unit-for="${prop}"]`,
          );
          const native = this.props.querySelector(
            `.he-color-input-native[data-prop="${prop}"]`,
          );
          const check = this.props.querySelector(
            `.he-attr-check[data-prop="${prop}"]`,
          );
          const swatch = native ? native.parentElement : null;
          let val = ev.target.value;
          if (sel && inp) val = inp.value + sel.value;
          if (check) {
            if (check.checked) el.setAttribute(prop, "");
            else el.removeAttribute(prop);
          } else if (native && swatch) {
            swatch.style.background = val;
            if (i.classList.contains("he-color-input-native")) {
              const hex = this.props.querySelector(
                `.he-color-hex[data-prop="${prop}"]`,
              );
              if (hex) hex.value = val;
            } else {
              native.value = val;
            }
          }

          if (i.dataset.attr && !check) el.setAttribute(prop, val);
          else if (i.dataset.content) el.innerHTML = val;
          else if (!check) el.style[prop] = val;
          this.updateOverlay();
          this.triggerC();
        });
      });

    this.props.querySelectorAll(".he-color-swatch-wrap").forEach((sw) => {
      sw.addEventListener("click", () => {
        const native = sw.querySelector(".he-color-input-native");
        if (native) native.click();
      });
    });

    const uploadTrigger = this.props.querySelector("#he-upload-trigger");
    const hiddenFile = this.props.querySelector("#he-hidden-file");
    const srcTextarea = this.props.querySelector('textarea[data-prop="src"]');
    if (uploadTrigger && hiddenFile) {
      uploadTrigger.addEventListener("click", () => hiddenFile.click());
      hiddenFile.addEventListener("change", (ev) => {
        const file = ev.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
          const b64 = e.target.result;
          if (srcTextarea) {
            srcTextarea.value = b64;
            el.setAttribute("src", b64);
            this.updateOverlay();
            this.triggerC();
          }
        };
        reader.readAsDataURL(file);
      });
    }

    // Options Manager Listeners
    this.props.querySelectorAll(".he-opt-label").forEach((i) => {
      i.addEventListener("input", () => {
        el.options[i.dataset.idx].textContent = i.value;
        this.triggerC();
      });
    });
    this.props.querySelectorAll(".he-opt-value").forEach((i) => {
      i.addEventListener("input", () => {
        el.options[i.dataset.idx].value = i.value;
        this.triggerC();
      });
    });
    this.props.querySelectorAll(".he-opt-selected").forEach((i) => {
      i.addEventListener("change", () => {
        Array.from(el.options).forEach(
          (o, idx) => (o.selected = idx == i.dataset.idx),
        );
        this.triggerC();
      });
    });
    this.props.querySelectorAll(".he-opt-del").forEach((i) => {
      i.addEventListener("click", () => {
        el.options[i.dataset.idx].remove();
        this.renderProps();
        this.saveToHistory();
        this.triggerC();
      });
    });

    const addOpt = this.props.querySelector("#he-add-opt");
    if (addOpt) {
      addOpt.addEventListener("click", () => {
        const opt = document.createElement("option");
        opt.value = "new";
        opt.textContent = "New Option";
        el.appendChild(opt);
        this.renderProps();
        this.saveToHistory();
        this.triggerC();
      });
    }
    this.eventManager.attachEvents(el, this.props);
  }

  renderF(el, p) {
    return `<div class="he-field"><label class="he-label">${p.label}</label><input type="text" class="he-input" data-prop="${p.prop}" data-attr="true" value="${el.getAttribute(p.prop) || ""}"></div>`;
  }
  renderStyleF(el, p) {
    if (p.type === "quad") {
      const sides = ["Top", "Right", "Bottom", "Left"];
      const inputs = p.props
        .map((prop, idx) => {
          const { n, u } = this.parseVal(el.style[prop]);
          return `<div class="he-quad-item"><span class="he-quad-label">${sides[idx]}</span><div class="he-input-group"><input type="text" class="he-input he-group-input he-quad-input" data-prop="${prop}" value="${n}"><select class="he-unit-select" data-unit-for="${prop}">${["px", "%", "em", "rem", "vh", "vw"].map((unit) => `<option value="${unit}" ${u === unit ? "selected" : ""}>${unit}</option>`).join("")}</select></div></div>`;
        })
        .join("");
      return `<div class="he-field"><label class="he-label">${p.label}</label><div class="he-quad-grid">${inputs}</div></div>`;
    }
    const cur = el.style[p.prop] || "";
    let i = "";
    if (p.type === "color") {
      const hex = this.resolveColor(cur);
      i = `<div class="he-color-tool"><div class="he-color-swatch-wrap" style="background: ${hex}"><input type="color" class="he-color-input-native" data-prop="${p.prop}" value="${hex}"></div><input type="text" class="he-color-hex" data-prop="${p.prop}" value="${hex}"></div>`;
    } else if (p.type === "select")
      i = `<select class="he-input" data-prop="${p.prop}">${p.options.map((o) => `<option value="${o}" ${cur === o ? "selected" : ""}>${o}</option>`).join("")}</select>`;
    else if (p.unit) {
      const { n, u } = this.parseVal(cur);
      i = `<div class="he-input-group"><input type="text" class="he-input he-group-input" data-prop="${p.prop}" value="${n}"><select class="he-unit-select" data-unit-for="${p.prop}">${["px", "%", "em", "rem", "vh", "vw"].map((unit) => `<option value="${unit}" ${u === unit ? "selected" : ""}>${unit}</option>`).join("")}</select></div>`;
    } else
      i = `<input type="text" class="he-input" data-prop="${p.prop}" placeholder="${p.placeholder || ""}" value="${cur}">`;
    return `<div class="he-field"><label class="he-label">${p.label}</label>${i}</div>`;
  }

  parseVal(v) {
    if (!v) return { n: "", u: "px" };
    const n = parseFloat(v);
    if (isNaN(n)) return { n: "", u: "px" };
    const u = v.replace(n.toString(), "").trim() || "px";
    return { n, u };
  }

  resolveColor(color) {
    if (!color || color === "transparent") return "#ffffff";
    if (color.startsWith("#") && color.length === 7) return color;
    const temp = document.createElement("div");
    temp.style.color = color;
    document.body.appendChild(temp);
    const rgb = getComputedStyle(temp).color;
    document.body.removeChild(temp);
    const m = rgb.match(/\d+/g);
    if (!m || m.length < 3) return "#ffffff";
    return (
      "#" +
      m
        .slice(0, 3)
        .map((x) => parseInt(x).toString(16).padStart(2, "0"))
        .join("")
    );
  }
  sanitizePastedHtml(html, text) {
    if (!html || !html.trim()) {
      const t = text || "";
      const escaped = t.replace(/[&<>]/g, (c) =>
        ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c],
      );
      return escaped.replace(/\r?\n/g, "<br>");
    }
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    tmp
      .querySelectorAll(
        "script, style, meta, link, base, title, noscript, head, html, body",
      )
      .forEach((n) => {
        if (n.tagName === "BODY" || n.tagName === "HTML" || n.tagName === "HEAD") {
          while (n.firstChild) n.parentNode.insertBefore(n.firstChild, n);
        }
        n.remove();
      });
    tmp.querySelectorAll("*").forEach((el) => {
      [...el.attributes].forEach((a) => {
        const name = a.name.toLowerCase();
        const val = a.value || "";
        if (name.startsWith("on")) el.removeAttribute(a.name);
        else if (
          (name === "href" || name === "src" || name === "xlink:href") &&
          /^\s*javascript:/i.test(val)
        )
          el.removeAttribute(a.name);
        else if (name.startsWith("data-mce-") || name === "data-pm-slice")
          el.removeAttribute(a.name);
      });
      if (el.className && /^(Mso|Apple-)/i.test(el.className))
        el.removeAttribute("class");
      if (
        el.tagName &&
        (el.tagName.includes(":") || /^(O|W|M):/i.test(el.tagName))
      ) {
        while (el.firstChild) el.parentNode.insertBefore(el.firstChild, el);
        el.remove();
      }
    });
    tmp.querySelectorAll("[class]").forEach((el) => {
      if (!el.getAttribute("class").trim()) el.removeAttribute("class");
    });
    return tmp.innerHTML;
  }
  getContent() {
    const cl = this.canvas.cloneNode(true);
    cl.querySelectorAll(
      ".he-floating-overlay, .he-hover-box, .he-placeholder, .he-canvas-placeholder",
    ).forEach((x) => x.remove());
    cl.querySelectorAll(".he-media-wrap").forEach((w) => {
      const media = w.querySelector("audio, video, img");
      if (media) w.replaceWith(media);
    });
    cl.querySelectorAll("*").forEach((x) => {
      x.classList.remove("he-selected");
      x.removeAttribute("contenteditable");
    });
    return cl.innerHTML.trim();
  }
  onChange(cb) {
    this.changeCallbacks.push(cb);
  }
  triggerC() {
    const h = this.getContent();
    if (this.targetTextarea) this.targetTextarea.value = h;
    this.changeCallbacks.forEach((x) => x(h));
    this.updatePlaceholder();

    // Auto-Save Persistence (clean content only, no placeholder leakage)
    localStorage.setItem("he-autosave", h);
  }
  updatePlaceholder() {
    if (!this.canvasPlaceholder) return;
    const stripped = this.canvas.innerHTML
      .replace(/<br\s*\/?>/gi, "")
      .replace(/&nbsp;/gi, "")
      .replace(/<(div|p|span)>\s*<\/\1>/gi, "")
      .trim();
    const hasText = this.canvas.textContent.replace(/\s/g, "").length > 0;
    const isEmpty = stripped === "" && !hasText;
    this.canvasPlaceholder.classList.toggle("hidden", !isEmpty);
  }
  saveToHistory() {
    const h = this.canvas.innerHTML;
    if (this.history[this.historyIndex] === h) return;
    this.history = this.history.slice(0, this.historyIndex + 1);
    this.history.push(h);
    if (this.history.length > 50) this.history.shift();
    this.historyIndex = this.history.length - 1;
  }
  undo() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.canvas.innerHTML = this.history[this.historyIndex];
      this.triggerC();
    }
  }
  redo() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.canvas.innerHTML = this.history[this.historyIndex];
      this.triggerC();
    }
  }
  setValue(h) {
    // Strip any legacy placeholder content from imported/stored HTML
    const tmp = document.createElement("div");
    tmp.innerHTML = h || "";
    tmp
      .querySelectorAll(".he-placeholder, .he-canvas-placeholder")
      .forEach((p) => p.remove());
    this.canvas.innerHTML = tmp.innerHTML;
    this.saveToHistory();
    this.triggerC();
  }
  getStored() {
    return localStorage.getItem("he-autosave");
  }
}
