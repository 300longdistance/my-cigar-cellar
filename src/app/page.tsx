import Image from "next/image";
import Link from "next/link";

const navItems = [
  { href: "/humidor", label: "Humidor" },
  { href: "/pairings", label: "Pairings" },
  { href: "/smokes", label: "Notebook" },
  { href: "/smoke-log", label: "Quick Log" },
];

function SideNav() {
  return (
    <aside className="hidden landscape:flex fixed left-0 top-0 z-40 h-screen w-[118px] flex-col items-center justify-between border-r border-[#3a2a0f] bg-black/95 px-3 py-5 shadow-[8px_0_30px_rgba(0,0,0,0.5)] lg:flex">
      <div
        className="writing-mode-vertical text-center text-[18px] font-semibold tracking-[0.16em] text-amber-300"
        style={{
          fontFamily: "var(--font-cinzel)",
          writingMode: "vertical-rl",
          transform: "rotate(180deg)",
        }}
      >
        MY CIGAR CELLAR
      </div>

      <nav className="flex w-full flex-col gap-3">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-2xl border border-[#3a2a0f] bg-[#120d07] px-2 py-3 text-center text-[12px] font-semibold text-amber-200 shadow-lg transition hover:border-amber-400/60 hover:bg-[#1c1309]"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}

function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-[#3a2a0f] bg-black/95 px-2 pb-[env(safe-area-inset-bottom)] pt-2 shadow-[0_-8px_30px_rgba(0,0,0,0.55)] landscape:hidden lg:hidden">
      <div className="grid w-full grid-cols-4 gap-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-2xl border border-[#3a2a0f] bg-[#120d07] px-1 py-2 text-center text-[11px] font-semibold text-amber-200"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <SideNav />

      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center px-3 pb-[92px] pt-2 sm:px-4 sm:pb-[104px] sm:pt-3 landscape:ml-[118px] landscape:max-w-none landscape:px-6 landscape:pb-6 lg:ml-[118px] lg:max-w-none lg:px-8 lg:pb-6">
        <header className="w-full text-center landscape:hidden lg:hidden">
          <h1
            className="text-center text-[27px] font-semibold tracking-[0.06em] text-amber-300 sm:text-4xl md:text-6xl"
            style={{ fontFamily: "var(--font-cinzel)" }}
          >
            MY CIGAR CELLAR
          </h1>

          <p className="mt-2 text-center text-[15px] text-amber-300 sm:mt-4 sm:text-xl md:text-2xl">
            Current Humidor
          </p>

          <p className="mt-1 text-center text-[19px] font-semibold text-white sm:mt-2 sm:text-2xl md:text-4xl">
            Start Your First Humidor
          </p>

          <div className="mx-auto mt-3 h-px w-full max-w-2xl bg-stone-800 sm:mt-5" />
        </header>

        <section className="mt-1 w-full sm:mt-3 landscape:mt-0 lg:mt-0">
          <div className="mx-auto w-[100vw] max-w-none sm:w-full sm:max-w-4xl landscape:w-full landscape:max-w-[820px] lg:max-w-[900px]">
            <div className="relative aspect-4/5 w-full bg-black landscape:aspect-[5/4]">
              <Image
                src="/images/main-home-v2.png"
                alt="My Cigar Cellar main scene"
                fill
                className="object-cover object-[center_35%] sm:object-contain landscape:object-contain"
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

        <section className="mt-2 w-full text-center sm:mt-4 landscape:hidden lg:hidden">
          <div className="mx-auto mb-3 h-px w-full max-w-2xl bg-stone-800 sm:mb-5" />

          <p className="text-center text-[15px] text-stone-300 sm:text-xl md:text-2xl">
            Recently Smoked
          </p>

          <p className="mt-1 text-center text-[18px] font-semibold text-white sm:mt-2 sm:text-2xl md:text-4xl">
            No Recent Smokes
          </p>
        </section>
      </div>

      <BottomNav />
    </main>
  );
}