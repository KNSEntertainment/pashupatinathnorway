import nodemailer from "nodemailer";

// Create nodemailer transporter
const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_APP_PASS,
	},
});

// Contact form email sender
type sendContactEmail = {
	name: string;
	email: string;
	message: string;
};
export async function sendContactEmail({ name, email, message }: sendContactEmail) {
	const mailOptions = {
		from: `"Contact Form" <${process.env.EMAIL_USER}>`,
		to: process.env.EMAIL_USER,
		subject: `New Contact Form Submission from ${name}`,
		text: `Name: ${name}\nEmail: ${email}\nMessage:\n${message}`,
		html: `
			<h2>New Contact Form Submission</h2>
			<p><strong>Name:</strong> ${name}</p>
			<p><strong>Email:</strong> ${email}</p>
			<p><strong>Message:</strong></p>
			<div style="background:#f9f9f9;padding:16px;border-radius:8px;border:1px solid #eee;">${message.replace(/\n/g, "<br/>")}</div>
		`,
	};
	try {
		await transporter.sendMail(mailOptions);
		console.log("Contact form email sent");
	} catch (error) {
		console.error("Error sending contact form email:", error);
		throw new Error("Failed to send contact form email");
	}
}

// Welcome email with password setup link
type sendWelcomeEmail = {
	name: string;
	email: string;
	setupToken: string;
};
export async function sendWelcomeEmail({ name, email, setupToken }: sendWelcomeEmail) {
	const setupUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/en/set-password?token=${setupToken}`;

	const mailOptions = {
		from: `"PNSB-Norway" <${process.env.EMAIL_USER}>`,
		to: email,
		subject: "Welcome to PNSB-Norway - Set Your Password",
		text: `Hello ${name},\n\nWelcome to PNSB-Norway! Your membership has been approved.\n\nPlease set your password by clicking the link below:\n${setupUrl}\n\nThis link is valid for 24 hours.\n\nBest regards,\nPNSB-Norway Team`,
		html: `
			<!DOCTYPE html>
			<html>
			<head>
				<style>
					body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
					.container { max-width: 600px; margin: 0 auto; padding: 20px; }
					.header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
					.content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
					.button { display: inline-block; background: #667eea; color: white !important; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; text-align: center; }
					.footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
				</style>
			</head>
			<body>
				<div class="container">
					<div class="header">
						<h1>Welcome to PNSB-Norway!</h1>
					</div>
					<div class="content">
						<p>Hello <strong>${name}</strong>,</p>
						<p>Congratulations! Your membership application has been approved. We're excited to have you as part of the PNSB-Norway community.</p>
						<p>To complete your account setup, please set your password by clicking the button below:</p>
						<center>
							<a href="${setupUrl}" class="button">Set Your Password</a>
						</center>
						<p>Or copy and paste this link in your browser:</p>
						<p style="background: white; padding: 10px; border-radius: 5px; word-break: break-all;">${setupUrl}</p>
						<p><strong>Note:</strong> This link is valid for 24 hours. If it expires, please contact our support team.</p>
						<p>Once you've set your password, you'll be able to:</p>
						<ul>
							<li>Access your member dashboard</li>
							<li>Update your profile information</li>
							<li>Participate in member-only events</li>
							<li>Stay connected with the community</li>
						</ul>
						<p>If you have any questions, feel free to reach out to us.</p>
						<p>Best regards,<br><strong>PNSB-Norway Team</strong></p>
					</div>
					<div class="footer">
						<p>This is an automated email. Please do not reply to this message.</p>
					</div>
				</div>
			</body>
			</html>
		`,
	};

	try {
		await transporter.sendMail(mailOptions);
		console.log("Welcome email sent to:", email);
	} catch (error) {
		console.error("Error sending welcome email:", error);
		throw new Error("Failed to send welcome email");
	}
}

// Donation thank you email
type sendDonationThankYouEmail = {
	name: string;
	email: string;
	amount: number;
	currency: string;
	transactionId: string;
	date: string;
	message?: string;
};
export async function sendDonationThankYouEmail({ name, email, amount, currency, transactionId, date, message }: sendDonationThankYouEmail) {
	const mailOptions = {
		from: `"PNSB-Norway" <${process.env.EMAIL_USER}>`,
		to: email,
		subject: "Thank You for Your Generous Donation - PNSB-Norway",
		text: `Dear ${name},\n\nThank you for your generous donation of ${amount} ${currency} to PNSB-Norway!\n\nYour support helps us make a positive impact in the Nepali community in Norway and support democratic values in Nepal.\n\nDonation Details:\nAmount: ${amount} ${currency}\nTransaction ID: ${transactionId}\nDate: ${date}\n${message ? `\nYour Message: ${message}` : ""}\n\nYour contribution will be used to support:\n- Community events and cultural programs\n- Political advocacy and awareness campaigns\n- Organizational growth and outreach\n- Member support and resources\n\nWe will send you a detailed receipt shortly for your records.\n\nWith gratitude,\nPNSB-Norway Team`,
		html: `
			<!DOCTYPE html>
			<html>
			<head>
				<style>
					body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
					.container { max-width: 600px; margin: 0 auto; padding: 20px; }
					.header { background: linear-gradient(135deg, #0094da 0%, #0070a8 100%); color: white; padding: 40px; text-align: center; border-radius: 10px 10px 0 0; }
					.header h1 { margin: 0; font-size: 28px; }
					.content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
					.donation-box { background: white; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0; border-radius: 5px; }
					.donation-amount { font-size: 32px; font-weight: bold; color: #0094da; margin: 10px 0; }
					.details { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
					.details-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
					.details-row:last-child { border-bottom: none; }
					.impact-section { margin: 20px 0; }
					.impact-item { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; display: flex; align-items: center; }
					.impact-icon { width: 40px; height: 40px; background: #0094da; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 20px; margin-right: 15px; flex-shrink: 0; }
					.footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #eee; color: #666; font-size: 12px; }
					.heart { color: #ef4444; font-size: 20px; }
				</style>
			</head>
			<body>
				<div class="container">
					<div class="header">
						<div class="heart">❤️</div>
						<h1>Thank You for Your Donation!</h1>
					</div>
					<div class="content">
						<p>Dear <strong>${name}</strong>,</p>
						
						<div class="donation-box">
							<p style="margin: 0; color: #666;">Your Generous Contribution</p>
							<div class="donation-amount">${amount} ${currency}</div>
							<p style="margin: 0; color: #10b981; font-weight: bold;">✓ Payment Successful</p>
						</div>

						<p>Your support makes a real difference in our mission to serve the Nepali community in Norway and support democratic values in Nepal. We are incredibly grateful for your generosity.</p>
							<a href="${process.env.NEXTAUTH_URL || "http://localhost:3000"}/en/membership" style="display: inline-block; background: white; color: #0094da; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 5px;">Join as Member</a>
						</div>

						<p>This email serves as your donation receipt. Please keep it for your records. If you need any additional documentation, please don't hesitate to contact us.</p>

						<p>With deep appreciation and gratitude,</p>
						<p><strong>PNSB-Norway Team</strong><br>
						<a href="mailto:${process.env.EMAIL_USER}" style="color: #0094da;">info@pnsbnorway.org</a><br>
						<a href="${process.env.NEXTAUTH_URL || "http://localhost:3000"}" style="color: #0094da;">www.pnsbnorway.org</a></p>
					</div>
					<div class="footer">
						<p>PNSB-Norway</p>
						<p>This is an automated receipt. Please keep it for your records.</p>
						<p style="color: #999; margin-top: 10px;">Questions? Contact us at ${process.env.EMAIL_USER}</p>
					</div>
				</div>
			</body>
			</html>
		`,
	};

	try {
		await transporter.sendMail(mailOptions);
		console.log("Donation thank you email sent to:", email);
	} catch (error) {
		console.error("Error sending donation thank you email:", error);
		throw new Error("Failed to send donation thank you email");
	}
}

// Newsletter subscription thank you email
export async function sendSubscriptionThankYouEmail(email: string) {
	const mailOptions = {
		from: `"PNSB-Norway" <${process.env.EMAIL_USER}>`,
		to: email,
		subject: "Thank You for Subscribing to PNSB-Norway Newsletter!",
		text: `Thank you for subscribing to the PNSB-Norway newsletter!\n\nWe're excited to keep you updated with our latest news, events, and community activities.\n\nWhat you can expect:\n- Latest news and updates from PNSB-Norway\n- Information about upcoming events\n- Community initiatives and opportunities\n- Ways to get involved and make a difference\n\nYou can unsubscribe at any time by clicking the unsubscribe link in our emails.\n\nBest regards,\nPNSB-Norway Team`,
		html: `
			<!DOCTYPE html>
			<html>
			<head>
				<style>
					body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
					.container { max-width: 600px; margin: 0 auto; padding: 20px; }
					.header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; text-align: center; border-radius: 10px 10px 0 0; }
					.header h1 { margin: 0; font-size: 28px; }
					.content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
					.welcome-box { background: white; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0; border-radius: 5px; }
					.feature-list { background: white; padding: 20px; margin: 20px 0; border-radius: 5px; }
					.feature-item { display: flex; align-items: center; margin: 15px 0; }
					.feature-icon { width: 40px; height: 40px; background: #667eea; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; margin-right: 15px; flex-shrink: 0; }
					.footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #eee; color: #666; font-size: 12px; }
					.social-links { margin: 20px 0; }
					.social-links a { margin: 0 10px; color: #667eea; text-decoration: none; }
				</style>
			</head>
			<body>
				<div class="container">
					<div class="header">
						<h1>Thank You for Subscribing! </h1>
						<p style="margin: 10px 0 0 0; font-size: 18px;">Welcome to the PNSB-Norway Community</p>
					</div>
					<div class="content">
						<p>Dear Subscriber,</p>
						
						<div class="welcome-box">
							<h3 style="margin: 0 0 10px 0; color: #10b981;"> Welcome to Our Newsletter! </h3>
							<p style="margin: 0;">Thank you for subscribing to the PNSB-Norway newsletter. We're thrilled to have you join our community!</p>
						</div>

						<p>You're now part of a vibrant community dedicated to serving the Nepali community in Norway and supporting democratic values in Nepal. Through our newsletter, you'll stay connected with our mission and activities.</p>

						<div class="feature-list">
							<h4 style="margin: 0 0 20px 0;">What You Can Expect:</h4>
							<div class="feature-item">
								<div class="feature-icon"> </div>
								<div>
									<strong>Latest News & Updates</strong>
									<p style="margin: 5px 0 0 0; color: #666;">Stay informed about PNSB-Norway's latest activities and achievements</p>
								</div>
							</div>
							<div class="feature-item">
								<div class="feature-icon"> </div>
								<div>
									<strong>Upcoming Events</strong>
									<p style="margin: 5px 0 0 0; color: #666;">Be the first to know about community events and gatherings</p>
								</div>
							</div>
							<div class="feature-item">
								<div class="feature-icon"> </div>
								<div>
									<strong>Community Initiatives</strong>
									<p style="margin: 5px 0 0 0; color: #666;">Learn about opportunities to get involved and make a difference</p>
								</div>
							</div>
							<div class="feature-item">
								<div class="feature-icon"> </div>
								<div>
									<strong>Ways to Support</strong>
									<p style="margin: 5px 0 0 0; color: #666;">Discover how you can contribute to our mission</p>
								</div>
							</div>
						</div>

						<p>We respect your inbox and promise to send only valuable content. You can unsubscribe at any time using the link in our emails.</p>

						<div style="text-align: center; margin: 30px 0;">
							<a href="${process.env.NEXTAUTH_URL || "http://localhost:3000"}" style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Visit Our Website</a>
						</div>

						<p>We're excited to have you with us on this journey. Together, we can make a meaningful impact!</p>

						<p>Best regards,<br><strong>PNSB-Norway Team</strong><br>
						<a href="mailto:${process.env.EMAIL_USER}" style="color: #667eea;">info@pnsbnorway.org</a><br>
						<a href="${process.env.NEXTAUTH_URL || "http://localhost:3000"}" style="color: #667eea;">www.pnsbnorway.org</a></p>
					</div>
					<div class="footer">
						<p>PNSB-Norway</p>
						<p>You're receiving this email because you subscribed to our newsletter.</p>
						<p style="color: #999; margin-top: 10px;">Questions? Contact us at ${process.env.EMAIL_USER}</p>
					</div>
				</div>
			</body>
			</html>
		`,
	};

	try {
		await transporter.sendMail(mailOptions);
		console.log("Subscription thank you email sent to:", email);
	} catch (error) {
		console.error("Error sending subscription thank you email:", error);
		throw new Error("Failed to send subscription thank you email");
	}
}

// Password reset email
type sendPasswordResetEmail = {
	name: string;
	email: string;
	resetUrl: string;
	userType: string;
};
export async function sendPasswordResetEmail({ name, email, resetUrl, userType }: sendPasswordResetEmail) {
	const mailOptions = {
		from: `"PNSB-Norway" <${process.env.EMAIL_USER}>`,
		to: email,
		subject: "Reset Your Password - PNSB-Norway",
		text: `Hello ${name},\n\nYou requested to reset your password for your PNSB-Norway ${userType} account.\n\nPlease click the link below to reset your password:\n${resetUrl}\n\nThis link is valid for 1 hour.\n\nIf you didn't request this, please ignore this email.\n\nBest regards,\nPNSB-Norway Team`,
		html: `
			<!DOCTYPE html>
			<html>
			<head>
				<style>
					body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
					.container { max-width: 600px; margin: 0 auto; padding: 20px; }
					.header { background: linear-gradient(135deg, #f59e0b 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
					.content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
					.button { display: inline-block; background: #dc2626; color: white !important; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; text-align: center; }
					.footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
					.warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 5px; margin: 20px 0; }
				</style>
			</head>
			<body>
				<div class="container">
					<div class="header">
						<h1>Reset Your Password</h1>
					</div>
					<div class="content">
						<p>Hello <strong>${name}</strong>,</p>
						<p>We received a request to reset the password for your PNSB-Norway ${userType} account.</p>
						<p>To reset your password, please click the button below:</p>
						<center>
							<a href="${resetUrl}" class="button">Reset Password</a>
						</center>
						<p>Or copy and paste this link in your browser:</p>
						<p style="background: white; padding: 10px; border-radius: 5px; word-break: break-all;">${resetUrl}</p>
						
						<div class="warning">
							<p><strong>Important:</strong></p>
							<ul>
								<li>This link is valid for 1 hour only</li>
								<li>If you didn't request this, please ignore this email</li>
								<li>Never share this link with anyone</li>
							</ul>
						</div>
						
						<p>If you have any questions or didn't request this password reset, please contact our support team.</p>
						<p>Best regards,<br><strong>PNSB-Norway Team</strong></p>
					</div>
					<div class="footer">
						<p>This is an automated email. Please do not reply to this message.</p>
					</div>
				</div>
			</body>
			</html>
		`,
	};

	try {
		await transporter.sendMail(mailOptions);
		console.log("Password reset email sent to:", email);
	} catch (error) {
		console.error("Error sending password reset email:", error);
		throw new Error("Failed to send password reset email");
	}
}
