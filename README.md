<p align="center">
  <img src="/template/public/SupawaldBanner.png" alt="Supawald Banner">
</p>

<p align="center">
    <em>A headless CMS for Supabase Storage. Built with Next.js 14, TypeScript, and Tailwind CSS.</em>
</p>

<p align="center">
    <a href="LICENSE">
        <img src="https://img.shields.io/badge/license-Apache%202.0-blue.svg" alt="Apache 2.0 License">
    </a>
    <a href="https://nodejs.org/">
        <img src="https://img.shields.io/badge/node-18%2B-blue.svg" alt="Node.js Version">
    </a>
    <a href="https://nextjs.org/">
        <img src="https://img.shields.io/badge/Next.js-14-black" alt="Next.js">
    </a>
    <a href="https://supabase.com/">
        <img src="https://img.shields.io/badge/Supabase-Platform-green" alt="Supabase">
    </a>
</p>

## 🚀 Quick Start with Template

1. **Create a new project**
   ```bash
   npx create-supawald my-app
   cd my-app
   ```

2. **Set up your Supabase project**
   - Create a new bucket in Supabase Storage
   - Get your project URL and anon key from Settings -> API
   - Copy `.env.example` to `.env.local` and fill in your credentials:
     ```env
     NEXT_PUBLIC_SUPABASE_URL=your-project-url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
     NEXT_PUBLIC_BUCKET_NAME=your-bucket-name
     AUTH_USERNAME=admin
     AUTH_PASSWORD=your-secure-password
     ```

3. **Start the development server**
   ```bash
   npm install
   npm run dev
   ```

4. **Visit http://localhost:3000** and log in with your credentials

> **Note**: The template includes a complete Next.js application with file management, authentication, and static site generation support.

# Supawald

A headless CMS for Supabase Storage. Built with Next.js 14, TypeScript, and Tailwind CSS. Provides a clean interface for managing files in Supabase Storage buckets with real-time updates and static site generation support.

![Supawald Screenshot](/template/public/images/viewbucket.png)

## What is Supawald?

Supawald is a file management system that turns Supabase Storage into a full-featured CMS. It's designed for developers who need a simple way to manage assets for their Next.js applications, blogs, or any project using Supabase Storage.

### Key Features

- **File Management**
  - Drag & drop file uploads
  - Folder navigation
  - File deletion
  - In-place file editing
  - Real-time updates via Supabase subscriptions

- **Developer Experience**
  - TypeScript for type safety
  - Next.js 14 App Router
  - Tailwind CSS for styling
  - Basic auth protection
  - Publish API for static site generation

- **Storage Features**
  - Public/private bucket support
  - File type detection
  - File size tracking
  - Last modified timestamps

<table>
  <tr>
    <td><img src="/template/public/images/viewmarkdown.png" alt="Supawald Screenshot" width="100%"></td>
    <td><img src="/template/public/images/viewimage.png" alt="Supawald Screenshot" width="100%"></td>
  </tr>
</table>

## Use Cases

1. **Blog Asset Management**
   - Store and manage images, documents, and other media
   - Organize content by date, category, or project
   - Quick access to frequently used assets

2. **Document Management**
   - Store and organize PDFs, spreadsheets, and other documents
   - Version control through Supabase's built-in features
   - Secure access control via bucket policies

3. **Application Assets**
   - Manage static assets for web applications
   - Store user uploads and generated content
   - Handle media files for user profiles or content

## Technical Requirements

- Node.js 18+
- Supabase account (free tier works)
- npm or yarn

## ▶️ Quick Start

### Use the CLI

```bash
npx create-supawald my-app
cd my-app
npm install
npm run dev
```

### Or clone manually

```bash
git clone https://github.com/yourusername/supawald.git
cd supawald/template
npm install
npm run dev
```

2. **Set Up Supabase**
   ```sql
   -- Create a new bucket in Supabase Storage
   -- Name it something like 'blog-content' or 'assets'
   -- Set appropriate privacy settings (public/private)
   ```

3. **Configure Environment**
   ```bash
   cp .env.example .env.local
   ```
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   NEXT_PUBLIC_BUCKET_NAME=your-bucket-name

   # Auth (for admin access)
   AUTH_USERNAME=admin
   AUTH_PASSWORD=your-secure-password

   # Publish API (for static site generation)
   PUBLISH_URL=https://your-site.com/api/publish
   PUBLISH_TOKEN=your-secure-token
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

## Static Site Generation Integration

Supawald includes a publish API that triggers regeneration of static pages that depend on Supabase Storage data. This is useful for:
- Blog posts that display uploaded images
- Product pages with product images
- Any static page that needs to reflect changes in your storage bucket

### Setting Up Your Static Site

1. **Create a Publish API Route**
   Create a new API route in your Next.js application at `pages/api/publish.ts`:

   ```typescript
   import { NextApiRequest, NextApiResponse } from 'next'

   export default async function handler(
     req: NextApiRequest,
     res: NextApiResponse
   ) {
     // Check for secret to confirm this is a valid request
     if (req.headers.authorization !== `Bearer ${process.env.PUBLISH_TOKEN}`) {
       return res.status(401).json({ message: 'Invalid token' })
     }

     try {
       // Revalidate your static pages
       await res.revalidate('/') // Revalidate homepage
       await res.revalidate('/blog') // Revalidate blog pages
       await res.revalidate('/products') // Revalidate product pages
       
       return res.json({ revalidated: true })
     } catch (err) {
       // If there was an error, Next.js will continue
       // to show the last successfully generated page
       return res.status(500).send('Error revalidating')
     }
   }
   ```

2. **Configure Environment Variables**
   In your Supawald instance:
   ```env
   PUBLISH_URL=https://your-static-site.com/api/publish
   PUBLISH_TOKEN=your-secure-token
   ```

   In your static site:
   ```env
   PUBLISH_TOKEN=your-secure-token  # Same token as above
   ```

3. **Using the Publish Button**
   When you click the publish button in Supawald:
   - It sends a POST request to your static site's publish API
   - Your static site regenerates the specified pages
   - The new content becomes available on your static site

![Supawald Screenshot](/template/public/images/screenshot.png)


### Example Usage

```typescript
// In your static site's page component
export async function getStaticProps() {
  // Fetch data from Supabase Storage
  const { data: images } = await supabase.storage
    .from('your-bucket')
    .list('blog-images')

  return {
    props: {
      images,
      // ... other props
    },
    // Revalidate every hour
    revalidate: 3600
  }
}
```

When you update an image in Supawald and click publish:
1. The image is updated in Supabase Storage
2. The publish API is called
3. Your static pages are regenerated with the new image
4. The changes are live on your static site

## API Integration

### File Operations

```typescript
// Example: Upload a file
const { data, error } = await supabase.storage
  .from('your-bucket')
  .upload('path/to/file.jpg', file)

// Example: Get file URL
const { data: { publicUrl } } = supabase.storage
  .from('your-bucket')
  .getPublicUrl('path/to/file.jpg')
```

### Static Site Generation

```typescript
// Trigger static page regeneration
await fetch('/api/publish', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.PUBLISH_TOKEN}`
  }
})
```

## 🔒 Security Best Practices

1. **Supabase Storage**
   - Use private buckets for sensitive content
   - Implement RLS policies for bucket access
   - Set up CORS rules for your domain
   - Use signed URLs for temporary access

2. **Authentication**
   - Use strong passwords for admin access
   - Implement rate limiting
   - Set up proper CORS headers
   - Use HTTPS in production

3. **Environment Variables**
   - Never commit `.env.local`
   - Rotate credentials regularly
   - Use different keys for development/production
   - Consider using a secrets manager
   - Keep your `PUBLISH_TOKEN` secure and only share with trusted services

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## **🤝 Contributing**

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines.

## **📄 License**

Apache 2.0 - See [LICENSE](LICENSE) for details.

## **🎉 Join the Community**

- **GitHub Issues**: Found a bug? Let us know [here](https://github.com/StructuredLabs/supawald/issues).
- **Community Forum**: Reach out [here](https://join.slack.com/t/structuredlabs-users/shared_invite/zt-31vvfitfm-_vG1HR9hYysR_56u_PfI8Q)
- **Discussions**: Share your ideas and ask questions in our [discussion forum](https://github.com/StructuredLabs/supawald/discussions).

## **📢 Stay Connected**

<p>
    <a href="https://www.linkedin.com/company/structuredlabs/" target="_blank">
        <img src="https://img.shields.io/badge/Follow%20Us-LinkedIn-blue?style=for-the-badge&logo=linkedin" alt="Follow us on LinkedIn">
    </a>
    <a href="https://x.com/StructuredLabs" target="_blank">
        <img src="https://img.shields.io/badge/Follow%20Us-Twitter-1DA1F2?style=for-the-badge&logo=twitter" alt="Follow us on Twitter">
    </a>
</p>