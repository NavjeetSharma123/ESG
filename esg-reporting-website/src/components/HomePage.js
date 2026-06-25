import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FRAMEWORKS,
  HOW_IT_WORKS,
  STATS,
} from '../data/services';
import Button from './ui/Button';
import Container from './ui/Container';
import Badge from './ui/Badge';
import SectionHeader from './ui/SectionHeader';
import Modal from './ui/Modal';
import DemoForm from './DemoForm';
import './HomePage.css';

const frameworkScores = {
  GRI: '96%',
  SASB: '91%',
  TCFD: '94%',
  BRSR: '98%',
  UNGC: '89%',
};

const dataNodes = [
  { label: 'Utility bills', value: '2.4m kWh', x: 10, y: 24 },
  { label: 'Suppliers', value: '412 vendors', x: 24, y: 72 },
  { label: 'HR systems', value: '18 policies', x: 49, y: 34 },
  { label: 'Facilities', value: '36 sites', x: 68, y: 78 },
  { label: 'Board packs', value: '7 reports', x: 84, y: 28 },
];

const insightMetrics = [
  { label: 'Scope coverage', value: '87%', note: 'AI flagged 4 missing supplier factors' },
  { label: 'Audit readiness', value: '92%', note: 'Evidence mapped to BRSR and GRI' },
  { label: 'Risk velocity', value: '-18%', note: 'High exposure topics are trending down' },
];

const FloatingObjects = () => (
  <div className="home-floaters" aria-hidden="true">
    <span className="home-floater home-floater--leaf">CO2</span>
    <span className="home-floater home-floater--chart">ESG</span>
    <span className="home-floater home-floater--doc">BRSR</span>
    <span className="home-floater home-floater--node">AI</span>
  </div>
);

const CursorExperience = () => {
  const cursorRef = useRef(null);
  const haloRef = useRef(null);
  const trailRef = useRef(null);
  const rafRef = useRef(null);
  const particlesRef = useRef([]);
  const targetRef = useRef({ x: 0, y: 0 });
  const posRef = useRef({ x: 0, y: 0 });
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!canHover || reducedMotion) return undefined;

    setEnabled(true);

    const move = (event) => {
      targetRef.current = { x: event.clientX, y: event.clientY };
      const interactive = event.target.closest('a, button, .home-magnetic, .home-tilt-card');
      document.documentElement.classList.toggle('is-cursor-active', Boolean(interactive));

      const hue = event.clientY < window.innerHeight * 0.55 ? '155 72% 47%' : '194 85% 58%';
      document.documentElement.style.setProperty('--cursor-hue', hue);

      if (particlesRef.current.length < 18 && trailRef.current) {
        const particle = document.createElement('i');
        particle.style.left = `${event.clientX}px`;
        particle.style.top = `${event.clientY}px`;
        particle.style.setProperty('--drift-x', `${(Math.random() - 0.5) * 44}px`);
        particle.style.setProperty('--drift-y', `${(Math.random() - 0.5) * 44}px`);
        particle.textContent = ['E', 'S', 'G'][Math.floor(Math.random() * 3)];
        trailRef.current.appendChild(particle);
        particlesRef.current.push(particle);
        window.setTimeout(() => {
          particle.remove();
          particlesRef.current = particlesRef.current.filter((item) => item !== particle);
        }, 760);
      }
    };

    const tick = () => {
      const current = posRef.current;
      current.x += (targetRef.current.x - current.x) * 0.18;
      current.y += (targetRef.current.y - current.y) * 0.18;

      if (cursorRef.current && haloRef.current) {
        cursorRef.current.style.transform = `translate3d(${current.x}px, ${current.y}px, 0) translate(-50%, -50%)`;
        haloRef.current.style.transform = `translate3d(${current.x}px, ${current.y}px, 0) translate(-50%, -50%)`;
      }

      rafRef.current = window.requestAnimationFrame(tick);
    };

    window.addEventListener('pointermove', move, { passive: true });
    rafRef.current = window.requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('pointermove', move);
      window.cancelAnimationFrame(rafRef.current);
      document.documentElement.classList.remove('is-cursor-active');
    };
  }, []);

  if (!enabled) return null;

  return (
    <>
      <div className="home-cursor-halo" ref={haloRef} />
      <div className="home-cursor" ref={cursorRef} />
      <div className="home-cursor-trail" ref={trailRef} />
    </>
  );
};

const handleTiltMove = (event) => {
  const card = event.currentTarget;
  const rect = card.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * 100;
  const y = ((event.clientY - rect.top) / rect.height) * 100;
  const rotateX = (50 - y) * 0.12;
  const rotateY = (x - 50) * 0.14;
  card.style.setProperty('--mx', `${x}%`);
  card.style.setProperty('--my', `${y}%`);
  card.style.setProperty('--rx', `${rotateX}deg`);
  card.style.setProperty('--ry', `${rotateY}deg`);
};

const resetTilt = (event) => {
  const card = event.currentTarget;
  card.style.setProperty('--rx', '0deg');
  card.style.setProperty('--ry', '0deg');
  card.style.setProperty('--mx', '50%');
  card.style.setProperty('--my', '50%');
};

const HomePage = () => {
  const [showDemoModal, setShowDemoModal] = useState(false);

  return (
    <div className="home home--interactive">
      <CursorExperience />
      <section className="home-hero" aria-labelledby="hero-heading">
        <div className="home-hero__aurora" aria-hidden="true" />
        <FloatingObjects />
        <Container>
          <div className="home-hero__grid">
            <div className="home-hero__content">
              <p className="home-hero__eyebrow">AI-powered ESG reporting platform</p>
              <h1 id="hero-heading" className="home-hero__title home-shimmer-text">
                ESG reporting that moves with your data
              </h1>
              <p className="home-hero__description">
                Collect evidence, map disclosures, surface AI insights, and generate audit-ready
                reports for GRI, SASB, TCFD, BRSR, and UNGC from one responsive workspace.
              </p>
              <div className="home-hero__actions">
                <Button as={Link} to="/esg-report" variant="primary" size="lg" className="home-magnetic">
                  <span>Start a report</span>
                  <span className="home-btn-icon" aria-hidden="true">-&gt;</span>
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="lg"
                  className="home-magnetic"
                  onClick={() => setShowDemoModal(true)}
                >
                  <span>Request a demo</span>
                  <span className="home-btn-icon" aria-hidden="true">+</span>
                </Button>
              </div>
              <div className="home-hero__frameworks" aria-label="Supported frameworks">
                {FRAMEWORKS.map((fw) => (
                  <Badge key={fw}>{fw}</Badge>
                ))}
              </div>
            </div>

            <div className="home-hero__visual" aria-hidden="true">
              <div className="home-globe-wrap">
                <div className="home-globe">
                  <span className="home-globe__ring home-globe__ring--one" />
                  <span className="home-globe__ring home-globe__ring--two" />
                  <span className="home-globe__ring home-globe__ring--three" />
                  {dataNodes.map((node) => (
                    <span
                      key={node.label}
                      className="home-globe__node"
                      style={{ left: `${node.x}%`, top: `${node.y}%` }}
                    >
                      <b>{node.value}</b>
                      <em>{node.label}</em>
                    </span>
                  ))}
                  <span className="home-globe__connection home-globe__connection--one" />
                  <span className="home-globe__connection home-globe__connection--two" />
                  <span className="home-globe__connection home-globe__connection--three" />
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="home-stats" aria-label="Platform metrics">
        <Container>
          <dl className="home-stats__list">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="home-stats__item home-tilt-card"
                onMouseMove={handleTiltMove}
                onMouseLeave={resetTilt}
              >
                <dt className="home-stats__value">{stat.value}</dt>
                <dd className="home-stats__label">{stat.label}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      <section className="home-section home-section--data" aria-labelledby="dashboard-heading">
        <Container>
          <div className="home-dashboard-layout">
            <div>
              <SectionHeader
                eyebrow="Live ESG intelligence"
                title="A dashboard that reacts before reporting risk gets expensive"
                description="Hover through the workspace to see metrics, data streams, framework mapping, and AI evidence checks respond in real time."
              />
              <div className="home-data-flow" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
            </div>

            <div
              className="home-dashboard home-tilt-card"
              onMouseMove={handleTiltMove}
              onMouseLeave={resetTilt}
              id="dashboard-heading"
            >
              <div className="home-dashboard__topline">
                <span>Enterprise dashboard</span>
                <strong>Live</strong>
              </div>
              <div className="home-dashboard__grid">
                {insightMetrics.map((metric) => (
                  <div key={metric.label} className="home-dashboard__metric">
                    <span>{metric.label}</span>
                    <strong>{metric.value}</strong>
                    <em>{metric.note}</em>
                  </div>
                ))}
              </div>
              <div className="home-chart">
                <span style={{ height: '44%' }} />
                <span style={{ height: '70%' }} />
                <span style={{ height: '58%' }} />
                <span style={{ height: '86%' }} />
                <span style={{ height: '76%' }} />
                <span style={{ height: '94%' }} />
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="home-section" aria-labelledby="framework-heading">
        <Container>
          <SectionHeader
            eyebrow="Framework mapping"
            title="Compliance cards with AI-assisted connections"
            description="Every framework card highlights its mapping confidence and reveals the way evidence moves through your disclosure model."
          />
          <div className="home-framework-grid" id="framework-heading">
            {FRAMEWORKS.map((fw) => (
              <div
                key={fw}
                className="home-framework-card home-tilt-card"
                onMouseMove={handleTiltMove}
                onMouseLeave={resetTilt}
              >
                <span className="home-framework-card__code">{fw}</span>
                <strong>{frameworkScores[fw]} mapped</strong>
                <p>AI-matched disclosures, evidence links, and review status update together.</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="home-section home-section--split" aria-labelledby="workflow-heading">
        <Container>
          <div className="home-split">
            <div className="home-split__panel home-split__panel--before">
              <span>Before</span>
              <h2 id="workflow-heading">Manual ESG workflow</h2>
              <p>Spreadsheets, email chasing, stale attachments, and disconnected evidence trails.</p>
            </div>
            <div className="home-split__handle" aria-hidden="true" />
            <div className="home-split__panel home-split__panel--after">
              <span>After</span>
              <h2>AI-powered disclosure flow</h2>
              <p>Guided intake, automatic framework mapping, live risk prompts, and export-ready reports.</p>
            </div>
          </div>
        </Container>
      </section>

      <section className="home-section" aria-labelledby="how-heading">
        <Container>
          <SectionHeader
            eyebrow="Workflow"
            title="Three steps to a complete disclosure"
            description="A guided process designed for sustainability teams, finance, and compliance."
          />
          <ol className="home-steps">
            {HOW_IT_WORKS.map((item) => (
              <li
                key={item.step}
                className="home-steps__item home-tilt-card"
                onMouseMove={handleTiltMove}
                onMouseLeave={resetTilt}
              >
                <span className="home-steps__number" aria-hidden="true">{item.step}</span>
                <h3 className="home-steps__title">{item.title}</h3>
                <p className="home-steps__description">{item.description}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <Modal
        isOpen={showDemoModal}
        onClose={() => setShowDemoModal(false)}
        ariaLabelledBy="demo-form-title"
      >
        <DemoForm onClose={() => setShowDemoModal(false)} />
      </Modal>
    </div>
  );
};

export default HomePage;
