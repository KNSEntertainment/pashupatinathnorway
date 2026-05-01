import nodemailer from "nodemailer";
import { addEmailFooter } from "./emailUtils";

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

// General Member welcome email (sent immediately on form submission)
type sendGeneralMemberWelcomeEmail = {
	name: string;
	email: string;
	familyMembers?: string[]; // Array of family member names
};
export async function sendGeneralMemberWelcomeEmail({ name, email, familyMembers }: sendGeneralMemberWelcomeEmail) {
	const familyMembersText = familyMembers && familyMembers.length > 0 
		? `\n\nFamily Members Registered: ${familyMembers.join(', ')}`
		: '';

	const mailOptions = {
		from: `"Pashupatinath Norway Temple" <${process.env.EMAIL_USER}>`,
		to: email,
		subject: "Welcome to Pashupatinath Norway Temple - General Member Registration Received",
		text: `Hello ${name},\n\nThank you for registering as a General Member with Pashupatinath Norway Temple! Your membership application has been successfully received.${familyMembersText}\n\nYou are now part of our sacred mission to build the first Nepali Hindu temple in Norway and unite our community. Together, we are creating a spiritual home where our cultural heritage and religious traditions can thrive for generations to come.\n\nWhat happens next:\n• Your application is currently under review by our admin team\n• Once approved, you will become an Active Member with full access to member benefits\n• If you are 15 years or older, you will be eligible for Active Member status upon approval\n• Members under 15 will remain as General Members until they turn 15\n\nAs a General Member, you are already part of our community and will receive updates about temple events and activities.\n\nBest regards,\nPashupatinath Temple Norway Team`,
		html: `
			<!DOCTYPE html>
			<html>
			<head>
				<style>
					body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
					.container { max-width: 600px; margin: 0 auto; padding: 20px; }
					.header { background: linear-gradient(135deg, #ffc445 0%, #FF7722 100%); color: #000000; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
					.content { background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; }
					.status-box { background: #ffffff; border-left: 4px solid #ffc445; padding: 20px; margin: 20px 0; border-radius: 5px; }
					.next-steps { background: #ffffff; padding: 20px; margin: 20px 0; border-radius: 5px; }
					.step-item { display: flex; align-items: center; margin: 15px 0; }
					.step-icon { width: 30px; height: 30px; background: #ffc445; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #000000; margin-right: 15px; flex-shrink: 0; font-weight: bold; }
					.footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
				</style>
			</head>
			<body>
				<div class="container">
					<div class="header">
						<h1>Welcome to Pashupatinath Norway Temple!</h1>
						<p style="margin: 10px 0 0 0; font-size: 18px;">Your General Member Registration Received</p>
					</div>
					<div class="content">
						<p>Hello <strong>${name}</strong>,</p>
						<p>Thank you for registering as a <strong>General Member</strong> with Pashupatinath Norway Temple! Your membership application has been successfully received and you are now part of our sacred community.</p>
						
						${familyMembers && familyMembers.length > 0 ? `
						<div style="background: #ffffff; border-left: 4px solid #ffc445; padding: 20px; margin: 20px 0; border-radius: 5px;">
							<h3 style="margin: 0 0 10px 0; color: #ffc445; font-weight: bold;">Family Members Registered</h3>
							<p style="margin: 0; font-weight: bold;">${familyMembers.join(', ')}</p>
						</div>
						` : ''}
				
						<div class="next-steps">
							<h3 style="margin: 0 0 15px 0;">What Happens Next:</h3>
							<div style="margin: 20px 0;">
								<p><strong>1. Application Review</strong><br>
								<span style="color: #666;">Your application is under review by our admin team</span></p>
							</div>
							<div style="margin: 20px 0;">
								<p><strong>2. Active Member Approval</strong><br>
								<span style="color: #666;">Once approved, you'll become an Active Member with full benefits</span></p>
							</div>
							<div style="margin: 20px 0;">
								<p><strong>3. Age-Based Eligibility</strong><br>
								<span style="color: #666;">Members 15+ become Active Members; under 15 remain General until they turn 15</span></p>
							</div>
						</div>
						
						<p>As a General Member, you are already an important part of our community and will stay connected with our temple activities and cultural programs.</p>
						
						<p>If you have any questions, feel free to reach out to us.</p>
						<p>Best regards,<br><strong>Pashupatinath Norway Temple Team</strong></p>
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
		// Add unsubscribe footer if user is subscribed
		const htmlContentWithFooter = await addEmailFooter(email, mailOptions.html);
		mailOptions.html = htmlContentWithFooter;
		
		await transporter.sendMail(mailOptions);
		console.log("General Member welcome email sent to:", email);
	} catch (error) {
		console.error("Error sending General Member welcome email:", error);
		throw new Error("Failed to send General Member welcome email");
	}
}

// Active Member approval email (sent when admin approves membership)
type sendActiveMemberApprovalEmailEnglish = {
	name: string;
	email: string;
	setupToken: string;
	familyMembers?: string[]; // Array of family member names
};
export async function sendActiveMemberApprovalEmailEnglish({ name, email, setupToken, familyMembers }: sendActiveMemberApprovalEmailEnglish) {
	const setupUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/en/set-password?token=${setupToken}`;
	
	const familyMembersText = familyMembers && familyMembers.length > 0 
		? `\n\nFamily Members Registered: ${familyMembers.join(', ')}`
		: '';

	const mailOptions = {
		from: `"Pashupatinath Norway Temple" <${process.env.EMAIL_USER}>`,
		to: email,
		subject: "Congratulations! You are now an Active Member - Pashupatinath Norway Temple",
			text: `Hello ${name},\n\nCongratulations! Your membership has been approved and you are now an <strong>Active Member</strong> of Pashupatinath Norway Temple!${familyMembersText}\n\nYour application has been reviewed and approved by our admin team. You now have full access to all member benefits and can participate actively in our temple activities.\n\nPlease set your password by clicking the link below to access your member dashboard:\n${setupUrl}\n\nThis link is valid for 1 year.\n\nAs an Active Member, you can:\n• Access your member dashboard\n• Update your profile information\n• Participate in temple events and cultural programs\n• Contribute to our temple construction mission\n• Connect with fellow Nepalese community members\n• Help preserve our cultural and religious heritage\n• Vote in community decisions\n• Access exclusive member resources\n\nWe are thrilled to have you as an Active Member of our sacred mission to build the first Nepali Hindu temple in Norway.\n\nBest regards,\nPashupatinath Temple Norway Team`,
		html: `
			<!DOCTYPE html>
			<html>
			<head>
				<style>
					body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
					.container { max-width: 600px; margin: 0 auto; padding: 20px; }
					.header { background: linear-gradient(135deg, #CC0000 0%, #E32636 100%); color: #ffffff; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
					.content { background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; }
					.button { display: inline-block; background: #CC0000; color: #ffffff !important; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; text-align: center; }
					.approval-box { background: #ffffff; border-left: 4px solid #CC0000; padding: 20px; margin: 20px 0; border-radius: 5px; }
					.benefits-list { background: #ffffff; padding: 20px; margin: 20px 0; border-radius: 5px; }
					.benefit-item { display: flex; align-items: center; margin: 15px 0; }
					.benefit-icon { width: 40px; height: 40px; background: #CC0000; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #ffffff; margin-right: 15px; flex-shrink: 0; }
					.footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
				</style>
			</head>
			<body>
				<div class="container">
					<div class="header">
						<h1>🎉 Congratulations!</h1>
						<p style="margin: 10px 0 0 0; font-size: 18px;">You are now an Active Member!</p>
					</div>
					<div class="content">
						<p>Hello <strong>${name}</strong>,</p>
						<p>Congratulations! Your membership has been approved and you are now an <strong style="color: #CC0000;">Active Member</strong> of Pashupatinath Norway Temple!</p>
						
						${familyMembers && familyMembers.length > 0 ? `
						<div style="background: #ffffff; border-left: 4px solid #CC0000; padding: 20px; margin: 20px 0; border-radius: 5px;">
							<h3 style="margin: 0 0 10px 0; color: #CC0000; font-weight: bold;">Family Members Registered</h3>
							<p style="margin: 0; font-weight: bold;">${familyMembers.join(', ')}</p>
						</div>
						` : ''}
						
					
						
						<p>To access your member dashboard and start enjoying your Active Member benefits, please set your password:</p>
						<center>
							<a href="${setupUrl}" class="button">Set Your Password</a>
						</center>
						<p>Or copy and paste this link in your browser:</p>
						<p style="background: white; padding: 10px; border-radius: 5px; word-break: break-all;">${setupUrl}</p>
						<p><strong>Note:</strong> This link is valid for 1 year. If it expires, please contact our support team.</p>
						
						<div class="benefits-list">
							<h4 style="margin: 0 0 20px 0;">🌟 Active Member Benefits:</h4>
							<ul style="margin: 0; padding-left: 20px; color: #333;">
								<li style="margin: 10px 0;">
									<strong>Member Dashboard</strong><br>
									<span style="color: #666;">Access your personal member dashboard</span>
								</li>
								<li style="margin: 10px 0;">
									<strong>Events & Programs</strong><br>
									<span style="color: #666;">Participate in temple events and cultural programs</span>
								</li>
								<li style="margin: 10px 0;">
									<strong>Temple Construction</strong><br>
									<span style="color: #666;">Contribute to our temple construction mission</span>
								</li>
								<li style="margin: 10px 0;">
									<strong>Community Connection</strong><br>
									<span style="color: #666;">Connect with fellow Nepalese community members</span>
								</li>
								<li style="margin: 10px 0;">
									<strong>Voting Rights</strong><br>
									<span style="color: #666;">Vote in community decisions</span>
								</li>
								<li style="margin: 10px 0;">
									<strong>Exclusive Resources</strong><br>
									<span style="color: #666;">Access exclusive member resources</span>
								</li>
							</ul>
						</div>
						
						<p>We are thrilled to have you as an Active Member of our sacred mission to build the first Nepali Hindu temple in Norway and unite our community.</p>
						
						<p>If you have any questions, feel free to reach out to us.</p>
						<p>Best regards,<br><strong>Pashupatinath Norway Temple Team</strong></p>
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
		// Add unsubscribe footer if user is subscribed
		const htmlContentWithFooter = await addEmailFooter(email, mailOptions.html);
		mailOptions.html = htmlContentWithFooter;
		
		await transporter.sendMail(mailOptions);
		console.log("Active Member approval email sent to:", email);
	} catch (error) {
		console.error("Error sending Active Member approval email:", error);
		throw new Error("Failed to send Active Member approval email");
	}
}

// Nepali Active Member approval email
type sendActiveMemberApprovalEmail = {
	name: string;
	email: string;
	setupToken: string;
	familyMembers?: string[]; // Array of family member names
};

export async function sendActiveMemberApprovalEmail({ name, email, setupToken, familyMembers }: sendActiveMemberApprovalEmail) {
	const setupUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/ne/set-password?token=${setupToken}`;
	
	const familyMembersText = familyMembers && familyMembers.length > 0 
		? `\n\nपरिवारका सदस्यहरू दर्ता: ${familyMembers.join(', ')}`
		: '';

	const mailOptions = {
		from: `"पशुपतिनाथ नर्वे मन्दिर" <${process.env.EMAIL_USER}>`,
		to: email,
		subject: "बधाई छ! तपाईं अब सक्रिय सदस्य हुनुहुन्छ - पशुपतिनाथ नर्वे मन्दिर",
			text: `नमस्ते ${name},\n\nबधाई छ! तपाईंको सदस्यता स्वीकृत भएको छ र तपाईं अब पशुपतिनाथ नर्वे मन्दिरको <strong>सक्रिय सदस्य</strong> हुनुहुन्छ!${familyMembersText}\n\nतपाईंको आवेदन हाम्रो प्रशासन टोलीले समीक्षा गरी स्वीकृत गरेको छ। अब तपाईंसँग सबै सदस्य सुविधाहरू पूर्ण पहुँच छ र तपाईं हाम्रो मन्दिर गतिविधिहरूमा सक्रिय रूपमा सहभागी हुन सक्नुहुन्छ।\n\nकृपया तल दिइएको लिंकमा क्लिक गरेर आफ्नो पासवर्ड सेट गर्नुहोस् र आफ्नो सदस्य ड्यासबोर्ड पहुँच गर्नुहोस्:\n${setupUrl}\n\nयो लिंक १ वर्षको लागि मान्य छ।\n\nसक्रिय सदस्यको रूपमा, तपाईंले गर्न सक्नुहुन्छ:\n• आफ्नो सदस्य ड्यासबोर्ड पहुँच गर्नुहोस्\n• आफ्नो प्रोफाइल जानकारी अपडेट गर्नुहोस्\n• मन्दिर कार्यक्रमहरू र सांस्कृतिक कार्यक्रमहरूमा सहभागी हुनुहोस्\n• हाम्रो मन्दिर निर्माण मिशनमा योगदान पुर्याउनुहोस्\n• अन्य नेपाली समुदायका सदस्यहरूसँग जोडिनुहोस्\n• हाम्रो सांस्कृतिक र धार्मिक विरासतलाई सुरक्षित राख्न मद्दत गर्नुहोस्\n• समुदाय निर्णयहरूमा मतदान गर्नुहोस्\n• विशेष सदस्य स्रोतहरू पहुँच गर्नुहोस्\n\nहामी नर्वेमा पहिलो नेपाली हिन्दू मन्दिर बनाउने र हाम्रो समुदायलाई एकजुट गर्ने पवित्र मिशनको सक्रिय सदस्यको रूपमा तपाईंलाई पाएर धेरै खुशी छौं।\n\nशुभकामना,\nपशुपतिनाथ नर्वे मन्दिर टोली`,
		html: `
			<!DOCTYPE html>
			<html>
			<head>
				<meta charset="UTF-8">
				<style>
					body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; direction: ltr; }
					.container { max-width: 600px; margin: 0 auto; padding: 20px; }
					.header { background: linear-gradient(135deg, #CC0000 0%, #E32636 100%); color: #ffffff; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
					.content { background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; }
					.button { display: inline-block; background: #CC0000; color: #ffffff !important; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; text-align: center; }
					.approval-box { background: #ffffff; border-left: 4px solid #CC0000; padding: 20px; margin: 20px 0; border-radius: 5px; }
					.benefits-list { background: #ffffff; padding: 20px; margin: 20px 0; border-radius: 5px; }
					.benefit-item { display: flex; align-items: center; margin: 15px 0; }
					.benefit-icon { width: 40px; height: 40px; background: #CC0000; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #ffffff; margin-right: 15px; flex-shrink: 0; }
					.footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
				</style>
			</head>
			<body>
				<div class="container">
					<div class="header">
						<h1>🎉 बधाई छ!</h1>
						<p style="margin: 10px 0 0 0; font-size: 18px;">तपाईं अब सक्रिय सदस्य हुनुहुन्छ!</p>
					</div>
					<div class="content">
						<p>नमस्ते <strong>${name}</strong>,</p>
						<p>बधाई छ! तपाईंको सदस्यता स्वीकृत भएको छ र तपाईं अब पशुपतिनाथ नर्वे मन्दिरको <strong style="color: #CC0000;">सक्रिय सदस्य</strong> हुनुहुन्छ!</p>
						
						${familyMembers && familyMembers.length > 0 ? `
						<div style="background: #ffffff; border-left: 4px solid #CC0000; padding: 20px; margin: 20px 0; border-radius: 5px;">
							<h3 style="margin: 0 0 10px 0; color: #CC0000; font-weight: bold;">परिवारका सदस्यहरू दर्ता</h3>
							<p style="margin: 0; font-weight: bold;">${familyMembers.join(', ')}</p>
						</div>
						` : ''}
						
						<p>आफ्नो सदस्य ड्यासबोर्ड पहुँच गर्न र सक्रिय सदस्य सुविधाहरू आनन्द लिन आफ्नो पासवर्ड सेट गर्नुहोस्:</p>
						<center>
							<a href="${setupUrl}" class="button">आफ्नो पासवर्ड सेट गर्नुहोस्</a>
						</center>
						<p>वा यो लिंक आफ्नो ब्राउजरमा कपी गर्नुहोस्:</p>
						<p style="background: white; padding: 10px; border-radius: 5px; word-break: break-all;">${setupUrl}</p>
						<p><strong>नोट:</strong> यो लिंक १ वर्षको लागि मान्य छ। यो समय सकिएमा, कृपया हाम्रो समर्थन टोलीलाई सम्पर्क गर्नुहोस्।</p>
						
						<div class="benefits-list">
							<h4 style="margin: 0 0 20px 0;">🌟 सक्रिय सदस्य सुविधाहरू:</h4>
							<ul style="margin: 0; padding-left: 20px; color: #333;">
								<li style="margin: 10px 0;">
									<strong>सदस्य ड्यासबोर्ड</strong><br>
									<span style="color: #666;">आफ्नो व्यक्तिगत सदस्य ड्यासबोर्ड पहुँच गर्नुहोस्</span>
								</li>
								<li style="margin: 10px 0;">
									<strong>कार्यक्रमहरू र कार्यक्रमहरू</strong><br>
									<span style="color: #666;">मन्दिर कार्यक्रमहरू र सांस्कृतिक कार्यक्रमहरूमा सहभागी हुनुहोस्</span>
								</li>
								<li style="margin: 10px 0;">
									<strong>मन्दिर निर्माण</strong><br>
									<span style="color: #666;">हाम्रो मन्दिर निर्माण मिशनमा योगदान पुर्याउनुहोस्</span>
								</li>
								<li style="margin: 10px 0;">
									<strong>समुदाय जडान</strong><br>
									<span style="color: #666;">अन्य नेपाली समुदायका सदस्यहरूसँग जोडिनुहोस्</span>
								</li>
								<li style="margin: 10px 0;">
									<strong>मतदान अधिकार</strong><br>
									<span style="color: #666;">समुदाय निर्णयहरूमा मतदान गर्नुहोस्</span>
								</li>
								<li style="margin: 10px 0;">
									<strong>विशेष स्रोतहरू</strong><br>
									<span style="color: #666;">विशेष सदस्य स्रोतहरू पहुँच गर्नुहोस्</span>
								</li>
							</ul>
						</div>
						
						<p>हामी नर्वेमा पहिलो नेपाली हिन्दू मन्दिर बनाउने र हाम्रो समुदायलाई एकजुट गर्ने पवित्र मिशनको सक्रिय सदस्यको रूपमा तपाईंलाई पाएर धेरै खुशी छौं।</p>
						
						<p>यदि तपाईंसँग कुनै प्रश्नहरू छन् भने, कृपया हामीलाई सम्पर्क गर्नुहोस्।</p>
						<p>शुभकामना,<br><strong>पशुपतिनाथ नर्वे मन्दिर टोली</strong></p>
					</div>
					<div class="footer">
						<p>यो एक स्वचालित इमेल हो। कृपया यो सन्देशमा जवाफ दिनुहुँदैन।</p>
					</div>
				</div>
			</body>
			</html>
		`,
	};

	try {
		// Add unsubscribe footer if user is subscribed
		const htmlContentWithFooter = await addEmailFooter(email, mailOptions.html);
		mailOptions.html = htmlContentWithFooter;
		
		await transporter.sendMail(mailOptions);
		console.log("Nepali Active Member approval email sent to:", email);
	} catch (error) {
		console.error("Error sending Nepali Active Member approval email:", error);
		throw new Error("Failed to send Nepali Active Member approval email");
	}
}

// Verification follow-up email for unverified members
type sendVerificationFollowupEmail = {
	name: string;
	email: string;
	personalNumber: string;
};

export async function sendVerificationFollowupEmail({ name, email, personalNumber }: sendVerificationFollowupEmail) {
	const mailOptions = {
		from: `"पशुपतिनाथ नर्वे मन्दिर" <${process.env.EMAIL_USER}>`,
		to: email,
		subject: "पशुपतिनाथ नर्वे मन्दिर - ओस्लो कम्युन द्वारा प्रमाणीकरण आवश्यक",
		text: `नमस्ते ${name},\n\nपशुपतिनाथ नर्वे मन्दिरमा तपाईंको सदस्यताको लागि धन्यवाद।\n\nहामीले हालै ओस्लो कम्युनसँग तपाईंको व्यक्तिगत नम्बर (${personalNumber}) को प्रमाणीकरण गरेका छौं, तर अहिले सम्पर्कमा आएको छैन।\n\nकृपया निम्न कुराहरू गर्नुहोस्:\n१. आफ्नो व्यक्तिगत नम्बर सही छ भनेर पुष्टि गर्नुहोस्\n२. यदि कुनै त्रुटि छ भने, हामीलाई तुरुन्त सूचित गर्नुहोस्\n३. आफ्नो प्रमाणीकरण पूरा गर्न आवश्यक कागजातहरू प्रदान गर्नुहोस्\n\nयदि तपाईंसँग कुनै प्रश्नहरू छन् भने, कृपया हाम्रो समर्थन टोलीलाई सम्पर्क गर्नुहोस्।\n\nशुभकामना,\nपशुपतिनाथ नर्वे मन्दिर टोली`,
		html: `
			<!DOCTYPE html>
			<html>
			<head>
				<meta charset="UTF-8">
				<style>
					body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; direction: ltr; }
					.container { max-width: 600px; margin: 0 auto; padding: 20px; }
					.header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
					.content { background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; }
					.warning-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 5px; }
					.personal-number { background: #f3f4f6; padding: 10px; border-radius: 5px; font-family: monospace; font-size: 14px; text-align: center; margin: 10px 0; }
					.footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
				</style>
			</head>
			<body>
				<div class="container">
					<div class="header">
						<h1>📋 प्रमाणीकरण आवश्यक</h1>
						<p style="margin: 10px 0 0 0; font-size: 18px;">ओस्लो कम्युन द्वारा प्रमाणीकरण</p>
					</div>
					<div class="content">
						<p>नमस्ते <strong>${name}</strong>,</p>
						<p>पशुपतिनाथ नर्वे मन्दिरमा तपाईंको सदस्यताको लागि धन्यवाद।</p>
						
						<div class="warning-box">
							<h3 style="margin: 0 0 10px 0; color: #d97706;">⚠️ महत्त्वपूर्ण सूचना</h3>
							<p style="margin: 0;">हामीले हालै ओस्लो कम्युनसँग तपाईंको व्यक्तिगत नम्बरको प्रमाणीकरण गरेका छौं, तर अहिले सम्पर्कमा आएको छैन।</p>
						</div>
						
						<p><strong>तपाईंको व्यक्तिगत नम्बर:</strong></p>
						<div class="personal-number">${personalNumber}</div>
						
						<p><strong>कृपया निम्न कुराहरू गर्नुहोस्:</strong></p>
						<ol style="margin: 20px 0; padding-left: 20px;">
							<li style="margin: 10px 0;">आफ्नो व्यक्तिगत नम्बर सही छ भनेर पुष्टि गर्नुहोस्</li>
							<li style="margin: 10px 0;">यदि कुनै त्रुटि छ भने, हामीलाई तुरुन्त सूचित गर्नुहोस्</li>
							<li style="margin: 10px 0;">आफ्नो प्रमाणीकरण पूरा गर्न आवश्यक कागजातहरू प्रदान गर्नुहोस्</li>
						</ol>
						
						<p>यदि तपाईंसँग कुनै प्रश्नहरू छन् भने, कृपया हाम्रो समर्थन टोलीलाई सम्पर्क गर्नुहोस्।</p>
						<p>हामी तपाईंलाई यो प्रक्रिया पूरा गर्न मद्दत गर्न चाहन्छौं।</p>
						<p>शुभकामना,<br><strong>पशुपतिनाथ नर्वे मन्दिर टोली</strong></p>
					</div>
					<div class="footer">
						<p>यो एक स्वचालित इमेल हो। कृपया यो सन्देशमा जवाफ दिनुहुँदैन।</p>
					</div>
				</div>
			</body>
			</html>
		`,
	};

	try {
		// Add unsubscribe footer if user is subscribed
		const htmlContentWithFooter = await addEmailFooter(email, mailOptions.html);
		mailOptions.html = htmlContentWithFooter;
		
		await transporter.sendMail(mailOptions);
		console.log("Verification follow-up email sent to:", email);
	} catch (error) {
		console.error("Error sending verification follow-up email:", error);
		throw new Error("Failed to send verification follow-up email");
	}
}

// Oslo verification approval email with password setup link
type sendOsloVerificationApprovalEmail = {
	name: string;
	email: string;
	setupToken: string;
};

export async function sendOsloVerificationApprovalEmail({ name, email, setupToken }: sendOsloVerificationApprovalEmail) {
	const setupUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/ne/set-password?token=${setupToken}`;

	const mailOptions = {
		from: `"पशुपतिनाथ नर्वे मन्दिर" <${process.env.EMAIL_USER}>`,
		to: email,
		subject: "बधाई छ! ओस्लो कम्युन द्वारा प्रमाणीकरण पूर्ण - पशुपतिनाथ नर्वे मन्दिर",
		text: `नमस्ते ${name},\n\nबधाई छ! ओस्लो कम्युन द्वारा तपाईंको सदस्यता प्रमाणीकरण पूर्ण भएको छ र तपाईंको सदस्यता स्वीकृत भएको छ।\n\nतपाईं अब आधिकारिक रूपमा पशुपतिनाथ नर्वे मन्दिरको सदस्य हुनुहुन्छ! हामी तपाईंलाई हाम्रो समुदायमा स्वागत गर्दछौं।\n\nकृपया तल दिइएको लिंकमा क्लिक गरेर आफ्नो पासवर्ड सेट गर्नुहोस् र आफ्नो सदस्य ड्यासबोर्ड पहुँच गर्नुहोस्:\n${setupUrl}\n\nयो लिंक १ वर्षको लागि मान्य छ।\n\nसदस्यको रूपमा, तपाईंले गर्न सक्नुहुन्छ:\n• आफ्नो सदस्य ड्यासबोर्ड पहुँच गर्नुहोस्\n• आफ्नो प्रोफाइल जानकारी अपडेट गर्नुहोस्\n• मन्दिर कार्यक्रमहरूमा सहभागी हुनुहोस्\n• हाम्रो मन्दिर निर्माण मिशनमा योगदान पुर्याउनुहोस्\n• अन्य समुदाय सदस्यहरूसँग जोडिनुहोस्\n\nतपाईंको प्रमाणीकरण पूरा भएकोमा हामी धेरै खुशी छौं।\n\nशुभकामना,\nपशुपतिनाथ नर्वे मन्दिर टोली`,
		html: `
			<!DOCTYPE html>
			<html>
			<head>
				<meta charset="UTF-8">
				<style>
					body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; direction: ltr; }
					.container { max-width: 600px; margin: 0 auto; padding: 20px; }
					.header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
					.content { background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; }
					.success-box { background: #d1fae5; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0; border-radius: 5px; }
					.button { display: inline-block; background: #10b981; color: white !important; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; text-align: center; }
					.features { background: #f9fafb; padding: 20px; border-radius: 5px; margin: 20px 0; }
					.footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
				</style>
			</head>
			<body>
				<div class="container">
					<div class="header">
						<h1>🎉 बधाई छ! प्रमाणीकरण पूर्ण</h1>
						<p style="margin: 10px 0 0 0; font-size: 18px;">ओस्लो कम्युन द्वारा स्वीकृत</p>
					</div>
					<div class="content">
						<p>नमस्ते <strong>${name}</strong>,</p>
						<p>बधाई छ! ओस्लो कम्युन द्वारा तपाईंको सदस्यता प्रमाणीकरण पूर्ण भएको छ र तपाईंको सदस्यता स्वीकृत भएको छ।</p>
						
						<div class="success-box">
							<h3 style="margin: 0 0 10px 0; color: #059669;">✅ प्रमाणीकरण सफल</h3>
							<p style="margin: 0;">तपाईं अब आधिकारिक रूपमा पशुपतिनाथ नर्वे मन्दिरको सदस्य हुनुहुन्छ! हामी तपाईंलाई हाम्रो समुदायमा स्वागत गर्दछौं।</p>
						</div>
						
						<p><strong>आफ्नो खाता सुरु गर्नुहोस्:</strong></p>
						<a href="${setupUrl}" class="button">पासवर्ड सेट गर्नुहोस्</a>
						<p style="text-align: center; color: #666; font-size: 14px; margin-top: 10px;">यो लिंक १ वर्षको लागि मान्य छ</p>
						
						<div class="features">
							<h4 style="margin: 0 0 15px 0; color: #374151;">🌟 सदस्य लाभहरू:</h4>
							<ul style="margin: 0; padding-left: 20px;">
								<li style="margin: 8px 0;">आफ्नो सदस्य ड्यासबोर्ड पहुँच गर्नुहोस्</li>
								<li style="margin: 8px 0;">आफ्नो प्रोफाइल जानकारी अपडेट गर्नुहोस्</li>
								<li style="margin: 8px 0;">मन्दिर कार्यक्रमहरूमा सहभागी हुनुहोस्</li>
								<li style="margin: 8px 0;">हाम्रो मन्दिर निर्माण मिशनमा योगदान पुर्याउनुहोस्</li>
								<li style="margin: 8px 0;">अन्य समुदाय सदस्यहरूसँग जोडिनुहोस्</li>
							</ul>
						</div>
						
						<p>तपाईंको प्रमाणीकरण पूरा भएकोमा हामी धेरै खुशी छौं।</p>
						<p>हामी तपाईंलाई यो प्रक्रिया पूरा गर्न मद्दत गर्न चाहन्छौं।</p>
						<p>शुभकामना,<br><strong>पशुपतिनाथ नर्वे मन्दिर टोली</strong></p>
					</div>
					<div class="footer">
						<p>यो एक स्वचालित इमेल हो। कृपया यो सन्देशमा जवाफ दिनुहुँदैन।</p>
					</div>
				</div>
			</body>
			</html>
		`,
	};

	try {
		// Add unsubscribe footer if user is subscribed
		const htmlContentWithFooter = await addEmailFooter(email, mailOptions.html);
		mailOptions.html = htmlContentWithFooter;
		
		await transporter.sendMail(mailOptions);
		console.log("Oslo verification approval email sent to:", email);
	} catch (error) {
		console.error("Error sending Oslo verification approval email:", error);
		throw new Error("Failed to send Oslo verification approval email");
	}
}

// Welcome email with password setup link (deprecated, keeping for compatibility)
type sendWelcomeEmail = {
	name: string;
	email: string;
	setupToken: string;
	familyMembers?: string[]; // Array of family member names
};
export async function sendWelcomeEmail({ name, email, setupToken, familyMembers }: sendWelcomeEmail) {
	const setupUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/ne/set-password?token=${setupToken}`;
	
	const familyMembersText = familyMembers && familyMembers.length > 0 
		? `\n\nपरिवारका सदस्यहरू दर्ता: ${familyMembers.join(', ')}`
		: '';

	const mailOptions = {
		from: `"पशुपतिनाथ नर्वे मन्दिर" <${process.env.EMAIL_USER}>`,
		to: email,
		subject: "पशुपतिनाथ नर्वे मन्दिरमा स्वागत - आफ्नो पासवर्ड सेट गर्नुहोस्",
			text: `नमस्ते ${name},\n\nपशुपतिनाथ नर्वे मन्दिरमा स्वागत छ! तपाईंको सदस्यता स्वीकृत भएको छ।${familyMembersText}\n\nतपाईं अब नर्वेमा पहिलो नेपाली हिन्दू मन्दिर बनाउने र हाम्रो समुदायलाई एकजुट गर्ने हाम्रो पवित्र मिशनको भाग हुनुहुन्छ। सँगै, हामी एक आध्यात्मिक घर बनाउँदैछौं जहाँ हाम्रो सांस्कृतिक विरासा र धार्मिक परम्पराहरू आउँदा पुस्ताहरूका लागि फल्न सक्छन्।\n\nकृपया तल दिइएको लिंकमा क्लिक गरेर आफ्नो पासवर्ड सेट गर्नुहोस्:\n${setupUrl}\n\nयो लिंक १ वर्षको लागि मान्य छ।\n\nतपाईंको सदस्यतासँग, तपाईं हाम्रो दृष्टिकोणमा हामीसँग मिल्नुहुन्छ जहाँ नर्वेमा हाम्रो समृद्ध, जोडिएको नेपाली समुदाय छ जहाँ हरेक सदस्यलाई समर्थन, मूल्यवान र आफ्नो विरासतमा गर्व महसुस हुन्छ।\n\nशुभकामना,\nपशुपतिनाथ नर्वे मन्दिर टोली`,
		html: `
			<!DOCTYPE html>
			<html>
			<head>
				<meta charset="UTF-8">
				<style>
					body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; direction: ltr; }
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
						<h1>पशुपतिनाथ नर्वे मन्दिरमा स्वागत छ!</h1>
						<p style="margin: 10px 0 0 0; font-size: 18px;">सँगै हाम्रो पवित्र मन्दिर बनाउँदै</p>
					</div>
					<div class="content">
						<p>नमस्ते <strong>${name}</strong>,</p>
						<p>बधाई छ! तपाईंको सदस्यता आवेदन स्वीकृत भएको छ। तपाईं अब नर्वेमा पहिलो नेपाली हिन्दू मन्दिर बनाउने र हाम्रो समुदायलाई एकजुट गर्ने हाम्रो पवित्र मिशनको भाग हुनुहुन्छ।</p>
						${familyMembers && familyMembers.length > 0 ? `
						<div style="background: white; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0; border-radius: 5px;">
							<h3 style="margin: 0 0 10px 0; color: #10b981;">परिवारका सदस्यहरू दर्ता</h3>
							<p style="margin: 0; font-weight: bold;">${familyMembers.join(', ')}</p>
						</div>
						` : ''}
						<p>सँगै, हामी एक आध्यात्मिक घर बनाउँदैछौं जहाँ हाम्रो सांस्कृतिक विरासा र धार्मिक परम्पराहरू आउँदा पुस्ताहरूका लागि फल्न सक्छन्। तपाईंको सदस्यताले हामीलाई नर्वेमा हाम्रो समृद्ध, जोडिएको नेपाली समुदायको दृष्टिकोण नजिक लैजान्छ।</p>
						<p>आफ्नो खाता सेटअप पूरा गर्न, कृपया तल दिइएको बटनमा क्लिक गरेर आफ्नो पासवर्ड सेट गर्नुहोस्:</p>
						<center>
							<a href="${setupUrl}" class="button">आफ्नो पासवर्ड सेट गर्नुहोस्</a>
						</center>
						<p>वा यो लिंक आफ्नो ब्राउजरमा कपी गर्नुहोस्:</p>
						<p style="background: white; padding: 10px; border-radius: 5px; word-break: break-all;">${setupUrl}</p>
						<p><strong>नोट:</strong> यो लिंक १ वर्षको लागि मान्य छ। यो समय सकिएमा, कृपया हाम्रो समर्थन टोलीलाई सम्पर्क गर्नुहोस्।</p>
						<p>एकपटक तपाईंले आफ्नो पासवर्ड सेट गरेपछि, तपाईंले गर्न सक्नुहुन्छ:</p>
						<ul>
							<li>आफ्नो सदस्य ड्यासबोर्ड पहुँच गर्नुहोस्</li>
							<li>आफ्नो प्रोफाइल जानकारी अपडेट गर्नुहोस्</li>
							<li>मन्दिर कार्यक्रमहरू र सांस्कृतिक कार्यक्रमहरूमा सहभागी हुनुहोस्</li>
							<li>हाम्रो मन्दिर निर्माण मिशनमा योगदान पुर्याउनुहोस्</li>
							<li>अन्य नेपाली समुदायका सदस्यहरूसँग जोडिनुहोस्</li>
							<li>हाम्रो सांस्कृतिक र धार्मिक विरासतलाई सुरक्षित राख्न मद्दत गर्नुहोस्</li>
						</ul>
						<p>यदि तपाईंसँग कुनै प्रश्नहरू छन् भने, कृपया हामीलाई सम्पर्क गर्नुहोस्।</p>
						<p>शुभकामना,<br><strong>पशुपतिनाथ नर्वे मन्दिर टोली</strong></p>
					</div>
					<div class="footer">
						<p>यो एक स्वचालित इमेल हो। कृपया यो सन्देशमा जवाफ दिनुहुँदैन।</p>
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
		from: `"Pashupatinath Norway Temple" <${process.env.EMAIL_USER}>`,
		to: email,
		subject: "Thank You for Your Generous Donation - Pashupatinath Norway Temple",
		text: `Dear ${name},\n\nThank you for your generous donation of ${amount} ${currency} to Pashupatinath Norway Temple!\n\nYour support helps us make a positive impact in the Nepali community in Norway and support democratic values in Nepal.\n\nDonation Details:\nAmount: ${amount} ${currency}\nTransaction ID: ${transactionId}\nDate: ${date}\n${message ? `\nYour Message: ${message}` : ""}\n\nYour contribution will be used to support:\n- Community events and cultural programs\n- Political advocacy and awareness campaigns\n- Organizational growth and outreach\n- Member support and resources\n\nWe will send you a detailed receipt shortly for your records.\n\nWith gratitude,\nPashupatinath Temple Norway Team`,
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
						<p><strong>Pashupatinath Norway Temple Team</strong><br>
						<a href="mailto:${process.env.EMAIL_USER}" style="color: #0094da;">nepalihindusamfunn@gmail.com</a><br>
						<a href="${process.env.NEXTAUTH_URL || "http://localhost:3000"}" style="color: #0094da;">http://pashupatinathnorway.vercel.app/</a></p>
					</div>
					<div class="footer">
						<p>Pashupatinath Norway Temple</p>
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
		from: `"Pashupatinath Norway Temple" <${process.env.EMAIL_USER}>`,
		to: email,
		subject: "Thank You for Subscribing to Pashupatinath Norway Temple Newsletter!",
		text: `Thank you for subscribing to the Pashupatinath Norway Temple newsletter!\n\nWe're excited to keep you updated with our latest news, events, and community activities.\n\nWhat you can expect:\n- Latest news and updates from Pashupatinath Norway Temple\n- Information about upcoming events\n- Community initiatives and opportunities\n- Ways to get involved and make a difference\n\nYou can unsubscribe at any time by clicking the unsubscribe link in our emails.\n\nBest regards,\nPashupatinath Temple Norway Team`,
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
						<p style="margin: 10px 0 0 0; font-size: 18px;">Welcome to the Pashupatinath Norway Temple Community</p>
					</div>
					<div class="content">
						<p>Dear Subscriber,</p>
						
						<div class="welcome-box">
							<h3 style="margin: 0 0 10px 0; color: #10b981;"> Welcome to Our Newsletter! </h3>
							<p style="margin: 0;">Thank you for subscribing to the Pashupatinath Norway Temple newsletter. We're thrilled to have you join our community!</p>
						</div>

						<p>You're now part of a vibrant community dedicated to serving the Nepali community in Norway and supporting democratic values in Nepal. Through our newsletter, you'll stay connected with our mission and activities.</p>

						<div class="feature-list">
							<h4 style="margin: 0 0 20px 0;">What You Can Expect:</h4>
							<div class="feature-item">
								<div class="feature-icon"> </div>
								<div>
									<strong>Latest News & Updates</strong>
									<p style="margin: 5px 0 0 0; color: #666;">Stay informed about Pashupatinath Norway Temple's latest activities and achievements</p>
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

						<p>Best regards,<br><strong>Pashupatinath Norway Temple Team</strong><br>
						<a href="mailto:${process.env.EMAIL_USER}" style="color: #667eea;">nepalihindusamfunn@gmail.com</a><br>
						<a href="${process.env.NEXTAUTH_URL || "http://localhost:3000"}" style="color: #667eea;">http://pashupatinathnorway.vercel.app/</a></p>
					</div>
					<div class="footer">
						<p>Pashupatinath Norway Temple</p>
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

// Email verification email for email change
type sendEmailVerificationEmail = {
	name: string;
	email: string;
	verificationToken: string;
};
export async function sendEmailVerificationEmail({ name, email, verificationToken }: sendEmailVerificationEmail) {
	console.log("=== EMAIL VERIFICATION FUNCTION CALLED ===");
	console.log("Sending to:", email);
	console.log("Name:", name);
	console.log("Verification URL:", `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/en/verify-email?token=${verificationToken}`);
	console.log("Transporter configured:", !!transporter);
	console.log("EMAIL_USER:", process.env.EMAIL_USER);
	
	const verificationUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/en/verify-email?token=${verificationToken}`;
	
	const mailOptions = {
		from: `"Pashupatinath Norway Temple" <${process.env.EMAIL_USER}>`,
		to: email,
		subject: "Verify Your New Email Address - Pashupatinath Norway Temple",
		text: `Hello ${name},\n\nYou requested to change your email address for your Pashupatinath Norway Temple account. Please click the link below to verify your new email address:\n\n${verificationUrl}\n\nThis link is valid for 1 hour.\n\nIf you didn't request this change, please ignore this email or contact our support team.\n\nBest regards,\nPashupatinath Temple Norway Team`,
		html: `
			<!DOCTYPE html>
			<html>
			<head>
				<style>
					body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
					.container { max-width: 600px; margin: 0 auto; padding: 20px; }
					.header { background: linear-gradient(135deg, #ffc445 0%, #FF7722 100%); color: #000000; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
					.content { background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; }
					.button { display: inline-block; background: #ffc445; color: #000000 !important; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; text-align: center; }
					.footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
				</style>
			</head>
			<body>
				<div class="container">
					<div class="header">
						<h1>Verify Your New Email Address</h1>
						<p style="margin: 10px 0 0 0; font-size: 18px;">Pashupatinath Norway Temple</p>
					</div>
					<div class="content">
						<p>Hello <strong>${name}</strong>,</p>
						<p>You requested to change your email address for your Pashupatinath Norway Temple account. Please click the button below to verify your new email address:</p>
						<center>
							<a href="${verificationUrl}" class="button">Verify Email Address</a>
						</center>
						<p>Or copy and paste this link in your browser:</p>
						<p style="background: white; padding: 10px; border-radius: 5px; word-break: break-all;">${verificationUrl}</p>
						<p><strong>Note:</strong> This link is valid for 1 hour. If you didn't request this change, please ignore this email or contact our support team.</p>
						<p>If you have any questions, feel free to reach out to us.</p>
						<p>Best regards,<br><strong>Pashupatinath Norway Temple Team</strong></p>
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
		// Add unsubscribe footer if user is subscribed
		const htmlContentWithFooter = await addEmailFooter(email, mailOptions.html);
		mailOptions.html = htmlContentWithFooter;
		
		console.log("=== SENDING EMAIL ===");
		console.log("From:", mailOptions.from);
		console.log("To:", mailOptions.to);
		console.log("Subject:", mailOptions.subject);
		
		const result = await transporter.sendMail(mailOptions);
		console.log("Email verification email sent successfully:", result.messageId);
		console.log("Email verification email sent to:", email);
	} catch (error) {
		console.error("Error sending email verification email:", error);
		throw new Error("Failed to send email verification email");
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
		from: `"Pashupatinath Norway Temple" <${process.env.EMAIL_USER}>`,
		to: email,
		subject: "Reset Your Password - Pashupatinath Norway Temple",
		text: `Hello ${name},\n\nYou requested to reset your password for your Pashupatinath Norway Temple ${userType} account.\n\nPlease click the link below to reset your password:\n${resetUrl}\n\nThis link is valid for 1 hour.\n\nIf you didn't request this, please ignore this email.\n\nBest regards,\nPashupatinath Temple Norway Team`,
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
						<p>We received a request to reset the password for your Pashupatinath Norway Temple ${userType} account.</p>
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
						<p>Best regards,<br><strong>Pashupatinath Norway Temple Team</strong></p>
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

// Birthday wish email
type sendBirthdayWishEmail = {
	name: string;
	email: string;
	age: number;
};

export async function sendBirthdayWishEmail({ name, email, age }: sendBirthdayWishEmail) {
    const mailOptions = {
        from: `"Pashupatinath Norway Temple" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `जन्मदिनको शुभकामना ${name}! - Pashupatinath Norway Temple`,
        text: `आदरणीय ${name},\n\nपशुपतिनाथ मन्दिर नर्वे परिवारको तर्फबाट तपाईंलाई जन्मदिनको हार्दिक मंगलमय शुभकामना व्यक्त गर्दछौं।\n\nपशुपतिनाथले तपाईंलाई सुस्वास्थ्य, दीर्घायु र समृद्धि प्रदान गरून्।\n\n"जीवेत् शरदः शतम्"\n(तपाईं सय वर्षसम्म जीवित रहनुहोस्)\n\nसादर,\nपशुपतिनाथ मन्दिर नर्वे परिवार`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f0f0f0; }
                    .header { background: linear-gradient(135deg, #d4418e 0%, #ff6b6b 100%); color: white; padding: 40px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; text-align: center; }
                    .mantra-box { background: #fff5f5; border: 2px dashed #ff6b6b; padding: 20px; margin: 20px 0; border-radius: 10px; }
                    .mantra-sanskrit { font-size: 22px; color: #b71c1c; font-weight: bold; margin-bottom: 10px; display: block; }
                    .age-badge { background: #ff6b6b; color: white; padding: 8px 20px; border-radius: 25px; display: inline-block; font-weight: bold; margin: 10px 0; }
                    .footer { text-align: center; margin-top: 30px; color: #888; font-size: 12px; border-top: 1px solid #eee; padding-top: 20px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1 style="margin:0;">🎂 जन्मदिनको शुभकामना</h1>
                        <p style="margin: 10px 0 0 0; font-size: 18px;">पशुपतिनाथले कल्याण गरून्</p>
                    </div>
                    <div class="content">
                        <p>आदरणीय <strong>${name}</strong> ज्यू,</p>
                        
                        <p>पशुपतिनाथ मन्दिर नर्वे परिवारको तर्फबाट तपाईंको <strong>${age} औं</strong> जन्मदिनको अवसरमा हार्दिक शुभकामना व्यक्त गर्दछौं।</p>
                        
                        <div class="mantra-box">
                            <span class="mantra-sanskrit">ॐ त्वं जीव शतं वर्धमान:।</span>
                            <p style="font-style: italic; color: #555; margin: 5px 0;">"तपाईंको आयु सय वर्ष होस् र तपाईंको निरन्तर उन्नति होस्।"</p>
                        </div>
                        
                        <div class="age-badge">${age} वर्ष प्रवेश 🎊</div>
                        
                        <p style="margin-top:20px;">भगवान श्री पशुपतिनाथको कृपाले तपाईंको जीवनमा सुख, शान्ति, सुस्वास्थ्य र आध्यात्मिक उन्नति प्राप्त भइरहोस्।</p>
                        
                        <p>हाम्रो मन्दिर समुदायको एक महत्वपूर्ण सदस्यको रूपमा तपाईंको उपस्थितिको हामी उच्च कदर गर्दछौं।</p>
                        
                        <p><strong>शुभकामना!</strong></p>
                        
                        <p style="margin-top: 30px;">
                            सादर,<br>
                            <strong>पशुपतिनाथ मन्दिर नर्वे टोली</strong>
                        </p>
                    </div>
                    <div class="footer">
                        <p>यो एक स्वचालित सन्देश हो। कृपया यसमा जवाफ नपठाउनुहोला।</p>
                    </div>
                </div>
            </body>
            </html>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("Birthday wish email sent to:", email);
    } catch (error) {
        console.error("Error sending birthday wish email:", error);
        throw new Error("Failed to send birthday wish email");
    }
}
