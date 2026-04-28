// Simple HTML sanitizer for server components (removes <style>, <script>, and event handlers)
export default function sanitizeHtml(html) {
	if (!html) return "";
	// Remove <script> and <style> tags and their content
	let clean = html.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "");
	// Remove on* event handlers (e.g., onclick, onmouseover)
	clean = clean.replace(/ on\w+="[^"]*"/gi, "");
	clean = clean.replace(/ on\w+='[^']*'/gi, "");
	return clean;
}
