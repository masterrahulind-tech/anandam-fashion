export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  coverImage?: string;
  publishedAt: string; // ISO date
  tags: string[];
  content: string[];
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'how-to-choose-the-right-lehenga-fabric',
    title: 'How to Choose the Right Lehenga Fabric',
    excerpt:
      'A practical guide to silk, velvet, organza, and georgette—so your lehenga looks premium and feels comfortable all day.',
    coverImage:
      'https://images.unsplash.com/photo-1610189012906-4c0aa9b9781e?fm=jpg&q=60&w=2400&auto=format&fit=crop',
    publishedAt: '2026-02-10',
    tags: ['Women', 'Ethnic', 'Fabric'],
    content: [
      'Choosing fabric is the fastest way to upgrade (or downgrade) how a lehenga looks. The same design can appear heavy and royal in one fabric and flat in another.',
      'Silk (Banarasi / raw silk) is ideal for weddings and evening functions. It photographs beautifully and holds embroidery well.',
      'Velvet is best for winter events and night functions. It adds depth, but can feel warm—plan accordingly.',
      'Organza gives a crisp, structured silhouette with a modern feel. It’s great for lighter embroidery and contemporary drapes.',
      'Georgette and crepe work best when you want flow and movement, especially for sangeet nights. They’re lighter but need good lining and finishing.',
      'Final tip: match fabric weight to the event duration and season. Comfort is part of luxury.'
    ]
  },
  {
    slug: 'kids-occasionwear-comfort-checklist',
    title: 'Kids Occasionwear Comfort Checklist',
    excerpt:
      'Sequins, tulle, and satin can still be comfortable—use this checklist before buying partywear for kids.',
    coverImage:
      'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?q=80&w=2400&auto=format&fit=crop',
    publishedAt: '2026-02-22',
    tags: ['Girls', 'Comfort', 'Occasion Wear'],
    content: [
      'Occasionwear should never feel “itchy” or restrictive. Comfort keeps the outfit wearable beyond one event.',
      'Check for soft lining: cotton voile or similar breathable lining prevents scratching from sequins and seams.',
      'Inspect the neckline and armholes: these areas cause the most irritation if finishing is rough.',
      'Prefer adjustable fit details: sashes, elastic backs, and generous hems help as kids grow.',
      'For tulle skirts, choose softer tulle and ensure the inner layer is smooth.',
      'If you’re unsure, size up slightly and tailor the fit—comfort should be the priority.'
    ]
  },
  {
    slug: 'care-guide-for-hand-embroidery',
    title: 'Care Guide for Hand Embroidery',
    excerpt:
      'Keep Zardosi, sequins, and handwork looking fresh with storage and cleaning habits that protect the craftsmanship.',
    coverImage:
      'https://images.unsplash.com/photo-1583391733956-6c78276477e2?q=80&w=2400&auto=format&fit=crop',
    publishedAt: '2026-03-01',
    tags: ['Care', 'Handwork', 'Heritage'],
    content: [
      'Handwork is delicate: it’s designed to last, but only if you store and clean it correctly.',
      'Avoid folding directly on heavy embroidery. Use tissue paper padding to reduce pressure points.',
      'Store in breathable garment covers (cotton) rather than plastic to prevent moisture buildup.',
      'Spot-clean small marks immediately. For full cleaning, prefer professional dry cleaning with experience handling embellished garments.',
      'Never iron directly on embroidery. Use a steamer from a safe distance or iron from the reverse side with a protective cloth.',
      'Air the garment after use before storing it again—this prevents odor and fabric dullness.'
    ]
  }
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

