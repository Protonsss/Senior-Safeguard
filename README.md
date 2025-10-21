# Senior Safeguard 🛡️

A multilingual voice AI assistant for seniors and caregivers - a safe, calming version of Siri optimized for elder care.

## Features

- **Multilingual Support**: English, Mandarin, Hindi, Tamil
- **Voice AI Assistant**: Natural language understanding with calm, respectful tone
- **Guided Tasks**: Zoom joining, phone calls, volume control, WiFi setup, scam protection
- **General Q&A**: Answer any question like a simplified ChatGPT
- **Scam Shield**: Integrated Sync.me protection
- **Multiple Platforms**:
  - Phone IVR (primary) via Twilio
  - Web PWA with offline support
  - SMS helper
  - Caregiver portal

## Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS, PWA
- **Backend**: Next.js API routes, Twilio webhooks
- **Database**: Supabase (PostgreSQL)
- **Voice**: Twilio, Google STT/TTS
- **AI**: OpenAI GPT-4 for Q&A and task detection
- **Background Jobs**: BullMQ + Redis
- **Auth**: Supabase Auth

## Getting Started

### Prerequisites

- Node.js 18+
- Redis (for background workers)
- Supabase account
- Twilio account
- OpenAI API key
- Google Cloud account (for STT/TTS)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd "Senior Safeguard"
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment variables:
```bash
cp .env.example .env
```

4. Fill in your environment variables in `.env`

5. Set up Supabase database:
   - Run the SQL in `supabase/schema.sql`
   - Run the seed data in `supabase/seed.sql`

6. Start the development server:
```bash
npm run dev
```

7. In a separate terminal, start the background worker:
```bash
npm run worker
```

### Twilio Setup

1. Create a Twilio account and get a phone number
2. Set up webhook URLs in Twilio console:
   - Voice: `https://your-domain.com/api/ivr/voice`
   - SMS: `https://your-domain.com/api/sms/incoming`
3. Configure TwiML app for voice capabilities

## Project Structure

```
Senior Safeguard/
├── src/
│   ├── app/                    # Next.js 14 app directory
│   │   ├── (auth)/            # Authentication pages
│   │   ├── (caregiver)/       # Caregiver portal
│   │   ├── (senior)/          # Senior PWA interface
│   │   └── api/               # API routes
│   ├── components/            # React components
│   ├── lib/                   # Core libraries
│   │   ├── ai/               # OpenAI integration
│   │   ├── ivr/              # Twilio IVR logic
│   │   ├── i18n/             # Internationalization
│   │   └── tasks/            # Guided task modules
│   ├── workers/              # Background job workers
│   └── types/                # TypeScript types
├── supabase/                 # Database schema & migrations
├── public/                   # Static assets
└── tests/                    # Test files
```

## Environment Variables

See `.env.example` for required environment variables.

## Usage

### For Seniors

1. **Phone**: Call the Twilio number
2. **Web**: Visit the PWA at your deployed URL
3. **SMS**: Send a text to the Twilio number

### For Caregivers

1. Visit `/caregiver` to access the dashboard
2. View activity logs, scam alerts, and metrics
3. Manage senior profiles and preferences

## Deployment

### Vercel (Recommended for Next.js)

```bash
vercel deploy
```

### Docker

```bash
docker build -t senior-safeguard .
docker run -p 3000:3000 senior-safeguard
```

## Contributing

This project is designed for senior care. Please maintain:
- Calm, respectful tone in all user-facing content
- Large touch targets (44px minimum)
- High contrast for readability
- Simple, clear language
- Accessibility best practices

## License

Proprietary - All rights reserved

## Support

For support, please contact the development team.

