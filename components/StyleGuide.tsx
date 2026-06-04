
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Scissors, Heart, BookOpen, Clock, Globe } from 'lucide-react';

const StyleGuide: React.FC = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
        document.title = "2026 Style Guide | Anandam Atelier";
    }, []);

    return (
        <div className="max-w-5xl mx-auto px-6 py-32 text-left">
            <header className="text-center mb-20 space-y-4">
                <span className="text-gold text-[10px] font-bold uppercase tracking-[0.5em] block">Editorial Archive</span>
                <h1 className="text-4xl md:text-7xl font-serif italic text-slate-900 leading-tight">The 2026 Style Narrative</h1>
                <div className="h-px w-24 bg-gold/30 mx-auto mt-6"></div>
                <p className="text-slate-400 font-serif italic text-lg max-w-2xl mx-auto pt-4">
                    Exploring the intersection of ancestral weaving and futuristic silhouettes for the coming year.
                </p>
            </header>

            <div className="space-y-24">
                {/* 2026 Trends */}
                <section className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 text-gold">
                            <Sparkles size={20} />
                            <h2 className="text-[10px] font-bold uppercase tracking-widest">Trend Forecast</h2>
                        </div>
                        <h3 className="text-3xl md:text-4xl font-serif italic text-slate-800">The Rise of 'Brut Denim' and Marigold Hues</h3>
                        <p className="text-slate-600 font-serif italic text-lg leading-relaxed">
                            As we transition into Spring/Summer 2026, the fashion landscape is witnessing a profound shift toward "Raw Authenticity." This is most evident in the resurgence of **Brut Denim**. Unlike the distressed washes of the previous decade, Brut Denim is unwashed, structured, and deep indido. At Anandam, we are reimagining this trend by pairing structured raw denim jackets with our hand-spun silk inner linings, blending industrial durability with artisanal luxury.
                        </p>
                        <p className="text-slate-600 font-serif italic text-lg leading-relaxed">
                            Color-wise, 2026 is the year of the "Yellow Spectrum." From the creamy depths of **Vanilla Yellow** to the energetic burst of **Popcorn Yellow**, these hues are predicted to dominate the runways. These colors symbolize a "back to sunlight" optimism that pairs beautifully with the earthy tones of heritage Indian fabrics.
                        </p>
                    </div>
                    <div className="aspect-[4/5] bg-slate-100 rounded-sm overflow-hidden">
                        <img
                            src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1600"
                            alt="2026 Fashion Trends - Brut Denim and Marigold Hues"
                            className="w-full h-full object-cover"
                        />
                    </div>
                </section>

                {/* Sustainable Styling */}
                <section className="bg-ivory p-8 md:p-16 border border-slate-100 rounded-sm space-y-12">
                    <div className="max-w-3xl space-y-6">
                        <div className="flex items-center gap-3 text-gold">
                            <Globe size={20} />
                            <h2 className="text-[10px] font-bold uppercase tracking-widest">Sustainable Styling</h2>
                        </div>
                        <h3 className="text-3xl md:text-4xl font-serif italic text-slate-800">The 4-Way Wardrobe: One Dress, Four Lives</h3>
                        <p className="text-slate-600 font-serif italic text-lg leading-relaxed">
                            In 2026, longevity is the ultimate luxury. The modern shopper values pieces that can adapt to their multifaceted lives. Our guide to "Wardrobe Investments" focuses on the versatility of the **Artisanal Linen Midi**.
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { title: 'The Boardroom', desc: 'Pair with a structured silk blazer and pointed flats for a commanding, professional look.' },
                            { title: 'The Weekend', desc: 'Swap the blazer for a knotted cotton shirt and artisanal leather sandals for beachside brunch.' },
                            { title: 'The Soiree', desc: 'Add a heritage Zardosi belt and statement gold jewelry to transition into evening elegance.' },
                            { title: 'The Journey', desc: 'Layer over premium leggings and add a light pashmina wrap for stylish, breathable travel.' }
                        ].map((item, i) => (
                            <div key={i} className="space-y-3">
                                <h4 className="text-gold font-bold uppercase tracking-widest text-[10px]">{item.title}</h4>
                                <p className="text-slate-500 font-serif italic text-sm leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Fabric Care */}
                <section className="grid md:grid-cols-2 gap-12 lg:gap-20">
                    <div className="order-2 md:order-1 aspect-[3/4] bg-slate-100 rounded-sm overflow-hidden">
                        <img
                            src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=1600"
                            alt="Artisanal Fabric Care - Preserving Silk and Linen"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="order-1 md:order-2 space-y-8">
                        <div className="flex items-center gap-3 text-gold">
                            <Scissors size={20} />
                            <h2 className="text-[10px] font-bold uppercase tracking-widest">Utility Archive</h2>
                        </div>
                        <h3 className="text-3xl md:text-4xl font-serif italic text-slate-800">Fabric Care 101: Preserving Your Heirlooms</h3>
                        <div className="space-y-8 text-slate-600 font-serif italic text-lg leading-relaxed">
                            <div className="space-y-3">
                                <h4 className="text-slate-800 not-italic font-bold text-xl">The Lace & Tulle Protocol</h4>
                                <p>Delicate lace should never meet a machine. We recommend cold-water immersion only, using a pH-neutral detergent. Lay flat on a white towel to dry—hanging can cause the intricate patterns to stretch and lose their silhouette.</p>
                            </div>
                            <div className="space-y-3">
                                <h4 className="text-slate-800 not-italic font-bold text-xl">The Silk Secret</h4>
                                <p>Silk is a living fiber. To maintain its natural luster, store it in breathable cotton bags rather than plastic. If a crease appears, use a dry iron on the lowest setting with a pressing cloth; steam can sometimes leave microscopic water spots on heavy silks.</p>
                            </div>
                            <div className="space-y-3">
                                <h4 className="text-slate-800 not-italic font-bold text-xl">The Linen Longevity</h4>
                                <p>Linen actually grows stronger and softer with use. However, high-heat drying can make fibers brittle. Air-dry your linen pieces while they are slightly damp, and iron them immediately for that crisp, prestigious finish.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* About the Author */}
                <section className="mt-20 pt-20 border-t border-slate-100">
                    <div className="bg-slate-50 p-8 md:p-12 rounded-sm flex flex-col md:flex-row items-center gap-8 border border-slate-200">
                        <div className="w-24 h-24 rounded-full overflow-hidden flex-shrink-0 border-2 border-gold shadow-lg">
                            <img
                                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400"
                                alt="Author Aditi V. Sharma - Heritage Fashion Expert"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="text-center md:text-left space-y-2">
                            <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold">Written By</h4>
                            <h3 className="text-2xl font-serif italic text-slate-900">Aditi V. Sharma</h3>
                            <p className="text-slate-500 font-serif italic text-sm leading-relaxed max-w-xl">
                                With over 15 years of experience in heritage textile preservation and luxury retail, Aditi leads the creative vision at Anandam Atelier. Her work focuses on bridging the gap between ancestral weaving techniques and contemporary fashion narratives. When she's not at the studio, she's often found in the weaving clusters of Varanasi, documenting the stories behind the thread.
                            </p>
                        </div>
                    </div>
                </section>
            </div>

            <footer className="mt-32 text-center pb-10">
                <Link to="/shop" className="inline-flex items-center gap-3 bg-black text-white px-10 py-4 text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-gold transition-all shadow-xl">
                    Back to Archive
                </Link>
            </footer>
        </div>
    );
};

export default StyleGuide;
