import { Box, Typography, Container, Button, Card, CardContent, TextField, Link as MuiLink } from '@mui/material';
import Link from 'next/link';

export default function PACT() {
  return (
    <Box sx={{ fontFamily: "'Montserrat', Arial, sans-serif", background: 'linear-gradient(135deg, #2c5aa0 0%, #1e2a47 100%)', color: '#f4f4f4' }}>
      {/* Header */}
      <Box
        component="header"
        sx={{
          background: 'linear-gradient(90deg, #2c5aa0 60%, #1e2a47 100%)',
          color: '#fff',
          padding: { xs: '20px', md: '40px 20px 20px 20px' },
          display: 'flex',
          alignItems: 'center',
          gap: '30px',
          boxShadow: '0 4px 16px rgba(44,90,160,0.15)',
          flexDirection: { xs: 'column', md: 'row' },
          textAlign: { xs: 'center', md: 'left' },
        }}
      >
        <Box
          component="img"
          src="https://yt3.googleusercontent.com/JopyS6NWXy80IipbG-kTwQJdCqbT45JBZ3b8JCCwnNSFCXHsqFZTCoJKv6ERl3XPXEzbU49njYo=s160-c-k-c0x00ffffff-no-rj"
          alt="PACT Venture Logo"
          sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            boxShadow: '0 2px 8px rgba(44,90,160,0.25)',
            background: '#fff',
            objectFit: 'cover',
            marginBottom: { xs: '10px', md: 0 },
          }}
        />
        <Box>
          <Typography variant="h1" sx={{ fontSize: '2.2em', fontWeight: 'bold', color: '#ffd700', letterSpacing: 2, mb: 1 }}>
            PACT Venture
          </Typography>
          <Typography sx={{ fontSize: '1.1em', color: '#e0e0e0', fontWeight: 500 }}>
            Property Care Training for Tomorrow's Workforce
          </Typography>
        </Box>
      </Box>

      {/* Navigation */}
      <Box component="nav" sx={{ background: '#1e2a47', padding: '12px 0', textAlign: 'center', boxShadow: '0 2px 8px rgba(44,90,160,0.10)' }}>
        <Link href="#home" passHref><Button component="a" sx={{ color: '#ffd700', margin: '0 18px', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.08em', '&:hover': { color: '#ff6b35' } }}>Home</Button></Link>
        <Link href="#about" passHref><Button component="a" sx={{ color: '#ffd700', margin: '0 18px', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.08em', '&:hover': { color: '#ff6b35' } }}>About</Button></Link>
        <Link href="#services" passHref><Button component="a" sx={{ color: '#ffd700', margin: '0 18px', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.08em', '&:hover': { color: '#ff6b35' } }}>Services</Button></Link>
        <Link href="#videos" passHref><Button component="a" sx={{ color: '#ffd700', margin: '0 18px', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.08em', '&:hover': { color: '#ff6b35' } }}>Videos</Button></Link>
        <Link href="#contact" passHref><Button component="a" sx={{ color: '#ffd700', margin: '0 18px', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.08em', '&:hover': { color: '#ff6b35' } }}>Contact</Button></Link>
      </Box>

      {/* Hero Section */}
      <Box id="home" sx={{ background: 'linear-gradient(120deg, #2c5aa0 60%, #1e2a47 100%)', color: '#fff', textAlign: 'center', padding: '90px 20px 60px 20px', boxShadow: '0 2px 12px rgba(44,90,160,0.10)' }}>
        <Container>
          <Typography variant="h2" sx={{ fontSize: '2.8em', mb: 2, fontWeight: 700, color: '#ffd700', textShadow: '1px 2px 8px #1e2a47' }}>
            Creating Jobs in Property Care for Disadvantaged Communities
          </Typography>
          <Typography variant="h5" sx={{ fontSize: '1.3em', color: '#e0e0e0', mb: 4 }}>
            Empowering lives through training and employment in maintenance, lawn care, cleaning, and more.
          </Typography>
          <Link href="#contact" passHref>
            <Button
              component="a"
              variant="contained"
              sx={{
                backgroundColor: '#ffd700',
                color: '#2c5aa0',
                padding: '15px 36px',
                borderRadius: '30px',
                fontWeight: 'bold',
                fontSize: '1.1em',
                boxShadow: '0 2px 8px rgba(44,90,160,0.10)',
                '&:hover': { backgroundColor: '#ff6b35', color: '#fff' },
              }}
            >
              Contact Us Today
            </Button>
          </Link>
        </Container>
      </Box>

      <Container>
        {/* About Section */}
        <Box id="about" sx={{ padding: '50px 20px', background: 'rgba(255,255,255,0.07)', borderRadius: '18px', textAlign: 'center', my: 4 }}>
          <Typography variant="h3" sx={{ fontSize: '2.2em', color: '#ffd700', mb: 2 }}>
            About PACT
          </Typography>
          <Typography sx={{ color: '#f4f4f4', fontSize: '1.1em', mb: 2 }}>
            At PACT Venture, we are dedicated to bridging the gap for disadvantaged communities by providing essential job training and placement in the property care industry. Our programs focus on skill-building in areas like property maintenance, lawn care, cleaning services, and beyond, ensuring sustainable employment opportunities that uplift individuals and strengthen communities.
          </Typography>
          <Typography sx={{ color: '#f4f4f4', fontSize: '1.1em' }}>
            Watch our story unfold through our YouTube channel: <MuiLink href="https://www.youtube.com/@PACTVenture" target="_blank" rel="noopener noreferrer" sx={{ color: '#ffd700' }}>PACT Venture on YouTube</MuiLink>
          </Typography>
        </Box>

        {/* Services Section */}
        <Box id="services" sx={{ padding: '50px 20px', background: 'rgba(44,90,160,0.08)', borderRadius: '18px', my: 4 }}>
          <Typography variant="h3" sx={{ textAlign: 'center', fontSize: '2.2em', color: '#ffd700', mb: 3 }}>
            Our Services
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '22px', mt: 4 }}>
            {[
              { title: 'Property Maintenance', description: 'Training in repairs, painting, and general upkeep to keep properties in top condition.' },
              { title: 'Lawn Care', description: 'Expert guidance on landscaping, mowing, and garden maintenance for beautiful outdoor spaces.' },
              { title: 'Cleaning Services', description: 'Comprehensive cleaning techniques for residential and commercial properties.' },
              { title: 'Job Placement', description: 'Connecting trained individuals with employers in the property care sector.' },
            ].map(service => (
              <Card key={service.title} sx={{ background: 'rgba(255,255,255,0.12)', borderRadius: '12px', textAlign: 'center', color: '#fff' }}>
                <CardContent>
                  <Typography variant="h5" sx={{ color: '#ffd700', mb: 1 }}>{service.title}</Typography>
                  <Typography>{service.description}</Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>

        {/* Videos Section */}
        <Box id="videos" sx={{ padding: '50px 20px', background: 'rgba(255,255,255,0.07)', borderRadius: '18px', my: 4 }}>
          <Typography variant="h3" sx={{ textAlign: 'center', fontSize: '2.2em', color: '#ffd700', mb: 2 }}>
            Our Impact in Action
          </Typography>
          <Typography sx={{ textAlign: 'center', mb: 3 }}>Discover how PACT is transforming lives through our featured videos.</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', mt: 4 }}>
            {[
              { src: "https://www.youtube.com/embed/YQZYWvlguoE?si=JSFCzhAWz_5IR0oq", title: "From Rejection To Greatness" },
              { src: "https://www.youtube.com/embed/-UwxTq8jkUs?si=9vigHgdJ2rCk6uOo", title: "Ignite Your Wealth & Impact" },
              { src: "https://www.youtube.com/embed/5VygRJCbwi4?si=Jt3kygHDsAkcIiMI", title: "Pact Credit Hacks Series" },
            ].map(video => (
              <Box key={video.title}>
                <Box
                  component="iframe"
                  src={video.src}
                  title={video.title}
                  frameBorder="0"
                  allowFullScreen
                  sx={{ width: '100%', height: 200, borderRadius: '12px', boxShadow: '0 2px 8px rgba(44,90,160,0.10)' }}
                />
                <Typography sx={{ color: '#ffd700', fontWeight: 500, mt: 1, textAlign: 'center' }}>{video.title}</Typography>
              </Box>
            ))}
          </Box>
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button
              href="https://www.youtube.com/@PACTVenture/videos"
              target="_blank"
              rel="noopener noreferrer"
              variant="contained"
              sx={{
                backgroundColor: '#ffd700',
                color: '#2c5aa0',
                padding: '15px 36px',
                borderRadius: '30px',
                fontWeight: 'bold',
                fontSize: '1.1em',
                '&:hover': { backgroundColor: '#ff6b35', color: '#fff' },
              }}
            >
              View All Videos
            </Button>
          </Box>
        </Box>

        {/* Contact Section */}
        <Box id="contact" sx={{ padding: '50px 20px', background: 'linear-gradient(90deg, #2c5aa0 60%, #1e2a47 100%)', color: '#fff', textAlign: 'center', borderRadius: '18px', my: 4 }}>
          <Typography variant="h3" sx={{ fontSize: '2.2em', color: '#ffd700', mb: 2 }}>
            Contact Us Today
          </Typography>
          <Typography>Ready to learn more about our services or join our programs? Get in touch!</Typography>
          <Box
            component="form"
            action="https://formsubmit.co/pact@isharehowventures.com"
            method="POST"
            sx={{ maxWidth: 500, margin: '20px auto' }}
          >
            <TextField fullWidth placeholder="Your Name" name="Name" required sx={{ my: 1, '& .MuiInputBase-root': { background: '#fff', borderRadius: '5px' } }} />
            <TextField fullWidth placeholder="Your Email" name="Email" type="email" required sx={{ my: 1, '& .MuiInputBase-root': { background: '#fff', borderRadius: '5px' } }} />
            <TextField fullWidth placeholder="Your Message" name="Message" multiline rows={5} required sx={{ my: 1, '& .MuiInputBase-root': { background: '#fff', borderRadius: '5px' } }} />
            <input type="hidden" name="_subject" value="New Contact Form Submission" />
            <input type="hidden" name="_next" value="https://www.youtube.com/@PACTVenture" />
            <Button
              type="submit"
              variant="contained"
              sx={{
                backgroundColor: '#ffd700',
                color: '#2c5aa0',
                padding: '10px 20px',
                borderRadius: '30px',
                fontWeight: 'bold',
                fontSize: '1.1em',
                mt: 2,
                '&:hover': { backgroundColor: '#ff6b35', color: '#fff' },
              }}
            >
              Send Message
            </Button>
          </Box>
        </Box>
      </Container>

      {/* Footer */}
      <Box component="footer" sx={{ background: '#1e2a47', color: '#ffd700', textAlign: 'center', padding: '16px', fontSize: '1.05em', letterSpacing: 1 }}>
        <Typography>
          &copy; 2025 PACT Venture. All rights reserved. | <MuiLink href="https://www.youtube.com/@PACTVenture" target="_blank" rel="noopener noreferrer" sx={{ color: '#ffd700' }}>YouTube</MuiLink>
        </Typography>
      </Box>
    </Box>
  );
}
