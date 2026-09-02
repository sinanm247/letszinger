import { toast } from "react-toastify";

// Google Apps Script Web App URL - Replace with your deployed web app URL
// To get this URL: Deploy > New deployment > Web app > Copy the URL
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyp86KdN55GdY3vhLKgjz2gCwinq_WnwkR2Ac7IsuRmCd4nDQqoCb6XoTeZjZiuf7uR/exec";

/**
 * Sends form data to Google Sheets via Google Apps Script
 * @param {Object} formData - Form data object
 * @param {string} formData.name - User's name
 * @param {string} formData.phone - User's phone number
 * @param {string} formData.email - User's email (optional)
 * @param {string} formData.message - Message content
 * @returns {Promise<boolean>} - Returns true if successful, false otherwise
 */
/**
 * Sends form data to Google Sheets via Google Apps Script
 * @param {Object} formData - Form data object
 * @param {string} formData.name - User's name
 * @param {string} formData.phone - User's phone number
 * @param {string} formData.email - User's email (optional)
 * @param {string} formData.message - Message content
 * @param {string} formData.source - Source of the form (optional, defaults to "Contact Form")
 * @param {string} formData.selectedOption - Selected option (for chatbot)
 * @param {string} formData.visitedBefore - Visited before (for chatbot)
 * @param {string} formData.configuration - Configuration (for chatbot)
 * @param {string} formData.pageUrl - Page URL (for chatbot)
 * @returns {Promise<boolean>} - Returns true if successful, false otherwise
 */
const sendToGoogleSheets = async (formData) => {
    // Skip if URL is not configured
    if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.includes("YOUR_GOOGLE_APPS_SCRIPT")) {
        console.warn("Google Sheets integration not configured. Skipping...");
        return { success: false, error: "Google Sheets URL not configured" };
    }

    try {
        // Prepare the data to send
        const dataToSend = {
            name: formData.name || "",
            phone: formData.phone || "",
            email: formData.email || "",
            message: formData.message || "",
            source: formData.source || "Contact Form",
            selectedOption: formData.selectedOption || "",
            visitedBefore: formData.visitedBefore !== undefined && formData.visitedBefore !== null ? formData.visitedBefore : null,
            configuration: formData.configuration || "",
            pageUrl: formData.pageUrl || "",
        };
        
        // Debug logging
        console.log("Sending to Google Sheets - Full data:", JSON.stringify(dataToSend, null, 2));
        console.log("Source being sent:", dataToSend.source);
        console.log("Configuration being sent:", dataToSend.configuration);
        
        // Try with CORS mode first to get proper response
        try {
            const response = await fetch(GOOGLE_SCRIPT_URL, {
                method: "POST",
                mode: "cors",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(dataToSend),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log("Data sent to Google Sheets successfully:", result);
            return { success: true, message: result.message || "Data sent successfully" };
        } catch (corsError) {
            // If CORS fails, try with no-cors mode as fallback
            console.warn("CORS mode failed, trying no-cors mode:", corsError);
            
            await fetch(GOOGLE_SCRIPT_URL, {
                method: "POST",
                mode: "no-cors",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(dataToSend),
            });

            // With no-cors mode, we can't read the response, but the data is still sent
            // We assume success since the request was sent without errors
            console.log("Data sent to Google Sheets (response not readable due to no-cors mode)");
            return { success: true, message: "Data sent successfully" };
        }
        
    } catch (error) {
        console.error("Google Sheets error:", error);
        // Even if there's an error, the data might still be saved
        // Return success: false but don't block the main flow
        return { success: false, error: error.message };
    }
};

/**
 * Sends contact form data to Google Sheets (which automatically sends email notifications)
 * Google Apps Script handles email sending when data is saved
 * @param {Object} formData - Form data object
 * @param {string} formData.name - User's name
 * @param {string} formData.phone - User's phone number
 * @param {string} formData.email - User's email (optional)
 * @param {string} formData.message - Message content
 * @param {string} formData.source - Source of the form (optional, defaults to "Contact Form")
 * @param {string} formData.configuration - Configuration (optional)
 * @returns {Promise<boolean>} - Returns true if successful, false otherwise
 */
export const sendContactFormEmail = async (formData) => {
    try {
        // Only send to Google Sheets if it's NOT a chatbot submission
        // Chatbot submissions are handled separately by sendChatbotToGoogleSheets
        const isChatbotSubmission = formData.message && formData.message.includes("Chatbot Inquiry Details");
        
        if (!isChatbotSubmission) {
            // Add source for contact form/popup form (use existing source if provided, otherwise default to "Contact Form")
            const formDataWithSource = {
                ...formData,
                source: formData.source || "Contact Form",
                selectedOption: "",
                visitedBefore: null,
                configuration: formData.configuration || "",
                pageUrl: "",
            };
            
            // Debug logging
            console.log("Sending to Google Sheets:", formDataWithSource);
            console.log("Source:", formDataWithSource.source);
            console.log("Configuration:", formDataWithSource.configuration);
            
            // Send to Google Sheets - this will trigger email notification via Google Apps Script
            const result = await sendToGoogleSheets(formDataWithSource);
            
            if (result.success) {
                toast.success("Thank you for your message! We'll get back to you soon.");
                return { success: true, message: "Data saved successfully" };
            } else {
                throw new Error(result.error || "Failed to save data");
            }
        } else {
            // If it's a chatbot submission, just return success (handled separately)
            toast.success("Thank you for your message! We'll get back to you soon.");
            return { success: true };
        }
    } catch (error) {
        console.error("Form submission error:", error);
        toast.error("Failed to send message. Please try again.");
        return { success: false, error: error.message || error };
    }
};

/**
 * Sends chatbot data to Google Sheets via Google Apps Script
 * @param {Object} chatData - Chatbot data object
 * @param {string} chatData.name - User's name
 * @param {string} chatData.phone - User's phone number
 * @param {string} chatData.selectedOption - Selected option label
 * @param {boolean} chatData.visitedBefore - Whether user visited before
 * @param {string} chatData.configuration - Selected configuration
 * @param {string} chatData.pageUrl - Page URL where chatbot was used
 * @returns {Promise<boolean>} - Returns true if successful, false otherwise
 */
export const sendChatbotToGoogleSheets = async (chatData) => {
    // Format chatbot message with details (without separator lines)
    const details = [];
    if (chatData.selectedOption) {
        details.push("Selected Option: " + chatData.selectedOption);
    }
    if (chatData.visitedBefore !== undefined && chatData.visitedBefore !== null) {
        details.push("Visited Before: " + (chatData.visitedBefore ? "Yes" : "No"));
    }
    if (chatData.configuration) {
        details.push("Configuration: " + chatData.configuration);
    }
    if (chatData.pageUrl) {
        details.push("Page URL: " + chatData.pageUrl);
    }
    
    const message = details.length > 0 
        ? "Chatbot Inquiry Details:\n" + details.join("\n")
        : "-";
    
    const formData = {
        name: chatData.name || "",
        phone: chatData.phone || "",
        email: "", // Chatbot doesn't collect email
        message: message, // Formatted message with chatbot details
        source: "Chatbot",
        selectedOption: chatData.selectedOption || "",
        visitedBefore: chatData.visitedBefore !== undefined && chatData.visitedBefore !== null ? chatData.visitedBefore : null,
        configuration: chatData.configuration || "",
        pageUrl: chatData.pageUrl || "",
    };

    // Send to Google Sheets (non-blocking - don't fail if this fails)
    try {
        const result = await sendToGoogleSheets(formData);
        if (result.success) {
            console.log("Chatbot data saved to Google Sheets successfully!");
        }
        return result;
    } catch (error) {
        console.error("Failed to save chatbot data to Google Sheets (non-critical):", error);
        return { success: false, error };
    }
};

