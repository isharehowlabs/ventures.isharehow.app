import React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Stack,
} from '@mui/material';
import Head from 'next/head';
import AppShell from '../components/AppShell';

export default function PrivacyPage() {
  return (
    <>
      <Head>
        <title>Privacy Policy - iShareHow Ventures</title>
        <link rel="canonical" href="https://ventures.isharehow.app/privacy" />
        <meta
          name="description"
          content="Privacy Policy for iShareHow Ventures - How we collect, use, and protect your personal information."
        />
      </Head>
      <AppShell active="home">
        <Box
          sx={{
            minHeight: '100vh',
            py: { xs: 4, md: 8 },
            bgcolor: 'background.default',
          }}
        >
          <Container maxWidth="md">
            <Paper elevation={2} sx={{ p: { xs: 3, md: 6 } }}>
              <Typography variant="h3" component="h1" fontWeight={700} gutterBottom>
                Privacy Policy
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                Last Updated: {new Date().toLocaleDateString()}
              </Typography>

              <Stack spacing={3}>
                <Box>
                  <Typography variant="h5" fontWeight={600} gutterBottom>
                    1. Information We Collect
                  </Typography>
                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    We collect information that you provide directly to us, including:
                  </Typography>
                  <Box component="ul" sx={{ mt: 1, pl: 3 }}>
                    <li>
                      <Typography variant="body1" color="text.secondary">
                        Name, email address, and contact information
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body1" color="text.secondary">
                        Account credentials and profile information
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body1" color="text.secondary">
                        Payment and billing information
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body1" color="text.secondary">
                        Usage data and analytics information
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body1" color="text.secondary">
                        Communications and support requests
                      </Typography>
                    </li>
                  </Box>
                </Box>

                <Box>
                  <Typography variant="h5" fontWeight={600} gutterBottom>
                    2. How We Use Your Information
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    We use the information we collect to:
                  </Typography>
                  <Box component="ul" sx={{ mt: 1, pl: 3 }}>
                    <li>
                      <Typography variant="body1" color="text.secondary">
                        Provide, maintain, and improve our services
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body1" color="text.secondary">
                        Process transactions and send related information
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body1" color="text.secondary">
                        Send technical notices, updates, and support messages
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body1" color="text.secondary">
                        Respond to your comments and questions
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body1" color="text.secondary">
                        Monitor and analyze trends and usage
                      </Typography>
                    </li>
                  </Box>
                </Box>

                <Box>
                  <Typography variant="h5" fontWeight={600} gutterBottom>
                    3. Information Sharing
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    We do not sell, trade, or rent your personal information to third parties. We may share your information only:
                  </Typography>
                  <Box component="ul" sx={{ mt: 1, pl: 3 }}>
                    <li>
                      <Typography variant="body1" color="text.secondary">
                        With your consent
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body1" color="text.secondary">
                        To comply with legal obligations
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body1" color="text.secondary">
                        To protect our rights and safety
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body1" color="text.secondary">
                        With service providers who assist in operating our platform
                      </Typography>
                    </li>
                  </Box>
                </Box>

                <Box>
                  <Typography variant="h5" fontWeight={600} gutterBottom>
                    4. Data Security
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    We implement appropriate technical and organizational security measures to protect your personal information. However, no method of transmission over the Internet or electronic storage is 100% secure.
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="h5" fontWeight={600} gutterBottom>
                    5. Cookies and Tracking
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    We use cookies and similar tracking technologies to track activity on our service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="h5" fontWeight={600} gutterBottom>
                    6. Your Rights
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    You have the right to:
                  </Typography>
                  <Box component="ul" sx={{ mt: 1, pl: 3 }}>
                    <li>
                      <Typography variant="body1" color="text.secondary">
                        Access and receive a copy of your personal data
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body1" color="text.secondary">
                        Request correction of inaccurate data
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body1" color="text.secondary">
                        Request deletion of your personal data
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body1" color="text.secondary">
                        Object to processing of your personal data
                      </Typography>
                    </li>
                  </Box>
                </Box>

                <Box>
                  <Typography variant="h5" fontWeight={600} gutterBottom>
                    7. Data Retention
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    We retain your personal information for as long as necessary to provide our services and fulfill the purposes described in this policy, unless a longer retention period is required by law.
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="h5" fontWeight={600} gutterBottom>
                    8. Children's Privacy
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Our service is not intended for children under 18 years of age. We do not knowingly collect personal information from children.
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="h5" fontWeight={600} gutterBottom>
                    9. Changes to This Policy
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="h5" fontWeight={600} gutterBottom>
                    10. Contact Us
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    If you have any questions about this Privacy Policy, please contact us through our support channels.
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Container>
        </Box>
      </AppShell>
    </>
  );
}

