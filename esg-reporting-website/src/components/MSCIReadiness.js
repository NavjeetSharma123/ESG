import React, { useMemo, useState } from 'react';
import './MSCIReadiness.css';

const SECTORS = [
  { id: 'manufacturing', label: 'Manufacturing' },
  { id: 'energy', label: 'Energy' },
  { id: 'services', label: 'Services' },
  { id: 'tech', label: 'Tech' },
];

function getPillarWeights(sectorId) {
  // Environmental weighted higher for Manufacturing/Energy.
  // Social/Governance weighted higher for Services/Tech.
  if (sectorId === 'manufacturing' || sectorId === 'energy') {
    return { E: 0.45, S: 0.30, G: 0.25 };
  }
  if (sectorId === 'services' || sectorId === 'tech') {
    return { E: 0.30, S: 0.35, G: 0.35 };
  }
  return { E: 0.34, S: 0.33, G: 0.33 };
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function round1(n) {
  return Math.round(n * 10) / 10;
}

function scoreToGrade(score0to10) {
  const s = clamp(score0to10, 0, 10);
  if (s >= 8.6) return 'AAA';
  if (s >= 7.1) return 'AA';
  if (s >= 5.7) return 'A';
  if (s >= 4.3) return 'BBB';
  if (s >= 2.9) return 'BB';
  if (s >= 1.4) return 'B';
  return 'CCC';
}

function gradeToTone(grade) {
  // Simple professional palette for a "financial dashboard" feel.
  switch (grade) {
    case 'AAA':
      return 'msci-tone msci-tone--aaa';
    case 'AA':
      return 'msci-tone msci-tone--aa';
    case 'A':
      return 'msci-tone msci-tone--a';
    case 'BBB':
      return 'msci-tone msci-tone--bbb';
    case 'BB':
      return 'msci-tone msci-tone--bb';
    case 'B':
      return 'msci-tone msci-tone--b';
    case 'CCC':
    default:
      return 'msci-tone msci-tone--ccc';
  }
}

function Select0to10({ value, onChange, id, label, helper }) {
  return (
    <div className="msci-field">
      <label htmlFor={id} className="msci-label">
        {label}
      </label>
      {helper ? <div className="msci-helper">{helper}</div> : null}
      <select
        id={id}
        className="msci-select"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      >
        {Array.from({ length: 11 }).map((_, n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>
      <div className="msci-scale-hint">
        <span>0 = best</span>
        <span>10 = worst</span>
      </div>
    </div>
  );
}

function SelectStrength0to10({ value, onChange, id, label, helper }) {
  return (
    <div className="msci-field">
      <label htmlFor={id} className="msci-label">
        {label}
      </label>
      {helper ? <div className="msci-helper">{helper}</div> : null}
      <select
        id={id}
        className="msci-select"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      >
        {Array.from({ length: 11 }).map((_, n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>
      <div className="msci-scale-hint">
        <span>0 = none</span>
        <span>10 = strong</span>
      </div>
    </div>
  );
}

function issueScore({ exposure0to10, management0to10 }) {
  // Exposure represents inherent risk (higher is worse); management offsets risk (higher is better).
  // This produces a 0-10 score where 10 is best.
  const exposurePenalty = clamp(exposure0to10, 0, 10);
  const managementStrength = clamp(management0to10, 0, 10);
  const score = (10 - exposurePenalty) * 0.6 + managementStrength * 0.4;
  return clamp(score, 0, 10);
}

function ProgressBar({ label, value0to10, toneClass }) {
  const pct = clamp((value0to10 / 10) * 100, 0, 100);
  return (
    <div className="msci-bar-row">
      <div className="msci-bar-meta">
        <div className="msci-bar-label">{label}</div>
        <div className="msci-bar-value">{round1(value0to10)}/10</div>
      </div>
      <div className="msci-bar-track" aria-hidden="true">
        <div className={`msci-bar-fill ${toneClass}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

const QUESTIONS = {
  E: [
    {
      id: 'carbon',
      title: 'Carbon Emissions',
      exposureLabel:
        'Exposure: How material are emissions to your operations today?',
      exposureHelper:
        '0 = minimal emissions footprint; 10 = highly emissions-intensive.',
      managementLabel:
        'Management: What percentage of your operations are covered by a formal Carbon Reduction Target (e.g., Net Zero by 2050)?',
      managementHelper:
        '0 = none; 10 = comprehensive coverage with clear targets.',
    },
    {
      id: 'water',
      title: 'Water Stress',
      exposureLabel:
        "Exposure: Do any of your primary manufacturing sites operate in 'High Water Stress' regions (WRI Aqueduct)?",
      exposureHelper:
        "0 = no; 10 = significant operations in high-stress regions.",
      managementLabel:
        'Management: Do you have a water stewardship / recycling policy and measurable reduction programs?',
      managementHelper:
        '0 = none; 10 = strong policy, monitoring, and reduction performance.',
    },
    {
      id: 'waste',
      title: 'Toxic Waste',
      exposureLabel:
        'Exposure: How significant is hazardous waste in your operations?',
      exposureHelper:
        '0 = negligible; 10 = high volumes / high hazard potential.',
      managementLabel:
        "Management: Does the company have a formal 'Closed-Loop' waste management system for 100% of hazardous materials?",
      managementHelper:
        '0 = no; 10 = fully closed-loop with verification.',
    },
  ],
  S: [
    {
      id: 'human-capital',
      title: 'Human Capital',
      exposureLabel:
        'Exposure: How challenged is retention in your workforce?',
      exposureHelper:
        '0 = turnover well below industry; 10 = turnover far above industry.',
      managementLabel:
        'Management: What is your annual employee turnover rate compared to your industry average?',
      managementHelper:
        '0 = much better than industry; 10 = much worse than industry.',
    },
    {
      id: 'privacy',
      title: 'Privacy & Data Security',
      exposureLabel:
        'Exposure: How sensitive and large is the customer/employee data you handle?',
      exposureHelper:
        '0 = minimal data; 10 = large-scale, sensitive regulated data.',
      managementLabel:
        'Management: Has the company obtained an external certification for data security (e.g., ISO 27001) in the last 24 months?',
      managementHelper:
        '0 = no; 10 = yes (recent) with strong controls.',
    },
    {
      id: 'supply-chain',
      title: 'Supply Chain',
      exposureLabel:
        'Exposure: How much of your Tier-1 supply base is in higher-risk geographies?',
      exposureHelper:
        '0 = low-risk; 10 = high-risk exposure.',
      managementLabel:
        "Management: Do you perform on-site social audits for Tier-1 suppliers in 'High Risk' geographies?",
      managementHelper:
        '0 = no; 10 = strong, frequent on-site audits with remediation.',
    },
  ],
  G: [
    {
      id: 'board',
      title: 'Board Independence',
      exposureLabel:
        'Exposure: How concentrated is control (insiders/major shareholders) relative to independent oversight?',
      exposureHelper:
        '0 = strong independent oversight; 10 = highly concentrated control.',
      managementLabel:
        "Management: What percentage of your Board of Directors are 'Independent Directors' (not employees or major shareholders)?",
      managementHelper:
        '0 = 0%; 10 = very high independence with robust committees.',
    },
    {
      id: 'pay',
      title: 'Pay Alignment',
      exposureLabel:
        'Exposure: How misaligned are incentives with long-term ESG performance?',
      exposureHelper:
        '0 = well aligned; 10 = clearly misaligned incentives.',
      managementLabel:
        'Management: Is Executive Compensation explicitly linked to specific ESG performance targets?',
      managementHelper:
        '0 = no; 10 = yes with measurable, disclosed targets.',
    },
    {
      id: 'controversy',
      title: 'Controversies',
      exposureLabel:
        'Exposure: How exposed is the business model to E/Human Rights/Corruption controversy risk?',
      exposureHelper:
        '0 = low; 10 = high exposure.',
      managementLabel:
        "Management: In the last 3 years, has the company faced any 'Very Severe' or 'Severe' controversies related to environment, human rights, or corruption?",
      managementHelper:
        '0 = yes (severe); 10 = no (and strong controls/monitoring).',
    },
  ],
};

const STEPS = [
  { id: 'sector', label: 'Industry Sector' },
  { id: 'E', label: 'Environmental' },
  { id: 'S', label: 'Social' },
  { id: 'G', label: 'Governance' },
  { id: 'results', label: 'Results' },
];

export default function MSCIReadiness() {
  const [stepIdx, setStepIdx] = useState(0);
  const [sectorId, setSectorId] = useState('manufacturing');

  const weights = useMemo(() => getPillarWeights(sectorId), [sectorId]);

  const [answers, setAnswers] = useState(() => {
    const init = {};
    ['E', 'S', 'G'].forEach((pillar) => {
      QUESTIONS[pillar].forEach((q) => {
        init[`${pillar}.${q.id}.exposure`] = 5;
        init[`${pillar}.${q.id}.management`] = 5;
      });
    });
    return init;
  });

  const computed = useMemo(() => {
    const pillarScores = {};
    const issueRows = [];

    (['E', 'S', 'G']).forEach((pillar) => {
      const issues = QUESTIONS[pillar].map((q) => {
        const exposure = answers[`${pillar}.${q.id}.exposure`];
        const management = answers[`${pillar}.${q.id}.management`];
        const score = issueScore({ exposure0to10: exposure, management0to10: management });
        return { pillar, id: q.id, title: q.title, exposure, management, score };
      });

      const avg = issues.reduce((sum, x) => sum + x.score, 0) / issues.length;
      pillarScores[pillar] = clamp(avg, 0, 10);

      issues.forEach((i) => {
        const contribution = (i.score * weights[pillar]) / issues.length;
        issueRows.push({ ...i, contribution });
      });
    });

    const overall =
      pillarScores.E * weights.E + pillarScores.S * weights.S + pillarScores.G * weights.G;

    const grade = scoreToGrade(overall);
    const sortedByContribution = [...issueRows].sort((a, b) => b.contribution - a.contribution);
    const helped = sortedByContribution.slice(0, 2);
    const hurt = [...sortedByContribution].reverse().slice(0, 2);

    return {
      weights,
      pillarScores,
      overall,
      grade,
      helped,
      hurt,
    };
  }, [answers, weights]);

  const progressPct = useMemo(() => {
    return clamp((stepIdx / (STEPS.length - 1)) * 100, 0, 100);
  }, [stepIdx]);

  const canGoBack = stepIdx > 0;
  const canGoNext = stepIdx < STEPS.length - 1;

  const currentStep = STEPS[stepIdx].id;
  const isLastPillarStep = currentStep === 'G';

  const setAnswer = (key) => (val) => setAnswers((prev) => ({ ...prev, [key]: val }));

  return (
    <div className="msci-page">
      <div className="msci-shell">
        <div className="msci-header">
          <div className="msci-title-row">
            <h1 className="msci-title">MSCI readiness score</h1>
            <div className="msci-badge msci-badge--neutral">
              Projected Grade: <strong>{computed.grade}</strong>
            </div>
          </div>
          <p className="msci-subtitle">
            Diagnostic self-assessment to estimate a company’s MSCI ESG Rating (AAA to CCC) on a 0–10 scale.
          </p>

          <div className="msci-progress-card">
            <div className="msci-progress-top">
              <div className="msci-steps">
                {STEPS.map((s, idx) => (
                  <button
                    key={s.id}
                    type="button"
                    className={`msci-step ${idx === stepIdx ? 'is-active' : ''} ${idx < stepIdx ? 'is-done' : ''}`}
                    onClick={() => setStepIdx(idx)}
                  >
                    <span className="msci-step-dot" aria-hidden="true" />
                    <span className="msci-step-label">{s.label}</span>
                  </button>
                ))}
              </div>
              <div className="msci-progress-pct">{Math.round(progressPct)}%</div>
            </div>
            <div className="msci-progress-track" aria-hidden="true">
              <div className="msci-progress-fill" style={{ width: `${progressPct}%` }} />
            </div>
          </div>
        </div>

        <div className="msci-grid">
          <div className="msci-main">
            {currentStep === 'sector' ? (
              <div className="msci-card">
                <h2 className="msci-card-title">Industry weighting</h2>
                <p className="msci-card-subtitle">
                  Select an industry sector. Environmental is weighted higher for Manufacturing/Energy; Social/Governance
                  are weighted higher for Services/Tech.
                </p>

                <div className="msci-form-row">
                  <div className="msci-field">
                    <label htmlFor="sector" className="msci-label">
                      Industry Sector
                    </label>
                    <select
                      id="sector"
                      className="msci-select"
                      value={sectorId}
                      onChange={(e) => setSectorId(e.target.value)}
                    >
                      {SECTORS.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="msci-weights">
                  <div className="msci-weight">
                    <div className="msci-weight-k">Environmental</div>
                    <div className="msci-weight-v">{Math.round(computed.weights.E * 100)}%</div>
                  </div>
                  <div className="msci-weight">
                    <div className="msci-weight-k">Social</div>
                    <div className="msci-weight-v">{Math.round(computed.weights.S * 100)}%</div>
                  </div>
                  <div className="msci-weight">
                    <div className="msci-weight-k">Governance</div>
                    <div className="msci-weight-v">{Math.round(computed.weights.G * 100)}%</div>
                  </div>
                </div>
              </div>
            ) : null}

            {(currentStep === 'E' || currentStep === 'S' || currentStep === 'G') ? (
              <div className="msci-card">
                <h2 className="msci-card-title">
                  {currentStep === 'E' ? 'Environmental (Risk focus)' : null}
                  {currentStep === 'S' ? 'Social (Stakeholder focus)' : null}
                  {currentStep === 'G' ? 'Governance (Integrity focus)' : null}
                </h2>
                <p className="msci-card-subtitle">
                  For each key issue, score one question on <strong>Exposure</strong> (risk) and one on <strong>Management</strong> (mitigation).
                </p>

                <div className="msci-issues">
                  {QUESTIONS[currentStep].map((q) => (
                    <div key={q.id} className="msci-issue-card">
                      <div className="msci-issue-head">
                        <div>
                          <div className="msci-issue-title">{q.title}</div>
                          <div className="msci-issue-mini">
                            Issue score:{' '}
                            <strong>
                              {round1(
                                issueScore({
                                  exposure0to10: answers[`${currentStep}.${q.id}.exposure`],
                                  management0to10: answers[`${currentStep}.${q.id}.management`],
                                })
                              )}
                              /10
                            </strong>
                          </div>
                        </div>
                      </div>

                      <div className="msci-two-col">
                        <Select0to10
                          id={`${currentStep}.${q.id}.exposure`}
                          value={answers[`${currentStep}.${q.id}.exposure`]}
                          onChange={setAnswer(`${currentStep}.${q.id}.exposure`)}
                          label={q.exposureLabel}
                          helper={q.exposureHelper}
                        />
                        <SelectStrength0to10
                          id={`${currentStep}.${q.id}.management`}
                          value={answers[`${currentStep}.${q.id}.management`]}
                          onChange={setAnswer(`${currentStep}.${q.id}.management`)}
                          label={q.managementLabel}
                          helper={q.managementHelper}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {currentStep === 'results' ? (
              <div className="msci-card">
                <div className="msci-results-top">
                  <div>
                    <h2 className="msci-card-title">Projected result</h2>
                    <div className="msci-results-sub">
                      Weighted average score: <strong>{round1(computed.overall)}/10</strong>
                    </div>
                  </div>
                  <div className={`msci-grade-badge ${gradeToTone(computed.grade)}`}>
                    <div className="msci-grade-k">Projected Grade</div>
                    <div className="msci-grade-v">{computed.grade}</div>
                  </div>
                </div>

                <div className="msci-results-grid">
                  <div className="msci-card-inner">
                    <h3 className="msci-inner-title">Pillar breakdown</h3>
                    <ProgressBar
                      label="Environmental"
                      value0to10={computed.pillarScores.E}
                      toneClass="msci-bar--e"
                    />
                    <ProgressBar
                      label="Social"
                      value0to10={computed.pillarScores.S}
                      toneClass="msci-bar--s"
                    />
                    <ProgressBar
                      label="Governance"
                      value0to10={computed.pillarScores.G}
                      toneClass="msci-bar--g"
                    />
                  </div>

                  <div className="msci-card-inner">
                    <h3 className="msci-inner-title">Key issue leaderboard</h3>
                    <div className="msci-leaderboard">
                      <div className="msci-leader-col">
                        <div className="msci-leader-title">Top 2 that helped</div>
                        {computed.helped.map((x) => (
                          <div key={`${x.pillar}.${x.id}`} className="msci-leader-row">
                            <div className="msci-leader-name">{x.title}</div>
                            <div className="msci-leader-score">{round1(x.score)}/10</div>
                          </div>
                        ))}
                      </div>
                      <div className="msci-leader-col">
                        <div className="msci-leader-title">Top 2 that hurt</div>
                        {computed.hurt.map((x) => (
                          <div key={`${x.pillar}.${x.id}`} className="msci-leader-row">
                            <div className="msci-leader-name">{x.title}</div>
                            <div className="msci-leader-score">{round1(x.score)}/10</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="msci-nav">
              <button
                type="button"
                className="msci-btn msci-btn--ghost"
                onClick={() => setStepIdx((i) => Math.max(0, i - 1))}
                disabled={!canGoBack}
              >
                Back
              </button>
              {currentStep !== 'results' ? (
                <button
                  type="button"
                  className="msci-btn msci-btn--primary"
                  onClick={() => setStepIdx((i) => Math.min(STEPS.length - 1, i + 1))}
                  disabled={!canGoNext}
                >
                  {isLastPillarStep ? 'Calculate' : 'Next'}
                </button>
              ) : (
                <button
                  type="button"
                  className="msci-btn msci-btn--primary"
                  onClick={() => setStepIdx(0)}
                >
                  Re-run assessment
                </button>
              )}
            </div>

            <div className="msci-disclaimer">
              <div className="msci-disclaimer-title">Disclaimer</div>
              <p>
                Disclaimer: This MSCI Readiness Score is a self-assessment tool based on publicly available MSCI ESG
                Ratings methodologies as of March 2026. This is NOT an official MSCI Rating. The actual rating awarded
                by MSCI Inc. may differ significantly based on their proprietary data, controversy monitoring, and
                analyst assessments. Use this score for internal strategic planning only.
              </p>
            </div>
          </div>

          <aside className="msci-side">
            <div className="msci-side-card">
              <div className="msci-side-title">Scoring engine</div>
              <div className="msci-side-body">
                <div className="msci-side-row">
                  <span>Scale</span>
                  <strong>0–10</strong>
                </div>
                <div className="msci-side-row">
                  <span>Sector weights</span>
                  <strong>
                    E {Math.round(computed.weights.E * 100)}% · S {Math.round(computed.weights.S * 100)}% · G{' '}
                    {Math.round(computed.weights.G * 100)}%
                  </strong>
                </div>
                <div className="msci-side-row">
                  <span>Grade mapping</span>
                  <strong>AAA → CCC</strong>
                </div>
                <div className="msci-map">
                  <div className="msci-map-row"><span>8.6–10.0</span><strong>AAA</strong></div>
                  <div className="msci-map-row"><span>7.1–8.5</span><strong>AA</strong></div>
                  <div className="msci-map-row"><span>5.7–7.0</span><strong>A</strong></div>
                  <div className="msci-map-row"><span>4.3–5.6</span><strong>BBB</strong></div>
                  <div className="msci-map-row"><span>2.9–4.2</span><strong>BB</strong></div>
                  <div className="msci-map-row"><span>1.4–2.8</span><strong>B</strong></div>
                  <div className="msci-map-row"><span>0.0–1.3</span><strong>CCC</strong></div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

