import Link from "next/link";

export default function HomePage() {
  return (
    <div>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Machine Learning and Knowledge Discovery</p>
          <h1>Machine Learning and Knowledge Discovery</h1>
          <p>
            The MLKD group advances machine learning and its applications in medical imaging,
            natural language processing and sequential decision making.
          </p>

          <div className="hero-actions">
            <Link className="button primary" href="/team">
              Our team
            </Link>
            <Link className="button primary" href="/publications">
              Explore publications
            </Link>
            <Link className="button secondary" href="/projects">
              View projects
            </Link>
          </div>
        </div>

        <div className="hero-media">
          <img src="/home2-500w.png" alt="MLKD visual combining a human profile and medical imaging scans" />
          <div className="metric-strip" aria-label="Prototype highlights">
            <div>
              <strong>360+</strong>
              <span>publication records</span>
            </div>
            <div>
              <strong>5</strong>
              <span>core areas</span>
            </div>
            <div>
              <strong>1</strong>
              <span>admin workflow</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section intro-band" aria-labelledby="mission-title">
        <div>
          <p className="eyebrow">Mission</p>
          <h2 id="mission-title">Advance machine learning and its applications.</h2>
        </div>
        <p>
          Areas of interest include learning theory, deep learning, convolutional neural
          networks, computer vision, reinforcement learning, supervised and self-supervised
          learning, attention mechanisms and computational biology.
        </p>
      </section>
    </div>
  );
}
