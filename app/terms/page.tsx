import type { Metadata } from 'next'
import Link from 'next/link'
import styles from './terms.module.css'

export const metadata: Metadata = {
  title: 'Terms & Conditions — Wayfindr',
  description: 'Terms and conditions for using Wayfindr, the AI travel planning service.',
}

export default function TermsPage() {
  return (
    <div className={styles.wrap}>

      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/" className={styles.wordmark}>
            Wayfin<span>dr</span>
          </Link>
          <span className={styles.headerDocLabel}>Terms &amp; Conditions</span>
        </div>
      </header>

      <div className={styles.page}>

        {/* Sidebar TOC */}
        <nav className={styles.toc} aria-label="Table of contents">
          <p className={styles.tocLabel}>Contents</p>
          <ol className={styles.tocList}>
            <li><a href="#acceptance">Acceptance of Terms</a></li>
            <li><a href="#ai-content">AI-Generated Content</a></li>
            <li><a href="#use">Use of the Service</a></li>
            <li><a href="#user-accounts">User Accounts</a></li>
            <li><a href="#disclaimer">Disclaimer of Warranties</a></li>
            <li><a href="#liability">Limitation of Liability</a></li>
            <li><a href="#privacy">Privacy</a></li>
            <li><a href="#ip">Intellectual Property</a></li>
            <li><a href="#changes">Changes to Terms</a></li>
            <li><a href="#governing-law">Governing Law</a></li>
            <li><a href="#contact">Contact</a></li>
          </ol>
          <div className={styles.tocDate}>
            <strong>Effective date</strong><br />
            12 April 2026<br /><br />
            <strong>Jurisdiction</strong><br />
            New Zealand
          </div>
        </nav>

        {/* Main content */}
        <main>
          <h1 className={styles.contentH1}>Terms &amp; <em>Conditions</em></h1>
          <p className={styles.introBlurb}>
            Please read these terms carefully before using Wayfindr. By accessing or using our service, you agree to be bound by the terms described below.
          </p>

          <section className={styles.section} id="acceptance">
            <div className={styles.sectionHeader}>
              <span className={styles.sectionNum}>01</span>
              <h2 className={styles.sectionH2}>Acceptance of Terms</h2>
            </div>
            <p>By accessing or using Wayfindr (&ldquo;the Service,&rdquo; &ldquo;we,&rdquo; &ldquo;our&rdquo;), you confirm that you have read, understood, and agree to be bound by these Terms and Conditions. If you do not agree, please do not use our Service.</p>
            <p>These terms apply to all visitors, users, and others who access or use Wayfindr, including via any mobile or web application we operate.</p>
          </section>

          <section className={styles.section} id="ai-content">
            <div className={styles.sectionHeader}>
              <span className={styles.sectionNum}>02</span>
              <h2 className={styles.sectionH2}>AI-Generated Content</h2>
            </div>
            <p>Wayfindr uses artificial intelligence to generate travel itineraries, suggestions, and related content. You acknowledge and agree that:</p>
            <ul>
              <li>AI-generated itineraries are produced automatically and may contain errors, inaccuracies, or outdated information.</li>
              <li>Wayfindr does not guarantee the accuracy, completeness, or suitability of any AI-generated content for your specific needs.</li>
              <li>Travel conditions, prices, visa requirements, safety advisories, and local regulations change frequently — you must independently verify all information before acting on it.</li>
              <li>AI-generated content does not constitute professional travel, legal, medical, or financial advice.</li>
              <li>Wayfindr accepts no responsibility for decisions made based on AI-generated itineraries or suggestions.</li>
            </ul>
            <div className={styles.callout}>
              Always verify entry requirements, health and safety conditions, and booking availability directly with airlines, accommodation providers, and official government sources before travelling.
            </div>
          </section>

          <section className={styles.section} id="use">
            <div className={styles.sectionHeader}>
              <span className={styles.sectionNum}>03</span>
              <h2 className={styles.sectionH2}>Use of the Service</h2>
            </div>
            <p>You agree to use Wayfindr for lawful purposes only. You must not:</p>
            <ul>
              <li>Use the Service to generate or distribute false, misleading, or harmful content.</li>
              <li>Attempt to reverse-engineer, scrape, or extract data from the Service by automated means.</li>
              <li>Use the Service in any manner that could disable, damage, or impair it.</li>
              <li>Impersonate any person or entity, or misrepresent your affiliation with any person or entity.</li>
              <li>Use the Service if you are under 18 years of age without parental or guardian consent.</li>
            </ul>
            <p>We reserve the right to suspend or terminate access to any user who violates these terms, at our sole discretion and without notice.</p>
          </section>

          <section className={styles.section} id="user-accounts">
            <div className={styles.sectionHeader}>
              <span className={styles.sectionNum}>04</span>
              <h2 className={styles.sectionH2}>User Accounts</h2>
            </div>
            <p>If you create an account with Wayfindr, you are responsible for maintaining the security of your login credentials and for all activity that occurs under your account.</p>
            <p>You agree to notify us immediately at the contact address below if you suspect any unauthorised use of your account. We will not be liable for any loss or damage arising from your failure to protect your account credentials.</p>
          </section>

          <section className={styles.section} id="disclaimer">
            <div className={styles.sectionHeader}>
              <span className={styles.sectionNum}>05</span>
              <h2 className={styles.sectionH2}>Disclaimer of Warranties</h2>
            </div>
            <p>Wayfindr is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis without warranties of any kind, either express or implied. We do not warrant that:</p>
            <ul>
              <li>The Service will be uninterrupted, timely, secure, or error-free.</li>
              <li>Any results obtained from the Service will be accurate or reliable.</li>
              <li>AI-generated itineraries will be fit for any particular purpose.</li>
            </ul>
            <p>To the fullest extent permitted by New Zealand law, we disclaim all warranties, including implied warranties of merchantability and fitness for a particular purpose.</p>
          </section>

          <section className={styles.section} id="liability">
            <div className={styles.sectionHeader}>
              <span className={styles.sectionNum}>06</span>
              <h2 className={styles.sectionH2}>Limitation of Liability</h2>
            </div>
            <p>To the maximum extent permitted by applicable law, Wayfindr and its owners, employees, and affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of the Service — including, but not limited to, damages for lost travel bookings, travel disruption, personal injury, or reliance on AI-generated content.</p>
            <p>Nothing in these terms limits liability that cannot be excluded under the Consumer Guarantees Act 1993 or the Fair Trading Act 1986 (New Zealand).</p>
          </section>

          <section className={styles.section} id="privacy">
            <div className={styles.sectionHeader}>
              <span className={styles.sectionNum}>07</span>
              <h2 className={styles.sectionH2}>Privacy</h2>
            </div>
            <p>Your use of Wayfindr is also governed by our Privacy Policy, which is incorporated into these Terms by reference. We handle your personal information in accordance with the Privacy Act 2020 (New Zealand).</p>
            <p>By using the Service, you consent to the collection and use of your information as described in our Privacy Policy.</p>
          </section>

          <section className={styles.section} id="ip">
            <div className={styles.sectionHeader}>
              <span className={styles.sectionNum}>08</span>
              <h2 className={styles.sectionH2}>Intellectual Property</h2>
            </div>
            <p>All content, branding, design, and software comprising Wayfindr — excluding AI-generated outputs provided to you — is owned by or licensed to Wayfindr and is protected by applicable intellectual property laws.</p>
            <p>AI-generated itineraries and travel plans created for you through the Service are provided for your personal, non-commercial use. You may not resell, redistribute, or represent AI-generated outputs as independently authored content without our written consent.</p>
          </section>

          <section className={styles.section} id="changes">
            <div className={styles.sectionHeader}>
              <span className={styles.sectionNum}>09</span>
              <h2 className={styles.sectionH2}>Changes to These Terms</h2>
            </div>
            <p>We may update these Terms and Conditions from time to time. When we do, we will revise the effective date at the top of this page. Your continued use of the Service after any changes constitutes your acceptance of the updated terms.</p>
            <p>We encourage you to review these Terms periodically. For material changes, we will make reasonable efforts to notify registered users.</p>
          </section>

          <section className={styles.section} id="governing-law">
            <div className={styles.sectionHeader}>
              <span className={styles.sectionNum}>10</span>
              <h2 className={styles.sectionH2}>Governing Law</h2>
            </div>
            <p>These Terms are governed by the laws of New Zealand. Any disputes arising from or related to these Terms or your use of Wayfindr shall be subject to the exclusive jurisdiction of the New Zealand courts.</p>
          </section>

          <section className={styles.section} id="contact">
            <div className={styles.sectionHeader}>
              <span className={styles.sectionNum}>11</span>
              <h2 className={styles.sectionH2}>Contact</h2>
            </div>
            <p>If you have any questions about these Terms, please contact us:</p>
            <div className={styles.contactBlock}>
              <p><strong style={{ color: 'var(--paper)' }}>Wayfindr</strong></p>
              <p>Email: <a href="mailto:hello@wayfindrtravel.com">hello@wayfindrtravel.com</a></p>
              <p>New Zealand</p>
            </div>
          </section>

        </main>
      </div>

      <footer className={styles.footer}>
        &copy; 2026 Wayfindr. All rights reserved. &nbsp;&middot;&nbsp; Effective 12 April 2026
      </footer>

    </div>
  )
}
