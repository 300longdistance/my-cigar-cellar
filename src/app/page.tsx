import Image from "next/image";
import Link from "next/link";

type SceneObjectProps = {
  href: string;
  label: string;
  imageSrc: string;
  top: string;
  left: string;
  width: string;
  rotate?: string;
  labelPosition?: "bottom" | "left" | "right";
  labelOffset?: string;
};

function SceneObject({
  href,
  label,
  imageSrc,
  top,
  left,
  width,
  rotate = "0deg",
  labelPosition = "bottom",
  labelOffset = "8px",
}: SceneObjectProps) {
  return (
    <Link
      href={href}
      className="group absolute z-20 block"
      style={{
        top,
        left,
        width,
        transform: `rotate(${rotate})`,
      }}
    >
      <div className="relative">
        <Image
          src={imageSrc}
          alt={label}
          width={500}
          height={500}
          className="h-auto w-full object-contain transition duration-200 group-hover:scale-[1.03] group-hover:drop-shadow-[0_0_18px_rgba(251,191,36,0.35)]"
        />

        {label && (
          <div
            className={`pointer-events-none absolute rounded-full border border-amber-300/40 bg-black/75 px-3 py-1 text-xs font-medium tracking-wide text-amber-200 opacity-0 shadow-lg transition duration-200 group-hover:opacity-100 ${
              labelPosition === "bottom"
                ? "left-1/2 top-full mt-2 -translate-x-1/2"
                : labelPosition === "left"
                ? "top-1/2 -translate-y-1/2"
                : "top-1/2 -translate-y-1/2"
            }`}
            style={
              labelPosition === "bottom"
                ? undefined
                : labelPosition === "left"
                ? { right: `calc(100% + ${labelOffset})` }
                : { left: `calc(100% + ${labelOffset})` }
            }
          >
            {label}
          </div>
        )}
      </div>
    </Link>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center px-4 pb-10 pt-3">
        <header className="w-full text-center">
          <h1
            className="text-4xl font-semibold tracking-[0.08em] text-amber-300 md:text-6xl"
            style={{ fontFamily: "var(--font-cinzel)" }}
          >
            MY CIGAR CELLAR
          </h1>

          <p className="mt-4 text-xl text-amber-300 md:text-2xl">
            Current Humidor
          </p>

          <p className="mt-2 text-2xl font-semibold text-white md:text-4xl">
  Start Your First Humidor
</p>

          <div className="mx-auto mt-5 h-px w-full max-w-2xl bg-stone-800" />
        </header>

        <section className="mt-3 w-full">
          <div className="mx-auto w-full max-w-4xl">
            <div className="relative aspect-4/5 w-full bg-black">
              <Image
                src="/images/main-home.png"
                alt="My Cigar Cellar main scene"
                fill
                className="object-contain"
                priority
              />

              {/* Humidor visual + its own precise hover/click area */}
              <div
                className="group absolute z-10 transition duration-200"
                style={{
                  top: "11%",
                  left: "02%",
                  width: "97%",
                }}
              >
                <Image
                  src="/images/humidor.png"
                  alt="Humidor"
                  width={500}
                  height={500}
                  className="h-auto w-full object-contain transition duration-200 group-hover:scale-[1.02] group-hover:drop-shadow-[0_0_24px_rgba(251,191,36,0.35)]"
                />

                <Link
  href="/humidor"
  className="absolute z-20 block"
                  style={{
                    top: "46%",
                    left: "42%",
                    width: "38%",
                    height: "18%",
                  }}
                >
                  <div className="relative h-full w-full">
                    <div
                      className="pointer-events-none absolute opacity-0 transition duration-200 group-hover:opacity-100"
                      style={{
                        top: "50%",
                        left: "100%",
                        marginLeft: "4px",
                        transform: "translateY(-50%)",
                      }}
                    >
                      <div className="rounded-full border border-amber-300/40 bg-black/75 px-3 py-1 text-xs font-medium tracking-wide text-amber-200 shadow-lg">
                        Humidor
                      </div>
                    </div>
                  </div>
                </Link>
              </div>

              <SceneObject
                href="/pairings"
                label="Pairings"
                imageSrc="/images/whiskey.png"
                top="47%"
                left="21%"
                width="19%"
                labelPosition="left"
              />

              <SceneObject
                href="/smokes"
                label="Notebook"
                imageSrc="/images/notebook.png"
                top="69%"
                left="15%"
                width="38%"
              />

              <SceneObject
                href="/smoke-log"
                label="Quick Log"
                imageSrc="/images/ashtray.png"
                top="65.5%"
                left="55%"
                width="28%"
              />
            </div>
          </div>
        </section>

                <section className="mt-2 w-full text-center">
          <div className="mx-auto mb-5 h-px w-full max-w-2xl bg-stone-800" />

          <p className="text-xl text-stone-300 md:text-2xl">
            Recently Smoked
          </p>

         <p className="mt-2 text-2xl font-semibold text-white md:text-4xl">
  No Recent Smokes
</p>
        </section>
      </div>
    </main>
  );
}