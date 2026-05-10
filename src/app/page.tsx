'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo } from 'react';
import { useCigarApp } from '@/context/CigarAppContext';

export default function HomePage() {
  const { hasLoadedStorage, humidors, cigars, smokeLogs } = useCigarApp();

  const currentHumidor = useMemo(() => {
    if (humidors.length > 0) return humidors[0];

    const firstCigarHumidor = cigars.find((cigar) => cigar.humidor)?.humidor;
    return firstCigarHumidor || 'Start Your First Humidor';
  }, [humidors, cigars]);

  const currentHumidorCigars = useMemo(() => {
    if (!currentHumidor || currentHumidor === 'Start Your First Humidor') {
      return [];
    }

    return cigars.filter((cigar) => cigar.humidor === currentHumidor);
  }, [cigars, currentHumidor]);

  const currentHumidorQuantity = useMemo(() => {
    return currentHumidorCigars.reduce((total, cigar) => total + (cigar.qty ?? 0), 0);
  }, [currentHumidorCigars]);

  const recentSmoke = useMemo(() => {
    return [...smokeLogs].sort(
      (a, b) =>
        new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime()
    )[0];
  }, [smokeLogs]);

  const currentHumidorLabel = hasLoadedStorage
    ? currentHumidor
    : 'Loading Humidor';

  const currentQuantityLabel =
    currentHumidor === 'Start Your First Humidor'
      ? '0 Cigars'
      : `${currentHumidorQuantity} ${
          currentHumidorQuantity === 1 ? 'Cigar' : 'Cigars'
        }`;

  const recentSmokeLabel = recentSmoke
    ? `${recentSmoke.brand} ${recentSmoke.cigarName}`
    : 'No Recent Smokes';

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center px-3 pb-4 pt-2 sm:px-4 sm:pb-6 sm:pt-3 landscape:max-w-none landscape:px-6 landscape:pt-3">
        <header className="w-full text-center">
          <h1
            className="text-center text-[27px] font-semibold tracking-[0.06em] text-amber-300 sm:text-4xl md:text-6xl landscape:text-[42px]"
            style={{ fontFamily: 'var(--font-cinzel)' }}
          >
            MY CIGAR CELLAR
          </h1>
        </header>

        {/* Portrait layout: phone / iPad portrait */}
        <div className="flex w-full flex-col items-center landscape:hidden">
          <section className="mt-2 w-full text-center sm:mt-4">
            <p className="text-center text-[15px] text-amber-300 sm:text-xl md:text-2xl">
              Current Humidor
            </p>

            <p className="mt-1 text-center text-[19px] font-semibold text-white sm:mt-2 sm:text-2xl md:text-4xl">
              {currentHumidorLabel}
            </p>

            <p className="mt-1 text-center text-[14px] font-semibold text-stone-500 sm:text-lg md:text-2xl">
              {currentQuantityLabel}
            </p>

            <div className="mx-auto mt-3 h-px w-full max-w-2xl bg-stone-800 sm:mt-5" />
          </section>

          <section className="mt-1 w-full sm:mt-3">
            <div className="mx-auto w-[100vw] max-w-none sm:w-full sm:max-w-4xl">
              <div className="mb-2 flex justify-end sm:mb-3">
  <Link
    href="/settings"
    className="rounded-full border border-white/10 bg-black/35 px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] text-white/40 transition hover:border-[#c8882d]/40 hover:text-[#d58a24]"
  >
    Settings
  </Link>
</div>
              <div className="relative h-[82vh] max-h-[980px] w-full bg-black">
                <Image
                  src="/images/main-home-v2.png"
                  alt="My Cigar Cellar main scene"
                  fill
                  sizes="100vw"
                  className="object-contain object-center"
                  priority
                />

                <Link
                  href="/humidor"
                  aria-label="Open Humidor"
                  className="group absolute z-20 block"
                  style={{
                    top: '36%',
                    left: '39%',
                    width: '45%',
                    height: '22%',
                  }}
                >
                  <div className="pointer-events-none absolute left-[95%] top-[120%] opacity-100 transition duration-200 sm:left-[90%] sm:top-[70%] sm:opacity-0 sm:group-hover:opacity-100">
                    <div className="rounded-full border border-amber-300/40 bg-black/75 px-2 py-[3px] text-[10px] font-medium tracking-wide text-amber-200 shadow-lg sm:px-3 sm:py-1 sm:text-xs">
                      Humidor
                    </div>
                  </div>
                </Link>

                <Link
                  href="/pairings"
                  aria-label="Open Pairings"
                  className="group absolute z-20 block"
                  style={{
                    top: '43%',
                    left: '17%',
                    width: '25%',
                    height: '18%',
                  }}
                >
                  <div className="pointer-events-none absolute left-[-45%] top-[-10%] opacity-100 transition duration-200 sm:left-[-30%] sm:top-[-5%] sm:opacity-0 sm:group-hover:opacity-100">
                    <div className="rounded-full border border-amber-300/40 bg-black/75 px-2 py-[3px] text-[10px] font-medium tracking-wide text-amber-200 shadow-lg sm:px-3 sm:py-1 sm:text-xs">
                      Pairings
                    </div>
                  </div>
                </Link>

                <Link
                  href="/smokes"
                  aria-label="Open Notebook"
                  className="group absolute z-20 block"
                  style={{
                    top: '65%',
                    left: '12%',
                    width: '42%',
                    height: '22%',
                  }}
                >
                  <div className="pointer-events-none absolute left-[-11%] top-[125%] opacity-100 transition duration-200 sm:left-[8%] sm:top-[73%] sm:opacity-0 sm:group-hover:opacity-100">
                    <div className="rounded-full border border-amber-300/40 bg-black/75 px-2 py-[3px] text-[10px] font-medium tracking-wide text-amber-200 shadow-lg sm:px-3 sm:py-1 sm:text-xs">
                      Notebook
                    </div>
                  </div>
                </Link>

                <Link
                  href="/smoke-log"
                  aria-label="Open Quick Log"
                  className="group absolute z-20 block"
                  style={{
                    top: '66%',
                    left: '54%',
                    width: '32%',
                    height: '20%',
                  }}
                >
                  <div className="pointer-events-none absolute left-[50%] top-[105%] opacity-100 transition duration-200 sm:left-[40%] sm:top-[52%] sm:opacity-0 sm:group-hover:opacity-100">
                    <div className="whitespace-nowrap rounded-full border border-amber-300/40 bg-black/75 px-2 py-[3px] text-[10px] font-medium tracking-wide text-amber-200 shadow-lg sm:px-3 sm:py-1 sm:text-xs">
                      Quick Log
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </section>

          <section className="mt-2 w-full text-center sm:mt-4">
            <div className="mx-auto mb-3 h-px w-full max-w-2xl bg-stone-800 sm:mb-5" />

            <p className="text-center text-[15px] text-stone-300 sm:text-xl md:text-2xl">
              Recently Smoked
            </p>

            <p className="mt-1 text-center text-[18px] font-semibold text-white sm:mt-2 sm:text-2xl md:text-4xl">
              {recentSmokeLabel}
            </p>
          </section>
        </div>

        {/* Landscape layout: iPad landscape / desktop */}
        <div className="hidden w-full flex-1 items-center justify-center gap-4 px-2 landscape:flex xl:gap-6">
          <aside className="w-[170px] shrink-0 pl-1 text-left xl:w-[190px]">
            <p className="text-[16px] font-semibold text-stone-400">
              Current Humidor
            </p>

            <p className="mt-2 text-[20px] font-semibold text-white">
              {currentHumidorLabel}
            </p>

            <p className="mt-2 text-[16px] font-semibold text-stone-500">
              {currentQuantityLabel}
            </p>
          </aside>

          <section className="h-[82vh] max-h-[980px] aspect-square">
  <div className="absolute right-4 top-4 z-30">
  <Link
    href="/settings"
    aria-label="Settings"
    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/45 text-white/45 backdrop-blur-sm transition hover:border-[#c8882d]/50 hover:text-[#d58a24]"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.527-.94 3.31.843 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.527-.843 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.527.94-3.31-.843-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.527.843-3.31 2.37-2.37.996.613 2.296.07 2.572-1.065z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  </Link>
</div>

  <div className="relative aspect-[4/3] w-full bg-black">
              <Image
                src="/images/main-home-v2.png"
                alt="My Cigar Cellar main scene"
                fill
                sizes="76vw"
                className="object-contain"
                priority
              />

              <Link
                href="/humidor"
                aria-label="Open Humidor"
                className="group absolute z-20 block"
                style={{
                  top: '36%',
                  left: '39%',
                  width: '45%',
                  height: '22%',
                }}
              />

              <Link
                href="/pairings"
                aria-label="Open Pairings"
                className="group absolute z-20 block"
                style={{
                  top: '43%',
                  left: '17%',
                  width: '25%',
                  height: '18%',
                }}
              />

              <Link
                href="/smokes"
                aria-label="Open Notebook"
                className="group absolute z-20 block"
                style={{
                  top: '65%',
                  left: '12%',
                  width: '42%',
                  height: '22%',
                }}
              />

              <Link
                href="/smoke-log"
                aria-label="Open Quick Log"
                className="group absolute z-20 block"
                style={{
                  top: '66%',
                  left: '54%',
                  width: '32%',
                  height: '20%',
                }}
              />
            </div>
          </section>

          <aside className="w-[170px] shrink-0 pr-1 text-right xl:w-[190px]">
            <p className="text-[16px] font-semibold text-stone-400">
              Recently Smoked
            </p>

            <p className="mt-2 text-[20px] font-semibold text-white">
              {recentSmokeLabel}
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}