# Lumina - Instagram Clone

A modern Instagram clone built with Next.js 14, TypeScript, Tailwind CSS, and Appwrite.

## 🌟 Features

- 📱 Responsive Design
- 🎨 Modern UI with Tailwind CSS and shadcn/ui
- 🔐 User Authentication with Appwrite
- 📸 Image Upload and Management
- 💬 Real-time Chat
- 📱 Stories Feature
- 🎥 Reels Support
- 🔍 Search Functionality
- #️⃣ Hashtag System
- 🔖 Post Bookmarking
- 📊 Analytics Dashboard
- 🌓 Dark Mode Support

## 🛠️ Tech Stack

- [Next.js 14](https://nextjs.org/) - React Framework
- [TypeScript](https://www.typescriptlang.org/) - Type Safety
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [shadcn/ui](https://ui.shadcn.com/) - UI Components
- [Appwrite](https://appwrite.io/) - Backend as a Service
- [Lucide Icons](https://lucide.dev/) - Icons
- [date-fns](https://date-fns.org/) - Date Formatting

## 📋 Prerequisites

- Node.js 18+ and npm
- Appwrite Instance

## 🚀 Getting Started

1. Clone the repository:
```bash
git clone https://github.com/saikothasan/Lumina.git
cd Lumina
```

2. Install dependencies:
```bash
npm install
```

3. Set up your environment variables:
Create a `.env.local` file in the root directory and add:
```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=your_appwrite_endpoint
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
```

4. Run the development server:
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your application.

## 📁 Project Structure

```
Lumina/
├── app/                   # Next.js App Router Pages
├── components/           # React Components
├── contexts/            # React Context Providers
├── lib/                 # Utility Functions
└── public/              # Static Assets
```

## 🔧 Configuration

### Appwrite Setup

1. Create a new project in Appwrite
2. Create the following collections:
   - users
   - posts
   - comments
   - likes
   - follows
   - stories
   - messages
   - notifications
   - reels
   - hashtags
   - bookmarks
   - blockedUsers

### Database Schema

Detailed database schema can be found in the `lib/appwrite.ts` file.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js Documentation](https://nextjs.org/docs)
- [Appwrite Documentation](https://appwrite.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)

## 📞 Contact

Saiko Thasan - [@saikothasan](https://github.com/saikothasan)

Project Link: [https://github.com/saikothasan/Lumina](https://github.com/saikothasan/Lumina)
