import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

export const PrivacyPolicy = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
        document.title = "Privacy Policy | Anandam Fashion";
    }, []);
    return (
        <article className="max-w-4xl mx-auto px-6 py-32 text-left">
            <h1 className="text-3xl md:text-5xl font-serif italic text-slate-900 mb-10">Privacy Policy</h1>
            <div className="prose prose-slate prose-lg font-serif text-slate-600 leading-relaxed italic">
                <p>Last Updated: {new Date().toLocaleDateString()}</p>
                <p>At Anandam Fashion ("we," "our," or "us"), we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website [anandamfashion.in].</p>

                <h3>1. Information We Collect</h3>
                <p>We collect information that you provide directly to us, such as when you create an account, make a purchase, or contact us. This may include your name, email address, phone number, shipping address, and payment information.</p>

                <h3>2. How We Use Your Information</h3>
                <p>We use the information we collect to:</p>
                <ul className="list-disc pl-5 space-y-2">
                    <li>Process and fulfill your orders.</li>
                    <li>Communicate with you about your account and orders.</li>
                    <li>Send you promotional emails and newsletters (you can opt-out at any time).</li>
                    <li>Improve our website and customer service.</li>
                    <li>Detect and prevent fraud.</li>
                </ul>

                <h3>3. Cookies and Tracking Technologies</h3>
                <p>We use cookies to enhance your browsing experience, analyze site traffic, and understand where our visitors are coming from.</p>
                <ul className="list-disc pl-5 space-y-2 mt-2">
                    <li><strong>Essential Cookies:</strong> Necessary for the website to function (e.g., cart, login).</li>
                    <li><strong>Google AdSense & Analytics:</strong> We use third-party vendors, such as Google, which use cookies to serve ads based on your prior visits to our website or other websites.</li>
                    <li><strong>Opt-Out:</strong> Google's use of advertising cookies enables it and its partners to serve ads to you based on your visit to our sites and/or other sites on the Internet. You may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">Google Ad Settings</a>.</li>
                </ul>
                <p className="mt-2">By using our website, you consent to our use of cookies in accordance with this policy.</p>

                <h3>4. Third-Party Disclosure</h3>
                <p>We do not sell, trade, or otherwise transfer your Personally Identifiable Information to outside parties, except to trusted third parties who assist us in operating our website, conducting our business, or serving our users, so long as those parties agree to keep this information confidential.</p>

                <h3>5. Data Security</h3>
                <p>We implement a variety of security measures to maintain the safety of your personal information when you place an order or enter, submit, or access your personal information.</p>

                <h3>6. Your Rights</h3>
                <p>You have the right to access, correct, or delete your personal information. Please contact us at anandamfashion.info@gmail.com for any privacy-related requests.</p>

                <h3>7. Contact Us</h3>
                <p>If you have any questions about this Privacy Policy, please contact us at anandamfashion.info@gmail.com.</p>
            </div>
        </article>
    );
};

export const TermsOfService = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
        document.title = "Terms of Service | Anandam Fashion";
    }, []);
    return (
        <article className="max-w-4xl mx-auto px-6 py-32 text-left">
            <h1 className="text-3xl md:text-5xl font-serif italic text-slate-900 mb-10">Terms of Service</h1>
            <div className="prose prose-slate prose-lg font-serif text-slate-600 leading-relaxed italic">
                <p>Welcome to Anandam Fashion. By accessing or using our website, you agree to be bound by these Terms of Service.</p>

                <h3>1. Use of Our Service</h3>
                <p>You must be at least 18 years old to use our website. You agree not to use our website for any illegal or unauthorized purpose.</p>

                <h3>2. Intellectual Property</h3>
                <p>All content on this website, including text, graphics, logos, images, and software, is the property of Anandam Fashion and is protected by copyright laws.</p>

                <h3>3. Products and Pricing</h3>
                <p>We make every effort to display as accurately as possible the colors and images of our products. We reserve the right to limit the sales of our products to any person or geographic region. Prices for our products are subject to change without notice.</p>

                <h3>4. Limitation of Liability</h3>
                <p>Anandam Fashion shall not be liable for any direct, indirect, incidental, special, or consequential damages resulting from the use or inability to use our service.</p>

                <h3>5. Governing Law</h3>
                <p>These Terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions.</p>

                <h3>6. Changes to Terms</h3>
                <p>We reserve the right to update or change our Terms of Service at any time. Your continued use of the service after we post any modifications to the Terms of Service will constitute your acknowledgment of the modifications.</p>
            </div>
        </article>
    );
};

export const ShippingPolicy = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
        document.title = "Shipping & Returns | Anandam Fashion";
    }, []);
    return (
        <article className="max-w-4xl mx-auto px-6 py-32 text-left">
            <h1 className="text-3xl md:text-5xl font-serif italic text-slate-900 mb-10">Shipping & Returns</h1>
            <div className="prose prose-slate prose-lg font-serif text-slate-600 leading-relaxed italic">
                <h3>Shipping Policy</h3>
                <p>We are committed to delivering your exquisite pieces safely and on time.</p>
                <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Processing Time:</strong> Orders are processed within 2-3 business days. Custom or made-to-order items may take 2-4 weeks.</li>
                    <li><strong>Shipping Rates:</strong> We offer free standard shipping on all domestic orders over ₹5,000.</li>
                    <li><strong>International Shipping:</strong> We ship globally. International shipping rates are calculated at checkout. Customs duties and taxes are the responsibility of the customer.</li>
                </ul>

                <h3 className="mt-8">Return & Exchange Policy</h3>
                <p>We want you to be completely satisfied with your purchase.</p>
                <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Returns:</strong> We accept returns of unworn, unwashed, and undamaged items with original tags attached within 7 days of delivery.</li>
                    <li><strong>Exchanges:</strong> If you need a different size, please contact us to arrange an exchange, subject to stock availability.</li>
                    <li><strong>Non-Returnable Items:</strong> Custom-made items and sale items are final sale and cannot be returned.</li>
                    <li><strong>Refunds:</strong> Refunds are processed to the original payment method within 7-10 business days of receiving the return.</li>
                </ul>
            </div>
        </article>
    );
};

export const AboutUs = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
        document.title = "About Our Brand | Anandam Atelier";
    }, []);
    return (
        <article className="max-w-4xl mx-auto px-6 py-32 text-left">
            <h1 className="text-4xl md:text-6xl font-serif italic text-slate-900 mb-12">The Soul of Anandam Atelier</h1>
            <div className="prose prose-slate lg:prose-xl font-serif text-slate-600 leading-relaxed italic space-y-8">
                <section>
                    <h3 className="text-2xl text-gold not-italic font-bold tracking-tight mb-4">The Origin Story: A Love Letter to Heritage</h3>
                    <p>
                        Anandam Atelier was born not in a boardroom, but in the sun-drenched courtyards of heritage weavers across Northern India. Our founder, a second-generation textile enthusiast, experienced an "aha" moment while witnessing the heartbreaking decline of traditional handloom villages. Seeing master weavers—men and women whose hands held centuries of history—contemplating leaving their craft for low-wage factory work was the catalyst.
                    </p>
                    <p>
                        The problem was clear: the global fashion industry had become an engine of anonymity. Mass production had stripped the soul from our garments, replacing the vibrant pulse of artisanal work with the cold efficiency of the machine. Anandam (meaning "Bliss") was founded to bridge this gap, creating a sanctuary where traditional craftsmanship could thrive in a modern marketplace. We set out to prove that luxury shouldn't be defined by a price tag, but by the number of human hours and the depth of heritage woven into every fiber.
                    </p>
                </section>

                <section>
                    <h3 className="text-2xl text-gold not-italic font-bold tracking-tight mb-4">Our Unique Value Proposition: Accessible Authenticity</h3>
                    <p>
                        What sets Anandam Atelier apart in the competitive landscape of Indian fashion is our unwavering commitment to "Accessible Authenticity." While many luxury brands outsource their heritage for prestige pricing, we maintain a direct-to-artisan model. We don't just "source" designs; we co-create them.
                    </p>
                    <p>
                        Our collections feature sustainable, hand-spun silks and organic linens that are often passed over by larger retailers due to the slow pace of their production. By prioritizing these artisanal materials, we offer our clients a silhouette that is not only unique but intrinsically sustainable. When you wear an Anandam piece, you are wearing a design that has been touched by human hands at every stage of its creation—from the spinning of the thread to the hand-applied Zardosi embroidery.
                    </p>
                </section>

                <section>
                    <h3 className="text-2xl text-gold not-italic font-bold tracking-tight mb-4">Transparency: Behind the Loom</h3>
                    <p>
                        In 2026, transparency is the cornerstone of trust. We believe our collectors have the right to know the journey of their acquisitions. Our fabrics are primarily sourced from the weaving clusters of Varanasi (Silk), Bhagalpur (Tussar), and Rajasthan (Cotton/Linen). We maintain an open-door policy with our artisanal collectives, ensuring that every workspace meets our rigorous standards for safety, respect, and fair compensation.
                    </p>
                    <p>
                        The "Behind the Scenes" of an Anandam creation is a symphony of slow fashion. A single wedding lehanga can spend up to six weeks on a wooden loom before even reaching our embroidery artists. Our Zari threads are tested for purity, ensuring that the gold and silver shimmer you see today will endure for generations. We reject the "fast fashion" cycle, producing only in small batches to minimize textile waste and ensure that every item in our archive is a masterpiece of its kind.
                    </p>
                </section>

                <section>
                    <h3 className="text-2xl text-gold not-italic font-bold tracking-tight mb-4">Voices of Leadership: Expertise & Vision</h3>
                    <p>
                        The leadership team at Anandam brings together decades of experience in retail, design, and heritage preservation. Our creative director spent years documenting rural weaving techniques before launching the brand, bringing a deep "Expertise" in traditional silhouettes. This background ensures that while our designs are contemporary, they never lose their historical anchor. We aren't just selling clothes; we are curating a legacy.
                    </p>
                </section>

                <section>
                    <h3 className="text-2xl text-gold not-italic font-bold tracking-tight mb-4">Our Mission: Style with Substance</h3>
                    <p>
                        Our mission is simple: to empower personal style while promoting ethical consumption. We envision a world where every woman feels the confidence of wearing a garment that aligns with her values. By choosing Anandam, you are not just acquiring a dress; you are voting for the survival of ancestral crafts. You are ensuring that the magic of the handloom remains a vibrant part of our future, not just a memory in a museum.
                    </p>
                    <p>
                        Thank you for being part of this journey. Welcome to the family of Anandam Atelier.
                    </p>
                </section>
            </div>
        </article>
    );
};

export const ContactUs = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
        document.title = "Contact Us | Anandam Fashion";
    }, []);
    return (
        <article className="max-w-4xl mx-auto px-6 py-32 text-left">
            <h1 className="text-3xl md:text-5xl font-serif italic text-slate-900 mb-10">Contact Us</h1>
            <div className="prose prose-slate prose-lg font-serif text-slate-600 leading-relaxed italic">
                <p>We are here to assist you with your heritage acquisition.</p>

                <div className="grid md:grid-cols-2 gap-12 mt-12">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 mb-4">Concierge Services</h3>
                        <p>For inquiries regarding orders, bespoke requests, or styling advice, please reach out to our team.</p>
                        <ul className="mt-6 space-y-4">
                            <li className="flex items-center gap-3">
                                <span className="font-bold text-gold">Email:</span>
                                <a href="mailto:anandamfashion.info@gmail.com" className="hover:text-gold transition-colors">anandamfashion.info@gmail.com</a>
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="font-bold text-gold">Phone:</span>
                                <span>+91 7692048305</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="font-bold text-gold">Hours:</span>
                                <span>Mon - Sat, 10:00 AM - 7:00 PM IST</span>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-xl font-bold text-slate-900 mb-4">Visit The Atelier</h3>
                        <p>Experience the collection in person by appointment.</p>
                        <address className="mt-6 not-italic">
                            Anandam Fashion<br />
                            M10 Greenland, Vishal Nagar,<br />
                            Near Aishwarya Residency, Telibandha<br />
                            RAIPUR, Chattisgarh, Pin 492001
                        </address>
                    </div>
                </div>
            </div>
        </article>
    );
};
