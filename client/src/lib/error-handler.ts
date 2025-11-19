// Frontend error handler for automatic error reporting
export function setupGlobalErrorHandler() {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    reportClientError(event.reason, {
      type: 'unhandledrejection',
      url: window.location.href,
      userAgent: navigator.userAgent
    });
  });

  // Handle JavaScript errors
  window.addEventListener('error', (event) => {
    console.error('JavaScript error:', event.error);
    reportClientError(event.error || event.message, {
      type: 'javascript',
      url: window.location.href,
      userAgent: navigator.userAgent,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    });
  });

  // Handle React error boundary errors (for future implementation)
  const originalConsoleError = console.error;
  console.error = (...args) => {
    // Check if this looks like a React error
    const errorString = args.join(' ');
    if (errorString.includes('React') || errorString.includes('component')) {
      reportClientError(errorString, {
        type: 'react',
        url: window.location.href,
        userAgent: navigator.userAgent
      });
    }
    originalConsoleError.apply(console, args);
  };
}

async function reportClientError(error: any, context: Record<string, any>) {
  try {
    const errorData = {
      message: typeof error === 'string' ? error : error?.message || 'Unknown error',
      stack: error?.stack,
      url: context.url,
      userAgent: context.userAgent,
      timestamp: new Date().toISOString(),
      additionalInfo: context
    };

    // Send to backend error reporting endpoint
    await fetch('/api/report-error', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(errorData)
    });
  } catch (reportingError) {
    console.error('Failed to report error:', reportingError);
  }
}