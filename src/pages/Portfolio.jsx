import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loadPortfolio } from '../utils/storage';

export default function Portfolio() {
  const { user } = useAuth();
  const data = loadPortfolio(user);

  if (!data) return <Navigate to="/dashboard" replace />;

  return (
    <div className={`portfolio tpl-${data.template}`}>
      <div className="portfolio-bar">
        <Link className="btn secondary small" to="/dashboard">← Back to editor</Link>
      </div>

      <header className="pf-hero">
        <span className="eyebrow">Portfolio</span>
        <h1>{data.name || 'Your name'}</h1>
        {data.tagline && <p className="pf-tagline">{data.tagline}</p>}
        {data.bio && <p className="pf-bio">{data.bio}</p>}
        <div className="pf-links">
          {data.contactEmail && <a href={`mailto:${data.contactEmail}`}>Email</a>}
          {data.github && <a href={data.github} target="_blank" rel="noreferrer">GitHub</a>}
          {data.linkedin && <a href={data.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>}
        </div>
      </header>

      {data.skills.length > 0 && (
        <section className="pf-section">
          <h2>Skills</h2>
          <div className="chips">
            {data.skills.map((s) => <span key={s} className="chip">{s}</span>)}
          </div>
        </section>
      )}

      {data.experience.length > 0 && (
        <section className="pf-section">
          <h2>Experience</h2>
          <ol className="timeline">
            {data.experience.map((e) => (
              <li key={e.id}>
                <h3>{e.role}</h3>
                <p className="item-meta">{e.company} · {e.duration}</p>
                {e.description && <p className="item-desc">{e.description}</p>}
              </li>
            ))}
          </ol>
        </section>
      )}

      {data.education.length > 0 && (
        <section className="pf-section">
          <h2>Education</h2>
          <ol className="timeline">
            {data.education.map((e) => (
              <li key={e.id}>
                <h3>{e.degree}</h3>
                <p className="item-meta">
                  {e.institution} · {e.years}{e.grade ? ` · ${e.grade}` : ''}
                </p>
              </li>
            ))}
          </ol>
        </section>
      )}

      {data.projects.length > 0 && (
        <section className="pf-section">
          <h2>Projects</h2>
          <div className="pf-projects">
            {data.projects.map((p) => (
              <article key={p.id} className="pf-project">
                <h3>{p.title}</h3>
                {p.description && <p className="item-desc">{p.description}</p>}
                {p.link && <a href={p.link} target="_blank" rel="noreferrer">View project →</a>}
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}