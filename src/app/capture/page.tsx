'use client';

import { ChangeEvent, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';

type AiResult = {
  brand?: string;
  name?: string;
  size?: string;
  wrapper?: string;
  origin?: string;
  strength?: string;
  notes?: string;
  confidence?: number;
};

export default function CapturePage() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AiResult | null>(null);
  const [error, setError] = useState('');

  async function handleImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    setError('');
    setResult(null);
    setLoading(true);

    try {
      const reader = new FileReader();

      reader.onload = async () => {
        const image = reader.result as string;

        setImagePreview(image);

        const { data, error } = await supabase.functions.invoke(
          'cigar-capture',
          {
            body: {
              image,
            },
          }
        );

        if (error) {
          console.error(error);
          setError('AI extraction failed');
          setLoading(false);
          return;
        }

        setResult(data);
        setLoading(false);
      };

      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setError('Failed to process image');
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black px-4 py-6 text-white">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="inline-flex rounded-full border border-[#3a2a0f] bg-black/60 px-4 py-2 text-sm text-[#d58a24]"
        >
          ← Back Home
        </Link>

        <section className="mt-8 rounded-2xl border border-[#3a2a0f] bg-[#111111] p-6 shadow-2xl">
          <div className="text-[10px] uppercase tracking-[0.16em] text-[#c8821f]">
            AI Capture
          </div>

          <h1 className="mt-2 font-cinzel text-3xl text-[#d58a24]">
            Capture Cigar with AI
          </h1>

          <p className="mt-4 text-sm leading-6 text-white/70">
            Upload a cigar photo and AI will attempt to identify the cigar
            details automatically.
          </p>

          <label className="mt-6 flex cursor-pointer items-center justify-center rounded-2xl border border-dashed border-[#3a2a0f] bg-black/40 px-6 py-10 text-center text-sm text-white/60 transition hover:border-[#d58a24]/60">
            Select Cigar Photo

            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImage}
              className="hidden"
            />
          </label>

          {loading ? (
            <div className="mt-6 rounded-xl border border-white/10 bg-black/40 p-4 text-sm text-white/70">
              AI is analyzing cigar image...
            </div>
          ) : null}

          {error ? (
            <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
              {error}
            </div>
          ) : null}

          {imagePreview ? (
            <div className="mt-6 overflow-hidden rounded-2xl border border-[#3a2a0f]">
              <img
                src={imagePreview}
                alt="Cigar preview"
                className="w-full object-cover"
              />
            </div>
          ) : null}

          {result ? (
            <div className="mt-6 rounded-2xl border border-[#3a2a0f] bg-black/40 p-5">
              <div className="text-[10px] uppercase tracking-[0.16em] text-[#c8821f]">
                AI Result
              </div>

              <div className="mt-4 grid gap-3 text-sm text-white/80">
                <div>
                  <span className="text-white/40">Brand:</span>{' '}
                  {result.brand || '-'}
                </div>

                <div>
                  <span className="text-white/40">Name:</span>{' '}
                  {result.name || '-'}
                </div>

                <div>
                  <span className="text-white/40">Size:</span>{' '}
                  {result.size || '-'}
                </div>

                <div>
                  <span className="text-white/40">Wrapper:</span>{' '}
                  {result.wrapper || '-'}
                </div>

                <div>
                  <span className="text-white/40">Origin:</span>{' '}
                  {result.origin || '-'}
                </div>

                <div>
                  <span className="text-white/40">Strength:</span>{' '}
                  {result.strength || '-'}
                </div>

                <div>
                  <span className="text-white/40">Notes:</span>{' '}
                  {result.notes || '-'}
                </div>

                <div>
                  <span className="text-white/40">Confidence:</span>{' '}
                  {typeof result.confidence === 'number'
                    ? `${Math.round(result.confidence * 100)}%`
                    : '-'}
                </div>
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}