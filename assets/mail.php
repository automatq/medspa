<?php
// Include PHPMailer classes manually
require 'PHPMailer/src/PHPMailer.php';
require 'PHPMailer/src/SMTP.php';
require 'PHPMailer/src/Exception.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    $name     = isset($_POST["name"])     ? trim($_POST["name"])     : "";
    $company  = isset($_POST["company"])  ? trim($_POST["company"])  : "";
    $website  = isset($_POST["website"])  ? trim($_POST["website"])  : "";
    $exact    = isset($_POST["exact"])    ? trim($_POST["exact"])    : "";
    $timeline  = isset($_POST["timeline"])  ? trim($_POST["timeline"])  : "";
    $budget  = isset($_POST["budget"])  ? trim($_POST["budget"])  : "";
    $message  = isset($_POST["message"])  ? trim($_POST["message"])  : "";
    $branding  = isset($_POST["branding"])  ? trim($_POST["branding"])  : "";
    $branding2  = isset($_POST["branding2"])  ? trim($_POST["branding2"])  : "";
    $branding3  = isset($_POST["branding3"])  ? trim($_POST["branding3"])  : "";
    $branding4  = isset($_POST["branding4"])  ? trim($_POST["branding4"])  : "";
    $branding5  = isset($_POST["branding5"])  ? trim($_POST["branding5"])  : "";
    $branding6  = isset($_POST["branding6"])  ? trim($_POST["branding6"])  : "";
    $branding7  = isset($_POST["branding7"])  ? trim($_POST["branding7"])  : "";
    
    // Sanitize email separately as it's not a ternary based on isset
    $email    = isset($_POST["email"]) ? filter_var(trim($_POST["email"]), FILTER_SANITIZE_EMAIL) : "";

    // Validation
    if ( empty($name) OR empty($company) OR empty($website) OR empty($exact) OR empty($timeline) 
        OR empty($budget) OR empty($message) OR !filter_var($email, FILTER_VALIDATE_EMAIL)) {

        // Set a 400 (bad request) response code and exit.

        http_response_code(400);

        echo "Please complete the form and try again.";

        exit;

    }


    // Recipient
    $recipient = "youremail@gmail.com";

    // HTML email content
    $email_content = "
    <html>
    <head>
        <title>New Contact Form</title>
    </head>
    <body style='font-family: Arial, sans-serif;'>
        <h2 style='color:#333;'>New Contact Request</h2>
        <p><strong>Name:</strong> {$name}</p>
        <p><strong>Company:</strong> {$company}</p>
        <p><strong>Website:</strong> {$website}</p>
        <p><strong>Exact:</strong> {$exact}</p>
        <p><strong>Timeline:</strong> {$timeline}</p>
        <p><strong>Budget:</strong> {$budget}</p>
        <p><strong>Message:</strong> {$message}</p>
        <p><strong>Branding:</strong> {$branding}</p>
        <p><strong>Branding2:</strong> {$branding2}</p>
        <p><strong>Branding3:</strong> {$branding3}</p>
        <p><strong>Branding4:</strong> {$branding4}</p>
        <p><strong>Branding5:</strong> {$branding5}</p>
        <p><strong>Branding6:</strong> {$branding6}</p>
        <p><strong>Branding7:</strong> {$branding7}</p>
        <hr>
        <p style='font-size:12px;color:#999;'>This email was sent from Aqlova Bfolio HTML template.</p>
    </body>
    </html>
    ";

    // PHPMailer setup
    $mail = new PHPMailer(true);

    try {
        //Server settings
        $mail->isSMTP();
        $mail->Host       = 'smtp.yourhosting.com';  // Your hosting SMTP server (example: smtp.yourhosting.com)
        $mail->SMTPAuth   = true;
        $mail->Username   = 'yourname@yourdomain.com'; // Your email address (must be from hosting server)
        $mail->Password   = 'your_email_password_here'; // Your email password ( Replace with your real email password)
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
        $mail->Port = 465; // SMTP Port (465 for SSL, 587 for TLS)
  

        //Recipients
        $mail->setFrom('yourname@yourdomain.com', 'Your Website Contact Form'); // "From" address (Sender email & name shown in inbox)
        $mail->addAddress($recipient); // Admin inbox
        $mail->addReplyTo($email, $name); // User reply

        // Content
        $mail->isHTML(true);
        $mail->Subject = "New contact from $name - $service";
        $mail->Body    = $email_content;
        $mail->AltBody = strip_tags($email_content);

        $mail->send();

        http_response_code(200);
        echo "Thank You! Your message has been sent.";
    } catch (Exception $e) {
        http_response_code(500);
        echo "Message could not be sent. Mailer Error: {$mail->ErrorInfo}";
    }

} else {
    http_response_code(403);
    echo "There was a problem with your submission, please try again.";
}
?>
