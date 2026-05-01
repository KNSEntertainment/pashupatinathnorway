import Subscriber from "@/models/Subscriber.Model";
import connectDB from "@/lib/mongodb";

/**
 * Generates unsubscribe footer for emails
 * @param {string} email - Recipient email address
 * @returns {Promise<string>} - HTML footer with unsubscribe link or empty string if not subscribed
 */
export async function generateEmailFooter(email) {
  try {
    console.log("=== GENERATING EMAIL FOOTER ===");
    console.log("Email:", email);
    
    await connectDB();
    
    // Check if the email is in subscribers collection
    const subscriber = await Subscriber.findOne({ subscriber: email });
    
    console.log("Subscriber found:", !!subscriber);
    if (subscriber) {
      console.log("Subscriber ID:", subscriber._id);
      console.log("Subscriber created:", subscriber.createdAt);
    }
    
    if (!subscriber) {
      console.log("No subscriber found, returning empty footer");
      return ""; // No unsubscribe link if not subscribed
    }
    
    // Generate unsubscribe link with token
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL || 'http://localhost:3000';
    const unsubscribeUrl = `${baseUrl}/en/unsubscribe?email=${encodeURIComponent(email)}`;
    
    return `
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 12px; text-align: center;">
          You received this email because you subscribed to our newsletter.
        </p>
        <p style="color: #6b7280; font-size: 12px; text-align: center; margin-top: 8px;">
          <a href="${unsubscribeUrl}" style="color: #dc2626; text-decoration: underline;">
            Unsubscribe
          </a>
        </p>
      </div>
    `;
  } catch (error) {
    console.error("Error generating email footer:", error);
    console.error("Error details:", error.message, error.stack);
    return ""; // Return empty footer on error
  }
}

/**
 * Adds unsubscribe footer to email content
 * @param {string} email - Recipient email address
 * @param {string} emailContent - Email HTML content
 * @returns {Promise<string>} - Email content with unsubscribe footer
 */
export async function addEmailFooter(email, emailContent) {
  console.log("=== ADDING EMAIL FOOTER ===");
  console.log("Email:", email);
  console.log("Content length:", emailContent.length);
  
  try {
    const footer = await generateEmailFooter(email);
    console.log("Footer length:", footer.length);
    console.log("Footer preview:", footer.substring(0, 100));
    
    const result = emailContent + footer;
    console.log("Final content length:", result.length);
    return result;
  } catch (error) {
    console.error("Error in addEmailFooter:", error);
    // Return original content if footer generation fails
    return emailContent;
  }
}

/**
 * Plain text version of unsubscribe footer
 * @param {string} email - Recipient email address
 * @returns {Promise<string>} - Plain text footer
 */
export async function generatePlainTextFooter(email) {
  try {
    await connectDB();
    
    const subscriber = await Subscriber.findOne({ subscriber: email });
    
    if (!subscriber) {
      return "";
    }
    
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL || 'http://localhost:3000';
    const unsubscribeUrl = `${baseUrl}/en/unsubscribe?email=${encodeURIComponent(email)}`;
    
    return `
---
You received this email because you subscribed to our newsletter.
To unsubscribe: ${unsubscribeUrl}
    `;
  } catch (error) {
    console.error("Error generating plain text footer:", error);
    return "";
  }
}
