'use client';

import { useRouter } from 'next/navigation';

type BackButtonProps = {
  href?: string;
};

export default function BackButton({ href = '/' }: BackButtonProps) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push(href)}
      className="flex h-10 w-10 items-center justify-center rounded-full bg-[#111216] text-lg text-zinc-300 hover:text-amber-400 transition"
    >
      ←
    </button>
  );
}