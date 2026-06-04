
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://anandamfashion.in';

async function generateSitemap() {
    console.log('Generating sitemap...');

    const staticRoutes = [
        '/',
        '/shop',
        '/blog',
        '/profile',
        '/login',
        '/privacy-policy',
        '/terms-of-service',
        '/shipping-returns',
        '/our-commitment',
        '/contact'
    ];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    // Add static routes
    staticRoutes.forEach(route => {
        xml += `
  <url>
    <loc>${BASE_URL}${route}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    });

    try {
        // Add blog post routes
        try {
            const blogModule = await import('../utils/blogPosts');
            const posts = (blogModule as any).BLOG_POSTS as Array<{ slug: string; publishedAt: string }>;
            posts.forEach((p) => {
                xml += `
  <url>
    <loc>${BASE_URL}/blog/${p.slug}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
            });
        } catch (e) {
            // Blog is optional; don't fail sitemap generation if the module isn't available
        }

        // Fetch products for dynamic routes
        console.log('Fetching products...');
        const productsCol = collection(db, 'products');
        const productSnapshot = await getDocs(productsCol);

        productSnapshot.forEach(doc => {
            xml += `
  <url>
    <loc>${BASE_URL}/product/${doc.id}</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>`;
        });

        xml += `
</urlset>`;

        const publicDir = path.resolve(__dirname, '../public');
        if (!fs.existsSync(publicDir)) {
            fs.mkdirSync(publicDir);
        }

        fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), xml);
        console.log('✅ Sitemap generated successfully at public/sitemap.xml');
        console.log(`- ${staticRoutes.length} static routes`);
        console.log(`- ${productSnapshot.size} product routes`);

    } catch (error) {
        console.error('❌ Error generating sitemap:', error);
        process.exit(1);
    }
}

generateSitemap();
