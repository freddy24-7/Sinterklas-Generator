# Sinterklaas Gedichten Generator

A modern, AI-powered web application for generating personalized Sinterklaas poems in Dutch. Create custom, humorous, and heartfelt poems for friends and family with customizable styles, tones, and even human-like imperfections.

## 🎁 Features

- **Personalized Poem Generation**: Create custom Sinterklaas poems with recipient names and personal facts
- **Two Poem Styles**:
  - **Klassiek**: Strict structure with 4-line groups and AABB rhyming pattern
  - **Vrij Stromend**: Variable line groupings with flexible or optional rhyming
- **AI Modes**:
  - **Fully AI**: Perfect, polished poems without human mistakes
  - **Humanize**: Poems with 2-3 subtle mistakes typical for the author's age and gender
- **Customizable Settings**:
  - Adjustable line count (4-20 lines)
  - Friendliness scale (Spicy to Very Friendly)
  - Age and gender-based humanization (for Humanize mode)
- **Export Options**: Copy, print, or download poems as PDF
- **Responsive Design**: Fully optimized for mobile, tablet, and desktop devices
- **Modern UI**: Clean, intuitive interface with helpful tooltips and instructions

## 🛠️ Technologies Used

### Frontend
- **[Next.js 16](https://nextjs.org/)** - React framework with App Router
- **[React 19](https://react.dev/)** - UI library
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Tailwind CSS 4](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Radix UI](https://www.radix-ui.com/)** - Accessible component primitives
  - Dialog, Slider, Button, Card components
- **[jsPDF](https://github.com/parallax/jsPDF)** - PDF generation library

### Backend & AI
- **[Google Gemini AI](https://ai.google.dev/)** - AI model for poem generation
  - Uses `gemini-2.0-flash` model via `@google/generative-ai`
- **Next.js API Routes** - Serverless API endpoints

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Vercel Analytics** - Analytics integration (optional)

## 📋 Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Google Gemini API key ([Get one here](https://ai.google.dev/))

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd NextjsStarter
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root directory:

```env
GOOGLE_GENAI_API_KEY=your_api_key_here
# Alternative variable names also supported:
# GEMINI_API_KEY=your_api_key_here
# GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here
# GOOGLE_AI_API_KEY=your_api_key_here

# Optional: Specify a different Gemini model
# GEMINI_MODEL=gemini-2.0-flash
```

### 4. Run the development server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for production

```bash
npm run build
npm start
```

## 📖 Usage

1. **Fill in recipient information**:
   - Enter the recipient's name (required)
   - Optionally add personal facts about the recipient

2. **Customize poem settings**:
   - Choose the number of lines (4-20)
   - Select poem style (Klassiek or Vrij Stromend)
   - Adjust friendliness level (Spicy to Very Friendly)

3. **Choose AI mode**:
   - **Fully AI**: For perfect, polished poems
   - **Humanize**: For authentic, hand-written feeling poems
     - If Humanize is selected, enter the author's age and gender

4. **Generate**: Click "Genereer Gedicht" to create your poem

5. **Export**: Copy, print, or download your poem as PDF

## 🏗️ Project Structure

```
NextjsStarter/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── generate-poem/
│   │   │       └── route.ts          # API endpoint for poem generation
│   │   ├── globals.css               # Global styles
│   │   ├── layout.tsx                # Root layout
│   │   └── page.tsx                  # Home page
│   ├── components/
│   │   ├── control-panel.tsx         # Settings and controls
│   │   ├── poem-generator.tsx        # Main poem generator component
│   │   ├── header.tsx                # App header with info dialog
│   │   ├── footer.tsx                # App footer
│   │   ├── sinterklaas-hero.tsx      # Hero section
│   │   └── ui/                       # Reusable UI components
│   └── lib/
│       ├── gemini.ts                 # Gemini AI utility functions
│       └── utils.ts                  # Utility functions
├── public/                            # Static assets
├── package.json
└── README.md
```

## 🔧 Configuration

### Environment Variables

The app supports multiple environment variable names for the Google Gemini API key:
- `GOOGLE_GENAI_API_KEY` (preferred)
- `GEMINI_API_KEY`
- `GOOGLE_GENERATIVE_AI_API_KEY`
- `GOOGLE_AI_API_KEY`

### Model Configuration

By default, the app uses `gemini-2.0-flash`. You can override this by setting:
- `GEMINI_MODEL` or `GOOGLE_GENERATIVE_AI_MODEL`

## 🎨 Features in Detail

### Poem Styles

- **Klassiek**: Traditional structure with strict 4-line groups and AABB rhyming (e.g., 4+4+4 for 12 lines)
- **Vrij Stromend**: Flexible structure with variable line groupings (e.g., 2+3+7) and optional rhyming

### Humanize Mode

When enabled, poems include 2-3 subtle mistakes based on:
- **Age groups**:
  - Young children (5-9): Simple spelling mistakes, basic word choices
  - Teenagers (10-17): Occasional typos, informal word choices
  - Adults (18+): Subtle typos, minor spelling mistakes
- **Gender**: Tailored mistakes typical for the selected gender

### Friendliness Scale

- **Spicy (0-39)**: Funny and sharp with a touch of humor
- **Normal (40-69)**: Neutral and balanced
- **Very Friendly (70-100)**: Very friendly and positive

## 🚢 Deployment

### Deploy to Vercel

The easiest way to deploy is using [Vercel](https://vercel.com):

1. Push your code to GitHub/GitLab/Bitbucket
2. Import your repository in Vercel
3. Add your environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

This Next.js app can be deployed to any platform that supports Node.js:
- Netlify
- AWS Amplify
- Railway
- Render
- Any Node.js hosting service

## 📝 License

This project is private and proprietary.

## 🤝 Contributing

This is a private project. For questions or suggestions, please contact the project maintainer.

## 📧 Support

For issues or questions, please open an issue in the repository or contact the development team.

---

Made with ❤️ for Sinterklaas celebrations
