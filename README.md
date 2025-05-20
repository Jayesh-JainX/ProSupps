# Whey Protein E-commerce Website

A modern e-commerce platform built with Next.js 13+ for selling whey protein supplements. This project features a responsive design, user authentication, product management, and an admin dashboard.

## Features

- **User Authentication**
  - Email/password signup and login
  - Protected routes for authenticated users
  - User profile management

- **Product Management**
  - Browse product catalog
  - Detailed product pages with descriptions
  - Product search and filtering

- **Admin Dashboard**
  - Product inventory management
  - User management
  - Order tracking

- **UI/UX**
  - Responsive design
  - Dark/light theme support
  - Modern component library with shadcn/ui

## Tech Stack

- **Frontend**: Next.js 13+ (App Router)
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS
- **TypeScript**: For type safety

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd whey-protein
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Set up environment variables
Create a `.env` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
├── app/                 # Next.js 13 app directory
│   ├── about/          # About page
│   ├── admin/          # Admin dashboard
│   ├── login/          # Authentication pages
│   ├── products/       # Product pages
│   └── profile/        # User profile
├── components/         # Reusable components
│   ├── ui/            # UI components
│   ├── footer.tsx     # Footer component
│   └── nav.tsx        # Navigation component
├── lib/                # Utility functions
│   ├── supabase.ts    # Supabase client
│   └── utils.ts       # Helper functions
└── public/            # Static assets
```

## Database Schema

The project uses Supabase PostgreSQL with the following main tables:

- `users`: User profiles and authentication
- `products`: Product information
- `orders`: Order management
- `categories`: Product categories

Check `supabase/schema.sql` for detailed schema information.

## Deployment

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Deploy your application using the following steps:

1. Push your code to a Git repository
2. Import your project to Vercel
3. Add your environment variables
4. Deploy!

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
