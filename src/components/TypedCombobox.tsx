'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type TypedComboboxProps = {
  label: string;
  value: string;
  options: string[];
  placeholder?: string;
  onChange: (value: string) => void;
};

export default function TypedCombobox({
  label,
  value,
  options,
  placeholder = 'Type or choose...',
  onChange,
}: TypedComboboxProps) {
  const [query, setQuery] = useState(value);
  const [isOpen, setIsOpen] = useState(false);

  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        event.target instanceof Node &&
        !wrapperRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }

    window.addEventListener('click', handleClickOutside);

    return () => {
      window.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const filteredOptions = useMemo(() => {
    const cleanQuery = query.trim().toLowerCase();

    if (!cleanQuery) return options;

    return options.filter((option) =>
      option.toLowerCase().includes(cleanQuery)
    );
  }, [options, query]);

  return (
    <div ref={wrapperRef} className="relative">
      <label className="mb-1 block text-[11px] uppercase tracking-[0.12em] text-[#c8821f]">
        {label}
      </label>

      <div className="flex items-center rounded-[14px] border border-[#3a2a0f] bg-[#101114] px-3 py-2.5 transition focus-within:border-[#c8882d]/60">
        <input
          type="text"
          value={query}
          placeholder={placeholder}
          onFocus={() => setIsOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value);
            onChange(event.target.value);
            setIsOpen(true);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();

              if (filteredOptions.length > 0) {
                setQuery(filteredOptions[0]);
                onChange(filteredOptions[0]);
              }

              setIsOpen(false);
            }

            if (event.key === 'Escape') {
              setQuery(value);
              setIsOpen(false);
            }
          }}
          className="w-full bg-transparent text-[15px] text-white outline-none placeholder:text-white/35"
        />

        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          className="ml-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-[10px] border border-[#3a2a0f] bg-[#17191d] text-[13px] text-[#d58a24]"
          aria-label={`Toggle ${label} options`}
        >
          {isOpen ? '⌃' : '⌄'}
        </button>
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-40 overflow-hidden rounded-[14px] border border-[#6b4217] bg-[#101114] shadow-[0_18px_40px_rgba(0,0,0,0.45)]">
          <div className="max-h-56 overflow-y-auto p-2">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => {
                const isActive =
                  option.toLowerCase() === value.trim().toLowerCase();

                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      setQuery(option);
                      onChange(option);
                      setIsOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-[12px] px-3 py-2.5 text-left text-[14px] transition ${
                      isActive
                        ? 'bg-[#1c1f25] text-white ring-1 ring-[#c8882d]/45'
                        : 'text-white/85 hover:bg-[#181b20]'
                    }`}
                  >
                    <span className="truncate">{option}</span>

                    {isActive && (
                      <span className="ml-3 text-[11px] text-[#d58a24]">
                        Active
                      </span>
                    )}
                  </button>
                );
              })
            ) : (
              <div className="rounded-[12px] px-3 py-3 text-[13px] text-white/50">
                No saved option. Your typed value will still be used.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}