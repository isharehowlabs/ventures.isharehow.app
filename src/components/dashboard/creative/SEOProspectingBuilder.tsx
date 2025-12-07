import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
  TextField,
  Button,
  Alert,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Card,
  CardContent,
  Divider,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Search as SearchIcon,
  AutoAwesome as AiIcon,
  Description as GuideIcon,
  Quiz as QuizIcon,
  ContentCopy as CopyIcon,
  Download as DownloadIcon,
  Launch as LaunchIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { getBackendUrl } from '../../../utils/backendUrl';

interface QuizAnswer {
  questionId: string;
  answer: string;
}

interface ScriptResult {
  script: string;
  seoAudit: string;
  valueProposition: string;
  nextSteps: string[];
}

export default function SEOProspectingBuilder() {
  const [activeStep, setActiveStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswer[]>([]);
  const [clientWebsite, setClientWebsite] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientIndustry, setClientIndustry] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [scriptResult, setScriptResult] = useState<ScriptResult | null>(null);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [copied, setCopied] = useState(false);

  const steps = ['Guide', 'Quiz', 'SEO Audit', 'Generate Script'];

  const guideContent = {
    title: "The 'Add Value First' Approach to SEO Prospecting",
    sections: [
      {
        title: "What is 'Add Value First'?",
        content: `The "Add Value First" philosophy, inspired by Grant Cardone and Alex Hormozi, means providing genuine value to prospects BEFORE asking for anything in return. This approach builds trust, demonstrates expertise, and dramatically increases response rates.`,
      },
      {
        title: "Why It Works",
        content: `Traditional cold outreach gets ignored because it's self-serving. When you lead with value—like a free SEO audit or actionable insights—you immediately differentiate yourself. Prospects see you as a helpful expert, not just another salesperson.`,
      },
      {
        title: "The Framework",
        content: `1. Research: Understand their business, pain points, and SEO opportunities
2. Provide Value: Offer a free SEO audit or specific insights
3. Build Rapport: Show genuine interest in their success
4. Soft Ask: Invite them to a conversation, not a sales pitch
5. Follow Up: Continue providing value even if they don't respond immediately`,
      },
      {
        title: "Key Principles",
        content: `• Personalization is non-negotiable
• Focus on their problems, not your solutions
• Use data and insights, not flattery
• Make it easy for them to say yes
• Follow up with more value, not pressure`,
      },
    ],
  };

  const quizQuestions = [
    {
      id: 'q1',
      question: "What is the prospect's primary business goal?",
      placeholder: "e.g., Increase online sales, Generate more leads, Build brand awareness",
    },
    {
      id: 'q2',
      question: "What SEO challenges do you think they're facing?",
      placeholder: "e.g., Low organic traffic, Poor keyword rankings, High bounce rate",
    },
    {
      id: 'q3',
      question: "What specific value can you offer them immediately?",
      placeholder: "e.g., Free SEO audit, Competitor analysis, Content gap analysis",
    },
    {
      id: 'q4',
      question: "What makes your approach unique for their industry?",
      placeholder: "e.g., Experience with e-commerce, Local SEO expertise, Technical SEO focus",
    },
    {
      id: 'q5',
      question: "What's the best way to reach them?",
      placeholder: "e.g., Email, LinkedIn, Phone, In-person",
    },
  ];

  const handleQuizAnswer = (questionId: string, answer: string) => {
    setQuizAnswers((prev) => {
      const existing = prev.find((a) => a.questionId === questionId);
      if (existing) {
        return prev.map((a) => (a.questionId === questionId ? { ...a, answer } : a));
      }
      return [...prev, { questionId, answer }];
    });
  };

  const handleNext = () => {
    if (activeStep === 1) {
      // Validate quiz answers
      const allAnswered = quizQuestions.every((q) =>
        quizAnswers.some((a) => a.questionId === q.id && a.answer.trim())
      );
      if (!allAnswered) {
        alert('Please answer all quiz questions before proceeding.');
        return;
      }
    }
    if (activeStep === 2) {
      // Validate SEO audit inputs
      if (!clientWebsite.trim()) {
        alert('Please enter the client website URL for SEO audit.');
        return;
      }
    }
    setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  const handleGenerateScript = async () => {
    setIsGenerating(true);
    setAiResponse('');
    setScriptResult(null);

    try {
      const backendUrl = getBackendUrl();
      
      // Prepare the prompt for AI
      const quizAnswersText = quizAnswers
        .map((a) => {
          const question = quizQuestions.find((q) => q.id === a.questionId);
          return `${question?.question}: ${a.answer}`;
        })
        .join('\n');

      const prompt = `You are an expert SEO prospecting script writer following the "Add Value First" approach inspired by Grant Cardone and Alex Hormozi.

Client Information:
- Name: ${clientName || 'Not provided'}
- Website: ${clientWebsite}
- Industry: ${clientIndustry || 'Not provided'}

Quiz Answers:
${quizAnswersText}

Please create a prospecting script that:
1. Leads with genuine value (mention the SEO audit)
2. Shows understanding of their business and challenges
3. Uses a warm, consultative tone (not salesy)
4. Includes a soft ask for a conversation
5. Is personalized based on the quiz answers
6. Follows the "Add Value First" framework

Also provide:
- A brief SEO audit summary (3-5 key findings)
- The value proposition (what makes this offer compelling)
- Next steps (how to follow up)

Format the response as a JSON object with these keys: script, seoAudit, valueProposition, nextSteps (array).`;

      const response = await fetch(`${backendUrl}/api/gemini-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              text: prompt,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate script');
      }

      const data = await response.json();
      setAiResponse(data.text);

      // Try to parse JSON from the response
      try {
        // Extract JSON from markdown code blocks if present
        let jsonText = data.text;
        const jsonMatch = jsonText.match(/```json\s*([\s\S]*?)\s*```/) || jsonText.match(/```\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          jsonText = jsonMatch[1];
        }
        
        const parsed = JSON.parse(jsonText);
        setScriptResult({
          script: parsed.script || data.text,
          seoAudit: parsed.seoAudit || 'SEO audit details will be generated.',
          valueProposition: parsed.valueProposition || 'Value proposition will be generated.',
          nextSteps: Array.isArray(parsed.nextSteps) ? parsed.nextSteps : ['Follow up in 3-5 days', 'Share additional insights', 'Offer a free consultation'],
        });
      } catch (parseError) {
        // If JSON parsing fails, use the raw text as the script
        setScriptResult({
          script: data.text,
          seoAudit: 'Review the generated script for SEO audit insights.',
          valueProposition: 'The value is embedded in the script above.',
          nextSteps: ['Review and customize the script', 'Test with a small batch', 'Follow up consistently'],
        });
      }

      setShowResultDialog(true);
    } catch (error: any) {
      console.error('Error generating script:', error);
      alert(`Error generating script: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyScript = () => {
    if (scriptResult) {
      navigator.clipboard.writeText(scriptResult.script);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadScript = () => {
    if (scriptResult) {
      const content = `SEO Prospecting Script
Generated: ${new Date().toLocaleString()}
Client: ${clientName || 'N/A'}
Website: ${clientWebsite}

SCRIPT:
${scriptResult.script}

SEO AUDIT SUMMARY:
${scriptResult.seoAudit}

VALUE PROPOSITION:
${scriptResult.valueProposition}

NEXT STEPS:
${scriptResult.nextSteps.map((step, i) => `${i + 1}. ${step}`).join('\n')}
`;
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `seo-prospecting-script-${clientName || 'client'}-${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <Box sx={{ p: 3, height: '100%', overflow: 'auto' }}>
      <Stack spacing={3}>
        <Box>
          <Chip
            label="10X SEO Prospecting"
            color="primary"
            icon={<SearchIcon />}
            sx={{ fontWeight: 700, mb: 2 }}
          />
          <Typography variant="h4" sx={{ fontWeight: 900, mb: 1 }}>
            SEO Prospecting Script Builder
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            Use our AI-powered tool to create personalized "Add Value First" prospecting scripts with integrated SEO audits.
            Perfect for agencies looking to 10X their client acquisition.
          </Typography>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>New:</strong> Get the complete 10X SEO Prospecting Workshop for just $97 (86% OFF). 
              Includes live training, AI templates, and access to our co-work community.{' '}
              <Button
                size="small"
                variant="outlined"
                href="https://shop.isharehow.app/products/flash-sale-10x-your-seo-prospecting?utm_source=creative-dashboard&utm_medium=learning-hub&utm_content=seo-builder"
                target="_blank"
                endIcon={<LaunchIcon />}
                sx={{ ml: 1 }}
              >
                Learn More
              </Button>
            </Typography>
          </Alert>
        </Box>

        <Paper sx={{ p: 3 }}>
          <Stepper activeStep={activeStep} orientation="vertical">
            {/* Step 1: Guide */}
            <Step>
              <StepLabel>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Learn the Framework
                </Typography>
              </StepLabel>
              <StepContent>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 2, color: 'primary.main' }}>
                    {guideContent.title}
                  </Typography>
                  <Stack spacing={3}>
                    {guideContent.sections.map((section, index) => (
                      <Accordion key={index} defaultExpanded={index === 0}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {section.title}
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                            {section.content}
                          </Typography>
                        </AccordionDetails>
                      </Accordion>
                    ))}
                  </Stack>
                </Box>
                <Button variant="contained" onClick={handleNext} sx={{ mt: 2 }}>
                  Continue to Quiz
                </Button>
              </StepContent>
            </Step>

            {/* Step 2: Quiz */}
            <Step>
              <StepLabel>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Answer Questions About Your Prospect
                </Typography>
              </StepLabel>
              <StepContent>
                <Stack spacing={3} sx={{ mb: 3 }}>
                  <Alert severity="info">
                    Answer these questions to help our AI create a personalized prospecting script.
                  </Alert>
                  {quizQuestions.map((question) => {
                    const answer = quizAnswers.find((a) => a.questionId === question.id);
                    return (
                      <Card key={question.id} variant="outlined">
                        <CardContent>
                          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                            {question.question}
                          </Typography>
                          <TextField
                            fullWidth
                            multiline
                            rows={3}
                            value={answer?.answer || ''}
                            onChange={(e) => handleQuizAnswer(question.id, e.target.value)}
                            placeholder={question.placeholder}
                            variant="outlined"
                          />
                        </CardContent>
                      </Card>
                    );
                  })}
                </Stack>
                <Stack direction="row" spacing={2}>
                  <Button onClick={handleBack}>Back</Button>
                  <Button variant="contained" onClick={handleNext}>
                    Continue to SEO Audit
                  </Button>
                </Stack>
              </StepContent>
            </Step>

            {/* Step 3: SEO Audit */}
            <Step>
              <StepLabel>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Enter Client Information for SEO Audit
                </Typography>
              </StepLabel>
              <StepContent>
                <Stack spacing={3} sx={{ mb: 3 }}>
                  <Alert severity="info">
                    Provide client information to generate an SEO audit that will be included in your prospecting script.
                  </Alert>
                  <TextField
                    fullWidth
                    label="Client Name"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g., Acme Corporation"
                    variant="outlined"
                  />
                  <TextField
                    fullWidth
                    label="Client Website URL"
                    value={clientWebsite}
                    onChange={(e) => setClientWebsite(e.target.value)}
                    placeholder="e.g., https://example.com"
                    variant="outlined"
                    required
                    helperText="This will be used to generate SEO audit insights"
                  />
                  <TextField
                    fullWidth
                    label="Industry"
                    value={clientIndustry}
                    onChange={(e) => setClientIndustry(e.target.value)}
                    placeholder="e.g., E-commerce, SaaS, Healthcare"
                    variant="outlined"
                  />
                </Stack>
                <Stack direction="row" spacing={2}>
                  <Button onClick={handleBack}>Back</Button>
                  <Button variant="contained" onClick={handleNext}>
                    Generate Script
                  </Button>
                </Stack>
              </StepContent>
            </Step>

            {/* Step 4: Generate Script */}
            <Step>
              <StepLabel>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Generate Your Prospecting Script
                </Typography>
              </StepLabel>
              <StepContent>
                <Stack spacing={3} sx={{ mb: 3 }}>
                  <Alert severity="success">
                  Ready to generate! Click the button below to create your personalized "Add Value First" prospecting script with integrated SEO audit.
                  </Alert>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                        Summary
                      </Typography>
                      <Stack spacing={1}>
                        <Typography>
                          <strong>Client:</strong> {clientName || 'Not provided'}
                        </Typography>
                        <Typography>
                          <strong>Website:</strong> {clientWebsite || 'Not provided'}
                        </Typography>
                        <Typography>
                          <strong>Industry:</strong> {clientIndustry || 'Not provided'}
                        </Typography>
                        <Typography>
                          <strong>Quiz Answers:</strong> {quizAnswers.length} / {quizQuestions.length}
                        </Typography>
                      </Stack>
                    </CardContent>
                  </Card>
                </Stack>
                <Stack direction="row" spacing={2}>
                  <Button onClick={handleBack}>Back</Button>
                  <Button
                    variant="contained"
                    onClick={handleGenerateScript}
                    disabled={isGenerating}
                    startIcon={isGenerating ? <AiIcon /> : <AiIcon />}
                    size="large"
                  >
                    {isGenerating ? 'Generating Script...' : 'Generate Script with AI'}
                  </Button>
                </Stack>
              </StepContent>
            </Step>
          </Stepper>
        </Paper>

        {/* Result Dialog */}
        <Dialog
          open={showResultDialog}
          onClose={() => setShowResultDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Your Prospecting Script
              </Typography>
              <Stack direction="row" spacing={1}>
                <IconButton onClick={handleCopyScript} title="Copy Script">
                  <CopyIcon />
                </IconButton>
                <IconButton onClick={handleDownloadScript} title="Download Script">
                  <DownloadIcon />
                </IconButton>
              </Stack>
            </Stack>
          </DialogTitle>
          <DialogContent dividers>
            {scriptResult && (
              <Stack spacing={3}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                    Script
                  </Typography>
                  <Paper sx={{ p: 2, bgcolor: 'grey.50', border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                      {scriptResult.script}
                    </Typography>
                  </Paper>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                    SEO Audit Summary
                  </Typography>
                  <Paper sx={{ p: 2, bgcolor: 'info.light', border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                      {scriptResult.seoAudit}
                    </Typography>
                  </Paper>
                </Box>

                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                    Value Proposition
                  </Typography>
                  <Paper sx={{ p: 2, bgcolor: 'success.light', border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                      {scriptResult.valueProposition}
                    </Typography>
                  </Paper>
                </Box>

                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                    Next Steps
                  </Typography>
                  <Stack spacing={1}>
                    {scriptResult.nextSteps.map((step, index) => (
                      <Chip
                        key={index}
                        label={`${index + 1}. ${step}`}
                        icon={<CheckIcon />}
                        variant="outlined"
                        sx={{ justifyContent: 'flex-start' }}
                      />
                    ))}
                  </Stack>
                </Box>
              </Stack>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowResultDialog(false)}>Close</Button>
            <Button
              variant="contained"
              onClick={() => {
                setShowResultDialog(false);
                // Reset for new script
                setActiveStep(0);
                setScriptResult(null);
                setQuizAnswers([]);
                setClientWebsite('');
                setClientName('');
                setClientIndustry('');
              }}
            >
              Create Another Script
            </Button>
          </DialogActions>
        </Dialog>

        {copied && (
          <Alert severity="success" onClose={() => setCopied(false)}>
            Script copied to clipboard!
          </Alert>
        )}
      </Stack>
    </Box>
  );
}

