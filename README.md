# Pashupatinath Norway Temple 🇳🇵

A modern, multilingual web platform for Pashupatinath Norway Temple, dedicated to fostering political engagement and community building for Nepali diaspora in Norway.

## 🎯 About

Pashupatinath Norway Temple serves as the digital hub for the Norwegian chapter of Nepal's progressive political movement. The platform enables political activism, community organizing, and cultural preservation for Nepali citizens residing in Norway while maintaining strong connections with their homeland.

### Key Features

- **🌍 Multilingual Support** - English, Nepali, and Norwegian languages
- **📱 Fully Responsive** - Optimized for all devices and screen sizes
- **🎨 Modern UI/UX** - Beautiful, accessible interface with smooth animations
- **🔐 Secure Authentication** - User registration, login, and role-based access
- **💳 Online Donations** - Stripe integration for secure payment processing
- **📰 Content Management** - Dynamic blogs, events, galleries, and notices
- **📧 Email Notifications** - Automated communication system
- **🎥 Media Gallery** - Photo and video galleries with optimized loading
- **📊 Admin Dashboard** - Comprehensive content management system

## 🛠️ Tech Stack

### Frontend

- **Framework**: Next.js 15.1.9 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom animations
- **UI Components**: Radix UI + Custom components
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Internationalization**: next-intl

### Backend

- **Database**: MongoDB with Mongoose ODM
- **Authentication**: NextAuth.js
- **File Storage**: Cloudinary
- **Email**: Nodemailer
- **Payments**: Stripe
- **API**: Next.js API Routes

### Development Tools

- **Code Quality**: ESLint, TypeScript
- **Testing**: Jest
- **Deployment**: Docker, Docker Compose
- **Version Control**: Git

## 📁 Project Structure

```
rspnorway/
├── app/                    # Next.js App Router pages
│   ├── [locale]/          # Internationalized routes
│   │   ├── (auth)/        # Authentication pages
│   │   ├── (dashboard)/   # Admin dashboard
│   │   ├── admin/         # Admin management
│   │   ├── api/           # API routes
│   │   ├── blog/          # Blog pages
│   │   ├── events/        # Event pages
│   │   ├── gallery/       # Photo/video galleries
│   │   └── ...
├── components/             # Reusable React components
│   ├── ui/               # Base UI components
│   ├── forms/            # Form components
│   ├── layout/           # Layout components
│   └── ...
├── lib/                   # Utility libraries
├── models/               # MongoDB schemas
├── messages/             # Internationalization messages
├── public/               # Static assets
└── types/                # TypeScript type definitions
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB database
- Cloudinary account (for media storage)
- Stripe account (for payments)
- Email service (Gmail or SMTP)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/your-username/rspnorway.git
cd rspnorway
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

```bash
cp .env.example .env.local
```

Configure your `.env.local` with:

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# NextAuth
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Stripe
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Email
EMAIL_USER=your-email@gmail.com
EMAIL_APP_PASS=your-app-password

# Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

4. **Run the development server**

```bash
npm run dev
```

5. **Open your browser** Navigate to [http://localhost:3000](http://localhost:3000)

## 🌐 Features in Detail

### 🏠 Homepage

- **Hero Section**: Dynamic content with call-to-action
- **Event Timeline**: Upcoming events with popup notifications
- **Gallery Preview**: Recent photos and videos
- **Newsletter Subscription**: Email capture system

### 📰 Content Management

- **Blog System**: Rich text editor with TipTap
- **Event Management**: Calendar integration with ticket booking
- **Gallery**: Photo and video galleries with lazy loading
- **Notices**: Important announcements and circulars

### 👥 User System

- **Authentication**: Secure login/registration with NextAuth
- **User Roles**: Member, Admin, SuperAdmin permissions
- **Profiles**: User profile management
- **Memberships**: Membership application and management

### 💰 Donations

- **Stripe Integration**: Secure payment processing
- **Multiple Amounts**: Preset and custom donation amounts
- **Receipt Generation**: Automated donation receipts
- **Donor Management**: Track and manage donations

### 🎨 Design System

- **Responsive Design**: Mobile-first approach
- **Dark/Light Mode**: Theme switching capability
- **Accessibility**: WCAG compliant components
- **Performance**: Optimized images and lazy loading

## 🌍 Internationalization

The platform supports three languages:

- **English** (en)
- **Nepali** (ne) - नेपाली
- **Norwegian** (no) - Norsk

Language files are located in `/messages/` directory and can be easily extended.

## 🔧 API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Content Management

- `GET /api/blogs` - Fetch blog posts
- `POST /api/blogs` - Create blog post
- `PUT /api/blogs/[id]` - Update blog post
- `DELETE /api/blogs/[id]` - Delete blog post

### Events

- `GET /api/events` - Fetch events
- `POST /api/events` - Create event
- `PUT /api/events/[id]` - Update event

### Media

- `GET /api/gallery` - Fetch gallery images
- `GET /api/videos` - Fetch videos
- `POST /api/upload` - Upload media to Cloudinary

### Donations

- `POST /api/donations` - Process donation
- `GET /api/donations` - Fetch donation history

## 📦 Deployment

### Docker Deployment

```bash
# Build the image
docker build -t rspnorway .

# Run with Docker Compose
docker-compose up -d
```

### Vercel Deployment

1. Connect your repository to Vercel
2. Configure environment variables
3. Deploy automatically on push to main branch

### Manual Deployment

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 🧪 Testing

Run the test suite:

```bash
npm test
```

Run tests with coverage:

```bash
npm run test:coverage
```

## 📊 Performance Optimization

- **Image Optimization**: Next.js Image component with Cloudinary
- **Code Splitting**: Automatic route-based code splitting
- **Lazy Loading**: Components and images loaded on demand
- **Caching**: API response caching and browser caching
- **Bundle Analysis**: Regular bundle size monitoring

## 🔒 Security Features

- **Authentication**: Secure session management
- **Authorization**: Role-based access control
- **Data Validation**: Input sanitization and validation
- **CSRF Protection**: Built-in Next.js CSRF protection
- **Rate Limiting**: API rate limiting
- **Secure Headers**: Security headers configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and inquiries:

- **Email**: nepalihindusamfunn@gmail.com
- **Phone**: +47 967 80 0984
- **Website**: [https://rspnorway.org](https://rspnorway.org)

## 🙏 Acknowledgments

- **Next.js Team**: For the amazing framework
- **Vercel**: For hosting and deployment platform
- **Cloudinary**: For media storage and optimization
- **Stripe**: For payment processing
- **Open Source Community**: For the amazing tools and libraries

---

**Pashupatinath Norway Temple** - Building a progressive future for Nepal, together. 🇳🇵✨
