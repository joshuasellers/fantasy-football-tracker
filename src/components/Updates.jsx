import React, { useEffect, useState } from 'react';

const DEFAULT_PLANNED = [
  'Migrate to a Node backend script to periodically fetch and refresh league data without relying on a manual “Connect to Sleeper” action.'
];

const DEFAULT_BUGS = [
  'Player projections are currently always 0; investigate and correct projection sourcing.',
  'Scoring page can mis-attribute teams when roster IDs are reused across leagues; continue monitoring after recent fixes.',
  'Scoring projections in general look wonky. Need to be updated.'
];

function parseSection(content, heading) {
  const regex = new RegExp(`##\\s*${heading}[\\r\\n]+([\\s\\S]*?)(?:\\n##|$)`, 'i');
  const match = content.match(regex);
  if (!match) return [];
  return match[1]
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.startsWith('-'))
    .map(line => line.replace(/^-\s*/, ''));
}

function Updates() {
  const [planned, setPlanned] = useState(DEFAULT_PLANNED);
  const [bugs, setBugs] = useState(DEFAULT_BUGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReadme = async () => {
      try {
        const res = await fetch(`${process.env.PUBLIC_URL}/README.md`);
        if (!res.ok) {
          setLoading(false);
          return;
        }
        const text = await res.text();
        const plannedList = parseSection(text, 'Planned Improvements');
        const bugsList = parseSection(text, 'Open Bugs');
        if (plannedList.length) setPlanned(plannedList);
        if (bugsList.length) setBugs(bugsList);
      } catch (e) {
        console.error('Failed to load README for updates page:', e);
      } finally {
        setLoading(false);
      }
    };

    loadReadme();
  }, []);

  return (
    <section className="section">
      <h2>Updates</h2>
      <p className="section-description">
        These notes are pulled from the README so the site and docs stay in sync.
      </p>

      {loading && (
        <div className="loading-indicator">
          <i className="fas fa-spinner fa-spin"></i> Loading updates...
        </div>
      )}

      {!loading && (
        <div className="updates-grid">
          <div className="updates-card">
            <h3><i className="fas fa-road"></i> Planned Improvements</h3>
            <ul>
              {planned.map((item, idx) => (
                <li key={`planned-${idx}`}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="updates-card">
            <h3><i className="fas fa-bug"></i> Open Bugs</h3>
            <ul>
              {bugs.map((item, idx) => (
                <li key={`bug-${idx}`}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}

export default Updates;

