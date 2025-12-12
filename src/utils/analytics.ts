// Google Analytics utility for advanced tracking and sales funnel monitoring

export interface AnalyticsEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
  userRole?: 'mentor' | 'mentee';
  dashboardContext?: 'cowork' | 'rise';
  // Enhanced fields for sales funnel
  funnelStage?: 'awareness' | 'interest' | 'consideration' | 'purchase' | 'retention';
  contentType?: string;
  contentId?: string;
  userId?: string;
  userType?: 'visitor' | 'lead' | 'customer' | 'enterprise';
}

// E-commerce tracking interfaces
export interface EcommerceItem {
  item_id: string;
  item_name: string;
  item_category?: string;
  item_category2?: string;
  price?: number;
  quantity?: number;
}

export interface EcommerceTransaction {
  transaction_id: string;
  value: number;
  currency?: string;
  items: EcommerceItem[];
  coupon?: string;
  shipping?: number;
  tax?: number;
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
  
  // Enhanced configuration for advanced tracking
  window.gtag('config', measurementId, {
    send_page_view: true,
    // Enhanced measurement features
    allow_google_signals: true,
    allow_ad_personalization_signals: true,
    // Enhanced e-commerce
    enhanced_ecommerce: true,
    // User engagement
    engagement_time_msec: 100,
    // Custom dimensions (configure these in GA4)
    custom_map: {
      'funnel_stage': 'funnel_stage',
      'user_type': 'user_type',
      'content_type': 'content_type',
    },
  });

  console.log('Google Analytics initialized with advanced tracking:', measurementId);
  
  // Track initial page view
  trackPageView(window.location.pathname + window.location.search, document.title);
};

export const trackEvent = (event: AnalyticsEvent) => {
  if (typeof window === 'undefined' || !window.gtag) {
    console.log('Analytics event (gtag not loaded):', event);
    return;
  }

  try {
    const eventParams: any = {
      event_category: event.category,
      event_label: event.label,
      value: event.value,
      user_role: event.userRole,
      dashboard_context: event.dashboardContext,
      // Enhanced sales funnel tracking
      funnel_stage: event.funnelStage,
      content_type: event.contentType,
      content_id: event.contentId,
      user_type: event.userType,
    };

    // Remove undefined values
    Object.keys(eventParams).forEach(key => {
      if (eventParams[key] === undefined) {
        delete eventParams[key];
      }
    });

    window.gtag('event', event.action, eventParams);

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

export const trackPageView = (path: string, title: string, additionalParams?: Record<string, any>) => {
  if (typeof window === 'undefined' || !window.gtag) return;

  const params: any = {
    page_path: path,
    page_title: title,
    page_location: window.location.href,
    ...additionalParams,
  };

  window.gtag('event', 'page_view', params);
  
  // Also send to config for proper page view tracking
  const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  if (GA_MEASUREMENT_ID) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: path,
      page_title: title,
      ...additionalParams,
    });
  }
};

// Enhanced e-commerce tracking
export const trackPurchase = (transaction: EcommerceTransaction) => {
  if (typeof window === 'undefined' || !window.gtag) return;

  try {
    window.gtag('event', 'purchase', {
      transaction_id: transaction.transaction_id,
      value: transaction.value,
      currency: transaction.currency || 'USD',
      coupon: transaction.coupon,
      shipping: transaction.shipping,
      tax: transaction.tax,
      items: transaction.items,
    });
  } catch (error) {
    console.error('Error tracking purchase:', error);
  }
};

export const trackAddToCart = (item: EcommerceItem) => {
  if (typeof window === 'undefined' || !window.gtag) return;

  try {
    window.gtag('event', 'add_to_cart', {
      currency: 'USD',
      value: (item.price || 0) * (item.quantity || 1),
      items: [item],
    });
  } catch (error) {
    console.error('Error tracking add to cart:', error);
  }
};

export const trackBeginCheckout = (items: EcommerceItem[], value: number) => {
  if (typeof window === 'undefined' || !window.gtag) return;

  try {
    window.gtag('event', 'begin_checkout', {
      currency: 'USD',
      value,
      items,
    });
  } catch (error) {
    console.error('Error tracking begin checkout:', error);
  }
};

// Sales funnel tracking
export const trackFunnelStage = (
  stage: 'awareness' | 'interest' | 'consideration' | 'purchase' | 'retention',
  action: string,
  additionalData?: Record<string, any>
) => {
  trackEvent({
    category: 'Sales Funnel',
    action,
    funnelStage: stage,
    ...additionalData,
  });
};

// User engagement tracking
export const trackUserEngagement = (engagementTime: number, engagementType: string) => {
  if (typeof window === 'undefined' || !window.gtag) return;

  try {
    window.gtag('event', 'user_engagement', {
      engagement_time_msec: engagementTime,
      engagement_type: engagementType,
    });
  } catch (error) {
    console.error('Error tracking user engagement:', error);
  }
};

// Scroll depth tracking
export const trackScrollDepth = (depth: number) => {
  if (typeof window === 'undefined' || !window.gtag) return;

  try {
    window.gtag('event', 'scroll', {
      scroll_depth: depth,
    });
  } catch (error) {
    console.error('Error tracking scroll depth:', error);
  }
};

// Form interaction tracking
export const trackFormStart = (formName: string, formLocation: string) => {
  trackEvent({
    category: 'Form',
    action: 'form_start',
    label: formName,
    contentType: formLocation,
    funnelStage: 'interest',
  });
};

export const trackFormSubmit = (formName: string, formLocation: string, success: boolean) => {
  trackEvent({
    category: 'Form',
    action: success ? 'form_submit_success' : 'form_submit_error',
    label: formName,
    contentType: formLocation,
    funnelStage: success ? 'consideration' : 'interest',
  });
};

// Button click tracking for key CTAs
export const trackCTA = (ctaText: string, ctaLocation: string, destination?: string) => {
  trackEvent({
    category: 'CTA',
    action: 'cta_click',
    label: ctaText,
    contentType: ctaLocation,
    funnelStage: 'interest',
  });
  
  if (destination) {
    trackEvent({
      category: 'Navigation',
      action: 'cta_navigation',
      label: destination,
      contentType: ctaLocation,
    });
  }
};

// Set user properties for better segmentation
export const setUserProperties = (properties: {
  userType?: 'visitor' | 'lead' | 'customer' | 'enterprise';
  userId?: string;
  userRole?: string;
  subscriptionTier?: string;
  [key: string]: any;
}) => {
  if (typeof window === 'undefined' || !window.gtag) return;

  try {
    window.gtag('set', 'user_properties', properties);
  } catch (error) {
    console.error('Error setting user properties:', error);
  }
};
