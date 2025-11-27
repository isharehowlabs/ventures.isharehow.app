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

export default function TermsPage() {
  return (
    <>
      <Head>
        <title>Terms & Conditions - iShareHow Ventures</title>
        <meta
          name="description"
          content="Terms and Conditions for iShareHow Ventures services and platform."
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
                Terms & Conditions
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                Last Updated: {new Date().toLocaleDateString()}
              </Typography>

              <Stack spacing={3}>
                <Box>
                  <Typography variant="h5" fontWeight={600} gutterBottom>
                    1. Acceptance of Terms
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    By accessing and using iShareHow Ventures services, you accept and agree to be bound by the terms and provision of this agreement.
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="h5" fontWeight={600} gutterBottom>
                    2. Use License
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Permission is granted to temporarily access the materials on iShareHow Ventures' website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
                  </Typography>
                  <Box component="ul" sx={{ mt: 1, pl: 3 }}>
                    <li>
                      <Typography variant="body1" color="text.secondary">
                        Modify or copy the materials
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body1" color="text.secondary">
                        Use the materials for any commercial purpose or for any public display
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body1" color="text.secondary">
                        Attempt to reverse engineer any software contained on the website
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body1" color="text.secondary">
                        Remove any copyright or other proprietary notations from the materials
                      </Typography>
                    </li>
                  </Box>
                </Box>

                <Box>
                  <Typography variant="h5" fontWeight={600} gutterBottom>
                    3. Service Terms
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    iShareHow Ventures provides creative services, dashboards, and AI-powered tools. Service availability, features, and pricing are subject to change. We reserve the right to modify or discontinue services with reasonable notice.
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="h5" fontWeight={600} gutterBottom>
                    4. Payment Terms
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Payment is required according to the selected plan. Monthly plans are billed monthly, annual plans are billed annually. Refunds are subject to our refund policy. Late payments may result in service suspension.
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="h5" fontWeight={600} gutterBottom>
                    5. User Accounts
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use of your account. We are not liable for any loss or damage arising from your failure to protect your account.
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="h5" fontWeight={600} gutterBottom>
                    6. Intellectual Property
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    All content, features, and functionality of the service are owned by iShareHow Ventures and are protected by international copyright, trademark, and other intellectual property laws.
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="h5" fontWeight={600} gutterBottom>
                    7. Limitation of Liability
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    In no event shall iShareHow Ventures or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on iShareHow Ventures' website.
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="h5" fontWeight={600} gutterBottom>
                    8. Revisions
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    iShareHow Ventures may revise these terms of service at any time without notice. By using this website you are agreeing to be bound by the then current version of these terms of service.
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="h5" fontWeight={600} gutterBottom>
                    9. Contact Information
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    If you have any questions about these Terms & Conditions, please contact us through our support channels.
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

