/**
 * ReviewTrack status notification email builder.
 * Structure matches the original template; colors match frontend theme 
 */

export enum ApplicationStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CHANGES_REQUESTED = 'CHANGES_REQUESTED',
}

interface BadgeConfig {
  label: string;
  color: string;
  textColor: string;
  borderColor: string;
}

const STATUS_BADGE: Partial<Record<ApplicationStatus, BadgeConfig>> = {
  [ApplicationStatus.UNDER_REVIEW]: {
    label: 'Under Review',
    color: '#E9F0E9',
    textColor: '#1A302A',
    borderColor: '#E9F0E9',
  },
  [ApplicationStatus.APPROVED]: {
    label: 'Approved',
    color: '#E9F0E9',
    textColor: '#1A302A',
    borderColor: '#E9F0E9',
  },
  [ApplicationStatus.REJECTED]: {
    label: 'Rejected',
    color: '#FEF2F2',
    textColor: '#B91C1C',
    borderColor: '#FECACA',
  },
  [ApplicationStatus.CHANGES_REQUESTED]: {
    label: 'Changes Requested',
    color: '#F5EBE0',
    textColor: '#6B5344',
    borderColor: '#F5EBE0',
  },
  [ApplicationStatus.SUBMITTED]: {
    label: 'Submitted',
    color: '#F5EBE0',
    textColor: '#6B5344',
    borderColor: '#F5EBE0',
  },
};

interface EmailContent {
  html: string;
  text: string;
}

export function buildStatusEmail(
  firstName: string,
  applicationTitle: string,
  status: ApplicationStatus,
): EmailContent {
  const badge = STATUS_BADGE[status];
  const label = badge?.label ?? status;
  const badgeBg = badge?.color ?? '#F4F4F2';
  const badgeFg = badge?.textColor ?? '#6B5344';
  const badgeBorder = badge?.borderColor ?? '#E9F0E9';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Application Status Update</title>
</head>
<body style="margin:0;padding:0;background-color:#F9F9F7;font-family:Inter,Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
         style="background-color:#F9F9F7;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" role="presentation"
               style="max-width:600px;width:100%;background-color:#FFFFFF;border-radius:12px;
                      border:1px solid #E9F0E9;box-shadow:0 1px 3px rgba(26,48,42,0.08);overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="background-color:#1A302A;padding:24px 32px;">
              <p style="margin:0;font-size:20px;font-weight:700;color:#FFFFFF;letter-spacing:0.5px;font-family:Georgia,'Playfair Display',serif;">
                ReviewTrack
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 16px;font-size:16px;color:#1A302A;">
                Hi <strong>${escapeHtml(firstName)}</strong>,
              </p>
              <p style="margin:0 0 24px;font-size:15px;color:#4A5C54;line-height:1.6;">
                There has been an update on one of your applications. Please review the details below.
              </p>

              <!-- Application card -->
              <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
                     style="background-color:#F9F9F7;border:1px solid #E9F0E9;border-radius:8px;margin-bottom:24px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#6B5344;
                               text-transform:uppercase;letter-spacing:0.8px;">
                      Application
                    </p>
                    <p style="margin:0 0 16px;font-size:16px;font-weight:600;color:#1A302A;">
                      ${escapeHtml(applicationTitle)}
                    </p>
                    <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#6B5344;
                               text-transform:uppercase;letter-spacing:0.8px;">
                      Status
                    </p>
                    <span style="display:inline-block;padding:4px 12px;background-color:${badgeBg};
                                 color:${badgeFg};border:1px solid ${badgeBorder};border-radius:9999px;
                                 font-size:13px;font-weight:600;">
                      ${label}
                    </span>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:14px;color:#4A5C54;">
                Log in to view the full details and take any required action.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#F4F4F2;border-top:1px solid #E9F0E9;padding:16px 32px;">
              <p style="margin:0;font-size:12px;color:#A08B7A;text-align:center;">
                This is an automated notification from ReviewTrack. Please do not reply to this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `Hi ${firstName},\n\nThere has been an update on your application "${applicationTitle}".\n\nStatus: ${label}\n\nLog in to view the full details and take any required action.\n\nReviewTrack\n(This is an automated notification — please do not reply.)`;

  return { html, text };
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
