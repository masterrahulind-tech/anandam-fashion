import React, { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { BLOG_POSTS } from '../../utils/blogPosts';

const formatDate = (iso: string) => {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' });
  } catch {
    return iso;
  }
};

const BlogIndexPage = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const posts = useMemo(() => {
    return [...BLOG_POSTS].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-24 md:py-40 min-h-screen">
      <div className="max-w-3xl">
        <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-gold mb-3">Journal</p>
        <h1 className="text-4xl md:text-6xl font-serif italic text-slate-900 leading-tight">The Anandam Blog</h1>
        <p className="mt-6 text-slate-500 font-serif italic text-base md:text-lg leading-relaxed">
          Styling notes, care guides, and heritage-led fashion insights—crafted to help you choose better and wear longer.
        </p>
      </div>

      <div className="mt-12 md:mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {posts.map((p) => (
          <article
            key={p.slug}
            className="group bg-white border border-slate-100 rounded-sm overflow-hidden shadow-sm hover:shadow-lg transition-all"
          >
            <Link to={`/blog/${p.slug}`} className="block">
              <div className="aspect-[4/3] bg-slate-50 overflow-hidden">
                {p.coverImage ? (
                  <img
                    src={p.coverImage}
                    alt={p.title}
                    className="w-full h-full object-cover transition-transform duration-[2.2s] group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-slate-50 to-slate-100" />
                )}
              </div>
              <div className="p-5 md:p-6 space-y-3 text-left">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400">
                    {formatDate(p.publishedAt)}
                  </span>
                  <span className="text-[8px] text-slate-200">/</span>
                  <div className="flex flex-wrap gap-2">
                    {p.tags.slice(0, 3).map((t) => (
                      <span
                        key={t}
                        className="text-[7px] font-bold uppercase tracking-widest px-2 py-1 bg-slate-50 text-slate-500 border border-slate-100"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <h2 className="text-xl md:text-2xl font-serif italic text-slate-900 leading-snug">{p.title}</h2>
                <p className="text-sm font-serif italic text-slate-500 leading-relaxed">{p.excerpt}</p>
                <div className="pt-2">
                  <span className="text-[9px] font-bold uppercase tracking-[0.35em] text-gold group-hover:text-slate-900 transition-colors">
                    Read Article
                  </span>
                </div>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
};

export default BlogIndexPage;

