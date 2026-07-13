<?php

declare(strict_types=1);

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

require __DIR__ . '/vendor/autoload.php';

// ─── Load .env if present ────────────────────────────────────────────────────
$envFile = __DIR__ . '/.env';
if (is_readable($envFile)) {
    foreach (file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        $line = trim($line);
        if ($line === '' || str_starts_with($line, '#')) continue;
        if (str_contains($line, '=')) {
            [$key, $value] = explode('=', $line, 2);
            $key   = trim($key);
            $value = trim($value, " \t\"'");
            if (!getenv($key)) putenv("{$key}={$value}");
        }
    }
}

// ─── CORS & Content-Type ────────────────────────────────────────────────────
header('Content-Type: application/json');
header('X-Content-Type-Options: nosniff');

// Only accept POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

// ─── Parse JSON body ────────────────────────────────────────────────────────
$raw  = file_get_contents('php://input');
$body = json_decode($raw, true);

if (json_last_error() !== JSON_ERROR_NONE || !is_array($body)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid request body.']);
    exit;
}

// ─── Input sanitisation & validation ────────────────────────────────────────
$name    = trim(strip_tags($body['name']    ?? ''));
$email   = trim(strip_tags($body['email']   ?? ''));
$company = trim(strip_tags($body['company'] ?? ''));
$message = trim(strip_tags($body['message'] ?? ''));

$errors = [];

if ($name === '' || mb_strlen($name) < 2) {
    $errors[] = 'Full name is required.';
}
if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'A valid email address is required.';
}
if ($message === '' || mb_strlen($message) < 10) {
    $errors[] = 'Message must be at least 10 characters.';
}

if ($errors) {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => implode(' ', $errors)]);
    exit;
}

// ─── SMTP credentials ───────────────────────────────────────────────────────
// Store these in a .env file or server environment variables in production.
// Never commit real credentials to version control.
define('SMTP_HOST',     getenv('SMTP_HOST')     ?: 'smtp.yourprovider.com');
define('SMTP_PORT',     (int)(getenv('SMTP_PORT') ?: 587));
define('SMTP_USERNAME', getenv('SMTP_USERNAME') ?: 'your-smtp-username@goalytics.io');
define('SMTP_PASSWORD', getenv('SMTP_PASSWORD') ?: 'your-smtp-password');
define('SMTP_FROM',     getenv('SMTP_FROM')     ?: 'no-reply@goalytics.io');
define('SMTP_FROM_NAME','Goalytics Contact');

// ─── Recipients ─────────────────────────────────────────────────────────────
define('MAIL_TO',      'contact@goalytics.io');
define('MAIL_TO_NAME', 'Goalytics');
define('MAIL_CC', [
    ['shahzar@goalytics.io', 'Shahzar'],
    ['nida@goalytics.io',    'Nida'],
]);

// ─── Build & send email ─────────────────────────────────────────────────────
$mail = new PHPMailer(true);

try {
    // Server settings
    $mail->isSMTP();
    $mail->Host       = SMTP_HOST;
    $mail->SMTPAuth   = true;
    $mail->Username   = SMTP_USERNAME;
    $mail->Password   = SMTP_PASSWORD;
    $mail->SMTPSecure = SMTP_PORT === 465 ? PHPMailer::ENCRYPTION_SMTPS : PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = SMTP_PORT;
    $mail->CharSet    = 'UTF-8';

    // From
    $mail->setFrom(SMTP_FROM, SMTP_FROM_NAME);

    // Reply-To (the person who submitted the form)
    $mail->addReplyTo($email, $name);

    // To
    $mail->addAddress(MAIL_TO, MAIL_TO_NAME);

    // CC
    foreach (MAIL_CC as [$ccEmail, $ccName]) {
        $mail->addCC($ccEmail, $ccName);
    }

    // Subject
    $subjectPrefix = $company !== '' ? "[{$company}]" : '[Website]';
    $mail->Subject = "{$subjectPrefix} New enquiry from {$name}";

    // Plain-text body
    $textBody  = "New contact form submission from goalytics.io\n";
    $textBody .= str_repeat('─', 48) . "\n\n";
    $textBody .= "Name:    {$name}\n";
    $textBody .= "Email:   {$email}\n";
    if ($company !== '') {
        $textBody .= "Company: {$company}\n";
    }
    $textBody .= "\nMessage:\n{$message}\n";
    $mail->AltBody = $textBody;

    // HTML body
    $nameHtml    = htmlspecialchars($name,    ENT_QUOTES, 'UTF-8');
    $emailHtml   = htmlspecialchars($email,   ENT_QUOTES, 'UTF-8');
    $companyHtml = htmlspecialchars($company, ENT_QUOTES, 'UTF-8');
    $msgHtml     = nl2br(htmlspecialchars($message, ENT_QUOTES, 'UTF-8'));

    $companyRow = $company !== ''
        ? "<tr><td style='padding:6px 0;color:#667085;font-weight:500;width:90px'>Company</td>
               <td style='padding:6px 0;color:#101828'>{$companyHtml}</td></tr>"
        : '';

    $mail->isHTML(true);
    $mail->Body = <<<HTML
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f2f4f7;font-family:'Inter',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f2f4f7;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1e40af 0%,#3b82f6 100%);padding:32px 40px;">
            <p style="margin:0;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;">Goalytics</p>
            <p style="margin:6px 0 0;font-size:13px;color:#bfdbfe;">New contact form submission</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 40px;">
            <h2 style="margin:0 0 24px;font-size:18px;font-weight:600;color:#101828;">
              You have a new enquiry from <span style="color:#2563eb">{$nameHtml}</span>
            </h2>

            <table cellpadding="0" cellspacing="0" width="100%"
                   style="border:1px solid #e4e7ec;border-radius:8px;padding:20px 24px;border-collapse:separate;">
              <tr>
                <td style="padding:6px 0;color:#667085;font-weight:500;width:90px">Name</td>
                <td style="padding:6px 0;color:#101828">{$nameHtml}</td>
              </tr>
              <tr>
                <td style="padding:6px 0;color:#667085;font-weight:500">Email</td>
                <td style="padding:6px 0;color:#101828">
                  <a href="mailto:{$emailHtml}" style="color:#2563eb;text-decoration:none">{$emailHtml}</a>
                </td>
              </tr>
              {$companyRow}
            </table>

            <h3 style="margin:28px 0 10px;font-size:14px;font-weight:600;color:#667085;text-transform:uppercase;letter-spacing:.5px">
              Message
            </h3>
            <div style="background:#f9fafb;border-radius:8px;padding:20px 24px;font-size:15px;color:#344054;line-height:1.7">
              {$msgHtml}
            </div>

            <p style="margin:28px 0 0;font-size:13px;color:#98a2b3">
              Hit <strong>Reply</strong> to respond directly to {$nameHtml} at {$emailHtml}.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;padding:20px 40px;border-top:1px solid #e4e7ec;text-align:center;">
            <p style="margin:0;font-size:12px;color:#98a2b3">
              Sent from the contact form at goalytics.io
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
HTML;

    $mail->send();

    echo json_encode(['success' => true, 'message' => 'Your message has been sent successfully.']);

} catch (Exception $e) {
    error_log('PHPMailer error: ' . $mail->ErrorInfo);
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Could not send your message. Please try again later.',
    ]);
}
