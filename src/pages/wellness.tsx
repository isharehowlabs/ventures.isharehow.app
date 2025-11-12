import React, { useState, useEffect, FormEvent } from 'react';
import Head from 'next/head';
import {
  AppBar,
  Toolbar,
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Link as MuiLink,
} from '@mui/material';

const WellnessPage = () => {
  const [quizScores, setQuizScores] = useState({
    digestive: 0,
    urinary: 0,
    lymphatic: 0,
    respiratory: 0,
    integumentary: 0,
  });
  const [quizResult, setQuizResult] = useState('');

  const handleQuizChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    const system = event.target.getAttribute('data-system');
    if (system) {
      setQuizScores(prevScores => ({
        ...prevScores,
        [system]: checked ? prevScores[system as keyof typeof prevScores] + 1 : prevScores[system as keyof typeof prevScores] - 1,
      }));
    }
  };

  const handleQuizSubmit = (event: FormEvent) => {
    event.preventDefault();
    const maxScore = Math.max(...Object.values(quizScores));
    const systems = (Object.keys(quizScores) as Array<keyof typeof quizScores>).filter(key => quizScores[key] === maxScore);

    let resultMessage = '';
    if (maxScore === 0) {
      resultMessage = 'No symptoms or habits selected. Your body systems appear to be functioning well, but consult a healthcare professional for a thorough evaluation.';
    } else {
      resultMessage = 'Based on your symptoms and habits, the following system(s) may benefit from cleansing:<br />';
      systems.forEach(system => {
        resultMessage += `<strong>${system.charAt(0).toUpperCase() + system.slice(1)} System</strong>: `;
        if (system === 'digestive') {
          resultMessage += 'Consider improving hydration, fiber intake through fruits and vegetables, regular bowel habits, and consulting a healthcare provider for liver or colon health. Suggested product: <a href="#product-1">Detox Herbal Blend</a> for supporting liver and colon cleansing.<br />';
        } else if (system === 'urinary') {
          resultMessage += 'Focus on increasing hydration and consult a healthcare provider for kidney or bladder health. Suggested product: <a href="#product-1">Detox Herbal Blend</a> for kidney support and waste elimination.<br />';
        } else if (system === 'lymphatic') {
          resultMessage += 'Incorporate more exercise, mobility routines, or lymphatic massage to address aches and pains, and consult a healthcare provider. Suggested product: <a href="#product-2">Energizing Tonic</a> to boost vitality and lymphatic flow.<br />';
        } else if (system === 'respiratory') {
          resultMessage += 'Practice deep breathing exercises, stress management techniques to improve focus, and consult a healthcare provider for lung health. Suggested products: <a href="#product-3">Nervous System Support</a> for stress relief and focus, or <a href="#product-1">Detox Herbal Blend</a> for overall cleansing.<br />';
        } else if (system === 'integumentary') {
          resultMessage += 'Maintain proper hydration and skincare routines, and consult a dermatologist if issues persist. Suggested product: <a href="#product-1">Detox Herbal Blend</a> for skin purification and overall toxin removal.<br />';
        }
      });
      resultMessage += '<br /><strong>Additional Products to Consider:</strong> Depending on your overall needs, explore <a href="#product-4">Immune Defense Capsules</a> for immune support or <a href="#product-3">Nervous System Support</a> for additional calm.<br />';
      resultMessage += '<br /><strong>Note:</strong> Always consult a healthcare professional before starting any cleansing regimen or using products.';
    }
    setQuizResult(resultMessage);
  };

  useEffect(() => {
    const scriptURL = 'https://sdks.shopifycdn.com/buy-button/latest/buy-button-storefront.min.js';
    const ShopifyBuy = (window as any).ShopifyBuy;

    const loadScript = () => {
      const script = document.createElement('script');
      script.async = true;
      script.src = scriptURL;
      (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(script);
      script.onload = ShopifyBuyInit;
    };

    const ShopifyBuyInit = () => {
      const ShopifyBuy = (window as any).ShopifyBuy;
      if (ShopifyBuy) {
        const client = ShopifyBuy.buildClient({
          domain: 'isharehow.myshopify.com',
          storefrontAccessToken: 'dc79ce7c1d3c946b2badeb44db899665',
        });
        ShopifyBuy.UI.onReady(client).then((ui: any) => {
          const productOptions = {
            product: {
              styles: {
                product: { '@media (min-width: 601px)': { 'max-width': '100%', 'margin-left': '0', 'margin-bottom': '50px' } },
                button: { 'background-color': '#28a745', ':hover': { 'background-color': '#218838' } }
              },
              text: { button: 'Add to Cart' }
            },
            cart: { styles: { button: { 'background-color': '#28a745', ':hover': { 'background-color': '#218838' } } } }
          };

          // Product IDs are placeholders as in the original HTML
          ui.createComponent('product', { id: 'YOUR_PRODUCT_ID_1', node: document.getElementById('product-1'), moneyFormat: '${{amount}}', options: productOptions });
          ui.createComponent('product', { id: 'YOUR_PRODUCT_ID_2', node: document.getElementById('product-2'), moneyFormat: '${{amount}}', options: productOptions });
          ui.createComponent('product', { id: 'YOUR_PRODUCT_ID_3', node: document.getElementById('product-3'), moneyFormat: '${{amount}}', options: productOptions });
          ui.createComponent('product', { id: 'YOUR_PRODUCT_ID_4', node: document.getElementById('product-4'), moneyFormat: '${{amount}}', options: productOptions });
        });
      }
    };

    if (ShopifyBuy) {
      if (ShopifyBuy.UI) {
        ShopifyBuyInit();
      } else {
        loadScript();
      }
    } else {
      loadScript();
    }
  }, []);

  return (
    <>
      <Head>
        <title>Wellness Lab - Get 7-Day Micro-Habits Plan + Free Habit Tracker</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
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
      </Head>
      <style jsx global>{`
        body {
            font-family: 'Arial', sans-serif;
            background: url('/wellness/Gemini_Generated_Image_phlqv9phlqv9phlq.png') no-repeat center center fixed;
            background-size: cover;
        }
        .hero {
            background: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('/wellness/Gemini_Generated_Image_phlqv9phlqv9phlq.png') no-repeat center center;
            background-size: cover;
            color: white;
            padding: 150px 0;
            text-align: center;
        }
        .hero h1 { font-size: 3.5rem; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.5); }
        .section { padding: 80px 0; background: rgba(255,255,255,0.9); color: #333; }
        .about-img {
            background: url('/wellness/Gemini_Generated_Image_wy67jywy67jywy67.png') no-repeat center center;
            background-size: cover;
            height: 400px;
        }
        .product-card { background: white; border: none; box-shadow: 0 4px 8px rgba(0,0,0,0.1); transition: transform 0.3s; }
        .product-card:hover { transform: translateY(-10px); }
        .product-icon { font-size: 3rem; color: #28a745; }
        .cta { background: #28a745; color: white; }
        .footer { background: #343a40; color: white; padding: 40px 0; }
        .product-img { width: 100%; height: 200px; object-fit: cover; }
        #quiz-form-container {
            max-width: 700px;
            margin: 0 auto;
            background: #fff;
            color: #222;
            border: 2px solid #28a745;
            box-shadow: 0 4px 16px rgba(0,0,0,0.12);
            padding: 30px;
            border-radius: 10px;
        }
        #quiz-result { margin-top: 20px; background: #f8f9fa; padding: 15px; border-radius: 5px; }
      `}</style>

      <AppBar position="fixed" sx={{ bgcolor: 'background.paper', color: 'text.primary' }}>
        <Container>
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
              Wellness Lab
            </Typography>
            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
              {['#home', '#about', '#learn', '#quiz', '#products', '#contact'].map((item) => (
                <Button key={item} component="a" href={item} sx={{ color: 'text.primary' }}>
                  {item.substring(1)}
                </Button>
              ))}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Box component="main" sx={{ mt: 8 }}>
        <Box id="home" className="hero">
          <Container>
            <Button href="https://isharehow.app" variant="contained" color="success" size="large" sx={{ mb: 2, px: 5, py: 2, boxShadow: '0 2px 8px rgba(40,167,69,0.15)' }}>
              Home
            </Button>
            <Typography variant="h1" component="h1">Get Your 7-Day Micro-Habits Plan + Free Digital Tracker</Typography>
            <Typography variant="h5" component="p" sx={{ mt: 2 }}>
              At Wellness Lab, we combine ancient wisdom with advanced techniques to empower your holistic health journey.
            </Typography>
            <Button href="#products" variant="contained" size="large" sx={{ mt: 4, bgcolor: 'white', color: 'black', '&:hover': { bgcolor: '#f0f0f0' } }}>
              Download Free Plan
            </Button>
          </Container>
        </Box>

        <Box id="about" className="section">
          <Container>
            <Grid container alignItems="center" spacing={4}>
              <Grid item lg={6}>
                <Box className="about-img" sx={{ borderRadius: 2, mb: { xs: 4, lg: 0 } }} />
              </Grid>
              <Grid item lg={6}>
                <Typography variant="h2" component="h2">Why Micro-Habits Transform Lives Faster</Typography>
                <Typography paragraph>
                  At Wellness Lab, we blend timeless wisdom with cutting-edge techniques. Our mission is to guide you toward optimal health through detoxification, spiritual alignment, and holistic wellness.
                </Typography>
              </Grid>
            </Grid>
          </Container>
        </Box>

        <Box id="learn" className="section">
          <Container>
            <Typography variant="h2" component="h2" align="center" gutterBottom>Educational Resources</Typography>
            <Typography align="center" paragraph>
              Join our community for teachings on natural healing, spiritual growth, and holistic wellness.
            </Typography>
            <Grid container justifyContent="center">
              <Grid item md={6}>
                <ul style={{ listStyleType: 'none', padding: 0 }}>
                  <li><MuiLink href="https://www.youtube.com/@RisewithJamel" target="_blank">YouTube - Rise with Jamel</MuiLink></li>
                  <li><MuiLink href="https://www.patreon.com/JamelEliYah" target="_blank">Patreon - Jamel EliYah</MuiLink></li>
                  <li><MuiLink href="https://www.facebook.com/jameleliyah" target="_blank">Facebook - Jamel EliYah</MuiLink></li>
                </ul>
              </Grid>
            </Grid>
          </Container>
        </Box>

        <Box id="quiz" className="section">
          <Container>
            <Typography variant="h2" component="h2" align="center" gutterBottom>Body System Cleanse Quiz</Typography>
            <Typography align="center" paragraph>
              Answer the following questions to identify which body system may need cleansing.
            </Typography>
            <Box component="form" onSubmit={handleQuizSubmit} id="quiz-form-container">
              {Object.keys(quizScores).map((system) => (
                <Box key={system} sx={{ mb: 4 }}>
                  <Typography variant="h5" component="h2">{system.charAt(0).toUpperCase() + system.slice(1)} System</Typography>
                  <FormGroup>
                    {quizQuestions[system as keyof typeof quizQuestions].map(q => (
                      <FormControlLabel
                        key={q.value}
                        control={<Checkbox onChange={handleQuizChange} name={q.value} data-system={system} sx={{ color: '#28a745', '&.Mui-checked': { color: '#28a745' } }} />}
                        label={q.label}
                      />
                    ))}
                  </FormGroup>
                </Box>
              ))}
              <Button type="submit" variant="contained" color="success" fullWidth>Submit</Button>
            </Box>
            {quizResult && (
              <Box id="quiz-result" sx={{ mt: 2, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
                <Typography variant="h5">Results</Typography>
                <Typography dangerouslySetInnerHTML={{ __html: quizResult }} />
              </Box>
            )}
          </Container>
        </Box>

        <Box id="products" className="section">
          <Container>
            <Typography variant="h2" component="h2" align="center" gutterBottom>Our Healing Products</Typography>
            <Grid container spacing={4}>
              {products.map((p, i) => (
                <Grid item key={p.title} lg={3} md={6} xs={12}>
                  <Card className="product-card" sx={{ height: '100%', textAlign: 'center' }}>
                    <Box component="img" src={`/wellness/${p.img}`} alt={p.title} className="product-img" />
                    <CardContent>
                      <Typography className="product-icon" gutterBottom>{p.icon}</Typography>
                      <Typography variant="h5" component="h5">{p.title}</Typography>
                      <Typography paragraph>{p.desc}</Typography>
                      <div id={`product-${i + 1}`}></div>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>

        <Box className="section cta" sx={{ textAlign: 'center' }}>
          <Container>
            <Typography variant="h2" component="h2">Join Our Wellness Ministry</Typography>
            <Typography paragraph>Start your holistic health journey with our clinic-quality products and educational resources!</Typography>
            <Button href="#quiz" variant="outlined" color="inherit" size="large" sx={{ mx: 1 }}>Take Quiz</Button>
            <Button href="#learn" variant="outlined" color="inherit" size="large" sx={{ mx: 1 }}>See What Wellness Looks Like</Button>
          </Container>
        </Box>

        <Box className="section" sx={{ background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)', color: 'white', py: '4rem' }}>
          <Container>
            <Box sx={{ textAlign: 'center', mb: '3rem' }}>
              <Typography variant="h2" component="h2" sx={{ color: 'white', fontSize: '2.5rem', mb: '1rem' }}>🎯 Your Complete 7-Day Micro-Habits System</Typography>
              <Typography sx={{ fontSize: '1.2rem', opacity: 0.9 }}>Science-proven small changes that create massive results</Typography>
            </Box>
            <Grid container justifyContent="center" spacing={4}>
              {microHabitsSystem.map(item => (
                <Grid item key={item.title} lg={3} md={6} xs={12}>
                  <Box sx={{ background: 'rgba(255,255,255,0.15)', p: '2rem', borderRadius: '12px', textAlign: 'center', height: '100%' }}>
                    <Typography sx={{ fontSize: '3rem', mb: '1rem' }}>{item.icon}</Typography>
                    <Typography variant="h4" component="h4" sx={{ color: 'white', mb: '1rem' }}>{item.title}</Typography>
                    <Typography>{item.desc}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
            <Box sx={{ textAlign: 'center', mt: '2rem', p: '2rem', background: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}>
              <Typography variant="h3" component="h3" sx={{ color: '#ffd700', mb: '1rem' }}>✅ 100% Free - No Catch</Typography>
              <Button href="https://www.patreon.com/cw/JamelEliYah/membership" variant="contained" size="large" sx={{ bgcolor: 'white', color: 'black' }}>Join Patreon for Free Ebook</Button>
              <Typography sx={{ fontSize: '1.1rem', mt: 1 }}>Become a free member on Patreon to access your complete 7-day plan and tracker.</Typography>
            </Box>
          </Container>
        </Box>
      </Box>
    </>
  );
};

const quizQuestions = {
  digestive: [
    { value: "bloating", label: "Bloating or abdominal discomfort" },
    { value: "mild_indigestion", label: "Mild indigestion or occasional heartburn" },
    { value: "constipation", label: "Constipation or irregular bowel movements" },
    { value: "fatigue", label: "Fatigue after eating" },
    { value: "infrequent_bowels", label: "Infrequent bowel movements (fewer than 3 per week)" },
    { value: "low_fruit_veg", label: "Low fruit and vegetable intake (less than 5 servings per day)" },
    { value: "gas_bad_breath", label: "Occasional gas or bad breath" },
    { value: "weight_struggles", label: "Difficulty losing weight" },
  ],
  urinary: [
    { value: "dark_urine", label: "Dark or cloudy urine" },
    { value: "mild_discomfort", label: "Mild discomfort during urination" },
    { value: "frequent_urination", label: "Frequent urination or urgency" },
    { value: "edema", label: "Swelling (edema) in legs or ankles" },
    { value: "low_hydration", label: "Inadequate hydration (drinking less than 8 glasses of water per day)" },
    { value: "puffy_eyes", label: "Puffy eyes or face" },
    { value: "back_pain", label: "Occasional lower back pain" },
  ],
  lymphatic: [
    { value: "swollen_nodes", label: "Swollen lymph nodes" },
    { value: "occasional_swelling", label: "Occasional mild swelling in limbs" },
    { value: "fatigue", label: "Persistent fatigue" },
    { value: "skin_issues", label: "Recurring skin infections or rashes" },
    { value: "low_mobility", label: "Low physical activity or mobility (sedentary lifestyle)" },
    { value: "aches_pains", label: "Frequent aches and pains" },
    { value: "frequent_infections", label: "Frequent colds or infections" },
    { value: "mild_headaches", label: "Mild headaches" },
  ],
  respiratory: [
    { value: "shortness_breath", label: "Shortness of breath" },
    { value: "occasional_breath", label: "Occasional difficulty catching breath" },
    { value: "cough", label: "Chronic cough or mucus production" },
    { value: "allergies", label: "Frequent allergies or sinus issues" },
    { value: "mild_stress", label: "Mild or occasional stress" },
    { value: "moderate_stress", label: "Moderate stress levels" },
    { value: "high_stress", label: "High stress levels" },
    { value: "restlessness", label: "Restlessness or difficulty focusing" },
    { value: "wheezing", label: "Wheezing or chest tightness" },
    { value: "pollutant_exposure", label: "Exposure to smoke, pollutants, or poor air quality" },
  ],
  integumentary: [
    { value: "acne", label: "Acne or skin breakouts" },
    { value: "occasional_breakouts", label: "Occasional minor skin breakouts" },
    { value: "dry_skin", label: "Dry or itchy skin" },
    { value: "excess_sweat", label: "Excessive sweating or body odor" },
    { value: "dull_skin", label: "Dull or uneven skin tone" },
    { value: "sensitive_skin", label: "Sensitive or irritated skin" },
  ],
};

const products = [
  { icon: '🌿', title: 'Detox Herbal Blend', desc: 'Cleanse your body with our powerful blend of herbs designed to support lymphatic and digestive health.', img: 'Gemini_Generated_Image_s3un7ms3un7ms3un.png' },
  { icon: '⚡', title: 'Energizing Tonic', desc: 'Boost vitality and balance with our advanced herbal tonic, crafted to enhance energy flow.', img: 'Gemini_Generated_Image_8t3idz8t3idz8t3i.png' },
  { icon: '💧', title: 'Nervous System Support', desc: 'Calm and restore your nervous system with our soothing herbal formula, inspired by holistic traditions.', img: 'Gemini_Generated_Image_4tkuei4tkuei4tku.png' },
  { icon: '👁️', title: 'Immune Defense Capsules', desc: 'Strengthen your body’s natural defenses with our advanced herbal capsules for holistic immunity.', img: 'Gemini_Generated_Image_s949w0s949w0s949.png' },
];

const microHabitsSystem = [
    { icon: '📋', title: 'Personalized Plan', desc: 'Custom micro-habits based on your goals, schedule, and lifestyle preferences' },
    { icon: '📱', title: 'Free Digital Tracker', desc: 'Beautiful habit tracking app with reminders, progress charts, and streak counters' },
    { icon: '🎓', title: 'Daily Guidance', desc: 'Step-by-step instructions, tips, and science-backed insights for each day' },
    { icon: '🌟', title: 'Lifetime Access', desc: 'Keep your plan forever, plus access to our growing library of bonus habits' },
];

export default WellnessPage;
