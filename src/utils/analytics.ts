// Google Analytics utility for tracking events

export interface AnalyticsEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
  userRole?: 'mentor' | 'mentee';
  dashboardContext?: 'cowork' | 'rise';
}

// Initialize gtag if available
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export const initAnalytics = (measurementId: string) => {
  if (typeof window === 'undefined') return;

  // Load gtag script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer?.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    send_page_view: true,
  });

  console.log('Google Analytics initialized:', measurementId);
};

export const trackEvent = (event: AnalyticsEvent) => {
  if (typeof window === 'undefined' || !window.gtag) {
    console.log('Analytics event (gtag not loaded):', event);
    return;
  }

  try {
    window.gtag('event', event.action, {
      event_category: event.category,
      event_label: event.label,
      value: event.value,
      user_role: event.userRole,
      dashboard_context: event.dashboardContext,
    });

    console.log('Analytics event tracked:', event);
  } catch (error) {
    console.error('Error tracking analytics event:', error);
  }
};

// Convenience functions for common events

export const trackTaskCompleted = (
  taskId: string,
  userRole: 'mentor' | 'mentee',
  dashboardContext: 'cowork' | 'rise'
) => {
  trackEvent({
    category: 'Tasks',
    action: 'task_completed',
    label: taskId,
    userRole,
    dashboardContext,
  });
};

export const trackBoardSession = (
  boardId: string,
  duration: number,
  participantCount: number
) => {
  trackEvent({
    category: 'Collaboration',
    action: 'board_session',
    label: boardId,
    value: duration,
  });
};

export const trackFocusSession = (
  duration: number,
  type: 'pomodoro' | 'blocking',
  dashboardContext: 'cowork' | 'rise'
) => {
  trackEvent({
    category: 'Focus',
    action: 'focus_session',
    label: type,
    value: duration,
    dashboardContext,
  });
};

export const trackModuleCompleted = (
  moduleId: string,
  category: 'mental' | 'physical' | 'spiritual'
) => {
  trackEvent({
    category: 'Wellness',
    action: 'module_completed',
    label: moduleId,
    value: category === 'mental' ? 1 : category === 'physical' ? 2 : 3,
  });
};

export const trackCryptoAwarded = (
  amount: number,
  reason: string,
  userRole: 'mentor' | 'mentee'
) => {
  trackEvent({
    category: 'Crypto',
    action: 'crypto_awarded',
    label: reason,
    value: amount,
    userRole,
  });
};

export const trackMilestoneAchieved = (
  type: string,
  value: number,
  dashboardContext: 'cowork' | 'rise'
) => {
  trackEvent({
    category: 'Milestones',
    action: 'milestone_achieved',
    label: type,
    value,
    dashboardContext,
  });
};

export const trackOpportunityCreated = (
  opportunityId: string,
  type: 'mssp' | 'soc' | 'venture' | 'client',
  value?: number
) => {
  trackEvent({
    category: 'Opportunities',
    action: 'opportunity_created',
    label: `${type}_${opportunityId}`,
    value,
    dashboardContext: 'cowork',
  });
};

export const trackJournalEntry = (
  mood: string,
  dashboardContext: 'cowork' | 'rise'
) => {
  trackEvent({
    category: 'Mindset',
    action: 'journal_entry',
    label: mood,
    dashboardContext,
  });
};

export const trackPageView = (path: string, title: string) => {
  if (typeof window === 'undefined' || !window.gtag) return;

  window.gtag('event', 'page_view', {
    page_path: path,
    page_title: title,
  });
};
