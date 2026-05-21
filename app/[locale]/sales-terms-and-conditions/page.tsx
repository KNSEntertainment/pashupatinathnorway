import type { Metadata } from "next";
import { getSettings } from "@/lib/data/settings";
import { normalizeDocs } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Terms & Conditions | Pashupatinath Norway Temple",
  description:
    "Standard terms and conditions of sale for consumer purchases of goods over the Internet.",
};

interface SectionProps {
  number: string;
  title: string;
  children: React.ReactNode;
}

function Section({ number, title, children }: SectionProps) {
  return (
    <section className="section" id={`section-${number}`}>
      <div className="section-header">
        <span className="section-number">{number.padStart(2, "0")}</span>
        <h2 className="section-title">{title}</h2>
      </div>
      <div className="section-body">{children}</div>
    </section>
  );
}

// interface SubsectionProps {
//   title: string;
//   children: React.ReactNode;
// }

// function Subsection({ title, children }: SubsectionProps) {
//   return (
//     <div className="subsection">
//       <h3 className="subsection-title">{title}</h3>
//       <p>{children}</p>
//     </div>
//   );
// }

const tocItems = [
  { number: "1", title: "The Agreement" },
  { number: "2", title: "The Parties" },
  { number: "3", title: "Price" },
  { number: "4", title: "Conclusion of the Agreement" },
  { number: "5", title: "Payment" },
  { number: "6", title: "Delivery" },
  { number: "7", title: "Risk of Goods" },
  { number: "8", title: "Right of Withdrawal" },
  { number: "9", title: "Delay and Non-Delivery" },
  { number: "10", title: "Defects in the Goods" },
  { number: "11", title: "Seller's Rights on Buyer Default" },
  { number: "12", title: "Warranty" },
  { number: "13", title: "Personal Data" },
  { number: "14", title: "Conflict Resolution" },
];

export default async function TermsAndConditionsPage() {
  const settings = await getSettings();
  const settingsNorm = normalizeDocs(settings);
  
  // Get the first (or primary) setting for organization details
  const orgSettings = settingsNorm[0] || {};
  const orgName = orgSettings.name || 'Pashupatinath Norway Temple';
  const orgEmail = orgSettings.email || 'nepalihindusamfunn@gmail.com';
  const orgPhone = orgSettings.phone || '41267124';
  const orgNumber = orgSettings.organizationNumber || '926499211';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Source+Serif+4:ital,opsz,wght@0,8..60,300;0,8..60,400;0,8..60,500;1,8..60,300;1,8..60,400&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --ink: #1a1714;
          --ink-secondary: #4a4540;
          --ink-muted: #8a8480;
          --rule: #d6d0c8;
          --rule-light: #ece8e0;
          --bg: #faf8f4;
          --bg-warm: #f2ede4;
          --accent: #b85c2a;
          --accent-light: #f0e4d8;
          --font-display: 'Playfair Display', Georgia, serif;
          --font-body: 'Source Serif 4', Georgia, serif;
        }

        html { scroll-behavior: smooth; }

        body {
          background-color: var(--bg);
          color: var(--ink);
          font-family: var(--font-body);
          font-size: 16px;
          line-height: 1.75;
          -webkit-font-smoothing: antialiased;
        }

        /* ── Page layout ── */
        .page-wrapper {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr min(760px, 100%) 1fr;
        }
        .page-wrapper > * { grid-column: 2; }

        /* ── Masthead ── */
        .masthead {
          padding: 64px 24px 0;
          border-bottom: 2px solid var(--ink);
          position: relative;
          overflow: hidden;
        }
        .masthead::before {
          content: '';
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            90deg,
            transparent 0,
            transparent 59px,
            var(--rule-light) 59px,
            var(--rule-light) 60px
          );
          opacity: 0.5;
          pointer-events: none;
        }
        .masthead-label {
          font-family: var(--font-body);
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--accent);
          margin-bottom: 20px;
        }
        .masthead-title {
          font-family: var(--font-display);
          font-size: clamp(36px, 6vw, 64px);
          font-weight: 700;
          line-height: 1.1;
          letter-spacing: -0.02em;
          color: var(--ink);
          position: relative;
        }
        .masthead-title em {
          font-style: italic;
          color: var(--accent);
        }
        .masthead-subtitle {
          font-family: var(--font-body);
          font-size: 15px;
          font-weight: 300;
          color: var(--ink-secondary);
          margin-top: 16px;
          font-style: italic;
          max-width: 520px;
          line-height: 1.6;
        }
        .masthead-meta {
          display: flex;
          gap: 32px;
          margin-top: 32px;
          padding: 20px 0;
          border-top: 1px solid var(--rule);
          font-size: 12px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--ink-muted);
          font-family: var(--font-body);
          font-weight: 500;
        }
        .masthead-meta span { display: flex; align-items: center; gap: 8px; }
        .masthead-meta span::before {
          content: '—';
          color: var(--accent);
        }

        /* ── Main content area ── */
        main { padding: 0 24px 80px; }

        /* ── Introduction block ── */
        .intro-block {
          margin: 40px 0;
          padding: 32px 36px;
          background: var(--bg-warm);
          border-left: 3px solid var(--accent);
          position: relative;
        }
        .intro-block::before {
          content: '§';
          position: absolute;
          top: -20px;
          right: 24px;
          font-family: var(--font-display);
          font-size: 80px;
          color: var(--rule);
          line-height: 1;
          pointer-events: none;
        }
        .intro-block p {
          font-size: 14.5px;
          color: var(--ink-secondary);
          line-height: 1.8;
        }
        .intro-block a {
          color: var(--accent);
          text-decoration: underline;
          text-underline-offset: 3px;
        }

        /* ── Table of Contents ── */
        .toc {
          margin: 40px 0;
          padding: 32px;
          border: 1px solid var(--rule);
          background: white;
        }
        .toc-label {
          font-family: var(--font-display);
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--ink-muted);
          margin-bottom: 20px;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--rule-light);
        }
        .toc-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0;
        }
        @media (max-width: 560px) {
          .toc-grid { grid-template-columns: 1fr; }
        }
        .toc-item {
          display: flex;
          align-items: baseline;
          gap: 12px;
          padding: 8px 0;
          border-bottom: 1px dotted var(--rule-light);
          text-decoration: none;
          color: var(--ink-secondary);
          font-size: 13.5px;
          transition: color 0.15s ease;
        }
        .toc-item:hover { color: var(--accent); }
        .toc-item:hover .toc-num { color: var(--accent); }
        .toc-num {
          font-family: var(--font-display);
          font-size: 11px;
          font-weight: 600;
          color: var(--ink-muted);
          min-width: 20px;
          transition: color 0.15s ease;
        }

        /* ── Divider ── */
        .divider {
          display: flex;
          align-items: center;
          gap: 16px;
          margin: 48px 0;
          color: var(--ink-muted);
          font-size: 11px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
        }
        .divider::before, .divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: var(--rule);
        }

        /* ── Sections ── */
        .section {
          margin-bottom: 48px;
          padding-bottom: 48px;
          border-bottom: 1px solid var(--rule-light);
          scroll-margin-top: 24px;
        }
        .section:last-child { border-bottom: none; }

        .section-header {
          display: flex;
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 20px;
        }
        .section-number {
          font-family: var(--font-display);
          font-size: 13px;
          font-weight: 600;
          color: var(--accent);
          letter-spacing: 0.05em;
          padding-top: 6px;
          min-width: 28px;
        }
        .section-title {
          font-family: var(--font-display);
          font-size: 22px;
          font-weight: 600;
          color: var(--ink);
          line-height: 1.3;
        }

        .section-body {
          padding-left: 48px;
        }
        @media (max-width: 480px) {
          .section-body { padding-left: 0; }
        }

        .section-body p {
          font-size: 15px;
          color: var(--ink-secondary);
          line-height: 1.8;
          margin-bottom: 16px;
        }
        .section-body p:last-child { margin-bottom: 0; }

        .section-body ul {
          list-style: none;
          margin: 20px 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .section-body ul li {
          font-size: 15px;
          color: var(--ink-secondary);
          line-height: 1.7;
          padding-left: 20px;
          position: relative;
        }
        .section-body ul li::before {
          content: '–';
          position: absolute;
          left: 0;
          color: var(--accent);
          font-weight: 300;
        }

        /* ── Subsections ── */
        .subsection {
          margin-top: 24px;
          padding: 20px 24px;
          background: var(--bg-warm);
          border-left: 2px solid var(--rule);
        }
        .subsection-title {
          font-family: var(--font-display);
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.08em;
          color: var(--ink);
          text-transform: uppercase;
          margin-bottom: 10px;
        }
        .subsection p {
          margin-bottom: 0 !important;
        }

        /* ── Contact card ── */
        .contact-card {
          display: inline-flex;
          flex-direction: column;
          gap: 4px;
          padding: 16px 20px;
          background: white;
          border: 1px solid var(--rule);
          margin: 12px 0;
          font-size: 14px;
        }
        .contact-card strong {
          font-family: var(--font-display);
          font-size: 15px;
          font-weight: 600;
          color: var(--ink);
        }
        .contact-card a {
          color: var(--accent);
          text-decoration: none;
        }
        .contact-card span { color: var(--ink-secondary); }

        /* ── Footer ── */
        footer {
          padding: 32px 24px;
          border-top: 2px solid var(--ink);
          background: var(--ink);
          color: var(--bg-warm);
          grid-column: 1 / -1;
        }
        .footer-inner {
          max-width: 760px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }
        .footer-org {
          font-family: var(--font-display);
          font-size: 15px;
          font-weight: 600;
          color: #faf8f4;
        }
        .footer-meta {
          font-size: 12px;
          color: var(--ink-muted);
          letter-spacing: 0.08em;
        }
        .footer-link {
          color: var(--accent);
          text-decoration: none;
          font-size: 12px;
          letter-spacing: 0.05em;
        }
      `}</style>

      <div className="page-wrapper">
        {/* Masthead */}
        <header className="masthead">
          <p className="masthead-label">{orgName}</p>
          <h1 className="masthead-title">
            Terms &amp; Conditions<br />
            <em>of Sale</em>
          </h1>
          <p className="masthead-subtitle">
            Standard terms for consumer purchases of goods over the Internet,
            prepared in accordance with Norwegian consumer protection legislation.
          </p>
          <div className="masthead-meta">
            <span>Consumer Purchases Act</span>
            <span>Right of Withdrawal Act</span>
            <span>E-Commerce Act</span>
          </div>
        </header>

        <main>
          {/* Introduction */}
          <div className="intro-block">
            <p>
              This purchase is governed by the following standard terms and conditions of sale for
              consumer purchases of goods over the Internet. Consumer purchases over the Internet are
              mainly regulated by the Contracts Act, the Consumer Purchases Act, the Marketing Act, the
              Right of Withdrawal Act and the E-Commerce Act — these laws give the consumer unalterable
              rights. The laws are available at{" "}
              <a href="https://www.lovdata.no" target="_blank" rel="noopener noreferrer">
                www.lovdata.no
              </a>
              . The terms of this agreement shall not be construed as any limitation of statutory rights,
              but sets out the parties&apos; most important rights and obligations. These terms of sale have
              been prepared and recommended by the Danish Consumer Authority.
            </p>
          </div>

          {/* Table of Contents */}
          <nav className="toc" aria-label="Table of contents">
            <p className="toc-label">Contents</p>
            <div className="toc-grid">
              {tocItems.map((item) => (
                <a key={item.number} href={`#section-${item.number}`} className="toc-item">
                  <span className="toc-num">{item.number}</span>
                  {item.title}
                </a>
              ))}
            </div>
          </nav>

          <div className="divider">Articles</div>

          {/* ── Section 1 ── */}
          <Section number="1" title="The Agreement">
            <p>
              The agreement consists of these terms of sale, information provided in the ordering
              solution and any separately agreed terms. In the event of any conflict between the
              information, what has been specifically agreed between the parties shall prevail, provided
              that it does not conflict with mandatory legislation.
            </p>
            <p>
              The agreement will also be completed by relevant legal provisions that regulate the
              purchase of goods between traders and consumers.
            </p>
          </Section>

          {/* ── Section 2 ── */}
          <Section number="2" title="The Parties">
              The seller and buyer details are as follows:
            <div className="contact-card">
              <strong>{orgName}</strong>
              <span>
                Email:{" "}
                <a href={`mailto:${orgEmail}`}>{orgEmail}</a>
              </span>
              <span>Contact: {orgPhone}</span>
              <span>Organisation number: {orgNumber}</span>
            </div>
            <p>
              The buyer is the consumer who places the order, and is hereinafter referred to as the
              buyer.
            </p>
          </Section>

          {/* ── Section 3 ── */}
          <Section number="3" title="Price">
              The stated price for the goods and services is the total price the buyer will pay. This
              price includes all taxes and additional costs. Additional costs that the seller has not
              informed about before the purchase, the buyer shall not bear.
          </Section>

          {/* ── Section 4 ── */}
          <Section number="4" title="Conclusion of the Agreement">
              The agreement is binding on both parties when the buyer has sent his order to the seller.
              However, the agreement is not binding if there have been typing or input errors in the
              offer from the seller in the ordering solution in the online store or in the buyer&apos;s order,
              and the other party realized or should have realized that such an error existed.
          </Section>

          {/* ── Section 5 ── */}
          <Section number="5" title="Payment">
              The seller may demand payment for the goods from the time they are shipped from the seller
              to the buyer. If the buyer uses a credit or debit card to pay, the seller can reserve the
              purchase price on the card by order. The card will be charged the same day the item is
              shipped.
              When paying by invoice, the invoice will be issued upon shipment of the goods. The payment
              deadline is stated on the invoice and is a minimum of 14 days from receipt. Buyers under
              the age of 18 cannot pay with a subsequent invoice.
          </Section>

          {/* ── Section 6 ── */}
          <Section number="6" title="Delivery">
              Delivery has occurred when the buyer, or his representative, has taken over the item. If
              no time of delivery is stated in the order solution, the seller shall deliver the goods to
              the buyer without undue delay and no later than 30 days after the order from the customer.
              The goods shall be delivered to the buyer unless otherwise specifically agreed between the
              parties.
          </Section>

          {/* ── Section 7 ── */}
          <Section number="7" title="Risk of the Goods">
              The risk for the goods passes to the buyer when he, or his representative, has received
              the goods in accordance with clause 6.
          </Section>

          {/* ── Section 8 ── */}
          <Section number="8" title="Right of Withdrawal">
              Unless the agreement is exempt from the right of withdrawal, the buyer may cancel the
              purchase of the item in accordance with the Right of Withdrawal Act. The buyer must notify
              the seller of the exercise of the right of withdrawal within 14 days from the start of the
              withdrawal period. All calendar days are included in the withdrawal period.
              If the deadline ends on a Saturday, public holiday or bank holiday, the deadline is
              extended to the nearest business day. The cancellation deadline is considered to have been
              met if notification is sent before the deadline expires. The buyer bears the burden of
              proof that the right of withdrawal has been exercised, and notification should therefore be
              made in writing (withdrawal form, email or letter).
              The withdrawal period begins to run:
            <ul>
                When purchasing individual items, the cancellation period runs from the day after the
                item(s) are received.
                If a subscription is sold, or the agreement involves regular delivery of identical
                goods, the deadline runs from the day after the first shipment is received.
                If the purchase consists of multiple deliveries, the cancellation period runs from the
                day after the last delivery is received.
            </ul>
              The withdrawal period is extended to 12 months after the expiry of the original period if
              the seller does not, at the conclusion of the contract, inform the buyer that there is a
              right of withdrawal and provide a standardised withdrawal form.
              When exercising the right of withdrawal, the item must be returned to the seller without
              unnecessary delay and no later than 14 days from the date of notification. The buyer
              covers the direct costs of returning the goods, unless otherwise agreed or the seller has
              failed to inform the buyer that the buyer shall cover the return costs.
              The seller cannot charge a fee for the buyer&apos;s use of the right of withdrawal. The seller
              is obliged to refund the purchase price to the buyer without undue delay, and no later than
              14 days from when the seller received notification of the buyer&apos;s decision to exercise the
              right of withdrawal. The seller has the right to withhold payment until the goods have been
              received from the buyer, or until the buyer has provided documentation that the goods have
              been returned.
          </Section>

          {/* ── Section 9 ── */}
          <Section number="9" title="Delay and Non-Delivery — Buyer&apos;s Rights">
              If the seller does not deliver the goods or delivers them late in accordance with the
              agreement between the parties, and this is not due to the buyer or circumstances on the
              buyer&apos;s side, the buyer may, in accordance with the rules of the Consumer Purchase Act
              Chapter 5, depending on the circumstances, withhold the purchase price, demand fulfilment,
              terminate the agreement and/or demand compensation from the seller. In the event of a
              claim for breach of contract, the notification should be in writing for evidentiary reasons.
              The buyer can maintain the purchase and demand fulfilment from the seller. However, the
              buyer cannot demand fulfilment if there is an obstacle the seller cannot overcome, or if
              fulfilment would result in such great inconvenience or cost to the seller that it is
              significantly disproportionate to the buyer&apos;s interest. The buyer loses the right to demand
              performance if he or she waits an unreasonable amount of time to present the claim.
              If the seller does not deliver the goods at the time of delivery, the buyer must encourage
              the seller to deliver within a reasonable additional period for performance. If the seller
              does not deliver within the additional period, the buyer can cancel the purchase. The buyer
              may cancel immediately if the seller refuses to deliver, or if delivery at the agreed time
              was decisive for the conclusion of the agreement.
              The buyer may claim compensation for losses suffered as a result of the delay. However,
              this does not apply if the seller proves that the delay is due to an obstacle beyond the
              seller&apos;s control that could not reasonably have been taken into account at the time of the
              agreement, avoided, or overcome.
          </Section>

          {/* ── Section 10 ── */}
          <Section number="10" title="Defects in the Goods — Buyer's Rights">
              If there is a defect in the goods, the buyer must within a reasonable time after it was
              discovered or should have been discovered, notify the seller that he or she will claim the
              defect. The buyer has always complained in timely fashion if it occurs within 2 months from
              the time the defect was discovered. A complaint can be made no later than two years after
              the buyer took over the goods. If the goods or parts of them are intended to last
              significantly longer than two years, the complaint period is five years.
              The buyer can choose between demanding the defect be rectified or delivery of equivalent
              goods. The seller may oppose the buyer&apos;s claim if the implementation is impossible or
              causes unreasonable costs. Correction or replacement shall be made within a reasonable
              time. The seller is not entitled to make more than two attempts at remedy for the same
              deficiency.
              The buyer may demand an appropriate price reduction if the goods are not repaired or
              redelivered. The ratio between the reduced and agreed price corresponds to the ratio
              between the value of the goods in their defective and contractual condition. If special
              reasons justify it, the price reduction may instead be set equal to the defect&apos;s
              importance to the buyer.
              If the goods are not corrected or redelivered, the buyer can also cancel the purchase when
              the defect is not immaterial.
          </Section>

          {/* ── Section 11 ── */}
          <Section number="11" title="Seller's Rights in the Event of Buyer's Default">
              If the buyer does not pay or fulfil other obligations under the agreement or the law, and
              this is not due to the seller or circumstances on the seller&apos;s part, the seller may,
              depending on the circumstances, withhold the goods, demand fulfilment of the agreement,
              demand the agreement be terminated and demand compensation from the buyer.
              The seller can maintain the purchase and demand that the buyer pay the purchase price. If
              the item is not delivered, the seller loses the right to claim if he waits an unreasonable
              amount of time to file the claim.
              The seller may terminate the agreement if there is material default in payment or other
              material default on the part of the buyer. The seller cannot withdraw if the full purchase
              price has been paid. If the seller determines a reasonable additional period for performance
              and the buyer does not pay within this period, the seller may cancel the purchase.
              If the buyer does not pay the purchase price according to the agreement, the seller may
              claim interest under the Late Payment Interest Act. In the event of non-payment, the claim
              may, after prior notice, be sent to debt collection, and the buyer may be held liable for
              fees under the Debt Collection Act. If the buyer fails to collect unpaid goods, the seller
              may charge a fee covering actual delivery expenses. Such a fee cannot be charged to buyers
              under 18 years of age.
          </Section>

          {/* ── Section 12 ── */}
          <Section number="12" title="Warranty">
              A warranty provided by the seller or manufacturer gives the buyer rights in addition to
              those the buyer already has according to mandatory legislation. A guarantee therefore does
              not imply any limitations on the buyer&apos;s right to make a complaint and raise claims in the
              event of delay or defects pursuant to clauses 9 and 10.
          </Section>

          {/* ── Section 13 ── */}
          <Section number="13" title="Personal Data">
              The data controller for the collected personal data is the seller. Unless the buyer agrees
              otherwise, the seller, in accordance with the Personal Data Act, can only collect and store
              the personal data that is necessary in order for the seller to be able to carry out the
              obligations under the agreement.
              The buyer&apos;s personal information will only be disclosed to others if it is necessary for
              the seller to carry out the agreement with the buyer, or in statutory cases.
          </Section>

          {/* ── Section 14 ── */}
          <Section number="14" title="Conflict Resolution">
              Complaints must be addressed to the seller within a reasonable time, cf. points 9 and 10.
              The parties shall attempt to resolve any disputes amicably. If this is not successful, the
              buyer can contact the Consumer Council for mediation.
            <div className="contact-card">
              <strong>Forbrukerrådet (Consumer Council of Norway)</strong>
              <span>
                Phone: <a href="tel:23400500">23 400 500</a>
              </span>
              <span>
                Website:{" "}
                <a href="https://www.forbrukerradet.no" target="_blank" rel="noopener noreferrer">
                  www.forbrukerradet.no
                </a>
              </span>
            </div>
          </Section>
        </main>
{/* 
        <footer>
          <div className="footer-inner">
            <span className="footer-org">Pashupatinath Norway Temple</span>
            <span className="footer-meta">Org. no. 926499211</span>
            <a href="mailto:nepalihindusamfunn@gmail.com" className="footer-link">
              nepalihindusamfunn@gmail.com
            </a>
          </div>
        </footer> */}
      </div>
    </>
  );
}