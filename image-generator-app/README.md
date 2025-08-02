# AI Image Studio

A modern, responsive web application for AI-powered image generation and editing using Google's Gemini AI. Create stunning visuals from text prompts or modify existing images with natural language instructions.

![AI Image Studio](https://img.shields.io/badge/AI-Powered-blue?style=for-the-badge&logo=google)
![Next.js](https://img.shields.io/badge/Next.js-15.4.5-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)

## ✨ Features

### 🎨 **Text-to-Image Generation**
- Generate high-quality images from text descriptions
- Advanced prompt engineering support
- Real-time image generation with Google Gemini AI

### 🖼️ **Image Editing & Modification**
- Upload existing images for modification
- Natural language editing instructions
- Preserve original image context while applying changes

### 🎯 **User Experience**
- **Side-by-Side Layout**: Controls on left, generated images on right
- **Drag & Drop Upload**: Easy image upload with visual feedback
- **Download & Share**: One-click download and social sharing
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Beautiful UI**: Modern glass morphism design with animated backgrounds

### 🚀 **Technical Features**
- **Real-time Generation**: Instant image creation and modification
- **Error Handling**: Graceful error management with user feedback
- **Loading States**: Visual feedback during generation process
- **Rate Limiting**: Built-in protection against abuse
- **Optimized Performance**: Fast loading and smooth interactions

## 🛠️ Tech Stack

- **Frontend**: Next.js 15.4.5, React 19.1.0, TypeScript
- **Styling**: Tailwind CSS 4.0
- **AI Integration**: Google Gemini AI (@google/genai)
- **Icons**: Lucide React
- **Deployment**: Vercel-ready

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Google AI API key

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd image-generator-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory:
   ```env
   GOOGLE_API_KEY=your_google_ai_api_key_here
   ```

4. **Get Google AI API Key**
   - Visit [Google AI Studio](https://aistudio.google.com/)
   - Create a new API key
   - Copy the key to your `.env.local` file

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎮 Usage

### Text-to-Image Generation
1. Enter a detailed description of the image you want to create
2. Click "Generate Image"
3. Wait for the AI to create your image
4. Download or share the generated image

### Image Editing
1. Upload an existing image using the drag & drop area
2. Enter instructions for how you want to modify the image
3. Click "Modify Image"
4. Download or share the modified image

### Tips for Better Results
- **Be Specific**: Detailed descriptions produce better results
- **Use Adjectives**: Include style, mood, and artistic direction
- **Mention Medium**: Specify if you want a photo, painting, illustration, etc.
- **Include Context**: Describe the setting, lighting, and composition

## 🏗️ Project Structure

```
image-generator-app/
├── app/
│   ├── api/
│   │   └── generate-image/
│   │       └── route.ts          # AI image generation API
│   ├── globals.css               # Global styles and animations
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Main application page
├── components/
│   ├── ai_image_generator.tsx    # Image generation component
│   └── navbar.tsx                # Navigation bar
├── public/
│   └── logo-light.png           # Application logo
├── package.json
└── README.md
```

## 🔧 Configuration

### Environment Variables
- `GOOGLE_API_KEY`: Your Google AI API key (required)

### Customization
- **Styling**: Modify `app/globals.css` for custom animations and styles
- **API**: Update `app/api/generate-image/route.ts` for different AI providers
- **UI**: Customize components in the `components/` directory

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add your `GOOGLE_API_KEY` to Vercel environment variables
4. Deploy automatically

### Other Platforms
The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🔒 Security & Rate Limiting

- **API Key Protection**: Environment variables keep your API key secure
- **Rate Limiting**: Built-in protection against excessive requests
- **Input Validation**: All user inputs are validated and sanitized
- **Error Handling**: Graceful error management without exposing sensitive data

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini AI** for providing the image generation capabilities
- **Next.js Team** for the amazing framework
- **Tailwind CSS** for the utility-first CSS framework
- **Vercel** for seamless deployment

## 📞 Support

If you encounter any issues or have questions:

- **Issues**: Create an issue in the GitHub repository
- **Email**: Contact info@technioz.com for support
- **Documentation**: Check the inline code comments for technical details

## 🔄 Updates

Stay updated with the latest features and improvements by:
- Watching the repository
- Following the release notes
- Checking the changelog

---

**Made with ❤️ by [Your Name/Team]**

*Transform your ideas into stunning visuals with AI Image Studio*
