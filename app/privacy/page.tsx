import type { Metadata } from 'next'
import Link from 'next/link'
import styles from '../terms/terms.module.css'

export const metadata: Metadata = {
  title: 'Privacy Policy — Wayfindr',
  description: 'How Wayfindr collects, uses, stores and protects your personal information.',
}

export default function PrivacyPage() {
  return (
    <div className={styles.wrap}>

      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/" className={styles.wordmark}>
            Wayfin<span>dr</span>
          </Link>
          <span className={styles.headerDocLabel}>Privacy Policy</span>
        </div>
      </header>

      <div className={styles.page}>

        {/* Sidebar TOC */}
        <nav className={styles.toc} aria-label="Table of contents">
          <p className={styles.tocLabel}>Contents</p>
          <ol className={styles.tocList}>
            <li><a href="#collect">Information We Collect</a></li>
            <li><a href="#use">How We Use It</a></li>
            <li><a href="#storage">Where It&apos;s Stored</a></li>
            <li><a href="#ai">AI Processing</a></li>
            <li><a href="#retention">Data Retention</a></li>
            <li><a href="#rights">Your Rights</a></li>
            <li><a href="#analytics">Cookies &amp; Analytics</a></li>
            <li><a href="#changes">Changes to This Policy</a></li>
            <li><a href="#contact">Contact</a></li>
          </ol>
          <div className={styles.tocDate}>
            <strong>Effective date</strong><br />
            19 November 2026<br /><br />
            <strong>Jurisdiction</strong><br />
            New Zealand
          </div>
        </nav>

        {/* Main content */}
        <main>
          <h1 className={styles.contentH1}>Privacy <em>Policy</em></h1>
          <p className={styles.introBlurb}>
            This policy explains what personal information Wayfindr collects, why, where it&rsquo;s stored, and how you can access, correct or delete it. It is incorporated into our <Link href="/terms">Terms &amp; Conditions</Link> by reference.
          </p>

          <section className={styles.section} id="collect">
            <div className={styles.sectionHeader}>
              <span className={styles.sectionNum}>01</span>
              <h2 className={styles.sectionH2}>Information We Collect</h2>
            </div>
            <p>If you create an account, we collect your email address and password (stored securely by our authentication provider, never in plain text).</p>
            <p>As you use Wayfindr, we also collect:</p>
            <ul>
              <li>The content of your conversations with our AI trip planner, including destinations, dates and any personal preferences you share.</li>
              <li>Saved itineraries and the trip details that make them up (budget, pace, travel style, and similar preferences).</li>
              <li>Traveller-type selections you make in the planning wizard (for example &ldquo;Solo female traveller&rdquo; or &ldquo;Family with young kids&rdquo;).</li>
            </ul>
            <p>If you use Wayfindr without an account, we also process your IP address briefly, solely to apply a daily usage limit and prevent abuse.</p>
          </section>

          <section className={styles.section} id="use">
            <div className={styles.sectionHeader}>
              <span className={styles.sectionNum}>02</span>
              <h2 className={styles.sectionH2}>How We Use It</h2>
            </div>
            <p>We use your information to:</p>
            <ul>
              <li>Generate and refine the travel itineraries and recommendations you ask for.</li>
              <li>Save your trips and preferences so you can return to them later.</li>
              <li>Maintain your account and let you sign in.</li>
              <li>Apply fair usage limits and protect the Service from abuse.</li>
            </ul>
            <p>We do not sell your personal information, and we do not use it to serve ads.</p>
          </section>

          <section className={styles.section} id="storage">
            <div className={styles.sectionHeader}>
              <span className={styles.sectionNum}>03</span>
              <h2 className={styles.sectionH2}>Where It&rsquo;s Stored</h2>
            </div>
            <p>Your account details, conversations and saved itineraries are stored with our database provider, Supabase, in their South Asia (Mumbai) region.</p>
            <p>Because this is outside New Zealand, your information is held overseas. We only work with providers who are contractually required to protect your information to a standard comparable to the Privacy Act 2020.</p>
          </section>

          <section className={styles.section} id="ai">
            <div className={styles.sectionHeader}>
              <span className={styles.sectionNum}>04</span>
              <h2 className={styles.sectionH2}>AI Processing</h2>
            </div>
            <p>To generate itineraries and chat responses, the content of your conversation is sent to Anthropic&rsquo;s Claude API for processing. Anthropic processes this content to return a response to Wayfindr and does not use it to train its models.</p>
            <p>Avoid sharing sensitive personal information (for example passport numbers or financial details) in chat — Wayfindr never asks for these and does not need them to plan your trip.</p>
          </section>

          <section className={styles.section} id="retention">
            <div className={styles.sectionHeader}>
              <span className={styles.sectionNum}>05</span>
              <h2 className={styles.sectionH2}>Data Retention</h2>
            </div>
            <p>We keep your account, conversations and saved itineraries for as long as your account is active. If you&rsquo;d like your data deleted, email us at the contact address below and we will remove it.</p>
            <p>If you use Wayfindr without creating an account, your itinerary exists only in your browser and is not stored on our servers once you close the tab, aside from the brief IP-based usage check described above.</p>
          </section>

          <section className={styles.section} id="rights">
            <div className={styles.sectionHeader}>
              <span className={styles.sectionNum}>06</span>
              <h2 className={styles.sectionH2}>Your Rights</h2>
            </div>
            <p>Under the Privacy Act 2020 (New Zealand), you have the right to:</p>
            <ul>
              <li>Ask what personal information we hold about you.</li>
              <li>Ask us to correct it if it&rsquo;s wrong.</li>
              <li>Ask us to delete your account and associated data.</li>
            </ul>
            <p>To exercise any of these, contact us at the address below. We will respond within a reasonable time.</p>
          </section>

          <section className={styles.section} id="analytics">
            <div className={styles.sectionHeader}>
              <span className={styles.sectionNum}>07</span>
              <h2 className={styles.sectionH2}>Cookies &amp; Analytics</h2>
            </div>
            <p>We do not use third-party analytics or tracking tools. We use only the essential cookies our authentication provider needs to keep you signed in. If this changes, we will update this policy first.</p>
          </section>

          <section className={styles.section} id="changes">
            <div className={styles.sectionHeader}>
              <span className={styles.sectionNum}>08</span>
              <h2 className={styles.sectionH2}>Changes to This Policy</h2>
            </div>
            <p>We may update this Privacy Policy from time to time. When we do, we will revise the effective date at the top of this page. For material changes, we will make reasonable efforts to notify registered users.</p>
          </section>

          <section className={styles.section} id="contact">
            <div className={styles.sectionHeader}>
              <span className={styles.sectionNum}>09</span>
              <h2 className={styles.sectionH2}>Contact</h2>
            </div>
            <p>Questions about this policy, or requests to access, correct or delete your information, can be sent to:</p>
            <div className={styles.contactBlock}>
              <p><strong style={{ color: 'var(--paper)' }}>Wayfindr</strong></p>
              <p>Email: <a href="mailto:hello@wayfindrtravel.com">hello@wayfindrtravel.com</a></p>
              <p>New Zealand</p>
            </div>
          </section>

        </main>
      </div>

      <footer className={styles.footer}>
        &copy; 2026 Wayfindr. All rights reserved. &nbsp;&middot;&nbsp; Effective 19 November 2026
      </footer>

    </div>
  )
}
