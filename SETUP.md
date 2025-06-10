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

## Environment Variables Required

Create a `.env` file with these variables:

```env
# OpenAI API
OPENAI_API_KEY=your_openai_api_key_here

# Supabase Database
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe (Optional - for real payments)
STRIPE_SECRET_KEY=your_stripe_secret_key
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
```

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