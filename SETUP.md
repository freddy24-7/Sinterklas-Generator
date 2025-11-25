# Setup Guide

## Environment Variables

Create a `.env.local` file in the root of your project with the following variables:

```env
GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here
```

### Optional Configuration

You can also specify which Gemini model to use:

```env
GOOGLE_GENERATIVE_AI_MODEL=gemini-pro
```

Available models:
- `gemini-pro` (default) - Best for text generation
- `gemini-pro-vision` - For multimodal content

## Getting Your Google API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the API key
5. Add it to your `.env.local` file

## Running the Application

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env.local` file with your API key (see above)

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. Fill in the recipient's name (required)
2. Optionally add facts about the recipient
3. Adjust the settings:
   - Number of lines (4-20)
   - Style (Classic or Free-flowing)
   - Friendliness level (0-100)
4. Click "Genereer Gedicht" to generate the poem
5. Copy or clear the generated poem as needed

## Troubleshooting

### API Key Issues
- Make sure your `.env.local` file is in the root directory
- Restart the development server after adding/changing environment variables
- Verify your API key is correct and has the necessary permissions

### Generation Errors
- Check the browser console for error messages
- Ensure you have internet connectivity
- Verify your Google API key has sufficient quota



