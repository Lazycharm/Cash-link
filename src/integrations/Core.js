/**
 * Core Integrations - Supabase Wrapper
 * Replaces Base44's @/integrations/Core
 * 
 * This file provides replacements for:
 * - UploadFile (file uploads)
 * - InvokeLLM (replaced with free currency API)
 * - SendEmail (via Supabase Edge Functions)
 */
import { supabase } from '@/lib/supabase';

/**
 * Upload a file to Supabase Storage
 * Replaces Base44's UploadFile integration
 * 
 * @param {Object} options - Upload options
 * @param {File} options.file - The file to upload
 * @param {string} options.bucket - Storage bucket name (default: 'cashlink-files')
 * @param {string} options.folder - Optional folder path within the bucket
 * @returns {Promise<{file_url: string}>} - Object containing the public URL
 */
export async function UploadFile({ file, bucket = 'cashlink-files', folder = 'uploads' }) {
  if (!file) {
    throw new Error('No file provided');
  }

  // Get current user for folder organization
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id || 'anonymous';

  // Generate unique filename
  const fileExt = file.name.split('.').pop();
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  const fileName = `${timestamp}-${randomStr}.${fileExt}`;
  const filePath = `${folder}/${userId}/${fileName}`;

  // Upload file
  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (uploadError) {
    console.error('Upload error:', uploadError);
    throw new Error(`Failed to upload file: ${uploadError.message}`);
  }

  // Get public URL
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return { file_url: data.publicUrl };
}

/**
 * Convert currency using free ExchangeRate API
 * Replaces Base44's InvokeLLM for currency conversion
 * 
 * @param {number} amount - Amount to convert
 * @param {string} fromCurrency - Source currency code (e.g., 'NGN', 'KES')
 * @returns {Promise<Object>} - Conversion results with AED and USD amounts
 */
export async function convertCurrency(amount, fromCurrency) {
  try {
    // Using exchangerate-api.com (free tier: 1500 requests/month)
    const response = await fetch(
      `https://api.exchangerate-api.com/v4/latest/${fromCurrency}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch exchange rates');
    }

    const data = await response.json();
    
    const aedRate = data.rates.AED;
    const usdRate = data.rates.USD;

    return {
      aed_amount: parseFloat((amount * aedRate).toFixed(2)),
      usd_amount: parseFloat((amount * usdRate).toFixed(2)),
      aed_rate: parseFloat(aedRate.toFixed(6)),
      usd_rate: parseFloat(usdRate.toFixed(6)),
      from_currency: fromCurrency,
      original_amount: amount,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Currency conversion error:', error);
    throw new Error('Failed to convert currency. Please try again.');
  }
}

/**
 * InvokeLLM - Compatibility wrapper
 * Redirects to convertCurrency for currency conversion use cases
 * For other LLM use cases, would need OpenAI/Anthropic API
 * 
 * @deprecated Use convertCurrency directly for currency conversion
 */
export async function InvokeLLM({ prompt, add_context_from_internet, response_json_schema }) {
  // Parse the prompt to extract currency conversion request
  const currencyMatch = prompt.match(/Convert\s+(\d+(?:\.\d+)?)\s+(\w{3})/i);
  
  if (currencyMatch) {
    const amount = parseFloat(currencyMatch[1]);
    const fromCurrency = currencyMatch[2].toUpperCase();
    return convertCurrency(amount, fromCurrency);
  }

  // For non-currency prompts, throw an error or implement OpenAI
  console.warn('InvokeLLM called for non-currency operation. Consider implementing OpenAI API.');
  throw new Error('LLM functionality not available. Please use convertCurrency for currency conversion.');
}

/**
 * Call a Supabase Edge Function
 * Used for backend operations like sending emails, admin notifications, etc.
 * 
 * @param {string} functionName - Name of the edge function
 * @param {Object} payload - Data to send to the function
 * @returns {Promise<any>} - Response from the function
 */
export async function callEdgeFunction(functionName, payload) {
  const { data: { session } } = await supabase.auth.getSession();
  
  const { data, error } = await supabase.functions.invoke(functionName, {
    body: payload,
    headers: session ? {
      Authorization: `Bearer ${session.access_token}`
    } : {}
  });

  if (error) {
    console.error(`Edge function ${functionName} error:`, error);
    throw error;
  }

  return data;
}

/**
 * Send email via Edge Function
 * Replaces Base44's SendEmail integration
 * 
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.body - Email body (HTML)
 */
export async function SendEmail({ to, subject, body }) {
  return callEdgeFunction('send-email', { to, subject, body });
}

// Export individual functions for backwards compatibility
export default {
  UploadFile,
  InvokeLLM,
  convertCurrency,
  SendEmail,
  callEdgeFunction
};
