import React, { useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getBlogPost } from '../../utils/blogPosts';

const formatDate = (iso: string) => {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: '2-digit' });
  } catch {
    return iso;
  }
};

const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>();

  const post = useMemo(() => (slug ? getBlogPost(slug) : undefined), [slug]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-32 text-left min-h-screen">
        <h1 className="text-4xl md:text-6xl font-serif italic text-slate-900 mb-6">Article not found</h1>
        <p className="text-slate-500 font-serif italic text-lg">This post doesn’t exist (or was moved).</p>
        <div className="mt-10">
          <Link
            to="/blog"
            className="text-gold font-bold uppercase tracking-widest text-[10px] hover:text-slate-900 transition-colors"
          >
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <article className="min-h-screen">
      <header className="bg-[#1a0507] pt-28 md:pt-36 pb-14 md:pb-20 px-4">
        <div className="max-w-5xl mx-auto text-left">
          <Link to="/blog" className="text-white/70 text-[9px] font-bold uppercase tracking-[0.4em] hover:text-gold">
            Blog
          </Link>
          <h1 className="mt-4 text-white text-4xl md:text-6xl font-serif italic leading-tight">{post.title}</h1>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="text-[9px] font-bold uppercase tracking-widest text-gold/90">{formatDate(post.publishedAt)}</span>
            <span className="text-white/20">•</span>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((t) => (
                <span
                  key={t}
                  className="text-[7px] font-bold uppercase tracking-widest px-2 py-1 bg-white/10 text-white/80 border border-white/10"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </header>

      {post.coverImage && (
        <div className="max-w-5xl mx-auto px-4 -mt-10 md:-mt-14">
          <div className="aspect-[16/8] md:aspect-[16/7] overflow-hidden rounded-sm shadow-2xl border border-slate-100 bg-slate-50">
            <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 md:px-8 py-12 md:py-16 text-left">
        <div className="space-y-6">
          <p className="text-slate-500 font-serif italic text-lg leading-relaxed">{post.excerpt}</p>
          <div className="h-px w-24 bg-gold/30" />
          <div className="space-y-5">
            {post.content.map((para, idx) => (
              <p key={idx} className="text-slate-700 font-serif italic text-lg leading-relaxed">
                {para}
              </p>
            ))}
          </div>
        </div>

        <div className="mt-16 pt-10 border-t border-slate-100 flex items-center justify-between gap-6">
          <Link to="/blog" className="text-gold font-bold uppercase tracking-widest text-[10px] hover:text-slate-900">
            Back to Blog
          </Link>
          <Link to="/shop" className="text-slate-400 font-bold uppercase tracking-widest text-[10px] hover:text-slate-900">
            Explore Collection
          </Link>
        </div>
      </div>
    </article>
  );
};

export default BlogPostPage;

