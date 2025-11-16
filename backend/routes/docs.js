import express from 'express';
import { google } from 'googleapis';

const router = express.Router();

// Helper to get io instance
const getIO = (req) => {
  return req.app.get('io');
};

// Middleware to check authentication
const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

// Initialize Google OAuth2 client
// Note: GOOGLE_REDIRECT_URI should be configured in environment variables
// For Firebase app (isharehowdash.firebaseapp.com), use: https://isharehowdash.firebaseapp.com/api/auth/google/callback
// For ventures.isharehow.app, use: https://ventures.isharehow.app/api/auth/google/callback
const getOAuth2Client = (user) => {
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  if (!redirectUri) {
    console.warn('GOOGLE_REDIRECT_URI is not configured. Google OAuth may not work correctly.');
  }
  
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectUri
  );

  if (user.googleAccessToken && user.googleRefreshToken) {
    oauth2Client.setCredentials({
      access_token: user.googleAccessToken,
      refresh_token: user.googleRefreshToken,
    });
  }

  return oauth2Client;
};

// List documents
router.get('/', requireAuth, async (req, res) => {
  try {
    const oauth2Client = getOAuth2Client(req.user);
    const docs = google.docs({ version: 'v1', auth: oauth2Client });
    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    // Get documents from Google Drive
    const response = await drive.files.list({
      q: "mimeType='application/vnd.google-apps.document'",
      fields: 'files(id, name, modifiedTime, createdTime)',
      orderBy: 'modifiedTime desc',
      pageSize: 50,
    });

    res.json({ documents: response.data.files || [] });
  } catch (error) {
    console.error('Error listing documents:', error);

    // If Google auth has expired or been revoked, surface a clear 401 to the frontend
    const status = error?.code || error?.response?.status;
    const message = error?.message || '';
    const authRelated =
      status === 401 ||
      status === 403 ||
      message.includes('invalid_grant') ||
      message.includes('unauthorized_client') ||
      message.includes('invalid_token');

    if (authRelated) {
      return res.status(401).json({
        error: 'Google authentication required',
        code: 'google_auth_required',
        message: 'Your Google connection has expired or been revoked. Please reconnect your account.',
      });
    }

    res.status(500).json({ error: 'Failed to list documents', message });
  }
});

// Get document details
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const oauth2Client = getOAuth2Client(req.user);
    const docs = google.docs({ version: 'v1', auth: oauth2Client });

    const document = await docs.documents.get({
      documentId: id,
    });

    res.json({ document: document.data });
  } catch (error) {
    console.error('Error fetching document:', error);

    const status = error?.code || error?.response?.status;
    const message = error?.message || '';
    const authRelated =
      status === 401 ||
      status === 403 ||
      message.includes('invalid_grant') ||
      message.includes('unauthorized_client') ||
      message.includes('invalid_token');

    if (authRelated) {
      return res.status(401).json({
        error: 'Google authentication required',
        code: 'google_auth_required',
        message: 'Your Google connection has expired or been revoked. Please reconnect your account.',
      });
    }

    res.status(500).json({ error: 'Failed to fetch document', message });
  }
});

// Create document
router.post('/', requireAuth, async (req, res) => {
  try {
    const { title, content } = req.body;
    const oauth2Client = getOAuth2Client(req.user);
    const docs = google.docs({ version: 'v1', auth: oauth2Client });

    const document = await docs.documents.create({
      requestBody: {
        title: title || 'New Document',
      },
    });

    if (content) {
      await docs.documents.batchUpdate({
        documentId: document.data.documentId,
        requestBody: {
          requests: [
            {
              insertText: {
                location: {
                  index: 1,
                },
                text: content,
              },
            },
          ],
        },
      });
    }

    // Emit socket event for document creation
    const io = getIO(req);
    if (io) {
      io.emit('document:created', {
        id: document.data.documentId,
        title: title || 'New Document',
      });
    }

    res.json({ document: document.data });
  } catch (error) {
    console.error('Error creating document:', error);

    const status = error?.code || error?.response?.status;
    const message = error?.message || '';
    const authRelated =
      status === 401 ||
      status === 403 ||
      message.includes('invalid_grant') ||
      message.includes('unauthorized_client') ||
      message.includes('invalid_token');

    if (authRelated) {
      return res.status(401).json({
        error: 'Google authentication required',
        code: 'google_auth_required',
        message: 'Your Google connection has expired or been revoked. Please reconnect your account.',
      });
    }

    res.status(500).json({ error: 'Failed to create document', message });
  }
});

// Update document
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const oauth2Client = getOAuth2Client(req.user);
    const docs = google.docs({ version: 'v1', auth: oauth2Client });

    // Get current document to find end index
    const document = await docs.documents.get({ documentId: id });
    const endIndex = document.data.body?.content?.[document.data.body.content.length - 1]?.endIndex || 1;

    await docs.documents.batchUpdate({
      documentId: id,
      requestBody: {
        requests: [
          {
            deleteContentRange: {
              range: {
                startIndex: 1,
                endIndex: endIndex - 1,
              },
            },
          },
          {
            insertText: {
              location: {
                index: 1,
              },
              text: content || '',
            },
          },
        ],
      },
    });

    // Emit socket event for document update
    const io = getIO(req);
    if (io) {
      io.to(`document:${id}`).emit('document:updated', {
        id: id,
        title: 'Document',
        updatedBy: req.user?.name || 'Unknown',
      });
    }

    res.json({ message: 'Document updated successfully' });
  } catch (error) {
    console.error('Error updating document:', error);
    res.status(500).json({ error: 'Failed to update document', message: error.message });
  }
});

export default router;

