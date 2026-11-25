import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { emptyPortfolio, loadPortfolio, savePortfolio } from '../utils/storage';
import { generatePortfolioHTML } from '../utils/generatePortfolio';

const SECTIONS = [
  { id: 'profile', label: 'Profile' },
  { id: 'skills', label: 'Skills' },
  { id: 'education', label: 'Education' },
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
];

const TEMPLATES = [
  { id: 'workshop', label: 'Workshop' },
  { id: 'editorial', label: 'Editorial' },
  { id: 'minimal', label: 'Minimal' },
  { id: 'noir', label: 'Noir' },
  { id: 'aurora', label: 'Aurora' },
];

const EDUCATION_FIELDS = [
  { name: 'institution', label: 'Institution', required: true, placeholder: 'e.g. KL University' },
  { name: 'degree', label: 'Degree', required: true, placeholder: 'e.g. B.Tech in CSE' },
  { name: 'years', label: 'Years', required: true, placeholder: 'e.g. 2024 – 2028' },
  { name: 'grade', label: 'Grade (optional)', placeholder: 'e.g. 8.5 CGPA' },
];

const EXPERIENCE_FIELDS = [
  { name: 'role', label: 'Role', required: true, placeholder: 'e.g. Frontend Intern' },
  { name: 'company', label: 'Company / Club / Event', required: true, placeholder: 'e.g. Smart India Hackathon' },
  { name: 'duration', label: 'Duration', required: true, placeholder: 'e.g. Jun 2026 – Aug 2026' },
  { name: 'description', label: 'Description', multiline: true, placeholder: 'What did you do?' },
];

const PROJECT_FIELDS = [
  { name: 'title', label: 'Title', required: true, placeholder: 'e.g. Expense Tracker' },
  { name: 'description', label: 'Description', multiline: true, placeholder: 'What does it do?' },
  { name: 'link', label: 'Link (optional)', placeholder: 'https://...' },
];

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [active, setActive] = useState('profile');
  const [data, setData] = useState(() => loadPortfolio(user) ?? emptyPortfolio('', user));
  const [status, setStatus] = useState('');
  const [previewHtml, setPreviewHtml] = useState(null);

  // Save on every change so nothing is lost on refresh
  useEffect(() => {
    savePortfolio(user, data);
  }, [user, data]);

  const update = (changes) => setData((prev) => ({ ...prev, ...changes }));

  const fileName = () => {
    const slug = (data.name || 'my')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    return `${slug || 'my'}-portfolio.html`;
  };

  // Step 1: build the HTML and show it in a preview (no download yet)
  const generate = () => {
    try {
      setPreviewHtml(generatePortfolioHTML(data));
      setStatus('');
    } catch (err) {
      console.error('Portfolio generation failed:', err);
      setStatus('Error: ' + err.message);
    }
  };

  // Step 2: only after the user has seen the preview, download it
  const download = () => {
    if (!previewHtml) return;
    const blob = new Blob([previewHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const name = fileName();

    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);

    setStatus(`Downloaded ${name}`);
  };

  const closePreview = () => setPreviewHtml(null);

  // Close the preview with the Escape key
  useEffect(() => {
    if (!previewHtml) return undefined;
    const onKey = (e) => e.key === 'Escape' && setPreviewHtml(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [previewHtml]);

  return (
    <div className="dash">
      <aside className="sidebar">
        <div className="brand">
          <div className="auth-mark">PM</div>
          <span>Portfolio Maker</span>
        </div>

        <nav>
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              className={`nav-btn ${active === s.id ? 'active' : ''}`}
              onClick={() => setActive(s.id)}
            >
              {s.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-foot">
          <p className="muted small">{user}</p>
          <button className="btn block" onClick={generate}>Generate &amp; preview</button>
          {status && <p className="muted small">{status}</p>}
          <button className="btn secondary block" onClick={logout}>Log out</button>
        </div>
      </aside>

      <main className="main" key={active}>
        {active === 'profile' && <ProfileSection data={data} update={update} />}
        {active === 'skills' && <SkillsSection data={data} update={update} />}
        {active === 'education' && <EducationSection data={data} update={update} />}
        {active === 'experience' && <ExperienceSection data={data} update={update} />}
        {active === 'projects' && <ProjectsSection data={data} update={update} />}
      </main>

      {previewHtml && (
        <div className="preview-overlay" onClick={closePreview}>
          <div
            className="preview-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Portfolio preview"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="preview-bar">
              <div>
                <strong>Preview</strong>
                <span className="muted small"> · {fileName()}</span>
              </div>
              <div className="preview-actions">
                <button className="btn secondary small" onClick={closePreview}>
                  Back to editor
                </button>
                <button className="btn small" onClick={download}>
                  ⬇ Download
                </button>
              </div>
            </div>
            <iframe
              className="preview-frame"
              title="Portfolio preview"
              srcDoc={previewHtml}
              sandbox="allow-popups allow-popups-to-escape-sandbox"
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Shared pieces ---------- */

function Section({ title, sub, children }) {
  const num = String(SECTIONS.findIndex((s) => s.label === title) + 1).padStart(2, '0');
  return (
    <div className="section">
      <header className="section-head">
        <span className="eyebrow">Section {num}</span>
        <h2>{title}</h2>
        {sub && <p className="muted">{sub}</p>}
      </header>
      {children}
    </div>
  );
}

function Field({ label, multiline, ...props }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {multiline ? <textarea rows={3} {...props} /> : <input {...props} />}
    </label>
  );
}

function ItemForm({ fields, onAdd, buttonText }) {
  const blank = () => Object.fromEntries(fields.map((f) => [f.name, '']));
  const [form, setForm] = useState(blank);

  const set = (name) => (e) => setForm((prev) => ({ ...prev, [name]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    onAdd(form);
    setForm(blank());
  };

  return (
    <form className="card item-form" onSubmit={submit}>
      {fields.map((f) => (
        <Field
          key={f.name}
          label={f.required ? `${f.label} *` : f.label}
          multiline={f.multiline}
          placeholder={f.placeholder}
          required={f.required}
          value={form[f.name]}
          onChange={set(f.name)}
        />
      ))}
      <button className="btn" type="submit">{buttonText}</button>
    </form>
  );
}

/* ---------- Sections ---------- */

function ProfileSection({ data, update }) {
  const set = (key) => (e) => update({ [key]: e.target.value });

  return (
    <Section title="Profile" sub="The top of your portfolio.">
      <div className="card form-grid">
        <Field label="Full name" value={data.name} onChange={set('name')} />
        <Field
          label="Tagline"
          value={data.tagline}
          onChange={set('tagline')}
          placeholder="e.g. CSE student who loves building web apps"
        />
        <Field label="Bio" multiline value={data.bio} onChange={set('bio')} />
        <Field label="Contact email" type="email" value={data.contactEmail} onChange={set('contactEmail')} />
        <Field label="GitHub URL" value={data.github} onChange={set('github')} />
        <Field label="LinkedIn URL" value={data.linkedin} onChange={set('linkedin')} />
        <label className="field">
          <span className="field-label">Template</span>
          <select value={data.template} onChange={set('template')}>
            {TEMPLATES.map((t) => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>
        </label>
      </div>
    </Section>
  );
}

function SkillsSection({ data, update }) {
  const [text, setText] = useState('');

  const add = (e) => {
    e.preventDefault();
    const skill = text.trim();
    if (!skill || data.skills.includes(skill)) return;
    update({ skills: [...data.skills, skill] });
    setText('');
  };

  const remove = (skill) => update({ skills: data.skills.filter((s) => s !== skill) });

  return (
    <Section title="Skills" sub="Languages, frameworks, tools.">
      <form className="card inline-form" onSubmit={add}>
        <input
          placeholder="e.g. React"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button className="btn" type="submit">Add</button>
      </form>

      <div className="chips">
        {data.skills.map((s) => (
          <span key={s} className="chip">
            {s}
            <button type="button" onClick={() => remove(s)} aria-label={`Remove ${s}`}>×</button>
          </span>
        ))}
        {data.skills.length === 0 && <p className="muted">No skills yet.</p>}
      </div>
    </Section>
  );
}

function EducationSection({ data, update }) {
  const add = (item) =>
    update({ education: [...data.education, { id: crypto.randomUUID(), ...item }] });

  const remove = (id) =>
    update({ education: data.education.filter((x) => x.id !== id) });

  return (
    <Section title="Education" sub="Schools, degrees and grades.">
      <ItemForm fields={EDUCATION_FIELDS} onAdd={add} buttonText="Add education" />

      <div className="item-list">
        {data.education.map((e) => (
          <div className="item-card" key={e.id}>
            <div className="grow">
              <h3>{e.degree}</h3>
              <p className="item-meta">
                {e.institution} · {e.years}{e.grade ? ` · ${e.grade}` : ''}
              </p>
            </div>
            <button className="btn danger small" onClick={() => remove(e.id)}>Delete</button>
          </div>
        ))}
      </div>
    </Section>
  );
}

function ExperienceSection({ data, update }) {
  const add = (item) =>
    update({ experience: [...data.experience, { id: crypto.randomUUID(), ...item }] });

  const remove = (id) =>
    update({ experience: data.experience.filter((x) => x.id !== id) });

  return (
    <Section title="Experience" sub="Internships, clubs, hackathons, anything you did.">
      <ItemForm fields={EXPERIENCE_FIELDS} onAdd={add} buttonText="Add experience" />

      <div className="item-list">
        {data.experience.map((e) => (
          <div className="item-card" key={e.id}>
            <div className="grow">
              <h3>{e.role}</h3>
              <p className="item-meta">{e.company} · {e.duration}</p>
              {e.description && <p className="item-desc">{e.description}</p>}
            </div>
            <button className="btn danger small" onClick={() => remove(e.id)}>Delete</button>
          </div>
        ))}
      </div>
    </Section>
  );
}

function ProjectsSection({ data, update }) {
  const [dragFrom, setDragFrom] = useState(null);
  const [overIdx, setOverIdx] = useState(null);
  const projects = data.projects;

  const add = (item) =>
    update({ projects: [...projects, { id: crypto.randomUUID(), ...item }] });

  const remove = (id) =>
    update({ projects: projects.filter((x) => x.id !== id) });

  const move = (from, to) => {
    if (from === null || from === to) return;
    const list = [...projects];
    const [moved] = list.splice(from, 1);
    list.splice(to, 0, moved);
    update({ projects: list });
  };

  return (
    <Section title="Projects" sub="Drag the ⋮⋮ handle to reorder.">
      <ItemForm fields={PROJECT_FIELDS} onAdd={add} buttonText="Add project" />

      <div className="item-list">
        {projects.map((p, i) => {
          const classes = [
            'item-card',
            'project-card',
            dragFrom === i ? 'dragging' : '',
            overIdx === i && dragFrom !== null && dragFrom !== i ? 'drag-over' : '',
          ].join(' ');

          return (
            <div
              key={p.id}
              className={classes}
              draggable
              onDragStart={(e) => {
                setDragFrom(i);
                e.dataTransfer.setData('text/plain', '');
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setOverIdx(i);
              }}
              onDragLeave={() => setOverIdx(null)}
              onDrop={(e) => {
                e.preventDefault();
                move(dragFrom, i);
                setDragFrom(null);
                setOverIdx(null);
              }}
              onDragEnd={() => {
                setDragFrom(null);
                setOverIdx(null);
              }}
            >
              <span className="drag-handle" title="Drag to reorder">⋮⋮</span>
              <div className="grow">
                <h3>{p.title}</h3>
                {p.description && <p className="item-desc">{p.description}</p>}
                {p.link && <a href={p.link} target="_blank" rel="noreferrer">{p.link}</a>}
              </div>
              <button className="btn danger small" onClick={() => remove(p.id)}>Delete</button>
            </div>
          );
        })}
      </div>
    </Section>
  );
}