const esc = (value = '') =>
  String(value).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[c]);

const safeUrl = (value = '') => {
  const v = value.trim();
  return /^(https?:\/\/|mailto:)/i.test(v) ? esc(v) : '#';
};

const FONTS = `
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">`;

const BASE_CSS = `
*{box-sizing:border-box}
html,body{margin:0}
body{background:var(--bg);background-image:var(--bg-image,none);color:var(--ink);font-family:var(--body);font-size:16px;line-height:1.6;-webkit-font-smoothing:antialiased;min-height:100vh}
.wrap{max-width:860px;margin:0 auto;padding:5rem 1.5rem 6rem}
h1,h2,h3{font-family:var(--heading);font-weight:500;letter-spacing:-.02em;line-height:1.15;margin:0 0 .4em;color:var(--ink)}
a{color:var(--accent);text-decoration:none}
a:hover{text-decoration:underline}
.eyebrow{display:block;font-size:.72rem;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:var(--accent);margin-bottom:1rem}
.hero{padding-bottom:3rem;margin-bottom:3rem;border-bottom:1px solid var(--line)}
.hero h1{font-size:var(--hero-size,3.4rem);margin-bottom:.5rem}
.tagline{font-size:1.25rem;color:var(--ink2);margin:0 0 1rem}
.bio{color:var(--muted);max-width:60ch;margin:0 0 1.5rem}
.links{display:flex;flex-wrap:wrap;gap:1.25rem;font-size:.93rem;font-weight:500}
section{margin-bottom:3.5rem}
section>h2{font-size:1.6rem;margin-bottom:1.25rem}
.chips{display:flex;flex-wrap:wrap;gap:.55rem}
.chip{padding:.42rem .95rem;border:1px solid var(--line);border-radius:999px;background:var(--surface);color:var(--ink2);font-size:.88rem}
.timeline{list-style:none;margin:0;padding:0 0 0 1.75rem;border-left:1px solid var(--line-2);display:grid;gap:1.8rem}
.timeline li{position:relative}
.timeline li::before{content:"";position:absolute;left:calc(-1.75rem - 5px);top:.55rem;width:10px;height:10px;border-radius:50%;background:var(--accent);box-shadow:0 0 0 4px var(--bg)}
.timeline h3{font-size:1.15rem;margin-bottom:.15rem}
.meta{margin:0;color:var(--muted);font-size:.9rem}
.desc{margin:.5rem 0 0;color:var(--ink2);font-size:.95rem}
.projects{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:1rem}
.project{background:var(--surface);border:1px solid var(--line);border-radius:var(--radius);box-shadow:var(--shadow);padding:1.4rem}
.project h3{font-size:1.1rem}
.project a{font-size:.88rem}
.foot{margin-top:4rem;padding-top:1.5rem;border-top:1px solid var(--line);color:var(--muted);font-size:.85rem}
`;

const TEMPLATES = {
  workshop: {
    vars: `--bg:#f6f5f1;--surface:#ffffff;--ink:#14130f;--ink2:#3d3b35;--muted:#7a776d;--line:#e7e5de;--line-2:#d9d6cc;--accent:#1f3a5f;--radius:18px;--shadow:0 1px 2px rgba(20,19,15,.04),0 14px 36px -14px rgba(20,19,15,.14);--heading:'Fraunces',Georgia,serif;--body:'Inter',system-ui,sans-serif;--hero-size:3.4rem;`,
    extra: '',
  },
  editorial: {
    vars: `--bg:#fbf8f1;--surface:#fbf8f1;--ink:#171717;--ink2:#2b2b2b;--muted:#6f6a60;--line:#171717;--line-2:#171717;--accent:#a8432a;--radius:0;--shadow:none;--heading:'Fraunces',Georgia,serif;--body:'Fraunces',Georgia,serif;--hero-size:4.6rem;`,
    extra: `
      .hero{border-top:3px solid var(--ink)}
      .hero h1{font-style:italic;font-weight:400}
      .eyebrow{font-family:var(--body)}
      .chip,.project{border-radius:0;box-shadow:none;border-color:var(--ink)}
      .chip{background:transparent}
      section>h2{border-bottom:1px solid var(--ink);padding-bottom:.5rem}`,
  },
  minimal: {
    vars: `--bg:#ffffff;--surface:#ffffff;--ink:#111111;--ink2:#444444;--muted:#888888;--line:#eeeeee;--line-2:#dddddd;--accent:#111111;--radius:6px;--shadow:none;--heading:'Inter',system-ui,sans-serif;--body:'Inter',system-ui,sans-serif;--hero-size:2.6rem;`,
    extra: `
      h1,h2,h3{font-weight:600;letter-spacing:-.03em}
      .wrap{padding-top:4rem}
      .chip{background:transparent;border-radius:4px}`,
  },
  noir: {
    vars: `--bg:#0b0b0c;--surface:#151517;--ink:#f5f1e8;--ink2:#d8d3c8;--muted:#8a8580;--line:#2a2a2e;--line-2:#3a3a40;--accent:#c9a84c;--radius:12px;--shadow:none;--heading:'Fraunces',Georgia,serif;--body:'Inter',system-ui,sans-serif;--hero-size:4.8rem;`,
    extra: `
      .hero h1{font-weight:400}
      section>h2{color:var(--accent);letter-spacing:.02em}
      .chip{background:transparent}`,
  },
  aurora: {
    vars: `--bg:#f5f4ff;--surface:rgba(255,255,255,.72);--ink:#1e1b4b;--ink2:#3730a3;--muted:#6b6896;--line:#e4e2f5;--line-2:#cfcbea;--accent:#6366f1;--radius:20px;--shadow:0 10px 30px -12px rgba(99,102,241,.25);--heading:'Fraunces',Georgia,serif;--body:'Inter',system-ui,sans-serif;--hero-size:3.8rem;--bg-image:radial-gradient(700px 500px at 0% 0%,#e0e7ff 0%,transparent 60%),radial-gradient(600px 500px at 100% 20%,#fce7f3 0%,transparent 60%),radial-gradient(700px 500px at 60% 100%,#cffafe 0%,transparent 60%);`,
    extra: `
      .hero h1{background:linear-gradient(90deg,#4f46e5,#db2777);-webkit-background-clip:text;background-clip:text;color:transparent}
      .project,.chip{backdrop-filter:blur(8px)}
      .chip{border-radius:999px}`,
  },
};

export function generatePortfolioHTML(data) {
  const t = TEMPLATES[data.template] ?? TEMPLATES.workshop;
  const name = esc(data.name || 'Your Name');

  const links = [
    data.contactEmail && `<a href="mailto:${esc(data.contactEmail)}">Email</a>`,
    data.github && `<a href="${safeUrl(data.github)}" target="_blank" rel="noreferrer">GitHub</a>`,
    data.linkedin && `<a href="${safeUrl(data.linkedin)}" target="_blank" rel="noreferrer">LinkedIn</a>`,
  ].filter(Boolean).join('');

  const skills = (data.skills ?? []).length
    ? `<section><h2>Skills</h2><div class="chips">${data.skills
        .map((s) => `<span class="chip">${esc(s)}</span>`).join('')}</div></section>`
    : '';

  const experience = (data.experience ?? []).length
    ? `<section><h2>Experience</h2><ol class="timeline">${data.experience.map((e) => `
        <li>
          <h3>${esc(e.role)}</h3>
          <p class="meta">${esc(e.company)} · ${esc(e.duration)}</p>
          ${e.description ? `<p class="desc">${esc(e.description)}</p>` : ''}
        </li>`).join('')}</ol></section>`
    : '';

  const education = (data.education ?? []).length
    ? `<section><h2>Education</h2><ol class="timeline">${data.education.map((e) => `
        <li>
          <h3>${esc(e.degree)}</h3>
          <p class="meta">${esc(e.institution)} · ${esc(e.years)}${e.grade ? ` · ${esc(e.grade)}` : ''}</p>
        </li>`).join('')}</ol></section>`
    : '';

  const projects = (data.projects ?? []).length
    ? `<section><h2>Projects</h2><div class="projects">${data.projects.map((p) => `
        <article class="project">
          <h3>${esc(p.title)}</h3>
          ${p.description ? `<p class="desc">${esc(p.description)}</p>` : ''}
          ${p.link ? `<a href="${safeUrl(p.link)}" target="_blank" rel="noreferrer">View project →</a>` : ''}
        </article>`).join('')}</div></section>`
    : '';

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${name} · Portfolio</title>
${FONTS}
<style>
:root{${t.vars}}
${BASE_CSS}
${t.extra}
</style>
</head>
<body>
<main class="wrap">
  <header class="hero">
    <span class="eyebrow">Portfolio</span>
    <h1>${name}</h1>
    ${data.tagline ? `<p class="tagline">${esc(data.tagline)}</p>` : ''}
    ${data.bio ? `<p class="bio">${esc(data.bio)}</p>` : ''}
    ${links ? `<div class="links">${links}</div>` : ''}
  </header>
  ${skills}
  ${experience}
  ${education}
  ${projects}
  <p class="foot">Generated with Portfolio Maker</p>
</main>
</body>
</html>`;
}