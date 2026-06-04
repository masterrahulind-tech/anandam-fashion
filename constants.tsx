
import { Product } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Royal Silk Zardosi Lehanga',
    description: `A masterpiece of traditional Indian embroidery on pure Banarasi silk. Hand-stitched with love and precision. 

    At Anandam Atelier, we believe that every garment tells a story of heritage and craftsmanship. Our Royal Silk Zardosi Lehanga is the epitome of this philosophy. Hand-woven in the historic city of Varanasi, this lehanga features intricate Zardosi work that has been passed down through generations of master artisans. The metallic threads, known as 'Zari', are meticulously woven into the fabric to create patterns inspired by nature and royal Mughal architecture. 

    The Banarasi silk used in this piece is sourced from local weavers who use traditional wooden looms, ensuring a texture and luster that is unmatched by power-loom alternatives. Each stitch is a testament to the artisan's dedication, with thousands of tiny beads and sequins hand-applied to create a shimmering effect that captures the light beautifully. The process of making a single lehanga can take anywhere from three to six weeks, reflecting the slow-fashion ethos we champion.

    This lehanga is not just a piece of clothing; it is a wearable piece of art. The silhouette is designed to provide a majestic flare, perfect for weddings, grand receptions, and heritage celebrations. The accompanying dupatta is also hand-embroidered to complement the main ensemble, featuring delicate borders and 'Boutis' (floral patterns) scattered throughout the length. The blouse fabric provided is also heavy silk, allowing for custom tailoring to your exact measurements.

    Styling Tip: Pair this royal ensemble with antique gold jewelry, such as a Jhumka or a Maang Tikka, and a traditional 'Gajra' in your hair for a complete heritage look. Whether you are a bride searching for her dream ensemble or a guest at a high-profile ethnic event, this Zardosi Lehanga ensures you stand out with timeless elegance and grace. Our commitment to sustainable luxury means that this piece is designed to be cherished for a lifetime and passed down as an heirloom through generations, preserving the rich textile history of India.`,
    price: 18500,
    originalPrice: 24000,
    category: 'Women',
    subCategory: 'Ethnic Wear',
    images: [
      'https://images.unsplash.com/photo-1583391733956-6c78276477e2?q=80&w=800',
      'https://images.unsplash.com/photo-1595967783875-c371f35d8049?q=80&w=800',
      'https://images.unsplash.com/photo-1594633313217-0628e932943e?q=80&w=800'
    ],
    sizes: ['S', 'M', 'L'],
    colors: ['Red', 'Gold', 'Blue'],
    ratings: 4.9,
    numReviews: 3,
    stock: 5,
    isOffer: true,
    isCustomizable: true,
    createdAt: new Date().toISOString(),
    reviews: [
      { id: 'r1', productId: '1', userName: 'Ananya Sharma', rating: 5, comment: 'Absolutely stunning work! The quality of silk is premium.', date: '2025-01-15' },
      { id: 'r2', productId: '1', userName: 'Meera K.', rating: 5, comment: 'The zardosi work is very intricate. Worth every penny.', date: '2025-02-10' },
      { id: 'r3', productId: '1', userName: 'Ritu Singh', rating: 4, comment: 'Very beautiful, but took a bit long to arrive.', date: '2025-02-20' }
    ]
  },
  {
    id: '2',
    name: 'Boho-Chic Linen Summer Dress',
    description: `Breathable linen blend with delicate lace detailing. Ideal for summer brunches, beach strolls, and effortless daytime elegance.

    At Anandam Atelier, we celebrate the beauty of natural fibers and relaxed silhouettes. Our Boho-Chic Linen Summer Dress is a tribute to the free-spirited woman who values both comfort and style. Crafted from a high-quality blend of organic linen and soft cotton, this dress offers exceptional breathability, making it the perfect choice for the tropical heat or warm summer days.

    The design features delicate hand-finished lace detailing along the neckline and hem, adding a touch of feminine charm to the minimalist aesthetic. The linen fabric has a natural texture that gains character with every wash, embodying the timeless appeal of artisanal textiles. We source our linen from ethical suppliers who prioritize sustainable farming practices, ensuring that your fashion choices are as kind to the earth as they are to your skin.

    The silhouette is relaxed yet flattering, with a gentle A-line cut that allows for ease of movement. Whether you are walking along a sun-drenched beach, enjoying a leisurely brunch with friends, or exploring a coastal town, this dress ensures you remain cool and sophisticated. The neutral palette—featuring White, Beige, and Pastel Pink—allows for versatile styling options.

    Styling Tip: Complement the bohemian vibe of this dress with tan leather sandals, a wide-brimmed straw hat, and subtle gold accessories. For a more structured look, you can cinch the waist with a thin leather belt. The dress is partially lined with soft cotton voile to ensure modesty without compromising on the airy feel of the linen.

    Sustainable Luxury: In an era of fast fashion, Anandam Atelier remains committed to slow, intentional production. This dress is made in small batches to minimize waste and ensure the highest quality standards. When you choose this piece, you are supporting a more conscious fashion ecosystem that values artisans and the environment.`,
    price: 3200,
    originalPrice: 4500,
    category: 'Women',
    subCategory: 'Western Wear',
    images: [
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?q=80&w=800',
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=800'
    ],
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['White', 'Beige', 'Pastel Pink'],
    ratings: 4.7,
    numReviews: 2,
    stock: 25,
    isOffer: true,
    isCustomizable: false,
    createdAt: new Date().toISOString(),
    reviews: [
      { id: 'r4', productId: '2', userName: 'Sarah J.', rating: 5, comment: 'So comfortable and perfect for the heat.', date: '2025-03-01' },
      { id: 'r5', productId: '2', userName: 'Priya Verma', rating: 4, comment: 'Linen is high quality. Runs slightly large.', date: '2025-03-05' }
    ]
  },
  {
    id: '3',
    name: 'Sequinned Tutu Party Dress',
    description: `Every little girl deserves to sparkle. This tiered tulle dress features a soft satin bodice and intricate hand-sewn sequins, designed for maximum comfort and magical memories.

    At Anandam Atelier, we understand that childhood is a time of wonder and play. Our Sequinned Tutu Party Dress is designed to capture that magic, combining high-fashion aesthetics with the practicality needed for active children. The bodice is crafted from premium satin that is gentle on the skin, while the multi-layered skirt is made from the finest Italian tulle to provide a voluminous, princess-like silhouette without the weight.

    The sequence work on the bodice is entirely hand-sewn by our artisans, ensuring that each sparkle is securely attached. We use rounded sequins to prevent any scratching, and the entire dress is lined with soft cotton voile for all-day comfort. Whether it's a birthday party, a wedding celebration, or a holiday event, this dress is designed to make your little one feel like the star of the show.

    Available in Silver, Rose Gold, and Lavender, each color option is chosen for its ability to shimmer beautifully under both natural and artificial light. The tiered design of the skirt adds depth and movement, making it perfect for twirling and dancing. The back features a concealed zipper for easy dressing and a sash that can be tied into a beautiful bow for an adjustable fit.

    Care Instructions: To preserve the delicate tulle and sequin work, we recommend professional dry cleaning or a gentle hand wash in cold water. Lay flat to dry to maintain the shape of the tiers. Avoid ironing the tulle directly; use a steamer to remove any wrinkles for a fresh, voluminous look.

    The Anandam Promise: We take pride in creating children's wear that is not only beautiful but also ethically made. Every dress purchased supports our mission to provide fair wages and a safe working environment for our craftspeople. This dress is made to last, ensuring it can be passed down to younger siblings or friends, continuing the cycle of joy and celebration.`,
    price: 2100,
    originalPrice: 3500,
    category: 'Girls',
    subCategory: 'Occasion Wear',
    images: [
      'https://images.unsplash.com/photo-1518833503222-793084185c3c?q=80&w=800',
      'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?q=80&w=800'
    ],
    sizes: ['2Y', '4Y', '6Y', '8Y'],
    colors: ['Silver', 'Rose Gold', 'Lavender'],
    ratings: 4.5,
    numReviews: 1,
    stock: 12,
    isOffer: true,
    isCustomizable: false,
    createdAt: new Date().toISOString(),
    reviews: [
      { id: 'r6', productId: '3', userName: 'Mama Bear', rating: 5, comment: 'My daughter looked like a princess. Very happy!', date: '2025-02-28' }
    ]
  }
];
