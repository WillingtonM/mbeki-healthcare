import { getUncachableOutlookClient } from './outlook-client.js';

interface ErrorReport {
  message: string;
  stack?: string;
  url?: string;
  userAgent?: string;
  timestamp: string;
  userId?: string;
  additionalInfo?: Record<string, any>;
}

export async function sendErrorReport(error: ErrorReport): Promise<void> {
  try {
    const client = await getUncachableOutlookClient();
    
    const emailBody = `
      <html>
        <body>
          <h2>🚨 Mbeki Healthcare System Error Report</h2>
          <hr>
          
          <h3>Error Details:</h3>
          <p><strong>Timestamp:</strong> ${error.timestamp}</p>
          <p><strong>Message:</strong> ${error.message}</p>
          
          ${error.url ? `<p><strong>URL:</strong> ${error.url}</p>` : ''}
          ${error.userAgent ? `<p><strong>User Agent:</strong> ${error.userAgent}</p>` : ''}
          ${error.userId ? `<p><strong>User ID:</strong> ${error.userId}</p>` : ''}
          
          ${error.stack ? `
            <h3>Stack Trace:</h3>
            <pre style="background-color: #f4f4f4; padding: 10px; border-radius: 4px; overflow-x: auto;">
              ${error.stack}
            </pre>
          ` : ''}
          
          ${error.additionalInfo ? `
            <h3>Additional Information:</h3>
            <pre style="background-color: #f4f4f4; padding: 10px; border-radius: 4px; overflow-x: auto;">
              ${JSON.stringify(error.additionalInfo, null, 2)}
            </pre>
          ` : ''}
          
          <hr>
          <p><small>This error was automatically reported by the Mbeki Healthcare System.</small></p>
          <p><small>Developed by <a href="https://www.champsafrica.com">Champs Group</a></small></p>
        </body>
      </html>
    `;

    const message = {
      subject: `🚨 Mbeki Healthcare System Error - ${new Date().toLocaleString()}`,
      body: {
        contentType: 'HTML',
        content: emailBody
      },
      toRecipients: [
        {
          emailAddress: {
            address: 'info@champsafrica.com'
          }
        }
      ]
    };

    await client.api('/me/sendMail').post({
      message: message
    });

    console.log('Error report sent successfully to info@champsafrica.com');
  } catch (emailError) {
    console.error('Failed to send error report email:', emailError);
    // Don't throw here as we don't want email failures to cause more errors
  }
}

export function createErrorReport(
  error: Error | string,
  context?: {
    url?: string;
    userAgent?: string;
    userId?: string;
    additionalInfo?: Record<string, any>;
  }
): ErrorReport {
  const errorMessage = typeof error === 'string' ? error : error.message;
  const errorStack = typeof error === 'string' ? undefined : error.stack;

  return {
    message: errorMessage,
    stack: errorStack,
    url: context?.url,
    userAgent: context?.userAgent,
    userId: context?.userId,
    additionalInfo: context?.additionalInfo,
    timestamp: new Date().toISOString()
  };
}