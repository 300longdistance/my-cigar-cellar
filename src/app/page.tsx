import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center px-3 pb-4 pt-2 sm:px-4 sm:pb-6 sm:pt-3 landscape:max-w-none landscape:px-6 landscape:pt-3">
        <header className="w-full text-center">
          <h1
            className="text-center text-[27px] font-semibold tracking-[0.06em] text-amber-300 sm:text-4xl md:text-6xl landscape:text-[42px]"
            style={{ fontFamily: "var(--font-cinzel)" }}
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
              Start Your First Humidor
            </p>

            <div className="mx-auto mt-3 h-px w-full max-w-2xl bg-stone-800 sm:mt-5" />
          </section>

          <section className="mt-1 w-full sm:mt-3">
            <div className="mx-auto w-[100vw] max-w-none sm:w-full sm:max-w-4xl">
              <div className="relative aspect-4/5 w-full bg-black">
                <Image
                  src="/images/main-home-v2.png"
                  alt="My Cigar Cellar main scene"
                  fill
                  className="object-cover object-[center_35%] sm:object-contain"
                  priority
                />

                <Link
                  href="/humidor"
                  aria-label="Open Humidor"
                  className="group absolute z-20 block"
                  style={{
                    top: "36%",
                    left: "39%",
                    width: "45%",
                    height: "22%",
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
                    top: "43%",
                    left: "17%",
                    width: "25%",
                    height: "18%",
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
                    top: "65%",
                    left: "12%",
                    width: "42%",
                    height: "22%",
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
                    top: "66%",
                    left: "54%",
                    width: "32%",
                    height: "20%",
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
              No Recent Smokes
            </p>
          </section>
        </div>

        {/* Landscape layout: iPad landscape / desktop */}
        <div className="hidden w-full flex-1 items-center justify-center gap-6 landscape:flex">
          <aside className="w-[190px] shrink-0 pl-1 text-left">
            <p className="text-[16px] font-semibold text-stone-400">
              Current Humidor
            </p>

            <p className="mt-2 text-[20px] font-semibold text-white">
              Home Humidor
            </p>

            <p className="mt-2 text-[16px] font-semibold text-stone-500">
              0 Cigars
            </p>
          </aside>

          <section className="w-[66vw] max-w-[930px]">
            <div className="relative aspect-[4/3] w-full bg-black">
              <Image
                src="/images/main-home-v2.png"
                alt="My Cigar Cellar main scene"
                fill
                className="object-contain"
                priority
              />

              <Link
                href="/humidor"
                aria-label="Open Humidor"
                className="group absolute z-20 block"
                style={{
                  top: "36%",
                  left: "39%",
                  width: "45%",
                  height: "22%",
                }}
              />

              <Link
                href="/pairings"
                aria-label="Open Pairings"
                className="group absolute z-20 block"
                style={{
                  top: "43%",
                  left: "17%",
                  width: "25%",
                  height: "18%",
                }}
              />

              <Link
                href="/smokes"
                aria-label="Open Notebook"
                className="group absolute z-20 block"
                style={{
                  top: "65%",
                  left: "12%",
                  width: "42%",
                  height: "22%",
                }}
              />

              <Link
                href="/smoke-log"
                aria-label="Open Quick Log"
                className="group absolute z-20 block"
                style={{
                  top: "66%",
                  left: "54%",
                  width: "32%",
                  height: "20%",
                }}
              />
            </div>
          </section>

          <aside className="w-[190px] shrink-0 pr-1 text-right">
            <p className="text-[16px] font-semibold text-stone-400">
              Recently Smoked
            </p>

            <p className="mt-2 text-[20px] font-semibold text-white">
              No recent smoke
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}