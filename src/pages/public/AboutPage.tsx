import React from 'react';
import { BookOpen, Image as ImageIcon } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="bg-stone-50 py-12 md:py-20 text-stone-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-14">
          <span className="text-xs font-bold text-emerald-700 tracking-wider uppercase mb-2 block">
            About Kisan Marg
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-emerald-950">
            Making Procurement Easier for Farmers
          </h1>
          <p className="mt-4 text-stone-600 max-w-3xl mx-auto text-base leading-relaxed">
            Kisan Marg is a digital platform designed to make agricultural procurement easier, faster, and more transparent for farmers. It helps farmers reduce waiting time, manage procurement slots, track queue status, and stay informed about their procurement and payment status.
          </p>
        </div>

        <section aria-labelledby="kisan-marg-heading">
          <h2 id="kisan-marg-heading" className="text-2xl font-serif font-bold text-emerald-950 text-center mb-6">
            Kisan Marg Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
            <article className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 flex flex-col">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                  <ImageIcon className="w-5 h-5 text-emerald-700" />
                </span>
                <h3 className="text-xl font-serif font-bold text-emerald-950">Quality Reference</h3>
              </div>
              <p className="text-sm text-stone-600 leading-relaxed mb-5">
                Help provide a quick indication of crop quality using image comparison.
              </p>
              <ol className="space-y-3 text-sm text-stone-700 leading-relaxed">
                {[
                  'Farmer captures or uploads a crop image.',
                  'The system compares the crop image with standard/reference images and checks important quality factors such as size, color, and maturity.',
                  'The system provides an indication of the crop quality.',
                  'Based on the assessed crop quality, the system predicts the expected price of the crop.',
                ].map((step, index) => (
                  <li key={step} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold flex items-center justify-center shrink-0">{index + 1}</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </article>

            <article className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 flex flex-col">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5 text-emerald-700" />
                </span>
                <h3 className="text-xl font-serif font-bold text-emerald-950">Farmer Knowledge Hub</h3>
              </div>
              <p className="text-sm text-stone-600 leading-relaxed mb-5">
                Help farmers learn useful and practical farming practices from experienced farmers.
              </p>
              <ol className="space-y-3 text-sm text-stone-700 leading-relaxed">
                {[
                  'Experienced farmers share their proven farming practices.',
                  'Information about crops, fertilizers, and pesticides is shared.',
                  'Other farmers can learn and apply useful practices.',
                  'This helps improve farming knowledge, crop quality, and productivity.',
                ].map((step, index) => (
                  <li key={step} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold flex items-center justify-center shrink-0">{index + 1}</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </article>
          </div>
        </section>
      </div>
    </div>
  );
};
