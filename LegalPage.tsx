import React from 'react';
import ReactMarkdown from 'react-markdown';
import { useEffect, useState } from 'react';

const sectionTitles = {
  privacy: 'Privacy Policy',
  terms: 'Terms of Service',
  cookie: 'Cookie Policy',
  disclaimer: 'Disclaimer',
  legal: 'Legal',
};

export default function LegalPage({ file, section }) {
  const [content, setContent] = useState('');
  useEffect(() => {
    fetch(`/${file}`).then(res => res.text()).then(md => {
      // Extract section
      const regex = new RegExp(`# ${sectionTitles[section]}([\s\S]*?)(?=\n#|$)`, 'i');
      const match = md.match(regex);
      setContent(match ? match[1].trim() : 'Section not found.');
    });
  }, [file, section]);
  return (
    <div className="max-w-3xl mx-auto py-24 px-4">
      <h1 className="text-3xl font-serif italic mb-8">{sectionTitles[section]}</h1>
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}