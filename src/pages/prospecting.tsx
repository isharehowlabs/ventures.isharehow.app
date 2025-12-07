import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function ProspectingPage() {
  const [timeLeft, setTimeLeft] = useState({ hours: 48, minutes: 0, seconds: 0 });

  useEffect(() => {
    // Calculate 48 hours from now
    const endTime = Date.now() + 48 * 60 * 60 * 1000;

    const updateTimer = () => {
      const now = Date.now();
      const distance = endTime - now;

      if (distance < 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (time: number) => time.toString().padStart(2, '0');
  const timerString = `${timeLeft.hours}:${formatTime(timeLeft.minutes)}:${formatTime(timeLeft.seconds)}`;

  const claimSpot = () => {
    // Redirect to Shopify flash sale product page
    window.location.href = 'https://shop.isharehow.app/products/flash-sale-10x-your-seo-prospecting?utm_source=copyToPasteBoard&utm_medium=product-links&utm_content=web';
  };

  return (
    <>
      <Head>
        <title>🔥 48-Hour Flash: 10X Your SEO Leads for Just $97 (Save $400!) | iShareHow Labs</title>
        <meta
          name="description"
          content="Struggling with ghosted SEO prospects? Join our live 10X SEO Prospecting Workshop—proven scripts, templates, and AI tools to land 5x more clients. Flash sale ends in 48 hours. Limited to 50 spots."
        />
      </Head>

      <style jsx global>{`
        body {
          font-family: 'Inter', sans-serif;
          margin: 0;
          padding: 0;
          background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%);
          color: #fff;
          line-height: 1.6;
        }
        .prospecting-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        .hero {
          text-align: center;
          padding: 40px 0;
          background: rgba(0, 255, 0, 0.1);
          border-radius: 10px;
          margin-bottom: 40px;
        }
        .headline {
          font-size: 3em;
          font-weight: bold;
          margin-bottom: 20px;
          color: #00ff00;
        }
        .subhead {
          font-size: 1.5em;
          margin-bottom: 30px;
        }
        .countdown {
          background: #ff0000;
          color: #fff;
          padding: 15px;
          border-radius: 5px;
          font-size: 1.2em;
          margin: 20px 0;
        }
        .value-stack {
          background: #1a1a2e;
          padding: 30px;
          border-radius: 10px;
          margin: 20px 0;
        }
        .stack-item {
          display: flex;
          justify-content: space-between;
          margin: 10px 0;
          border-bottom: 1px solid #333;
          padding-bottom: 10px;
        }
        .cta {
          background: #00ff00;
          color: #000;
          padding: 15px 30px;
          font-size: 1.2em;
          font-weight: bold;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          width: 100%;
          margin: 20px 0;
          transition: background 0.3s;
        }
        .cta:hover {
          background: #00cc00;
        }
        .testimonial {
          background: #0f0f23;
          padding: 20px;
          border-radius: 10px;
          margin: 20px 0;
          font-style: italic;
        }
        .faq {
          margin-top: 40px;
        }
        .faq-item {
          margin: 20px 0;
        }
        .prospecting-footer {
          text-align: center;
          padding: 20px;
          font-size: 0.9em;
          opacity: 0.7;
        }
        .prospecting-footer a {
          color: #00ff00;
          text-decoration: none;
        }
        .prospecting-footer a:hover {
          text-decoration: underline;
        }
        @media (max-width: 768px) {
          .headline {
            font-size: 2em;
          }
        }
      `}</style>

      <div className="prospecting-container">
        {/* Hero Section */}
        <section className="hero">
          <h1 className="headline">🚨 FLASH SALE: 10X Your SEO Prospecting in 90 Minutes—Live Workshop</h1>
          <p className="subhead">
            Agency owners: Tired of cold emails vanishing into the void? Get Grant Cardone-inspired scripts + AI-powered SEO tools to close 5x more clients. Normally $497... Today only:{' '}
            <strong>$97</strong> (86% OFF!)
          </p>
          <div className="countdown">
            ⏰ Flash Sale Ends In: <span id="timer">{timerString}</span> | Only 50 Spots Left
          </div>
          <button className="cta" onClick={claimSpot}>
            Claim Your Spot Now – $97
          </button>
          <p>
            <small>100% Secure Checkout | Instant Access | Money-Back Guarantee</small>
          </p>
        </section>

        {/* Pain/Agitate Section */}
        <section>
          <h2>Why Your SEO Outreach Feels Like Shouting Into the Wind</h2>
          <p>
            As an agency founder building co-work dashboards and client wins, you know the drill: You pour hours into SEO audits, but prospects ghost you. Rankings stall, leads dry up, and your Analytics dashboard shows more frustration than growth.
          </p>
          <ul>
            <li>❌ 80% of cold pitches ignored (even with &quot;personalized&quot; tweaks)</li>
            <li>❌ Wasted ad spend on unqualified tire-kickers</li>
            <li>❌ No scalable system to prospect high-ticket clients who value your AI-driven expertise</li>
          </ul>
          <p>Sound familiar? It&apos;s not you—it&apos;s your process. Time to 10X it.</p>
        </section>

        {/* Solution & Value Stack */}
        <section className="value-stack">
          <h2>What&apos;s Inside the 10X SEO Prospecting Workshop</h2>
          <p>
            Join me live (or get the replay) for a 90-min deep dive: From Cardone&apos;s &quot;add value first&quot; mindset to Hormozi&apos;s grand-slam offers, tailored for SEO agencies. Walk away with a plug-and-play system that feeds your dashboard&apos;s Ministry & Wellness modules for sustained client relationships.
          </p>
          <div className="stack-item">
            <span>Live Training: 10X Prospecting Scripts (Cold Email + LinkedIn DMs)</span>
            <span>$997</span>
          </div>
          <div className="stack-item">
            <span>Bonus: AI SEO Audit Template (Integrates with Your Analytics Dashboard)</span>
            <span>$497</span>
          </div>
          <div className="stack-item">
            <span>Bonus: 50 High-Ticket Client Personas + Outreach Tracker</span>
            <span>$297</span>
          </div>
          <div className="stack-item">
            <span>Bonus: Private Co-Work Community Access (1 Month – Build Together!)</span>
            <span>$197</span>
          </div>
          <div style={{ borderTop: '2px solid #00ff00', paddingTop: '10px', fontWeight: 'bold' }}>
            <span>Total Value</span>
            <span>$1,988</span>
          </div>
          <p style={{ textAlign: 'center', fontSize: '2em', color: '#00ff00', marginTop: '20px' }}>
            Flash Price: <strong>Just $97</strong> (You Save $400 + Get $1,491 in Bonuses)
          </p>
        </section>

        {/* Social Proof */}
        <section>
          <h2>Agencies Just Like Yours Are 10Xing...</h2>
          <div className="testimonial">
            &quot;This workshop turned my SEO cold outreach from 2% response to 18% closes. Integrated the templates into my dashboard—clients now co-work on real-time wins. Revenue up 3x in Q4!&quot; – Sarah J., Digital Agency Founder
          </div>
          <div className="testimonial">
            &quot;Hormozi + Cardone in one session? Game-changer for prospecting. The AI bonus alone saved me 20 hours/week.&quot; – Mark T., SEO Consultant
          </div>
        </section>

        {/* Objection Handling / FAQ */}
        <section className="faq">
          <h2>Still On the Fence? Here&apos;s the Real Talk</h2>
          <div className="faq-item">
            <h3>Q: Is this beginner-friendly?</h3>
            <p>A: Yes—perfect for agencies scaling from solopreneur to team leads. No fluff, just actionable 10X tactics.</p>
          </div>
          <div className="faq-item">
            <h3>Q: What if I miss the live session?</h3>
            <p>A: Full replay + resources dropped instantly. Plus, lifetime access to updates via your dashboard.</p>
          </div>
          <div className="faq-item">
            <h3>Q: Guarantee?</h3>
            <p>A: 30-Day Money-Back. If you don&apos;t land your first qualified prospect, full refund—no questions.</p>
          </div>
        </section>

        {/* Final CTA */}
        <section style={{ textAlign: 'center', padding: '40px 0', background: 'rgba(0,255,0,0.1)', borderRadius: '10px' }}>
          <h2>Don&apos;t Let This Slip – Your Next Client is Waiting</h2>
          <p>
            Flash ends in <span id="final-timer">{timerString}</span>. Join the 10X movement and build client wins together.
          </p>
          <button className="cta" onClick={claimSpot}>
            Secure My $97 Spot Before It&apos;s Gone
          </button>
        </section>

        <footer className="prospecting-footer">
          <p>
            &copy; 2025 iShareHow Labs LLC | Helping Agencies Build Community-Driven Growth |{' '}
            <a href="/privacy">Privacy</a> | <a href="/terms">Terms</a>
          </p>
        </footer>
      </div>
    </>
  );
}

