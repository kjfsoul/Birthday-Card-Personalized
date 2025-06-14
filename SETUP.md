# Birthday Gen Setup Guide

## Database Setup (Supabase)

1. **Create a Supabase project** at https://supabase.com
2. **Run the SQL schema** in your Supabase SQL Editor:
   ```sql
   -- Copy and paste the entire contents of supabase-schema.sql
   ```
3. **Get your environment variables** from Project Settings > API:
   - `SUPABASE_URL` - Your project URL
   - `SUPABASE_ANON_KEY` - Your anon/public key

## Environment Variables & API Key Configuration

Create a `.env` file in the project root by copying `.env.example` (you may need to create this file if it doesn't exist) and filling in your actual keys.

### OpenAI API Key
-   **Variable:** `OPENAI_API_KEY`
-   **Purpose:** Used for generating birthday messages (GPT-4) and images (DALL-E 3).
-   **How to obtain:** Get it from your [OpenAI Platform dashboard](https://platform.openai.com/api-keys).
-   **Notes:** The application relies on access to GPT-4 and DALL-E 3 models. Ensure your OpenAI account has credits and access to these models.

### Supabase
-   **Variable:** `SUPABASE_URL`
-   **Purpose:** URL for your Supabase project, used for database storage.
-   **How to obtain:** Project Settings > API in your Supabase dashboard.
-   **Notes:** Used by the server for storing generated messages and purchase information.

-   **Variable:** `SUPABASE_ANON_KEY`
-   **Purpose:** Anon/public key for your Supabase project.
-   **How to obtain:** Project Settings > API in your Supabase dashboard.
-   **Notes:** Used by the server for interacting with Supabase.

### Stripe (for Payments)
-   **Variable:** `STRIPE_SECRET_KEY` (Server-side)
-   **Purpose:** Used for processing payments with Stripe (e.g., creating PaymentIntents).
-   **How to obtain:** Find it in your [Stripe Dashboard](https://dashboard.stripe.com/apikeys) (secret key, usually `sk_live_...` or `sk_test_...`).
-   **Notes:** Required for the premium purchase flow if you intend to process real payments.

-   **Variable:** `VITE_STRIPE_PUBLIC_KEY` (Client-side)
-   **Purpose:** Used by the Stripe.js client in the frontend to tokenize payment information.
-   **How to obtain:** Find it in your [Stripe Dashboard](https://dashboard.stripe.com/apikeys) (publishable key, usually `pk_live_...` or `pk_test_...`).
-   **Notes:** This key is prefixed with `VITE_` as it's exposed to the client through Vite.

### Resend (for Sending Emails)
-   **Variable:** `RESEND_API_KEY`
-   **Purpose:** Used for sending birthday card emails via Resend.
-   **How to obtain:** Get it from your [Resend Dashboard](https://resend.com/api-keys).
-   **Notes:** You'll need to verify a domain with Resend for good email deliverability (e.g., `noreply@yourdomain.com`).

### Twilio (for Sending SMS)
-   **Variable:** `TWILIO_ACCOUNT_SID`
-   **Purpose:** Account SID for your Twilio account, used for sending SMS.
-   **How to obtain:** Find it on your [Twilio Console dashboard](https://www.twilio.com/console).

-   **Variable:** `TWILIO_AUTH_TOKEN`
-   **Purpose:** Auth Token for your Twilio account.
-   **How to obtain:** Find it on your [Twilio Console dashboard](https://www.twilio.com/console).

-   **Variable:** `TWILIO_PHONE_NUMBER`
-   **Purpose:** A Twilio phone number that you've purchased or configured, capable of sending SMS.
-   **How to obtain:** Manage numbers in your [Twilio Console](https://www.twilio.com/console/phone-numbers/incoming).
-   **Notes:** Ensure the number is SMS-capable and has the necessary geographic reach.

## Testing Premium Features

To test the premium card designer and features without payment:

1. Generate a birthday message
2. Click "Get Premium Experience" 
3. Enter any email address
4. Click "Test Premium Experience (Free)" button
5. You'll be redirected to the premium experience with:
   - Additional premium messages
   - Full card designer with fonts and effects
   - Sparkle customization tools
   - Download capabilities

## Real Payment Integration

The app uses your Stripe product URL: `https://buy.stripe.com/cNicN6erG5Vr9ed4ld9Zm02`

Users can click "Buy Premium Experience - $2.99" to complete actual purchases.

## Key Features

### Enhanced Image Generation
- Analyzes personality traits and quirks
- Generates contextually appropriate images
- Horse riding → Western themes with horseshoes, cowboy boots
- Country/trailer → Rustic farmhouse aesthetics
- Cat lover → Elegant feline elements
- Artist → Paint palettes and creative elements

### Smart Name Logic
- Family relationships (mom, dad, sister) → Shows relationship name
- Friends/others → Shows actual name
- Prevents "Happy Birthday, Linda!" when recipient is "Mom"

### Card Designer
- 6 font options with previews
- 5 sparkle effects (gold, silver, rainbow, pink, blue)
- Color customization
- Editable text overlays
- Canvas download functionality

### Premium Experience
- 3 additional personalized messages
- Full card customization
- Printify integration placeholders
- Advanced editing tools

## Development Notes

- Uses Supabase for database instead of local PostgreSQL
- OpenAI GPT-4o for text generation
- DALL-E 3 for sophisticated image generation
- No text rendering in images to avoid spelling issues
- Text overlays handle all name display logic

## Cost Considerations

This application integrates several third-party services that operate on a usage-based pricing model. It's crucial to be aware of these potential costs and monitor your usage:

-   **OpenAI (GPT-4 & DALL-E 3):**
    -   Both text generation (GPT-4) and image generation (DALL-E 3) API calls are billed based on usage (tokens for text, per image for DALL-E).
    -   Costs can accumulate, especially with high usage or more advanced models.
    -   **Recommendation:** Monitor your OpenAI API usage regularly in your OpenAI dashboard. Consider setting usage limits if possible. Explore different models or prompt optimization techniques if costs become a concern.

-   **Twilio (SMS):**
    -   Sending SMS messages via Twilio incurs per-message fees, which vary by destination country and message type.
    -   **Recommendation:** Review [Twilio's SMS pricing](https://www.twilio.com/sms/pricing) and monitor your usage in the Twilio console.

-   **Resend (Email):**
    -   Resend offers a generous free tier (e.g., 3,000 emails/month, 100 emails/day as of initial writing).
    -   If you exceed these limits, you will be billed according to their pricing plans.
    *   **Recommendation:** Check [Resend's pricing page](https://resend.com/pricing) for current free tier details and paid plan costs.

-   **Stripe (Payments):**
    *   Stripe charges a percentage and/or fixed fee per successful card transaction.
    *   **Recommendation:** Familiarize yourself with [Stripe's transaction fees](https://stripe.com/pricing) for your region.

-   **Supabase (Database & Backend):**
    *   Supabase also has a free tier with certain limits on database size, API calls, etc.
    *   **Recommendation:** Monitor your Supabase project usage. For larger applications or higher traffic, you might need to upgrade to a paid plan. Check [Supabase pricing](https://supabase.com/pricing).

**General Advice:**
*   Always refer to the official pricing pages for each service for the most up-to-date information.
*   Set up billing alerts with each service provider where available to avoid unexpected charges.
*   Use test keys and development modes where possible during initial development to avoid incurring costs.