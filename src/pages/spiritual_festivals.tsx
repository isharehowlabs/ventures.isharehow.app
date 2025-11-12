import React, { useState, FormEvent } from 'react';
import Head from 'next/head';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Link,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
} from '@mui/material';

const SpiritualFestivalsPage = () => {
  const [interest, setInterest] = useState('');
  const [atmosphere, setAtmosphere] = useState('');
  const [duration, setDuration] = useState('');
  const [budget, setBudget] = useState('');
  const [family, setFamily] = useState('');
  const [quizResult, setQuizResult] = useState('');

  const handleQuizSubmit = (e: FormEvent) => {
    e.preventDefault();
    let result = '';
    // Decision logic based on new data
    if (interest === 'marketplace' && atmosphere === 'high-energy' && (budget === 'under50' || budget === 'free') && family === 'yes') {
      result = 'You would love Spirit Fest (affordable, family-friendly metaphysical marketplace)!';
    } else if (interest === 'wellness' && (atmosphere === 'educational' || atmosphere === 'high-energy') && (budget === 'free' || budget === 'under50') && family === 'yes') {
      result = 'The Holistic Health & Healing Expo is a great fit (low cost, family-friendly, wellness focus).';
    } else if (interest === 'transformational' && atmosphere === 'immersive' && (budget === '50to150' || budget === '150plus') && family === 'yes') {
      result = 'Try Transcend Fest or LoveLight Festival (transformational, immersive, family-friendly).';
    } else if (interest === 'astronomy' && atmosphere === 'scientific' && budget === 'free' && family === 'yes') {
      result = 'Penn State AstroFest is perfect (free, scientific, family-friendly).';
    } else if (interest === 'wellness' && atmosphere === 'urban' && (budget === 'under50' || budget === '50to150') && family === 'yes') {
      result = 'Boston Yoga & Wellness Festival is a vibrant, urban, family-friendly event.';
    } else if (interest === 'transformational' && atmosphere === 'artistic' && (budget === '50to150' || budget === '150plus') && family === 'yes') {
      result = 'LoveLight Festival is a great fit for music, art, and healing.';
    } else if (interest === 'retreat' && atmosphere === 'peaceful' && (budget === '150plus' || budget === '50to150') && family !== 'no') {
      result = 'Omega Spirit Festival or a spiritual retreat is ideal for you.';
    } else if (interest === 'wellness' && atmosphere === 'scenic' && (budget === '50to150' || budget === '150plus') && family === 'yes') {
      result = 'Asheville Yoga Festival offers scenic, immersive wellness for all ages.';
    } else if (interest === 'music' && atmosphere === 'uplifting' && (budget === 'under50' || budget === '50to150') && family === 'yes') {
      result = 'SoulFest is uplifting, multi-genre, and family-friendly.';
    } else {
      result = 'Try exploring a multi-faceted expo or festival to sample different experiences!';
    }
    setQuizResult(result);
  };

  return (
    <>
      <Head>
        <title>Download 2024 Festival Guidebook + Ritual Pack - Complete Spiritual Events Guide</title>
        <meta name="description" content="Download the complete 2024 Festival Guidebook with 50+ spiritual events, plus bonus ritual pack. Free instant download with festival calendar, travel tips, and preparation guides." />
        <meta name="keywords" content="spiritual festivals, east coast, astrology events, cosmic gatherings, wellness expos, retreats, metaphysical, transformational, yoga, holistic health" />
        <link rel="canonical" href="https://labs.isharehow.app/Spiritual_Festivals/" />
        <meta property="og:title" content="Download 2024 Festival Guidebook + Ritual Pack - Complete Spiritual Events Guide" />
        <meta property="og:description" content="Discover the top spiritual, cosmic, and astrological events, expos, and retreats on the East Coast. Your guide to higher vibrations and conscious community." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://labs.isharehow.app/Spiritual_Festivals/" />
        <meta property="og:image" content="https://labs.isharehow.app/Spiritual_Festivals/og-image.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Download 2024 Festival Guidebook + Ritual Pack - Complete Spiritual Events Guide" />
        <meta name="twitter:description" content="Discover the top spiritual, cosmic, and astrological events, expos, and retreats on the East Coast. Your guide to higher vibrations and conscious community." />
        <meta name="twitter:image" content="https://labs.isharehow.app/Spiritual_Festivals/og-image.jpg" />
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-WQE2GEYFQW"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-WQE2GEYFQW');
            `,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: `
            {
              "@context": "https://schema.org",
              "@type": "WebPage",
              "name": "Download 2024 Festival Guidebook + Ritual Pack - Complete Spiritual Events Guide",
              "description": "Download the complete 2024 Festival Guidebook with 50+ spiritual events, plus bonus ritual pack. Free instant download with festival calendar, travel tips, and preparation guides.",
              "url": "https://labs.isharehow.app/Spiritual_Festivals/"
            }
            `,
          }}
        />
      </Head>
      <style jsx global>{`
        body { 
            font-family: 'Segoe UI', 'Arial', sans-serif; 
            line-height: 1.7; 
            color: #2c3e50; 
            margin: 0; 
            padding: 0 0 40px 0; 
            background: linear-gradient(135deg, #f3f4f6 0%, #e0e7ef 100%) fixed;
        }
        .container-class { 
            max-width: 1460px; 
            margin: 40px auto 0 auto; 
            background: rgba(255,255,255,0.97); 
            border-radius: 2em; 
            box-shadow: 0 8px 32px rgba(16,185,129,0.10), 0 1.5px 0 #ffd700 inset; 
            padding: 2.5em 2em 2em 2em; 
        }
        @media (max-width: 1400px) {
            .container-class { max-width: 98vw; }
        }
        @media (max-width: 700px) {
            .container-class { padding: 0.5em 0.1em; max-width: 100vw; }
            .card-class { padding: 1.2em 0.7em; }
            #festival-highlights div[style*='flex:'] { flex: 1 1 100%; max-width: 100%; }
        }
        table, th, td {
            word-break: break-word;
        }
        h1, h2, h3, h4 { 
            color: #10b981; 
            font-family: 'Segoe UI Semibold', 'Arial', sans-serif; 
            letter-spacing: 0.01em;
        }
        h1 { 
            text-align: center; 
            font-size: 2.5em; 
            margin-bottom: 0.5em; 
            color: #047857;
            text-shadow: 0 2px 8px #e0e7ef;
        }
        h2 {
            font-size: 2em;
            margin-top: 1.5em;
            margin-bottom: 0.7em;
        }
        h3 {
            font-size: 1.3em;
            margin-top: 1.2em;
            margin-bottom: 0.5em;
        }
        h4, h5 {
            font-size: 1.1em;
            margin-top: 1em;
            margin-bottom: 0.4em;
        }
        hr {
            border: 0; 
            height: 2px; 
            background: linear-gradient(90deg,#10b981 0%,#ffd700 100%); 
            margin: 48px 0 36px 0;
            border-radius: 1em;
        }
        table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-bottom: 24px; 
            background: #f8fafc; 
            border-radius: 1em; 
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(16,185,129,0.06);
        }
        th, td { 
            border: 1px solid #e0e7ef; 
            padding: 10px 12px; 
            text-align: left; 
        }
        th { 
            background: #e0f7fa; 
            color: #047857; 
            font-weight: 600;
        }
        ul { 
            padding-left: 22px; 
        }
        .card-class {
            background: linear-gradient(120deg, #f8fafc 80%, #e0f7fa 100%);
            border-radius: 1.5em;
            box-shadow: 0 4px 16px rgba(16,185,129,0.08);
            padding: 2em 1.5em;
            margin-bottom: 2em;
        }
        #festival-highlights h2 {
            color: #ffd700;
            text-shadow: 0 2px 8px #10b98144;
        }
        #festival-highlights h3 {
            color: #10b981;
        }
        #festival-highlights img {
            border: 3px solid #ffd70044;
            box-shadow: 0 2px 12px #10b98122;
        }
        #festival-quiz {
            background: linear-gradient(120deg, #e0f7fa 80%, #f8fafc 100%);
            border: 2px solid #10b98122;
        }
        #festivalQuizForm button[type=submit] {
            background: linear-gradient(90deg,#10b981 0%,#ffd700 100%);
            color: #2c3e50;
            font-weight: 700;
            border: none;
            border-radius: 2em;
            padding: 0.7em 2em;
            font-size: 1.1em;
            box-shadow: 0 4px 16px #10b98122;
            margin-top: 1em;
            cursor: pointer;
            transition: background 0.2s, color 0.2s, transform 0.15s;
        }
        #festivalQuizForm button[type=submit]:hover {
            background: linear-gradient(90deg,#ffd700 0%,#10b981 100%);
            color: #047857;
            transform: scale(1.05);
        }
        @media (max-width: 700px) {
            .container-class { padding: 0.5em 0.1em; max-width: 100vw; }
            .card-class { padding: 1.2em 0.7em; }
            #festival-highlights div[style*='flex:'] { flex: 1 1 100%; max-width: 100%; }
        }
      `}</style>
      <div className="container-class">
        <Typography variant="h1" component="h1" gutterBottom>
          Download Your 2026 Festival Guidebook + Bonus Ritual Pack
        </Typography>

        <Card className="card-class" style={{ background: 'linear-gradient(135deg, #e0f7fa 0%, #f8fafc 100%)', color: '#2c3e50', borderRadius: '1.5em', padding: '3em', margin: '2em 0', textAlign: 'center', boxShadow: '0 8px 32px rgba(16,185,129,0.10), 0 1.5px 0 #ffd700 inset' }}>
          <CardContent>
            <Typography variant="h2" component="h2" style={{ color: '#10b981', fontSize: '2.2em', marginBottom: '1em', textShadow: '0 2px 8px #e0e7ef' }}>
              🌟 Everything You Need for 2026 Spiritual Events
            </Typography>
            <Typography style={{ fontSize: '1.25em', marginBottom: '2em', opacity: 0.95 }}>
              Complete guide to 50+ festivals, expos, and retreats across the East Coast
            </Typography>
            <Grid container spacing={2} style={{ margin: '2em 0', textAlign: 'left' }}>
            </Grid>
            <Box style={{ background: '#e0f7fa', padding: '2em', borderRadius: '1em', margin: '2em 0', border: '2px solid #10b98122' }}>
              <Typography variant="h3" component="h3" style={{ color: '#ffd700', marginBottom: '1em', fontSize: '1.3em' }}>
                🎯 Instant Download - No Email Required
              </Typography>
              <Typography style={{ fontSize: '1.1em', marginBottom: '1.5em', color: '#2c3e50' }}>
                Get immediate access to your complete 2024 festival guide plus bonus ritual materials. Start planning your spiritual journey today!
              </Typography>
              <Button
                variant="contained"
                href="https://www.patreon.com/posts/ai-access-139527004"
                target="_blank"
                style={{ display: 'inline-block', background: 'linear-gradient(90deg,#10b981 0%,#ffd700 100%)', color: '#2c3e50', padding: '1em 3em', borderRadius: '2em', fontWeight: 'bold', fontSize: '1.2em', textDecoration: 'none', boxShadow: '0 4px 16px #10b98122', transition: 'background 0.2s, color 0.2s, transform 0.15s' }}
              >
                Download Free Guidebook + Ritual Pack
              </Button>
            </Box>
          </CardContent>
        </Card>

        <Typography variant="h2" component="h2">What's Inside Your 2024 Festival Guidebook</Typography>
        <Typography paragraph>
          The spiritual and wellness landscape of the American East Coast is a vibrant and dynamic market, characterized by a diverse array of gatherings that cater to various levels of interest and commitment. An analysis of the available events reveals that the market can be broadly segmented into distinct archetypes: the Metaphysical Marketplace, the Wellness-Focused Expo, the Transformational Festival, and the Spiritual Retreat. A primary finding is that standalone festivals dedicated solely to "astrology" or "cosmic" themes are exceptionally rare; instead, these topics are typically integrated as specialized components within larger, multi-faceted events. This report provides a detailed breakdown of these archetypes, offering a comprehensive guide for individuals seeking an experience that aligns with their personal journey, from casual exploration to deep, introspective work.
        </Typography>

        <hr />

        <Typography variant="h3" component="h3">Table 1: East Coast Spiritual & Cosmic Gatherings: A Quick Reference</Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Event Name</TableCell>
                <TableCell>Location(s)</TableCell>
                <TableCell>Primary Focus</TableCell>
                <TableCell>Dates</TableCell>
                <TableCell>Atmosphere</TableCell>
                <TableCell>Website</TableCell>
                <TableCell>Price Range</TableCell>
                <TableCell>Family Friendly?</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[
                { name: 'Spirit Fest', location: 'Virginia Beach, VA & FL', focus: 'Metaphysical Marketplace', dates: 'Sep. 19-21, 2026 (VA), Nov. 7-8, 2026 (Orlando, FL)', atmosphere: 'Commercial, High-energy, Diverse', website: 'https://spiritfestusa.com', price: '$10-$25/day', family: 'Yes' },
                { name: 'Holistic Health & Healing Expo', location: 'Cherry Hill, NJ; Raleigh, NC; Deerfield Beach, FL', focus: 'Holistic Health & Wellness', dates: 'Oct. 18, 2025 (NJ); Mar. 15, 2026 (NC); Feb. 8, 2026 (FL)', atmosphere: 'Educational, Integrative, Community-focused', website: 'https://holistichealthandhealingexpo.com', price: 'Free-$15', family: 'Yes' },
                { name: 'Mind Body Soul Expo', location: 'Saratoga Springs, NY', focus: 'Mind-Body-Soul Expo', dates: 'Apr. 25, 2026', atmosphere: 'Large, Regional, Multi-vendor', website: 'https://mindbodysoulexpo.com', price: '$15-$30', family: 'Yes' },
                { name: 'Transcend Fest', location: 'Middlefield, CT', focus: 'Transformational / Yoga', dates: 'Sep. 11-13, 2026', atmosphere: 'Immersive, Community-building, Ecstatic', website: 'https://transcendfest.com', price: '$99-$249', family: 'Yes' },
                { name: 'Penn State AstroFest', location: 'University Park, PA', focus: 'Scientific Astronomy', dates: 'July 8-11, 2026', atmosphere: 'Educational, Family-friendly, Scientific', website: 'https://astro.psu.edu/astrofest', price: 'Free', family: 'Yes' },
                { name: 'Boston Yoga & Wellness Festival', location: 'Boston, MA', focus: 'Yoga, Wellness, Community', dates: 'June 14-15, 2026', atmosphere: 'Urban, Vibrant, Inclusive', website: 'https://bostonyogafestival.com', price: '$35-$99', family: 'Yes' },
                { name: 'LoveLight Festival', location: 'Darlington, MD', focus: 'Music, Yoga, Art, Healing', dates: 'Aug. 21-24, 2026', atmosphere: 'Transformational, Artistic, Family-friendly', website: 'https://lovelightfestival.com', price: '$99-$299', family: 'Yes' },
                { name: 'SoulFest', location: 'Lincoln, NH', focus: 'Music, Spirituality, Workshops', dates: 'July 17-19, 2026', atmosphere: 'Uplifting, Community, Multi-genre', website: 'https://soulfest.com', price: '$49-$179', family: 'Yes' },
                { name: 'Asheville Yoga Festival', location: 'Asheville, NC', focus: 'Yoga, Mindfulness, Nature', dates: 'July 23-26, 2026', atmosphere: 'Scenic, Immersive, Wellness-focused', website: 'https://ashevilleyogafestival.com', price: '$99-$299', family: 'Yes' },
                { name: 'Omega Spirit Festival', location: 'Rhinebeck, NY', focus: 'Spirituality, Workshops, Healing', dates: 'Sept. 4-7, 2026', atmosphere: 'Holistic, Educational, Retreat-style', website: 'https://eomega.org', price: '$150-$400', family: 'Yes' },
              ].map((row) => (
                <TableRow key={row.name}>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.location}</TableCell>
                  <TableCell>{row.focus}</TableCell>
                  <TableCell>{row.dates}</TableCell>
                  <TableCell>{row.atmosphere}</TableCell>
                  <TableCell><Link href={row.website} target="_blank" rel="noopener">{row.website.replace('https://', '')}</Link></TableCell>
                  <TableCell>{row.price}</TableCell>
                  <TableCell>{row.family}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <hr />

        <Typography variant="h3" component="h3">The Spiritual & Metaphysical Experience</Typography>
        <Typography variant="h4" component="h4">Defining the "Spiritual Festival": An Event Ecosystem</Typography>
        <Typography paragraph>
          The terminology used to describe spiritual gatherings on the East Coast is expansive and often overlaps. Terms such as "spirituality," "New Age," "holistic," and "metaphysical" are often used interchangeably to categorize a wide range of offerings. A close examination of this market reveals a tiered ecosystem. At the top are large, professionalized traveling expos that visit multiple cities on a set circuit. Below this tier are significant regional fairs that serve as major hubs for a specific geographic area. Finally, a constellation of smaller, hyper-local events, classes, and workshops cater to niche interests and a more intimate audience. This tiered structure is a hallmark of a mature and well-established market.
        </Typography>

        <Typography variant="h4" component="h4">The All-Encompassing Metaphysical Marketplace</Typography>
        <Typography paragraph>
          This category represents the most common type of spiritual gathering, functioning as a vibrant marketplace where attendees can explore a wide variety of services and products under one roof.
        </Typography>

        <Typography variant="h5" component="h5">Profile: Spirit Fest USA</Typography>
        <Typography paragraph>
          Spirit Fest USA is a premier example of a traveling metaphysical marketplace with a strong presence on the East Coast. While the brand hosts events in various states, including Florida and Tennessee, a notable East Coast stop is in Virginia Beach, Virginia, with an event scheduled for September 20. The event's model is built on providing a one-stop-shop for a diverse array of spiritual services, including "psychic readers, healing practitioners, and merchandise vendors". The organizers also feature specialty services such as "aura photos" and "reflexology," positioning the expo as a high-energy, commercial hub for the spiritual community. The presence of this brand in multiple states demonstrates a deliberate business strategy: a proven, reliable demand for these types of events in various regions. This traveling circuit model allows organizers to professionalize their operations and build a recognizable brand, leading to greater attendee trust and vendor participation. The effect is a more stable and predictable calendar for both vendors and participants, transforming the market from a collection of isolated events into a structured, professionalized industry.
        </Typography>

        <Typography variant="h5" component="h5">Profile: Holistic Health & Healing Expo (HHH Expo)</Typography>
        <Typography paragraph>
          Another prominent example of the multi-location fair model is the Holistic Health & Healing Expo (HHH Expo). This event has a distinct mission to merge integrative health with conscious living and is a regular fixture in multiple East Coast cities. Its primary locations include Cherry Hill, New Jersey; Drexel Hill, Pennsylvania; and Deerfield Beach, Florida. The event's commitment to both spiritual and health-oriented topics is evidenced by its extensive list of workshops. These sessions go beyond simple vendor booths to provide in-depth instruction on subjects ranging from the practical to the paranormal. Workshops cover everything from a "Sound Healing Journey," "Crystal Healing Made Easy," and "Group Energy Healing" to "Paranormal 101 class," "Plant Medicines," and "Unlocking the Secrets of Microbiome".
        </Typography>

        <Typography variant="h5" component="h5">Profile: Mind Body Soul Expo</Typography>
        <Typography paragraph>
          In the regional market, the Mind Body Soul Expo in Saratoga Springs, New York, stands out as a significant event. The expo's scale is impressive, with over 130 vendors and attendance figures exceeding 4,000 people. The event's focus is on "Health, Wellness, and Holistic Therapies," and it provides a comprehensive experience with live presentations, performances, and instructional classes throughout the day. This event serves as a major hub for the mind-body-spirit community in the New York region, drawing a large crowd and demonstrating the strong demand for this type of gathering.
        </Typography>

        <hr />

        <Typography variant="h3" component="h3">The Transformational Festival Paradigm</Typography>
        <Typography variant="h4" component="h4">From Counterculture to Community: The Transformational Ethos</Typography>
        <Typography paragraph>
          A more niche but increasingly important category of spiritual gatherings is the transformational festival. These events are distinguished from conventional music festivals by their emphasis on "personal growth, social responsibility, healthy living, and creative expression". They are often characterized by communal activities such as seminars, classes, drum circles, and ceremonies, fostering a sense of shared purpose and a deep connection among participants. This paradigm represents a different kind of spiritual exploration, one that prioritizes immersion, self-discovery, and the building of a collective community.
        </Typography>

        <Typography variant="h4" component="h4">A Case Study in Transcendence: Transcend Fest, Connecticut</Typography>
        <Typography paragraph>
          Transcend Fest in Middlefield, Connecticut, serves as a prime example of a transformational festival on the East Coast. Nestled in the picturesque mountains at Powder Ridge, the event is designed as a "transformative weekend of yoga, wellness, and spirituality". Its programming directly aligns with the transformational ethos, featuring a diverse array of "yoga and movement workshops, thoughtfully curated wellness lectures, and enlightening spirituality classes." The festival fosters a unified atmosphere, particularly during "Transcend After Dark," where live DJs spin beats to create a sense of shared celebration and unity. The event's focus on deep immersion and self-discovery stands in contrast to the broader, more commercial appeal of a metaphysical fair. This distinction illustrates a segmentation within the spiritual market, where a general audience is drawn to the wide variety of a marketplace-style event, while a more committed and specific audience seeks the immersive, ethos-driven nature of a transformational festival. This development signifies a maturing market where attendees can now choose an experience precisely aligned with their personal journey.
        </Typography>

        <hr />

        <Typography variant="h3" component="h3">Navigating the Celestial: From Astrology to Astronomy</Typography>
        <Typography variant="h4" component="h4">The Role of Astrology Within Broader Events</Typography>
        <Typography paragraph>
          A key finding is that standalone astrology festivals are not a widespread phenomenon on the East Coast. Instead, astrology is most commonly found as a specialized service or workshop integrated into larger spiritual or holistic events. For example, a "New Age" event on Eventbrite lists "astrology" as a key tag or interest. Similarly, a Florida-based event highlights a specific class called "The Anchor Method - Astrology Event - Learn to Read Natal Charts," which is part of a larger series of spiritual classes. Other psychic and healing fairs, such as "The Journey Psychic & Healing Fair," list "astrology, numerology, and card reads" among their offerings, confirming its role as a component of a more comprehensive event.
        </Typography>

        <hr />

        <Typography variant="h3" component="h3">Table 2: Spotlight on Workshops & Activities</Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Activity/Workshop Name</TableCell>
                <TableCell>Associated Festival(s)</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Description</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[
                { name: 'Sound Healing Journey', festival: 'HHH Expo', location: 'Cherry Hill, NJ, Deerfield Beach, FL', category: 'Healing, Music', description: 'An immersive experience using sound for therapeutic and spiritual purposes.' },
                { name: 'Crystal Healing Made Easy', festival: 'HHH Expo', location: 'Cherry Hill, NJ, Deerfield Beach, FL', category: 'Mysticism, Healing', description: 'A class teaching the basics of using crystals for healing and energy work.' },
                { name: 'Paranormal 101 class', festival: 'HHH Expo', location: 'Cherry Hill, NJ, Deerfield Beach, FL', category: 'Mysticism, Education', description: 'An introductory course exploring paranormal phenomena and investigation.' },
                { name: 'The Anchor Method - Astrology Event', festival: 'Various local events on Eventbrite', location: 'Florida', category: 'Astrology, Education', description: 'A class focused on teaching participants how to read natal charts.' },
                { name: 'Around The Zodiac', festival: 'Paradox Astrology (event)', location: 'Lily Dale, NY', category: 'Astrology, Education', description: 'An evening presentation on the art and science of astrology and the 12 signs of the zodiac.' },
              ].map((row) => (
                <TableRow key={row.name}>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.festival}</TableCell>
                  <TableCell>{row.location}</TableCell>
                  <TableCell>{row.category}</TableCell>
                  <TableCell>{row.description}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <hr />

        <Typography variant="h4" component="h4">The Cosmic Dimension: The Distinction of Astronomy Festivals</Typography>
        <Typography paragraph>
          When addressing the term "cosmic," it is crucial to distinguish between two fundamentally different fields: <strong>astrology</strong>, a divinatory practice, and <strong>astronomy</strong>, a scientific discipline. This distinction is vital for providing an accurate and useful response to the query. While spiritual gatherings often explore "cosmic energy" or astrological charts, scientifically oriented "cosmic" festivals exist to celebrate the wonders of the universe through a different lens.
        </Typography>

        <Typography variant="h5" component="h5">Profile: Penn State AstroFest</Typography>
        <Typography paragraph>
          The Penn State AstroFest is the premier "cosmic" event on the East Coast that is rooted in science, not spirituality. Held annually in University Park, Pennsylvania, the festival is a free public outreach event featuring a variety of educational activities and stargazing opportunities. The program includes solar telescopes, planetarium shows, and talks on topics such as the history of humans observing the sky. The event is a celebration of scientific inquiry and discovery, drawing thousands of attendees annually to engage with the wonders of the universe through a scientific framework.
        </Typography>

        <Typography variant="h4" component="h4">The Curious Case of "Cosmico": An Outlier Analysis</Typography>
        <Typography paragraph>
          The term "cosmic" in the user's query can lead to ambiguity. In one interpretation, it refers to the spiritual cosmos, which is well-represented in holistic fairs. In another, it points to the scientific cosmos, as seen in AstroFest. A third, and more misleading, result is the "Cosmico" festival. While the name aligns with the query, this event is located in Sonoma County, California, and is primarily a boutique music festival. This festival's focus is on music, arts, food, and wine, with a "psychedelic" vibe, rather than a spiritual or scientific one. This example serves as a reminder that a comprehensive review of all available information is necessary to prevent a search from following a geographically or thematically irrelevant lead.
        </Typography>

        <hr />

        <Typography variant="h3" component="h3">Beyond the Festival: Retreats for Deeper Reflection</Typography>
        <Typography paragraph>
          To provide a truly comprehensive view of the East Coast spiritual landscape, it is important to look beyond high-energy festivals and consider the more introspective experience of a spiritual retreat. These gatherings cater to a different need, one of quiet reflection and deep inner work rather than external connection.
        </Typography>

        <Typography variant="h5" component="h5">Profile: Light on the Hill & Springwater Center</Typography>
        <Typography paragraph>
          Examples such as Light on the Hill and Springwater Center, both located in upstate New York, offer a stark contrast to the festival atmosphere. Their core mission is to provide a "sacred space" for "peace and solace away from their everyday worldly pursuits". These centers offer various programs, from guided and silent meditation to individual self-reflection in a natural setting, providing a much-needed sanctuary from the fast-paced world. The inclusion of retreats in this analysis is essential to provide a complete understanding of the available options. The market provides a full spectrum of experiences, and by acknowledging both the communal festival and the solitary retreat, this guide helps individuals choose a path that aligns with their temperament and spiritual goals.
        </Typography>

        <hr />

        <Typography variant="h3" component="h3">Curating Your Journey: Recommendations & Conclusions</Typography>
        <Typography paragraph>
          The East Coast spiritual and wellness market is a sophisticated ecosystem of events that has professionalized and diversified to serve a wide range of needs. The analysis indicates a clear structure, with a circuit of large-scale, commercial fairs providing a broad spiritual marketplace and a more curated set of transformational festivals offering an immersive, community-driven experience. Specialized topics such as astrology and energy healing are almost universally integrated as components of these larger gatherings, while gatherings focused on astronomy occupy a distinct, scientifically grounded niche.
        </Typography>
        <Typography paragraph>
          For the <strong>First-Time Explorer</strong> seeking a broad overview of the spiritual community, a multi-faceted expo like Spirit Fest or the Holistic Health & Healing Expo is a compelling choice. These events offer an accessible, one-day experience with a wide variety of vendors and services to sample.
        </Typography>
        <Typography paragraph>
          For the <strong>Dedicated Seeker</strong> looking for deeper personal work and community connection, a focused, ethos-driven event such as Transcend Fest is highly recommended. Alternatively, a visit to a spiritual retreat like Light on the Hill or Springwater Center provides a tranquil, introspective environment for a more solitary and profound journey.
        </Typography>
        <Typography paragraph>
          For the <strong>Intellectually Curious</strong> individual, Penn State AstroFest offers a unique opportunity to explore the "cosmic" from a purely scientific perspective. For those interested in the more esoteric, a deep dive into specific workshops at the HHH Expo, such as the "Paranormal 101 class" or "Crystal Healing Made Easy," could provide a focused exploration of those topics.
        </Typography>
        <Typography paragraph>
          The spiritual and wellness landscape on the East Coast is not a monolithic entity but a rich tapestry of experiences. By understanding the distinct archetypes of these gatherings, individuals can more effectively navigate their options and find the perfect event to support their personal journey.
        </Typography>
      </div>

      <section id="festival-quiz" className="card-class" style={{ margin: '2em 0' }}>
        <Typography variant="h2" component="h2" style={{ color: '#10b981', textAlign: 'center' }}>Find Your Ideal Festival</Typography>
        <Typography style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 1.5em auto' }}>
          Answer a few quick questions to discover which type of spiritual, cosmic, or wellness event best matches your interests and journey.
        </Typography>
        <form id="festivalQuizForm" onSubmit={handleQuizSubmit} style={{ maxWidth: '600px', margin: '0 auto' }}>
          <FormControl fullWidth margin="normal">
            <InputLabel>1. What are you most interested in?</InputLabel>
            <Select value={interest} onChange={(e) => setInterest(e.target.value)} required>
              <MenuItem value="">-- Select --</MenuItem>
              <MenuItem value="marketplace">Exploring vendors, readings, and metaphysical products</MenuItem>
              <MenuItem value="wellness">Workshops on health, healing, and holistic living</MenuItem>
              <MenuItem value="transformational">Immersive experiences, yoga, and community</MenuItem>
              <MenuItem value="astronomy">Science, stargazing, and astronomy</MenuItem>
              <MenuItem value="retreat">Quiet reflection and meditation</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>2. What kind of atmosphere do you prefer?</InputLabel>
            <Select value={atmosphere} onChange={(e) => setAtmosphere(e.target.value)} required>
              <MenuItem value="">-- Select --</MenuItem>
              <MenuItem value="high-energy">High-energy, commercial, lots of people</MenuItem>
              <MenuItem value="educational">Educational, community-focused</MenuItem>
              <MenuItem value="immersive">Immersive, creative, communal</MenuItem>
              <MenuItem value="scientific">Scientific, family-friendly</MenuItem>
              <MenuItem value="peaceful">Peaceful, introspective, nature</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>3. How long do you want your experience to be?</InputLabel>
            <Select value={duration} onChange={(e) => setDuration(e.target.value)} required>
              <MenuItem value="">-- Select --</MenuItem>
              <MenuItem value="day">One day</MenuItem>
              <MenuItem value="weekend">A weekend</MenuItem>
              <MenuItem value="multi-day">Several days</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>4. What is your budget?</InputLabel>
            <Select value={budget} onChange={(e) => setBudget(e.target.value)} required>
              <MenuItem value="">-- Select --</MenuItem>
              <MenuItem value="free">Free</MenuItem>
              <MenuItem value="under50">Under $50</MenuItem>
              <MenuItem value="50to150">$50-$150</MenuItem>
              <MenuItem value="150plus">Over $150</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>5. Are you looking for a family-friendly event?</InputLabel>
            <Select value={family} onChange={(e) => setFamily(e.target.value)} required>
              <MenuItem value="">-- Select --</MenuItem>
              <MenuItem value="yes">Yes</MenuItem>
              <MenuItem value="no">No</MenuItem>
              <MenuItem value="either">Doesn't matter</MenuItem>
            </Select>
          </FormControl>
          <Box textAlign="center" marginTop="1em">
            <Button type="submit" variant="contained" style={{ background: '#10b981', color: '#fff', padding: '0.7em 2em', borderRadius: '2em', fontSize: '1.1em', fontWeight: 600 }}>
              See My Match
            </Button>
          </Box>
        </form>
        {quizResult && (
          <Box id="festivalQuizResult" marginTop="2em" textAlign="center" fontSize="1.15em" fontWeight={500}>
            <Typography>{quizResult}</Typography>
            <Typography>To get your complete guide, check out our ebook on Patreon!</Typography>
            <Button
              variant="contained"
              href="https://www.patreon.com/posts/ai-access-139527004"
              target="_blank"
              style={{ background: '#10b981', color: '#fff', padding: '0.7em 2em', borderRadius: '2em', fontSize: '1.1em', fontWeight: 600, marginTop: '1em' }}
            >
              Get the eBook
            </Button>
          </Box>
        )}
      </section>

      <section id="festival-highlights" style={{ margin: '2.5em 0' }}>
        <Typography variant="h2" component="h2" style={{ color: '#10b981', textAlign: 'center' }}>Festival Highlights</Typography>
        <Grid container spacing={2} justifyContent="center" alignItems="stretch">
          {[
            { img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80', title: 'Top-Tier Musical Performances & Art', desc: 'Experience world-class live music, visionary art installations, and creative performances that inspire and uplift. These festivals are a feast for the senses, blending sound, color, and movement in unforgettable ways.' },
            { img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80', title: 'Yoga & Meditation Workshops', desc: 'Join expert-led yoga flows, guided meditations, and wellness workshops designed to nurture your body, mind, and spirit. All levels are welcome, from beginners to seasoned practitioners.' },
            { img: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80', title: 'Family-Friendly Activities & Art Lounges', desc: 'Enjoy a welcoming environment for all ages, with creative art lounges, interactive workshops, and fun activities for children and families to explore together.' },
            { img: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=600&q=80', title: 'Mini-Sessions with Vetted Practitioners', desc: 'Book mini-sessions with experienced healers, coaches, and holistic practitioners. Sample a variety of modalities in a safe, supportive setting.' },
            { img: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=600&q=80', title: 'Holistic Products & Metaphysical Items', desc: 'Browse a curated marketplace of crystals, essential oils, handmade crafts, and metaphysical tools to support your journey and well-being.' },
          ].map((item, index) => (
            <Grid item key={index} xs={12} sm={6} md={4} style={{ flex: '1 1 320px', maxWidth: '400px', marginBottom: '1.5em' }}>
              <Card style={{ background: '#f8fafc', borderRadius: '1.5em', padding: '1.5em', boxShadow: '0 4px 16px rgba(16,185,129,0.08)', textAlign: 'center', height: '100%' }}>
                <img src={item.img} alt={item.title} style={{ width: '100%', borderRadius: '1em', marginBottom: '1em' }} loading="lazy" />
                <CardContent>
                  <Typography variant="h3" component="h3" style={{ color: '#2c3e50' }}>{item.title}</Typography>
                  <Typography>{item.desc}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </section>
    </>
  );
};

export default SpiritualFestivalsPage;

