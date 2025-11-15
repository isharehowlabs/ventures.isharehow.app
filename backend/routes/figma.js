import express from 'express';

const router = express.Router();

// Note: Figma API calls use server-side Figma token, so authentication is optional
// Authentication can be added back if needed for tracking usage

const FIGMA_ACCESS_TOKEN = process.env.FIGMA_ACCESS_TOKEN;
const FIGMA_API_URL = 'https://api.figma.com/v1';

// Helper to get user's teams (for debugging/validation)
router.get('/teams', async (req, res) => {
  try {
    if (!FIGMA_ACCESS_TOKEN) {
      return res.status(500).json({ error: 'Figma access token not configured' });
    }

    const response = await fetch(`${FIGMA_API_URL}/teams`, {
      headers: {
        'X-Figma-Token': FIGMA_ACCESS_TOKEN,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Figma API error: ${response.status}`;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.err || errorData.message || errorMessage;
      } catch (e) {
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    res.json({ teams: data.teams || [] });
  } catch (error) {
    console.error('Error fetching Figma teams:', error);
    res.status(500).json({ error: 'Failed to fetch Figma teams', message: error.message });
  }
});

// List Figma files (aggregates files from all projects in the team)
router.get('/files', async (req, res) => {
  try {
    if (!FIGMA_ACCESS_TOKEN) {
      return res.status(500).json({ error: 'Figma access token not configured' });
    }

    const teamId = process.env.FIGMA_TEAM_ID;
    if (!teamId) {
      return res.status(500).json({ error: 'Figma team ID not configured' });
    }

    // First, get all projects for the team
    const projectsResponse = await fetch(`${FIGMA_API_URL}/teams/${teamId}/projects`, {
      headers: {
        'X-Figma-Token': FIGMA_ACCESS_TOKEN,
      },
    });

    if (!projectsResponse.ok) {
      const errorText = await projectsResponse.text();
      let errorMessage = `Figma API error: ${projectsResponse.status}`;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.err || errorData.message || errorMessage;
      } catch (e) {
        errorMessage = errorText || errorMessage;
      }
      console.error('Figma API error details:', {
        status: projectsResponse.status,
        statusText: projectsResponse.statusText,
        error: errorMessage,
        teamId: teamId,
      });
      throw new Error(errorMessage);
    }

    const projectsData = await projectsResponse.json();
    const projects = projectsData.projects || [];

    // Then, get files from each project
    const allFiles = [];
    for (const project of projects) {
      try {
        const filesResponse = await fetch(`${FIGMA_API_URL}/projects/${project.id}/files`, {
          headers: {
            'X-Figma-Token': FIGMA_ACCESS_TOKEN,
          },
        });

        if (filesResponse.ok) {
          const filesData = await filesResponse.json();
          const files = filesData.files || [];
          // Add project name to each file for context
          allFiles.push(...files.map(file => ({
            ...file,
            projectName: project.name,
            projectId: project.id,
          })));
        }
      } catch (err) {
        console.warn(`Failed to fetch files for project ${project.id}:`, err.message);
        // Continue with other projects even if one fails
      }
    }

    res.json({ projects: allFiles });
  } catch (error) {
    console.error('Error fetching Figma files:', error);
    res.status(500).json({ error: 'Failed to fetch Figma files', message: error.message });
  }
});

// Get file details
router.get('/file/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!FIGMA_ACCESS_TOKEN) {
      return res.status(500).json({ error: 'Figma access token not configured' });
    }

    const response = await fetch(`${FIGMA_API_URL}/files/${id}`, {
      headers: {
        'X-Figma-Token': FIGMA_ACCESS_TOKEN,
      },
    });

    if (!response.ok) {
      throw new Error(`Figma API error: ${response.status}`);
    }

    const data = await response.json();
    res.json({ file: data });
  } catch (error) {
    console.error('Error fetching Figma file:', error);
    res.status(500).json({ error: 'Failed to fetch Figma file', message: error.message });
  }
});

// Get design components
router.get('/file/:id/components', async (req, res) => {
  try {
    const { id } = req.params;
    if (!FIGMA_ACCESS_TOKEN) {
      return res.status(500).json({ error: 'Figma access token not configured' });
    }

    const response = await fetch(`${FIGMA_API_URL}/files/${id}`, {
      headers: {
        'X-Figma-Token': FIGMA_ACCESS_TOKEN,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Figma API error: ${response.status}`;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.err || errorData.message || errorMessage;
      } catch (e) {
        errorMessage = errorText || errorMessage;
      }
      console.error('Figma API error details for components:', {
        status: response.status,
        statusText: response.statusText,
        error: errorMessage,
        fileId: id,
      });
      throw new Error(errorMessage);
    }

    const data = await response.json();
    const components = Object.values(data.components || {});
    res.json({ components });
  } catch (error) {
    console.error('Error fetching Figma components:', error);
    res.status(500).json({ error: 'Failed to fetch Figma components', message: error.message });
  }
});

// Get design tokens
router.get('/file/:id/tokens', async (req, res) => {
  try {
    const { id } = req.params;
    if (!FIGMA_ACCESS_TOKEN) {
      return res.status(500).json({ error: 'Figma access token not configured' });
    }

    const response = await fetch(`${FIGMA_API_URL}/files/${id}`, {
      headers: {
        'X-Figma-Token': FIGMA_ACCESS_TOKEN,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Figma API error: ${response.status}`;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.err || errorData.message || errorMessage;
      } catch (e) {
        errorMessage = errorText || errorMessage;
      }
      console.error('Figma API error details for tokens:', {
        status: response.status,
        statusText: response.statusText,
        error: errorMessage,
        fileId: id,
      });
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    // Extract design tokens from styles
    const styles = data.styles || {};
    const tokens = Object.values(styles).map((style) => ({
      id: style.key,
      name: style.name,
      description: style.description,
      styleType: style.styleType,
    }));

    res.json({ tokens });
  } catch (error) {
    console.error('Error fetching Figma tokens:', error);
    res.status(500).json({ error: 'Failed to fetch Figma tokens', message: error.message });
  }
});

export default router;

