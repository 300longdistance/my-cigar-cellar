'use client';

import Link from 'next/link';
import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useCigarApp } from '@/context/CigarAppContext';
import { saveUserAppData } from '@/lib/supabaseAppData';
import { uploadCigarImage } from '@/lib/supabaseImages';

type Cigar = {
  id: number;
  name: string;
  brand: string;
  humidor: string;
  qty: number;
  origin: string;
  wrapper: string;
  strength: string;
  size: string;
  notes: string;
  favorite: boolean;
  image?: string;
};

type FormState = {
  name: string;
  brand: string;
  humidor: string;
  qty: number;
  origin: string;
  wrapper: string;
  strength: string;
  size: string;
  notes: string;
  image?: string;
};

type SmokeLogEntry = {
  id: number;
  cigarId: number;
  cigarName: string;
  brand: string;
  humidor: string;
  rating: number;
  notes: string;
  pairing: string;
  loggedAt: string;
};

type SmokeLogDraft = {
  rating: number;
  notes: string;
  pairing: string;
};

type SortOption = 'name' | 'qty' | 'favorites';
type SortDirection = 'asc' | 'desc';

const defaultHumidors: string[] = [];

const defaultCigars: Cigar[] = [];

const emptyForm = (humidor: string): FormState => ({
  name: '',
  brand: '',
  humidor,
  qty: 1,
  origin: '',
  wrapper: '',
  strength: '',
  size: '',
  notes: '',
  image: undefined,
});

const emptySmokeDraft: SmokeLogDraft = {
  rating: 0,
  notes: '',
  pairing: '',
};

const wrapperOptions = [
  'Connecticut',
  'Connecticut Shade',
  'Connecticut Broadleaf',
  'Habano',
  'Habano Rosado',
  'Corojo',
  'Maduro',
  'Oscuro',
  'Sumatra',
  'Ecuadorian',
  'Ecuadorian Habano',
  'Ecuadorian Sumatra',
  'San Andrés',
  'Cameroon',
  'Criollo',
  'Mexican San Andrés',
  'Nicaraguan',
];

const strengthOptions = [
  'Mild',
  'Mild-Medium',
  'Medium',
  'Medium-Full',
  'Full',
];

const originOptions = [
  'Dominican Republic',
  'Nicaragua',
  'Honduras',
  'Cuba',
  'Mexico',
  'Costa Rica',
  'Ecuador',
  'Peru',
  'Brazil',
  'United States',
];

const sizeOptions = [
  'Corona',
  'Petit Corona',
  'Corona Gorda',
  'Robusto',
  'Double Robusto',
  'Toro',
  'Gordo',
  'Churchill',
  'Torpedo',
  'Belicoso',
  'Perfecto',
  'Lonsdale',
  'Lancero',
  'Panetela',
  'Petit Panetela',
  'Presidente',
  'Gigante',
  'Short Robusto',
  'Petit Robusto',
  'Figurado',
];

export default function HumidorPage() {
  const { humidors, setHumidors, cigars, setCigars } = useCigarApp();
const [selectedHumidor, setSelectedHumidor] = useState<string>('');
const [selectedId, setSelectedId] = useState<number | null>(defaultCigars[0]?.id ?? null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
const [isHumidorDropdownOpen, setIsHumidorDropdownOpen] = useState(false);
const [isNewCigarHumidorDropdownOpen, setIsNewCigarHumidorDropdownOpen] = useState(false);
const [isBrandDropdownOpen, setIsBrandDropdownOpen] = useState(false);
const [isSizeDropdownOpen, setIsSizeDropdownOpen] = useState(false);
const [isStrengthDropdownOpen, setIsStrengthDropdownOpen] = useState(false);
const [isWrapperDropdownOpen, setIsWrapperDropdownOpen] = useState(false);
const [isOriginDropdownOpen, setIsOriginDropdownOpen] = useState(false);

const [isEditBrandDropdownOpen, setIsEditBrandDropdownOpen] = useState(false);
const [isEditStrengthDropdownOpen, setIsEditStrengthDropdownOpen] = useState(false);
const [isEditWrapperDropdownOpen, setIsEditWrapperDropdownOpen] = useState(false);
const [isEditSizeDropdownOpen, setIsEditSizeDropdownOpen] = useState(false);
const [isEditOriginDropdownOpen, setIsEditOriginDropdownOpen] = useState(false);

const [editBrandFilterQuery, setEditBrandFilterQuery] = useState('');
const [editStrengthFilterQuery, setEditStrengthFilterQuery] = useState('');
const [editWrapperFilterQuery, setEditWrapperFilterQuery] = useState('');
const [editSizeFilterQuery, setEditSizeFilterQuery] = useState('');
const [editOriginFilterQuery, setEditOriginFilterQuery] = useState('');

const [newBrandActiveIndex, setNewBrandActiveIndex] = useState(0);
const [newStrengthActiveIndex, setNewStrengthActiveIndex] = useState(0);
const [newWrapperActiveIndex, setNewWrapperActiveIndex] = useState(0);
const [newSizeActiveIndex, setNewSizeActiveIndex] = useState(0);
const [newOriginActiveIndex, setNewOriginActiveIndex] = useState(0);

const [editBrandActiveIndex, setEditBrandActiveIndex] = useState(0);
const [editStrengthActiveIndex, setEditStrengthActiveIndex] = useState(0);
const [editWrapperActiveIndex, setEditWrapperActiveIndex] = useState(0);
const [editSizeActiveIndex, setEditSizeActiveIndex] = useState(0);
const [editOriginActiveIndex, setEditOriginActiveIndex] = useState(0);

const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isManageHumidorsOpen, setIsManageHumidorsOpen] = useState(false);
  const [isAddHumidorOpen, setIsAddHumidorOpen] = useState(false);
  const [renamingHumidor, setRenamingHumidor] = useState<string | null>(null);

  const [draftForm, setDraftForm] = useState<FormState>(emptyForm(defaultHumidors[0] ?? ''));
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const [newHumidorName, setNewHumidorName] = useState('');
  const [renameHumidorName, setRenameHumidorName] = useState('');

  const [smokeLogs, setSmokeLogs] = useState<SmokeLogEntry[]>([]);
  const [expandedSmokeLogId, setExpandedSmokeLogId] = useState<number | null>(null);
  const [editingSmokeLogId, setEditingSmokeLogId] = useState<number | null>(null);
  const [smokeDraft, setSmokeDraft] = useState<SmokeLogDraft>(emptySmokeDraft);
  const [hasLoadedStorage, setHasLoadedStorage] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const newImageInputRef = useRef<HTMLInputElement | null>(null);

  const newCigarNameRef = useRef<HTMLInputElement | null>(null);
const newCigarBrandRef = useRef<HTMLInputElement | null>(null);
const newCigarStrengthRef = useRef<HTMLInputElement | null>(null);
const newCigarWrapperRef = useRef<HTMLInputElement | null>(null);
const newCigarSizeRef = useRef<HTMLInputElement | null>(null);
const newCigarOriginRef = useRef<HTMLInputElement | null>(null);
const newCigarNotesRef = useRef<HTMLTextAreaElement | null>(null);

const editCigarBrandRef = useRef<HTMLInputElement | null>(null);
const editCigarStrengthRef = useRef<HTMLInputElement | null>(null);
const editCigarWrapperRef = useRef<HTMLInputElement | null>(null);
const editCigarSizeRef = useRef<HTMLInputElement | null>(null);
const editCigarOriginRef = useRef<HTMLInputElement | null>(null);

  function loadSmokeLogsFromStorage() {
    const savedSmokeLogs = localStorage.getItem('smokeLogs');

    if (!savedSmokeLogs) {
      setSmokeLogs([]);
      return;
    }

    try {
      const parsed = JSON.parse(savedSmokeLogs) as SmokeLogEntry[];

      if (Array.isArray(parsed)) {
        setSmokeLogs(parsed);
      } else {
        setSmokeLogs([]);
      }
    } catch (error) {
      console.error('Failed to load smoke logs from localStorage:', error);
      setSmokeLogs([]);
    }
  }

  useEffect(() => {
    loadSmokeLogsFromStorage();
    setHasLoadedStorage(true);
  }, []);

     useEffect(() => {
    if (!hasLoadedStorage) return;
    localStorage.setItem('smokeLogs', JSON.stringify(smokeLogs));
  }, [smokeLogs, hasLoadedStorage]);

  useEffect(() => {
    function refreshSmokeLogs() {
      loadSmokeLogsFromStorage();
    }

    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        loadSmokeLogsFromStorage();
      }
    }

    window.addEventListener('focus', refreshSmokeLogs);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', refreshSmokeLogs);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const totalCigarsInSelectedHumidor = useMemo(() => {
    return cigars
      .filter((cigar) => cigar.humidor === selectedHumidor)
      .reduce((sum, cigar) => sum + cigar.qty, 0);
  }, [cigars, selectedHumidor]);
const totalCigarsOnHand = useMemo(() => {
  return cigars.reduce((sum, cigar) => sum + cigar.qty, 0);
}, [cigars]);

  const filteredCigarsByHumidor = useMemo(() => {
    return cigars.filter((cigar) => cigar.humidor === selectedHumidor);
  }, [cigars, selectedHumidor]);

  const visibleCigars = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    const filtered = filteredCigarsByHumidor.filter((cigar) => {
      if (!normalizedSearch) return true;

      return (
        cigar.name.toLowerCase().includes(normalizedSearch) ||
        cigar.brand.toLowerCase().includes(normalizedSearch)
      );
    });

    const sorted = [...filtered];

    if (sortBy === 'name') {
      sorted.sort((a, b) => {
        const result = a.name.localeCompare(b.name);
        return sortDirection === 'asc' ? result : -result;
      });
    }

    if (sortBy === 'qty') {
      sorted.sort((a, b) => {
        const result = a.qty - b.qty || a.name.localeCompare(b.name);
        return sortDirection === 'asc' ? result : -result;
      });
    }

    if (sortBy === 'favorites') {
      sorted.sort((a, b) => {
        let result = 0;
        if (a.favorite === b.favorite) {
          result = a.name.localeCompare(b.name);
        } else {
          result = a.favorite ? -1 : 1;
        }
        return sortDirection === 'asc' ? result : -result;
      });
    }

    return sorted;
  }, [filteredCigarsByHumidor, searchTerm, sortBy, sortDirection]);

  const selectedCigar = useMemo(() => {
    if (filteredCigarsByHumidor.length === 0) return null;

    return (
      filteredCigarsByHumidor.find((cigar) => cigar.id === selectedId) ??
      filteredCigarsByHumidor[0]
    );
  }, [filteredCigarsByHumidor, selectedId]);

  const selectedCigarSmokeHistory = useMemo(() => {
  if (!selectedCigar) return [];

  return [...smokeLogs]
    .filter((entry) => entry.cigarId === selectedCigar.id)
    .sort(
      (a, b) =>
        new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime()
    );
}, [smokeLogs, selectedCigar]);

  // ---------- KNOWN DATA HELPERS ----------
function uniqueSortedValues(values: Array<string | undefined>) {
  return Array.from(
    new Set(
      values
        .map((value) => value?.trim() ?? '')
        .filter(Boolean)
    )
  ).sort((a, b) => a.localeCompare(b));
}

// ---------- KNOWN DATA (DEFAULT + USER DATA) ----------
const knownBrandOptions = useMemo(() => {
  return uniqueSortedValues([
    ...defaultCigars.map((cigar) => cigar.brand),
    ...cigars.map((cigar) => cigar.brand),
  ]);
}, [cigars]);

const knownStrengthOptions = useMemo(() => {
  return uniqueSortedValues([
    ...strengthOptions,
    ...defaultCigars.map((cigar) => cigar.strength),
    ...cigars.map((cigar) => cigar.strength),
  ]);
}, [cigars]);

const knownWrapperOptions = useMemo(() => {
  return uniqueSortedValues([
    ...wrapperOptions,
    ...defaultCigars.map((cigar) => cigar.wrapper),
    ...cigars.map((cigar) => cigar.wrapper),
  ]);
}, [cigars]);

const knownSizeOptions = useMemo(() => {
  return uniqueSortedValues([
    ...sizeOptions,
    ...defaultCigars.map((cigar) => cigar.size),
    ...cigars.map((cigar) => cigar.size),
  ]);
}, [cigars]);

const knownOriginOptions = useMemo(() => {
  return uniqueSortedValues([
    ...originOptions,
    ...defaultCigars.map((cigar) => cigar.origin),
    ...cigars.map((cigar) => cigar.origin),
  ]);
}, [cigars]);

// ---------- FILTERED OPTIONS (USED BY DROPDOWNS) ----------
const filteredBrandOptions = useMemo(() => {
  return filterOptions(knownBrandOptions, draftForm.brand);
}, [knownBrandOptions, draftForm.brand]);

const filteredStrengthOptions = useMemo(() => {
  return filterOptions(knownStrengthOptions, draftForm.strength);
}, [knownStrengthOptions, draftForm.strength]);

const filteredWrapperOptions = useMemo(() => {
  return filterOptions(knownWrapperOptions, draftForm.wrapper);
}, [knownWrapperOptions, draftForm.wrapper]);

const filteredSizeOptions = useMemo(() => {
  return filterOptions(knownSizeOptions, draftForm.size);
}, [knownSizeOptions, draftForm.size]);

const filteredOriginOptions = useMemo(() => {
  return filterOptions(knownOriginOptions, draftForm.origin);
}, [knownOriginOptions, draftForm.origin]);

useEffect(() => {
  if (!isBrandDropdownOpen) {
    setNewBrandActiveIndex(0);
    return;
  }

  if (filteredBrandOptions.length === 0) {
    setNewBrandActiveIndex(0);
    return;
  }

  setNewBrandActiveIndex((current) =>
    Math.min(current, filteredBrandOptions.length - 1)
  );
}, [isBrandDropdownOpen, filteredBrandOptions]);

useEffect(() => {
  if (!isStrengthDropdownOpen) {
    setNewStrengthActiveIndex(0);
    return;
  }

  if (filteredStrengthOptions.length === 0) {
    setNewStrengthActiveIndex(0);
    return;
  }

  setNewStrengthActiveIndex((current) =>
    Math.min(current, filteredStrengthOptions.length - 1)
  );
}, [isStrengthDropdownOpen, filteredStrengthOptions]);

useEffect(() => {
  if (!isWrapperDropdownOpen) {
    setNewWrapperActiveIndex(0);
    return;
  }

  if (filteredWrapperOptions.length === 0) {
    setNewWrapperActiveIndex(0);
    return;
  }

  setNewWrapperActiveIndex((current) =>
    Math.min(current, filteredWrapperOptions.length - 1)
  );
}, [isWrapperDropdownOpen, filteredWrapperOptions]);

useEffect(() => {
  if (!isSizeDropdownOpen) {
    setNewSizeActiveIndex(0);
    return;
  }

  if (filteredSizeOptions.length === 0) {
    setNewSizeActiveIndex(0);
    return;
  }

  setNewSizeActiveIndex((current) =>
    Math.min(current, filteredSizeOptions.length - 1)
  );
}, [isSizeDropdownOpen, filteredSizeOptions]);

useEffect(() => {
  if (!isOriginDropdownOpen) {
    setNewOriginActiveIndex(0);
    return;
  }

  if (filteredOriginOptions.length === 0) {
    setNewOriginActiveIndex(0);
    return;
  }

  setNewOriginActiveIndex((current) =>
    Math.min(current, filteredOriginOptions.length - 1)
  );
}, [isOriginDropdownOpen, filteredOriginOptions]);

const filteredEditBrandOptions = useMemo(() => {
  return filterOptions(knownBrandOptions, editBrandFilterQuery);
}, [knownBrandOptions, editBrandFilterQuery]);

const filteredEditStrengthOptions = useMemo(() => {
  return filterOptions(knownStrengthOptions, editStrengthFilterQuery);
}, [knownStrengthOptions, editStrengthFilterQuery]);

const filteredEditWrapperOptions = useMemo(() => {
  return filterOptions(knownWrapperOptions, editWrapperFilterQuery);
}, [knownWrapperOptions, editWrapperFilterQuery]);

const filteredEditSizeOptions = useMemo(() => {
  return filterOptions(knownSizeOptions, editSizeFilterQuery);
}, [knownSizeOptions, editSizeFilterQuery]);

const filteredEditOriginOptions = useMemo(() => {
  return filterOptions(knownOriginOptions, editOriginFilterQuery);
}, [knownOriginOptions, editOriginFilterQuery]);

useEffect(() => {
  if (!isEditBrandDropdownOpen) {
    setEditBrandActiveIndex(0);
    return;
  }

  if (filteredEditBrandOptions.length === 0) {
    setEditBrandActiveIndex(0);
    return;
  }

  setEditBrandActiveIndex((current) =>
    Math.min(current, filteredEditBrandOptions.length - 1)
  );
}, [isEditBrandDropdownOpen, filteredEditBrandOptions]);

useEffect(() => {
  if (!isEditStrengthDropdownOpen) {
    setEditStrengthActiveIndex(0);
    return;
  }

  if (filteredEditStrengthOptions.length === 0) {
    setEditStrengthActiveIndex(0);
    return;
  }

  setEditStrengthActiveIndex((current) =>
    Math.min(current, filteredEditStrengthOptions.length - 1)
  );
}, [isEditStrengthDropdownOpen, filteredEditStrengthOptions]);

useEffect(() => {
  if (!isEditWrapperDropdownOpen) {
    setEditWrapperActiveIndex(0);
    return;
  }

  if (filteredEditWrapperOptions.length === 0) {
    setEditWrapperActiveIndex(0);
    return;
  }

  setEditWrapperActiveIndex((current) =>
    Math.min(current, filteredEditWrapperOptions.length - 1)
  );
}, [isEditWrapperDropdownOpen, filteredEditWrapperOptions]);

useEffect(() => {
  if (!isEditSizeDropdownOpen) {
    setEditSizeActiveIndex(0);
    return;
  }

  if (filteredEditSizeOptions.length === 0) {
    setEditSizeActiveIndex(0);
    return;
  }

  setEditSizeActiveIndex((current) =>
    Math.min(current, filteredEditSizeOptions.length - 1)
  );
}, [isEditSizeDropdownOpen, filteredEditSizeOptions]);

useEffect(() => {
  if (!isEditOriginDropdownOpen) {
    setEditOriginActiveIndex(0);
    return;
  }

  if (filteredEditOriginOptions.length === 0) {
    setEditOriginActiveIndex(0);
    return;
  }

  setEditOriginActiveIndex((current) =>
    Math.min(current, filteredEditOriginOptions.length - 1)
  );
}, [isEditOriginDropdownOpen, filteredEditOriginOptions]);

  useEffect(() => {
    if (humidors.length === 0) {
      setSelectedHumidor('');
      setDraftForm(emptyForm(''));
      return;
    }

    if (!selectedHumidor || !humidors.includes(selectedHumidor)) {
      setSelectedHumidor(humidors[0]);
      setDraftForm(emptyForm(humidors[0]));
    }
  }, [humidors, selectedHumidor]);

  useEffect(() => {
    if (isCreatingNew) return;

    if (filteredCigarsByHumidor.length === 0) {
      setSelectedId(null);
      setDraftForm(emptyForm(selectedHumidor));
      setIsDeleteConfirmOpen(false);
      return;
    }

    const hasSelectedInHumidor = filteredCigarsByHumidor.some(
      (cigar) => cigar.id === selectedId
    );

    if (!hasSelectedInHumidor) {
      setSelectedId(filteredCigarsByHumidor[0].id);
    }
  }, [filteredCigarsByHumidor, selectedId, isCreatingNew, selectedHumidor]);

  useEffect(() => {
  if (isCreatingNew || !selectedCigar) return;

  setDraftForm({
  name: selectedCigar.name,
  brand: selectedCigar.brand,
  humidor: selectedCigar.humidor,
  qty: selectedCigar.qty,
  origin: selectedCigar.origin ?? '',
  wrapper: selectedCigar.wrapper ?? '',
  strength: selectedCigar.strength ?? '',
  size: selectedCigar.size ?? '',
  notes: selectedCigar.notes ?? '',
  image: selectedCigar.image,
});
  setIsDeleteConfirmOpen(false);
}, [selectedCigar, isCreatingNew]);

useEffect(() => {
  if (!isCreatingNew) return;

  const timeout = window.setTimeout(() => {
    newCigarNameRef.current?.focus();
  }, 0);

  return () => window.clearTimeout(timeout);
}, [isCreatingNew]);

  useEffect(() => {
    setRenameHumidorName(selectedHumidor);
  }, [selectedHumidor]);

  useEffect(() => {
  if (!selectedHumidor) return;

  localStorage.setItem(
    'quickLogSelection',
    JSON.stringify({
      humidor: selectedHumidor,
      cigarId: selectedId,
    })
  );
}, [selectedHumidor, selectedId]);

useEffect(() => {
  function handleWindowClick() {
    if (
      isEditBrandDropdownOpen ||
      isEditStrengthDropdownOpen ||
      isEditWrapperDropdownOpen ||
      isEditSizeDropdownOpen ||
      isEditOriginDropdownOpen
    ) {
      saveDraftToSelectedCigar();
    }

    setIsHumidorDropdownOpen(false);
    setIsNewCigarHumidorDropdownOpen(false);
    setIsBrandDropdownOpen(false);
    setIsSizeDropdownOpen(false);
    setIsStrengthDropdownOpen(false);
    setIsWrapperDropdownOpen(false);
    setIsOriginDropdownOpen(false);

    setIsEditBrandDropdownOpen(false);
    setIsEditStrengthDropdownOpen(false);
    setIsEditWrapperDropdownOpen(false);
    setIsEditSizeDropdownOpen(false);
    setIsEditOriginDropdownOpen(false);

    setEditBrandFilterQuery('');
    setEditStrengthFilterQuery('');
    setEditWrapperFilterQuery('');
    setEditSizeFilterQuery('');
    setEditOriginFilterQuery('');

    setIsSortDropdownOpen(false);
  }

  window.addEventListener('click', handleWindowClick);

  return () => {
    window.removeEventListener('click', handleWindowClick);
  };
}, [
  isEditBrandDropdownOpen,
  isEditStrengthDropdownOpen,
  isEditWrapperDropdownOpen,
  isEditSizeDropdownOpen,
  isEditOriginDropdownOpen,
  draftForm,
  selectedCigar,
  isCreatingNew,
]);

  function updateQty(id: number, delta: number) {
    setCigars((current) =>
      current.map((cigar) =>
        cigar.id === id
          ? { ...cigar, qty: Math.max(0, cigar.qty + delta) }
          : cigar
      )
    );
  }

  function toggleFavorite(id: number) {
    setCigars((current) =>
      current.map((cigar) =>
        cigar.id === id ? { ...cigar, favorite: !cigar.favorite } : cigar
      )
    );
  }

  function handleCardKeyDown(
    event: React.KeyboardEvent<HTMLDivElement>,
    cigarId: number
  ) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setIsCreatingNew(false);
      setSelectedId(cigarId);
    }
  }

  function startCreatingNewCigar() {
  setIsCreatingNew(true);
  setSelectedId(null);
  setDraftForm(emptyForm(selectedHumidor));
  setIsDeleteConfirmOpen(false);
  setSearchTerm('');
}

  function cancelCreatingNewCigar() {
    setIsCreatingNew(false);

    if (selectedCigar) {
      setDraftForm({
  name: selectedCigar.name,
  brand: selectedCigar.brand,
  humidor: selectedCigar.humidor,
  qty: selectedCigar.qty,
  origin: selectedCigar.origin ?? '',
  wrapper: selectedCigar.wrapper ?? '',
  strength: selectedCigar.strength ?? '',
  size: selectedCigar.size ?? '',
  notes: selectedCigar.notes ?? '',
  image: selectedCigar.image,
});
    } else if (filteredCigarsByHumidor.length > 0) {
      setSelectedId(filteredCigarsByHumidor[0].id);
    } else {
      setDraftForm(emptyForm(selectedHumidor));
    }
  }

  async function saveNewCigar() {
  const trimmedName = draftForm.name.trim();
  const trimmedBrand = draftForm.brand.trim();
  const nextHumidor = draftForm.humidor.trim();

  if (!trimmedName) return;
  if (!nextHumidor) return;

  const isNewHumidor = !humidors.includes(nextHumidor);

  const nextHumidors = isNewHumidor
    ? [...humidors, nextHumidor]
    : humidors;

  const newCigar = {
    id: Date.now(),
    name: trimmedName,
    brand: trimmedBrand || 'Unknown Brand',
    humidor: nextHumidor,
    qty: Math.max(1, draftForm.qty || 1),
    origin: draftForm.origin.trim() || 'Unknown',
    wrapper: draftForm.wrapper.trim() || 'Unknown',
    strength: draftForm.strength.trim() || 'Unknown',
    size: draftForm.size.trim() || 'Unknown',
    notes: draftForm.notes.trim(),
    favorite: false,
    image: draftForm.image,
  };

  const nextCigars = [newCigar, ...cigars];

  try {
    await saveUserAppData({
      humidors: nextHumidors,
      cigars: nextCigars,
    });

    setHumidors(nextHumidors);
    setCigars(nextCigars);
    setSelectedHumidor(nextHumidor);
    setSelectedId(newCigar.id);
    setIsCreatingNew(true);
    setSearchTerm('');

    setDraftForm({
      name: '',
      brand: trimmedBrand || '',
      humidor: nextHumidor,
      qty: Math.max(1, draftForm.qty || 1),
      origin: draftForm.origin.trim(),
      wrapper: draftForm.wrapper.trim(),
      strength: draftForm.strength.trim(),
      size: '',
      notes: '',
      image: undefined,
    });

    window.setTimeout(() => {
      newCigarNameRef.current?.focus();
    }, 0);
  } catch (error) {
    console.error('Failed to save cigar to Firestore:', error);
  }
}

  function updateDraftField(updates: Partial<FormState>) {
    setDraftForm((current) => ({ ...current, ...updates }));
  }

  function updateAndSaveSelectedCigarField(updates: Partial<FormState>) {
    setDraftForm((current) => ({ ...current, ...updates }));

    if (!selectedCigar || isCreatingNew) return;

    setCigars((current) =>
      current.map((cigar) =>
        cigar.id === selectedCigar.id
          ? {
              ...cigar,
              ...updates,
            }
          : cigar
      )
    );
  }

  function focusElement(
    element:
      | HTMLInputElement
      | HTMLTextAreaElement
      | null
      | undefined
  ) {
    element?.focus();
  }

  function moveCaretToEnd(
    element: HTMLInputElement | HTMLTextAreaElement | null
  ) {
    if (!element) return;

    const valueLength = element.value.length;
    window.setTimeout(() => {
      element.setSelectionRange(valueLength, valueLength);
    }, 0);
  }

  function filterOptions(options: string[], value: string) {
    const normalized = value.trim().toLowerCase();

    if (!normalized) return options;

    return options.filter((option) =>
      option.toLowerCase().includes(normalized)
    );
  }

  function handleNewCigarEnterKey(
    event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
    nextElement?: HTMLInputElement | HTMLTextAreaElement | null
  ) {
    if (event.key !== 'Enter') return;

    if (event.currentTarget.tagName === 'TEXTAREA' && event.shiftKey) {
      return;
    }

    event.preventDefault();

    if (nextElement) {
      focusElement(nextElement);
      return;
    }

    saveNewCigar();
  }

  function saveDraftToSelectedCigar() {
    if (!selectedCigar || isCreatingNew) return;

    const trimmedName = draftForm.name.trim();
    const trimmedBrand = draftForm.brand.trim();

    const nextSavedForm: FormState = {
  name: trimmedName || selectedCigar.name,
  brand: trimmedBrand || 'Unknown Brand',
  humidor: selectedCigar.humidor,
  qty: Math.max(1, draftForm.qty || selectedCigar.qty),
  origin: draftForm.origin.trim() || 'Unknown',
  wrapper: draftForm.wrapper.trim() || 'Unknown',
  strength: draftForm.strength.trim() || 'Unknown',
  size: draftForm.size.trim() || 'Unknown',
  notes: draftForm.notes.trim(),
  image: draftForm.image ?? selectedCigar.image,
};

    setCigars((current) =>
      current.map((cigar) =>
        cigar.id === selectedCigar.id
          ? {
              ...cigar,
              name: nextSavedForm.name,
              brand: nextSavedForm.brand,
              qty: nextSavedForm.qty,
              origin: nextSavedForm.origin,
              wrapper: nextSavedForm.wrapper,
              strength: nextSavedForm.strength,
              size: nextSavedForm.size,
              notes: nextSavedForm.notes,
              image: nextSavedForm.image,
            }
          : cigar
      )
    );
  }

  function openDeleteConfirm() {
  if (!selectedCigar || isCreatingNew) return;
  setIsDeleteConfirmOpen(true);
}

  function closeDeleteConfirm() {
  setIsDeleteConfirmOpen(false);
}

function confirmRemoveSelectedCigar() {
  if (!selectedCigar) return;

  const remaining = cigars.filter((cigar) => cigar.id !== selectedCigar.id);

  setCigars(remaining);
  setIsDeleteConfirmOpen(false);
  setExpandedSmokeLogId(null);
  setEditingSmokeLogId(null);
  setSmokeDraft(emptySmokeDraft);

  const remainingInSelectedHumidor = remaining.filter(
    (cigar) => cigar.humidor === selectedHumidor
  );

  if (remainingInSelectedHumidor.length > 0) {
    setSelectedId(remainingInSelectedHumidor[0].id);
    return;
  }

  if (remaining.length > 0) {
    setSelectedHumidor(remaining[0].humidor);
    setSelectedId(remaining[0].id);
    return;
  }

  setSelectedId(null);
  setDraftForm(emptyForm(selectedHumidor));
}

  function addHumidor() {
  const trimmed = newHumidorName.trim();

  if (!trimmed) return;
  if (humidors.some((humidor) => humidor.toLowerCase() === trimmed.toLowerCase())) {
    return;
  }

  const nextHumidors = [...humidors, trimmed];
  setHumidors(nextHumidors);
  setSelectedHumidor(trimmed);
  setNewHumidorName('');
  setIsAddHumidorOpen(false);
  setIsManageHumidorsOpen(true);
}

  function startRenameHumidor(humidor: string) {
    setRenamingHumidor(humidor);
    setRenameHumidorName(humidor);
  }

  function cancelRenameHumidor() {
    setRenamingHumidor(null);
    setRenameHumidorName(selectedHumidor);
  }

  function saveRenamedHumidor() {
    if (!renamingHumidor) return;

    const trimmed = renameHumidorName.trim();

    if (!trimmed) return;
    if (trimmed === renamingHumidor) {
      setRenamingHumidor(null);
      return;
    }
    if (humidors.some((humidor) => humidor.toLowerCase() === trimmed.toLowerCase())) {
      return;
    }

    setHumidors((current) =>
      current.map((humidor) => (humidor === renamingHumidor ? trimmed : humidor))
    );

    setCigars((current) =>
      current.map((cigar) =>
        cigar.humidor === renamingHumidor ? { ...cigar, humidor: trimmed } : cigar
      )
    );

    setSmokeLogs((current) =>
      current.map((entry) =>
        entry.humidor === renamingHumidor ? { ...entry, humidor: trimmed } : entry
      )
    );

    if (selectedHumidor === renamingHumidor) {
      setSelectedHumidor(trimmed);
    }

    setRenamingHumidor(null);
  }

  function deleteHumidor(humidorToDelete: string) {
    if (humidors.length <= 1) return;

    const moveTarget = humidors.find((humidor) => humidor !== humidorToDelete) ?? null;
    if (!moveTarget) return;

    setCigars((current) =>
      current.map((cigar) =>
        cigar.humidor === humidorToDelete
          ? { ...cigar, humidor: moveTarget }
          : cigar
      )
    );

    setSmokeLogs((current) =>
      current.map((entry) =>
        entry.humidor === humidorToDelete
          ? { ...entry, humidor: moveTarget }
          : entry
      )
    );

    setHumidors((current) => current.filter((humidor) => humidor !== humidorToDelete));

    if (selectedHumidor === humidorToDelete) {
      setSelectedHumidor(moveTarget);
    }

    if (renamingHumidor === humidorToDelete) {
      setRenamingHumidor(null);
    }
  }

  function humidorCount(humidor: string) {
    return cigars
      .filter((cigar) => cigar.humidor === humidor)
      .reduce((sum, cigar) => sum + cigar.qty, 0);
  }

  function triggerImagePicker() {
    imageInputRef.current?.click();
  }

  function triggerNewImagePicker() {
    newImageInputRef.current?.click();
  }

  function updateSelectedCigarImage(image: string | undefined) {
    if (!selectedCigar || isCreatingNew) return;

    setCigars((current) =>
      current.map((cigar) =>
        cigar.id === selectedCigar.id ? { ...cigar, image } : cigar
      )
    );

    setDraftForm((current) => ({ ...current, image }));
  }

  async function handleSelectedImageChange(event: ChangeEvent<HTMLInputElement>) {
  const file = event.target.files?.[0];
  if (!file || !selectedCigar || isCreatingNew) return;

  try {
    setIsUploadingImage(true);

    const imageUrl = await uploadCigarImage(file, selectedCigar.id);

    updateSelectedCigarImage(imageUrl);
  } catch (error) {
    console.error('Failed to upload selected cigar image:', error);
  } finally {
    setIsUploadingImage(false);
    event.target.value = '';
  }
}

async function handleNewImageChange(event: ChangeEvent<HTMLInputElement>) {
  const file = event.target.files?.[0];
  if (!file) return;

  try {
    setIsUploadingImage(true);

    const temporaryImageId = `new-${Date.now()}`;
    const imageUrl = await uploadCigarImage(file, temporaryImageId);

    setDraftForm((current) => ({ ...current, image: imageUrl }));
  } catch (error) {
    console.error('Failed to upload new cigar image:', error);
  } finally {
    setIsUploadingImage(false);
    event.target.value = '';
  }
}

  function formatLogDate(dateString: string) {
    return new Date(dateString).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  function toggleSmokeHistoryEntry(entryId: number) {
    if (editingSmokeLogId === entryId) return;

    setExpandedSmokeLogId((current) => (current === entryId ? null : entryId));
  }

  function startEditingSmokeLog(entry: SmokeLogEntry) {
    setEditingSmokeLogId(entry.id);
    setExpandedSmokeLogId(entry.id);
    setSmokeDraft({
      rating: entry.rating,
      notes: entry.notes,
      pairing: entry.pairing,
    });
  }

  function cancelEditingSmokeLog() {
    setEditingSmokeLogId(null);
    setSmokeDraft(emptySmokeDraft);
  }

  function saveSmokeLogEdit(entryId: number) {
    if (smokeDraft.rating < 1 || smokeDraft.rating > 5) return;

    setSmokeLogs((current) =>
      current.map((entry) =>
        entry.id === entryId
          ? {
              ...entry,
              rating: smokeDraft.rating,
              notes: smokeDraft.notes.trim(),
              pairing: smokeDraft.pairing.trim(),
            }
          : entry
      )
    );

    setEditingSmokeLogId(null);
    setSmokeDraft(emptySmokeDraft);
  }

  function deleteSmokeLog(entryId: number) {
    setSmokeLogs((current) => current.filter((entry) => entry.id !== entryId));

    if (expandedSmokeLogId === entryId) {
      setExpandedSmokeLogId(null);
    }

    if (editingSmokeLogId === entryId) {
      setEditingSmokeLogId(null);
      setSmokeDraft(emptySmokeDraft);
    }
  }

  const deleteDisabled = isCreatingNew || !selectedCigar;

  return (
  <main className="humidor-phone-readable humidor-ipad-readable min-h-screen overflow-x-hidden bg-black text-white">
    <div className="mx-auto w-full max-w-[1500px] px-1.5 py-1.5 sm:px-4 sm:py-4 lg:px-5 lg:py-5">
      <div className="grid min-h-[calc(100vh-12px)] grid-cols-1 gap-2 sm:grid-cols-[340px_minmax(0,1fr)] sm:gap-4 md:grid-cols-[380px_minmax(0,1fr)] lg:grid-cols-[410px_minmax(0,1fr)]">
          <aside className="rounded-[24px] bg-[#050505] px-3 py-3 sm:px-4 sm:py-4">
            <div className="mb-3 flex items-center justify-between">
              <Link
                href="/"
                className="flex h-8 w-8 items-center justify-center rounded-full text-white/90 transition hover:bg-white/5"
                aria-label="Back to Home"
              >
                <span className="text-[24px]">‹</span>
              </Link>
              <div className="w-8" />
            </div>

            <div className="rounded-[22px] bg-[linear-gradient(135deg,#0d0d0f_0%,#17181c_55%,#111111_100%)] px-4 py-4">
              <div className="text-[10px] uppercase tracking-[0.14em] text-[#c8821f]">
  Current Humidor
</div>

<div className="mt-3">
  <div className="relative">
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        setIsHumidorDropdownOpen((current) => !current);
      }}
      className="flex w-full items-center justify-between rounded-[18px] border border-[#6b4217] bg-[#101114] px-4 py-3 text-left shadow-[0_0_0_1px_rgba(200,136,45,0.08),0_10px_30px_rgba(0,0,0,0.35)] transition hover:border-[#8a5a20] hover:bg-[#14161a]"
      aria-haspopup="listbox"
      aria-expanded={isHumidorDropdownOpen}
    >
      <span className="truncate text-[15px] font-medium text-white">
        {selectedHumidor}
      </span>

      <span className="ml-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-[12px] border border-[#3a2a0f] bg-[#17191d] text-[14px] text-[#d58a24]">
        {isHumidorDropdownOpen ? '⌃' : '⌄'}
      </span>
    </button>

    {isHumidorDropdownOpen && (
      <div
        className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 overflow-hidden rounded-[18px] border border-[#6b4217] bg-[#101114] shadow-[0_18px_40px_rgba(0,0,0,0.45)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="max-h-64 overflow-y-auto p-2">
          {humidors.map((humidor) => {
            const isActive = humidor === selectedHumidor;

            return (
              <button
                key={humidor}
                type="button"
                onClick={() => {
                  setSelectedHumidor(humidor);
                  setSearchTerm('');
                  setIsCreatingNew(false);
                  setIsHumidorDropdownOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-[14px] px-3 py-3 text-left transition ${
                  isActive
                    ? 'bg-[#1c1f25] text-white ring-1 ring-[#c8882d]/45'
                    : 'text-white/85 hover:bg-[#181b20]'
                }`}
              >
                <span className="truncate text-[14px]">{humidor}</span>

                {isActive && (
                  <span className="ml-3 text-[12px] text-[#d58a24]">
                    Active
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    )}
  </div>
</div>

<div className="mt-2 text-[13px] text-white/45">
  {totalCigarsInSelectedHumidor} cigars in this humidor
</div>
<button
  type="button"
  onClick={() => setIsManageHumidorsOpen((current) => !current)}
  className="mt-2 flex w-full items-center justify-between text-left text-[12px] text-white/55 transition hover:text-[#c8882d]"
>
  <span>Add / Manage Humidors</span>
  <span className="text-[14px]">{isManageHumidorsOpen ? '⌃' : '⌄'}</span>
</button>

{isManageHumidorsOpen && (
  <div className="mt-2 space-y-2">
    <button
      type="button"
      onClick={() => setIsAddHumidorOpen((current) => !current)}
      className="flex w-full items-center gap-2 rounded-[12px] bg-[#1b1d22] px-3 py-2.5 text-left transition hover:bg-[#20232a]"
    >
      <span className="text-[18px] leading-none text-white/85">+</span>
      <span className="text-[12px] text-white">Add Humidor</span>
    </button>

    {isAddHumidorOpen && (
      <div className="rounded-[12px] bg-[#1b1d22] px-3 py-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={newHumidorName}
            onChange={(event) => setNewHumidorName(event.target.value)}
            placeholder="New humidor name"
            className="min-w-0 flex-1 rounded-[10px] border border-[#2d210d] bg-[#0d0f12] px-3 py-2 text-[12px] text-white outline-none placeholder:text-white/25 focus:border-[#c8882d]/60"
          />
          <button
            type="button"
            onClick={addHumidor}
            className="rounded-[10px] bg-[#c8882d] px-3 py-2 text-[12px] text-white transition hover:brightness-110"
          >
            Add
          </button>
        </div>
      </div>
    )}

    {humidors.map((humidor) => {
      const isActive = humidor === selectedHumidor;
      const count = humidorCount(humidor);
      const isRenaming = renamingHumidor === humidor;
      const canDelete = humidors.length > 1;

      return (
        <div
          key={humidor}
          className="rounded-[12px] bg-[#1b1d22] px-3 py-2.5"
        >
          {isRenaming ? (
            <div className="space-y-2">
              <input
                type="text"
                value={renameHumidorName}
                onChange={(event) => setRenameHumidorName(event.target.value)}
                className="w-full rounded-[10px] border border-[#2d210d] bg-[#0d0f12] px-3 py-2 text-[12px] text-white outline-none focus:border-[#c8882d]/60"
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={saveRenamedHumidor}
                  className="flex-1 rounded-[10px] bg-[#c8882d] px-3 py-2 text-[12px] text-white transition hover:brightness-110"
                >
                  Save
                </button>

                <button
                  type="button"
                  onClick={cancelRenameHumidor}
                  className="flex-1 rounded-[10px] border border-white/10 bg-[#121316] px-3 py-2 text-[12px] text-white/75 transition hover:bg-[#17191d] hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedHumidor(humidor);
                  setIsCreatingNew(false);
                }}
                className="min-w-0 flex-1 text-left"
              >
                <div className="truncate text-[13px] text-white">
                  {humidor}
                </div>

                <div className="mt-0.5 text-[10px] text-white/45">
                  {count} cigars
                </div>
              </button>

              <div className="flex shrink-0 items-center gap-2">
                {isActive && (
                  <span className="text-[11px] font-medium text-[#d58a24]">
                    Active
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => startRenameHumidor(humidor)}
                  className="text-[14px] text-[#d58a24] transition hover:text-[#f0d78a]"
                  aria-label={`Rename ${humidor}`}
                >
                  ✎
                </button>

                <button
                  type="button"
                  onClick={() => deleteHumidor(humidor)}
                  disabled={!canDelete}
                  className="text-[15px] text-red-400 transition hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label={`Delete ${humidor}`}
                >
                  🗑
                </button>
              </div>
            </div>
          )}
        </div>
      );
    })}
  </div>
)}

              <div className="mt-5 border-t border-[#5a3410]/70 pt-3">
                <div className="text-[10px] uppercase tracking-[0.14em] text-[#c8821f]">
                  Inventory
                </div>

                <div className="mt-3">
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={startCreatingNewCigar}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        startCreatingNewCigar();
                      }
                    }}
                    className={`block w-full cursor-pointer rounded-[16px] border px-3 py-3 text-left transition ${
                      isCreatingNew
                        ? 'border-[#6b4217] bg-[linear-gradient(135deg,#1b1d22_0%,#20242b_100%)] ring-1 ring-[#c8882d] shadow-[0_0_18px_rgba(200,136,45,0.10)]'
                        : 'border-white/5 bg-[linear-gradient(135deg,#15171b_0%,#1a1d22_100%)] hover:border-white/10 hover:bg-[linear-gradient(135deg,#181b20_0%,#1d2127_100%)]'
                    }`}
                    aria-pressed={isCreatingNew}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[12px] bg-[#c8882d] text-[24px] text-white">
                        +
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="text-[14px] leading-tight text-white">New Cigar</div>
                        <div className="mt-[2px] text-[11px] text-white/60">
                          Add a cigar to {selectedHumidor}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 space-y-2.5">
  <input
    type="text"
    value={searchTerm}
    onChange={(event) => setSearchTerm(event.target.value)}
    placeholder="Search name or brand"
    className="w-full rounded-[16px] border border-[#3a2a0f] bg-[#111215] px-3.5 py-2.5 text-[13px] text-white outline-none transition placeholder:text-white/25 focus:border-[#c8882d]/60 focus:ring-1 focus:ring-[#c8882d]/20"
  />

  <div className="relative">
  <button
    type="button"
    onClick={(event) => {
      event.stopPropagation();
      setIsSortDropdownOpen((current) => !current);
    }}
    className="flex w-full items-center justify-between rounded-[18px] border border-[#6b4217] bg-[#101114] px-4 py-2.5 text-left shadow-[0_0_0_1px_rgba(200,136,45,0.08),0_10px_30px_rgba(0,0,0,0.35)] transition hover:border-[#8a5a20] hover:bg-[#14161a]"
    aria-haspopup="listbox"
    aria-expanded={isSortDropdownOpen}
  >
    <span className="truncate text-[13px] font-medium text-white">
      {sortBy === 'name' && 'Sort By: Name'}
      {sortBy === 'qty' && 'Sort By: Quantity'}
      {sortBy === 'favorites' && 'Sort By: Favorites'}
    </span>

    <span className="ml-3 flex h-7 w-7 shrink-0 items-center justify-center rounded-[12px] border border-[#3a2a0f] bg-[#17191d] text-[13px] text-[#d58a24]">
      {isSortDropdownOpen ? '⌃' : '⌄'}
    </span>
  </button>

  {isSortDropdownOpen && (
    <div
      className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 overflow-hidden rounded-[18px] border border-[#6b4217] bg-[#101114] shadow-[0_18px_40px_rgba(0,0,0,0.45)]"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="p-2">
        {[
          { value: 'name', label: 'Sort By: Name' },
          { value: 'qty', label: 'Sort By: Quantity' },
          { value: 'favorites', label: 'Sort By: Favorites' },
        ].map((option) => {
          const isActive = sortBy === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                setSortBy(option.value as SortOption);
                setIsSortDropdownOpen(false);
              }}
              className={`flex w-full items-center justify-between rounded-[14px] px-3 py-2.5 text-left transition ${
                isActive
                  ? 'bg-[#1c1f25] text-white ring-1 ring-[#c8882d]/45'
                  : 'text-white/85 hover:bg-[#181b20]'
              }`}
            >
              <span className="truncate text-[13px]">
                {option.label}
              </span>

              {isActive && (
                <span className="ml-3 text-[11px] text-[#d58a24]">
                  Selected
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  )}
</div>

  <div className="grid grid-cols-2 gap-2 rounded-[16px] border border-[#3a2a0f] bg-[#111215] p-1">
    <button
      type="button"
      onClick={() => setSortDirection('asc')}
      className={`rounded-[12px] px-3 py-2 text-[12px] font-medium transition ${
        sortDirection === 'asc'
          ? 'bg-[#c8882d] text-white shadow-[0_4px_14px_rgba(200,136,45,0.22)]'
          : 'text-white/70 hover:bg-[#191b20] hover:text-white'
      }`}
    >
      {sortBy === 'name' && 'A–Z'}
      {sortBy === 'qty' && 'Low–High'}
      {sortBy === 'favorites' && 'Fav First'}
    </button>

    <button
      type="button"
      onClick={() => setSortDirection('desc')}
      className={`rounded-[12px] px-3 py-2 text-[12px] font-medium transition ${
        sortDirection === 'desc'
          ? 'bg-[#c8882d] text-white shadow-[0_4px_14px_rgba(200,136,45,0.22)]'
          : 'text-white/70 hover:bg-[#191b20] hover:text-white'
      }`}
    >
      {sortBy === 'name' && 'Z–A'}
      {sortBy === 'qty' && 'High–Low'}
      {sortBy === 'favorites' && 'Fav Last'}
    </button>
  </div>
</div>

                <div className="mt-4 space-y-2">
                  {visibleCigars.length > 0 ? (
                    visibleCigars.map((cigar) => {
                      const isSelected = !isCreatingNew && cigar.id === selectedId;

                      return (
                        <div
  key={cigar.id}
  role="button"
  tabIndex={0}
  onClick={() => {
    setIsCreatingNew(false);
    setSelectedId(cigar.id);
  }}
  onKeyDown={(event) => handleCardKeyDown(event, cigar.id)}
  className={`group block w-full cursor-pointer rounded-[20px] border px-3.5 py-3.5 text-left transition duration-150 ${
    isSelected
      ? 'border-[#c8882d]/45 bg-[#1b1d22] shadow-[0_0_0_1px_rgba(200,136,45,0.25),0_12px_28px_rgba(0,0,0,0.28)]'
      : 'border-white/5 bg-[#16181c] hover:border-[#c8882d]/25 hover:bg-[#1a1d22]'
  } ${cigar.qty === 0 ? 'opacity-65' : ''}`}
  aria-pressed={isSelected}
>
  <div className="flex items-center gap-3.5">
    <div className="flex h-[64px] w-[64px] shrink-0 items-center justify-center overflow-hidden rounded-[16px] bg-white">
      {cigar.image ? (
        <img
          src={cigar.image}
          alt={cigar.name}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="h-[48px] w-[12px] rounded-full bg-gradient-to-b from-[#6d4a2c] to-[#5d3c22]" />
      )}
    </div>

    <div className="min-w-0 flex-1">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-[15.5px] font-semibold leading-tight text-white">
            {cigar.name}
          </div>

          <div className="mt-1 truncate text-[12.5px] text-white/60">
            {cigar.brand}
          </div>
        </div>

        <div
          className={`shrink-0 rounded-full px-2.5 py-1 text-[11.5px] font-medium ${
            cigar.qty === 0
              ? 'bg-red-500/10 text-red-400 ring-1 ring-red-400/25'
              : cigar.qty <= 2
                ? 'bg-yellow-400/10 text-yellow-300 ring-1 ring-yellow-300/25'
                : 'bg-[#c8882d]/10 text-[#d58a24] ring-1 ring-[#c8882d]/25'
          }`}
        >
          {cigar.qty === 0
            ? 'Out'
            : cigar.qty <= 2
              ? `Low ×${cigar.qty}`
              : `×${cigar.qty}`}
        </div>
      </div>

      <div className="mt-2 flex items-center gap-2 text-[11.5px] text-white/45">
        <span className="truncate">
          {[cigar.wrapper, cigar.size].filter(Boolean).join(' • ') || 'No wrapper or size set'}
        </span>
      </div>
    </div>
  </div>
</div>
                      );
                    })
                  ) : (
                    <div className="rounded-[16px] bg-[#111215] px-3 py-3 text-[12px] text-white/55">
                      No cigars match this humidor and search.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </aside>

          <section className="rounded-[24px] bg-[#050505] px-3 py-3 sm:px-4 sm:py-4">
            <div className="mb-3 grid grid-cols-[32px_1fr_32px] items-center">
              <div />
              <h1 className="text-center text-[16px]">Cigar</h1>
              <div />
            </div>

            {isCreatingNew ? (
  <div className="mx-auto flex w-full max-w-[620px] flex-col gap-3">
    <div className="rounded-[20px] bg-[#16181c] px-4 py-4">
      <div className="flex gap-3">
        <button
          type="button"
          onClick={triggerNewImagePicker}
          className="flex h-[96px] w-[96px] shrink-0 items-center justify-center overflow-hidden rounded-[16px] bg-white transition hover:brightness-95"
          aria-label={draftForm.image ? 'Change cigar image' : 'Add cigar image'}
          title={draftForm.image ? 'Click to change image' : 'Click to add image'}
        >
          {draftForm.image ? (
            <img
              src={draftForm.image}
              alt={draftForm.name || 'New cigar'}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center px-3 text-center text-[11px] font-medium uppercase tracking-[0.08em] text-[#8a5a20]">
              Add Image
            </div>
          )}
        </button>

        <div className="min-w-0 flex-1">
          <div className="text-[20px] text-white">
            {draftForm.name.trim() || 'New Cigar'}
          </div>

          <div className="mt-1 text-[13px] text-white/60">
            {draftForm.brand.trim() || 'Brand'}
          </div>

          <div className="mt-1 text-[13px] text-[#d58a24]">
            in {draftForm.humidor || selectedHumidor}
          </div>

          <div className="mt-3 border-t border-[#6b4217]/60 pt-3">
            <input
              ref={newImageInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleNewImageChange}
              className="hidden"
            />
          </div>
        </div>
      </div>
    </div>

    <div className="rounded-[20px] border border-[#3a2a0f] bg-[linear-gradient(180deg,#111214_0%,#0c0c0d_100%)] px-4 py-4 sm:px-5">
  <div className="mb-3">
    <div className="text-[10px] uppercase tracking-[0.14em] text-[#c8821f]">
      New Cigar
    </div>
    <h2 className="mt-1 text-[19px] text-white">Add to Humidor</h2>
    <div className="mt-0.5 text-[12px] text-white/50">
      Create a new cigar and save it permanently.
    </div>
  </div>

  <div className="grid gap-2.5 sm:grid-cols-2">
        <div className="sm:col-span-2">
  <label className="mb-1 block text-[10px] uppercase tracking-[0.12em] text-[#c8821f]">
    Name
  </label>
  <input
    ref={newCigarNameRef}
    type="text"
    value={draftForm.name}
    onChange={(event) => updateDraftField({ name: event.target.value })}
    onKeyDown={(event) =>
      handleNewCigarEnterKey(event, newCigarBrandRef.current)
    }
    className="w-full rounded-[14px] border border-[#2d210d] bg-[#111215] px-3 py-2 text-[14px] text-white outline-none transition placeholder:text-white/25 focus:border-[#c8882d]/60"
    placeholder="VSG Sorcerer"
  />
</div>

        <div>
  <label className="mb-1 block text-[10px] uppercase tracking-[0.12em] text-[#c8821f]">
    Brand
  </label>

  <div className="relative">
    <input
      ref={newCigarBrandRef}
      type="text"
      value={draftForm.brand}
      onChange={(event) => {
        updateDraftField({ brand: event.target.value });
        setIsBrandDropdownOpen(true);
        setNewBrandActiveIndex(0);
      }}
      onFocus={() => {
        setIsBrandDropdownOpen(true);
        setNewBrandActiveIndex(0);
      }}
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          setIsBrandDropdownOpen(false);
          setNewBrandActiveIndex(0);
          return;
        }

        if (event.key === 'ArrowDown') {
          event.preventDefault();

          if (!isBrandDropdownOpen) {
            setIsBrandDropdownOpen(true);
            setNewBrandActiveIndex(0);
            return;
          }

          if (filteredBrandOptions.length > 0) {
            setNewBrandActiveIndex((current) =>
              Math.min(current + 1, filteredBrandOptions.length - 1)
            );
          }
          return;
        }

        if (event.key === 'ArrowUp') {
          event.preventDefault();

          if (!isBrandDropdownOpen) {
            setIsBrandDropdownOpen(true);
            setNewBrandActiveIndex(0);
            return;
          }

          if (filteredBrandOptions.length > 0) {
            setNewBrandActiveIndex((current) => Math.max(current - 1, 0));
          }
          return;
        }

        if (event.key === 'Enter' && isBrandDropdownOpen && filteredBrandOptions.length > 0) {
          event.preventDefault();

          const selectedOption = filteredBrandOptions[newBrandActiveIndex];
          if (selectedOption) {
            updateDraftField({ brand: selectedOption });
            setIsBrandDropdownOpen(false);
            setNewBrandActiveIndex(0);
            newCigarStrengthRef.current?.focus();
          }
          return;
        }

        handleNewCigarEnterKey(event, newCigarStrengthRef.current);
      }}
      className="w-full rounded-[18px] border border-[#6b4217] bg-[#101114] px-4 py-2.5 pr-10 text-[14px] text-white outline-none shadow-[0_0_0_1px_rgba(200,136,45,0.08),0_10px_30px_rgba(0,0,0,0.35)] transition placeholder:text-white/25 focus:border-[#c8882d]/60 focus:ring-1 focus:ring-[#c8882d]/20"
      placeholder="Choose or type brand"
      autoComplete="off"
      aria-haspopup="listbox"
      aria-expanded={isBrandDropdownOpen}
    />

    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        const next = !isBrandDropdownOpen;
        setIsBrandDropdownOpen(next);

        if (next) {
          setNewBrandActiveIndex(0);
          focusElement(newCigarBrandRef.current);
          moveCaretToEnd(newCigarBrandRef.current);
        }
      }}
      className="absolute inset-y-0 right-0 flex w-10 items-center justify-center"
      aria-label="Toggle brand options"
      tabIndex={-1}
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-[12px] border border-[#3a2a0f] bg-[#17191d] text-[13px] text-[#d58a24]">
        {isBrandDropdownOpen ? '⌃' : '⌄'}
      </span>
    </button>

    {isBrandDropdownOpen && (
      <div
        className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 overflow-hidden rounded-[18px] border border-[#6b4217] bg-[#101114] shadow-[0_18px_40px_rgba(0,0,0,0.45)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="max-h-64 overflow-y-auto p-2">
          {filteredBrandOptions.length > 0 ? (
            filteredBrandOptions.map((option, index) => {
              const isSelectedValue = draftForm.brand === option;
              const isKeyboardActive = newBrandActiveIndex === index;

              return (
                <button
                  key={option}
                  type="button"
                  onMouseEnter={() => setNewBrandActiveIndex(index)}
                  onClick={() => {
                    updateDraftField({ brand: option });
                    setIsBrandDropdownOpen(false);
                    setNewBrandActiveIndex(0);
                    newCigarStrengthRef.current?.focus();
                  }}
                  className={`flex w-full items-center justify-between rounded-[14px] px-3 py-2.5 text-left transition ${
                    isKeyboardActive
                      ? 'bg-[#1c1f25] text-white ring-1 ring-[#c8882d]/45'
                      : 'text-white/85 hover:bg-[#181b20]'
                  }`}
                >
                  <span className="truncate text-[13px]">
                    {option}
                  </span>

                  {isSelectedValue && (
                    <span className="ml-3 text-[11px] text-[#d58a24]">
                      Selected
                    </span>
                  )}
                </button>
              );
            })
          ) : (
            <div className="rounded-[14px] px-3 py-2.5 text-[13px] text-white/50">
              No matching brands. Keep typing to use a custom value.
            </div>
          )}
        </div>
      </div>
    )}
  </div>
</div>

        <div className="sm:col-span-1 sm:max-w-[165px]">
  <label className="mb-1 block text-[10px] uppercase tracking-[0.12em] text-[#c8821f]">
    Quantity
  </label>

  <div className="rounded-[14px] border border-[#3a2a0f] bg-[#15161a] px-2 py-1.5">
    <div className="flex items-center justify-between gap-2">
      <button
        type="button"
        onClick={() =>
          updateDraftField({ qty: Math.max(1, draftForm.qty - 1) })
        }
        className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-[#111215] text-[16px] text-white transition hover:bg-[#17191d]"
        aria-label="Decrease quantity"
      >
        −
      </button>

      <div className="text-center">
  <div className="text-[11px] text-white/60">Qty</div>

  <div
    className={`text-[18px] ${
      draftForm.qty <= 2 ? 'text-yellow-300' : 'text-[#d58a24]'
    }`}
  >
    {draftForm.qty}
  </div>
</div>

      <button
        type="button"
        onClick={() => updateDraftField({ qty: draftForm.qty + 1 })}
        className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-[#c8882d] text-[16px] text-white transition hover:brightness-110"
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  </div>
</div>

        <div className="sm:col-span-2">
          <label className="mb-1 block text-[10px] uppercase tracking-[0.12em] text-[#c8821f]">
            Humidor
          </label>

          <div className="relative">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setIsNewCigarHumidorDropdownOpen((current) => !current);
              }}
              className="flex w-full items-center justify-between rounded-[18px] border border-[#6b4217] bg-[#101114] px-4 py-3 text-left shadow-[0_0_0_1px_rgba(200,136,45,0.08),0_10px_30px_rgba(0,0,0,0.35)] transition hover:border-[#8a5a20] hover:bg-[#14161a]"
              aria-haspopup="listbox"
              aria-expanded={isNewCigarHumidorDropdownOpen}
            >
              <span className="truncate text-[14px] font-medium text-white">
                {draftForm.humidor}
              </span>

              <span className="ml-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-[12px] border border-[#3a2a0f] bg-[#17191d] text-[14px] text-[#d58a24]">
                {isNewCigarHumidorDropdownOpen ? '⌃' : '⌄'}
              </span>
            </button>

            {isNewCigarHumidorDropdownOpen && (
              <div
                className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 overflow-hidden rounded-[18px] border border-[#6b4217] bg-[#101114] shadow-[0_18px_40px_rgba(0,0,0,0.45)]"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="max-h-64 overflow-y-auto p-2">
                  {humidors.map((humidor) => {
                    const isActive = humidor === draftForm.humidor;

                    return (
                      <button
                        key={humidor}
                        type="button"
                        onClick={() => {
                          updateDraftField({ humidor });
                          setIsNewCigarHumidorDropdownOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-[14px] px-3 py-3 text-left transition ${
                          isActive
                            ? 'bg-[#1c1f25] text-white ring-1 ring-[#c8882d]/45'
                            : 'text-white/85 hover:bg-[#181b20]'
                        }`}
                      >
                        <span className="truncate text-[14px]">{humidor}</span>

                        {isActive && (
                          <span className="ml-3 text-[12px] text-[#d58a24]">
                            Selected
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <div>
  <label className="mb-1 block text-[10px] uppercase tracking-[0.12em] text-[#c8821f]">
    Strength
  </label>

  <div className="relative">
    <input
      ref={newCigarStrengthRef}
      type="text"
      value={draftForm.strength}
      onChange={(event) => {
        updateDraftField({ strength: event.target.value });
        setIsStrengthDropdownOpen(true);
        setNewStrengthActiveIndex(0);
      }}
      onFocus={() => {
        setIsStrengthDropdownOpen(true);
        setNewStrengthActiveIndex(0);
      }}
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          setIsStrengthDropdownOpen(false);
          setNewStrengthActiveIndex(0);
          return;
        }

        if (event.key === 'ArrowDown') {
          event.preventDefault();

          if (!isStrengthDropdownOpen) {
            setIsStrengthDropdownOpen(true);
            setNewStrengthActiveIndex(0);
            return;
          }

          if (filteredStrengthOptions.length > 0) {
            setNewStrengthActiveIndex((current) =>
              Math.min(current + 1, filteredStrengthOptions.length - 1)
            );
          }
          return;
        }

        if (event.key === 'ArrowUp') {
          event.preventDefault();

          if (!isStrengthDropdownOpen) {
            setIsStrengthDropdownOpen(true);
            setNewStrengthActiveIndex(0);
            return;
          }

          if (filteredStrengthOptions.length > 0) {
            setNewStrengthActiveIndex((current) => Math.max(current - 1, 0));
          }
          return;
        }

        if (event.key === 'Enter' && isStrengthDropdownOpen && filteredStrengthOptions.length > 0) {
          event.preventDefault();

          const selectedOption = filteredStrengthOptions[newStrengthActiveIndex];
          if (selectedOption) {
            updateDraftField({ strength: selectedOption });
            setIsStrengthDropdownOpen(false);
            setNewStrengthActiveIndex(0);
            newCigarWrapperRef.current?.focus();
          }
          return;
        }

        handleNewCigarEnterKey(event, newCigarWrapperRef.current);
      }}
      className="w-full rounded-[18px] border border-[#6b4217] bg-[#101114] px-4 py-2.5 pr-10 text-[14px] text-white outline-none shadow-[0_0_0_1px_rgba(200,136,45,0.08),0_10px_30px_rgba(0,0,0,0.35)] transition placeholder:text-white/25 focus:border-[#c8882d]/60 focus:ring-1 focus:ring-[#c8882d]/20"
      placeholder="Choose or type strength"
      autoComplete="off"
      aria-haspopup="listbox"
      aria-expanded={isStrengthDropdownOpen}
    />

    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        const next = !isStrengthDropdownOpen;
        setIsStrengthDropdownOpen(next);

        if (next) {
          setNewStrengthActiveIndex(0);
          focusElement(newCigarStrengthRef.current);
          moveCaretToEnd(newCigarStrengthRef.current);
        }
      }}
      className="absolute inset-y-0 right-0 flex w-10 items-center justify-center"
      aria-label="Toggle strength options"
      tabIndex={-1}
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-[12px] border border-[#3a2a0f] bg-[#17191d] text-[13px] text-[#d58a24]">
        {isStrengthDropdownOpen ? '⌃' : '⌄'}
      </span>
    </button>

    {isStrengthDropdownOpen && (
      <div
        className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 overflow-hidden rounded-[18px] border border-[#6b4217] bg-[#101114] shadow-[0_18px_40px_rgba(0,0,0,0.45)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="max-h-64 overflow-y-auto p-2">
          {filteredStrengthOptions.length > 0 ? (
            filteredStrengthOptions.map((option, index) => {
              const isSelectedValue = draftForm.strength === option;
              const isKeyboardActive = newStrengthActiveIndex === index;

              return (
                <button
                  key={option}
                  type="button"
                  onMouseEnter={() => setNewStrengthActiveIndex(index)}
                  onClick={() => {
                    updateDraftField({ strength: option });
                    setIsStrengthDropdownOpen(false);
                    setNewStrengthActiveIndex(0);
                    newCigarWrapperRef.current?.focus();
                  }}
                  className={`flex w-full items-center justify-between rounded-[14px] px-3 py-2.5 text-left transition ${
                    isKeyboardActive
                      ? 'bg-[#1c1f25] text-white ring-1 ring-[#c8882d]/45'
                      : 'text-white/85 hover:bg-[#181b20]'
                  }`}
                >
                  <span className="truncate text-[13px]">
                    {option}
                  </span>

                  {isSelectedValue && (
                    <span className="ml-3 text-[11px] text-[#d58a24]">
                      Selected
                    </span>
                  )}
                </button>
              );
            })
          ) : (
            <div className="rounded-[14px] px-3 py-2.5 text-[13px] text-white/50">
              No matching strengths. Keep typing to use a custom value.
            </div>
          )}
        </div>
      </div>
    )}
  </div>
</div>

        <div>
  <label className="mb-1 block text-[10px] uppercase tracking-[0.12em] text-[#c8821f]">
    Wrapper
  </label>

  <div className="relative">
    <input
      ref={newCigarWrapperRef}
      type="text"
      value={draftForm.wrapper}
      onChange={(event) => {
        updateDraftField({ wrapper: event.target.value });
        setIsWrapperDropdownOpen(true);
        setNewWrapperActiveIndex(0);
      }}
      onFocus={() => {
        setIsWrapperDropdownOpen(true);
        setNewWrapperActiveIndex(0);
      }}
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          setIsWrapperDropdownOpen(false);
          setNewWrapperActiveIndex(0);
          return;
        }

        if (event.key === 'ArrowDown') {
          event.preventDefault();

          if (!isWrapperDropdownOpen) {
            setIsWrapperDropdownOpen(true);
            setNewWrapperActiveIndex(0);
            return;
          }

          if (filteredWrapperOptions.length > 0) {
            setNewWrapperActiveIndex((current) =>
              Math.min(current + 1, filteredWrapperOptions.length - 1)
            );
          }
          return;
        }

        if (event.key === 'ArrowUp') {
          event.preventDefault();

          if (!isWrapperDropdownOpen) {
            setIsWrapperDropdownOpen(true);
            setNewWrapperActiveIndex(0);
            return;
          }

          if (filteredWrapperOptions.length > 0) {
            setNewWrapperActiveIndex((current) => Math.max(current - 1, 0));
          }
          return;
        }

        if (event.key === 'Enter' && isWrapperDropdownOpen && filteredWrapperOptions.length > 0) {
          event.preventDefault();

          const selectedOption = filteredWrapperOptions[newWrapperActiveIndex];
          if (selectedOption) {
            updateDraftField({ wrapper: selectedOption });
            setIsWrapperDropdownOpen(false);
            setNewWrapperActiveIndex(0);
            newCigarSizeRef.current?.focus();
          }
          return;
        }

        handleNewCigarEnterKey(event, newCigarSizeRef.current);
      }}
      className="w-full rounded-[18px] border border-[#6b4217] bg-[#101114] px-4 py-2.5 pr-10 text-[14px] text-white outline-none shadow-[0_0_0_1px_rgba(200,136,45,0.08),0_10px_30px_rgba(0,0,0,0.35)] transition placeholder:text-white/25 focus:border-[#c8882d]/60 focus:ring-1 focus:ring-[#c8882d]/20"
      placeholder="Choose or type wrapper"
      autoComplete="off"
      aria-haspopup="listbox"
      aria-expanded={isWrapperDropdownOpen}
    />

    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        const next = !isWrapperDropdownOpen;
        setIsWrapperDropdownOpen(next);

        if (next) {
          setNewWrapperActiveIndex(0);
          focusElement(newCigarWrapperRef.current);
          moveCaretToEnd(newCigarWrapperRef.current);
        }
      }}
      className="absolute inset-y-0 right-0 flex w-10 items-center justify-center"
      aria-label="Toggle wrapper options"
      tabIndex={-1}
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-[12px] border border-[#3a2a0f] bg-[#17191d] text-[13px] text-[#d58a24]">
        {isWrapperDropdownOpen ? '⌃' : '⌄'}
      </span>
    </button>

    {isWrapperDropdownOpen && (
      <div
        className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 overflow-hidden rounded-[18px] border border-[#6b4217] bg-[#101114] shadow-[0_18px_40px_rgba(0,0,0,0.45)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="max-h-64 overflow-y-auto p-2">
          {filteredWrapperOptions.length > 0 ? (
            filteredWrapperOptions.map((option, index) => {
              const isSelectedValue = draftForm.wrapper === option;
              const isKeyboardActive = newWrapperActiveIndex === index;

              return (
                <button
                  key={option}
                  type="button"
                  onMouseEnter={() => setNewWrapperActiveIndex(index)}
                  onClick={() => {
                    updateDraftField({ wrapper: option });
                    setIsWrapperDropdownOpen(false);
                    setNewWrapperActiveIndex(0);
                    newCigarSizeRef.current?.focus();
                  }}
                  className={`flex w-full items-center justify-between rounded-[14px] px-3 py-2.5 text-left transition ${
                    isKeyboardActive
                      ? 'bg-[#1c1f25] text-white ring-1 ring-[#c8882d]/45'
                      : 'text-white/85 hover:bg-[#181b20]'
                  }`}
                >
                  <span className="truncate text-[13px]">
                    {option}
                  </span>

                  {isSelectedValue && (
                    <span className="ml-3 text-[11px] text-[#d58a24]">
                      Selected
                    </span>
                  )}
                </button>
              );
            })
          ) : (
            <div className="rounded-[14px] px-3 py-2.5 text-[13px] text-white/50">
              No matching wrappers. Keep typing to use a custom value.
            </div>
          )}
        </div>
      </div>
    )}
  </div>
</div>

        <div>
  <label className="mb-1 block text-[10px] uppercase tracking-[0.12em] text-[#c8821f]">
    Size
  </label>

  <div className="relative">
    <input
      ref={newCigarSizeRef}
      type="text"
      value={draftForm.size}
      onChange={(event) => {
        updateDraftField({ size: event.target.value });
        setIsSizeDropdownOpen(true);
        setNewSizeActiveIndex(0);
      }}
      onFocus={() => {
        setIsSizeDropdownOpen(true);
        setNewSizeActiveIndex(0);
      }}
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          setIsSizeDropdownOpen(false);
          setNewSizeActiveIndex(0);
          return;
        }

        if (event.key === 'ArrowDown') {
          event.preventDefault();

          if (!isSizeDropdownOpen) {
            setIsSizeDropdownOpen(true);
            setNewSizeActiveIndex(0);
            return;
          }

          if (filteredSizeOptions.length > 0) {
            setNewSizeActiveIndex((current) =>
              Math.min(current + 1, filteredSizeOptions.length - 1)
            );
          }
          return;
        }

        if (event.key === 'ArrowUp') {
          event.preventDefault();

          if (!isSizeDropdownOpen) {
            setIsSizeDropdownOpen(true);
            setNewSizeActiveIndex(0);
            return;
          }

          if (filteredSizeOptions.length > 0) {
            setNewSizeActiveIndex((current) => Math.max(current - 1, 0));
          }
          return;
        }

        if (event.key === 'Enter' && isSizeDropdownOpen && filteredSizeOptions.length > 0) {
          event.preventDefault();

          const selectedOption = filteredSizeOptions[newSizeActiveIndex];
          if (selectedOption) {
            updateDraftField({ size: selectedOption });
            setIsSizeDropdownOpen(false);
            setNewSizeActiveIndex(0);
            newCigarOriginRef.current?.focus();
          }
          return;
        }

        handleNewCigarEnterKey(event, newCigarOriginRef.current);
      }}
      className="w-full rounded-[18px] border border-[#6b4217] bg-[#101114] px-4 py-2.5 pr-10 text-[14px] text-white outline-none shadow-[0_0_0_1px_rgba(200,136,45,0.08),0_10px_30px_rgba(0,0,0,0.35)] transition placeholder:text-white/25 focus:border-[#c8882d]/60 focus:ring-1 focus:ring-[#c8882d]/20"
      placeholder="Choose or type size"
      autoComplete="off"
      aria-haspopup="listbox"
      aria-expanded={isSizeDropdownOpen}
    />

    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        const next = !isSizeDropdownOpen;
        setIsSizeDropdownOpen(next);

        if (next) {
          setNewSizeActiveIndex(0);
          focusElement(newCigarSizeRef.current);
          moveCaretToEnd(newCigarSizeRef.current);
        }
      }}
      className="absolute inset-y-0 right-0 flex w-10 items-center justify-center"
      aria-label="Toggle size options"
      tabIndex={-1}
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-[12px] border border-[#3a2a0f] bg-[#17191d] text-[13px] text-[#d58a24]">
        {isSizeDropdownOpen ? '⌃' : '⌄'}
      </span>
    </button>

    {isSizeDropdownOpen && (
      <div
        className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 overflow-hidden rounded-[18px] border border-[#6b4217] bg-[#101114] shadow-[0_18px_40px_rgba(0,0,0,0.45)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="max-h-64 overflow-y-auto p-2">
          {filteredSizeOptions.length > 0 ? (
            filteredSizeOptions.map((option, index) => {
              const isSelectedValue = draftForm.size === option;
              const isKeyboardActive = newSizeActiveIndex === index;

              return (
                <button
                  key={option}
                  type="button"
                  onMouseEnter={() => setNewSizeActiveIndex(index)}
                  onClick={() => {
                    updateDraftField({ size: option });
                    setIsSizeDropdownOpen(false);
                    setNewSizeActiveIndex(0);
                    newCigarOriginRef.current?.focus();
                  }}
                  className={`flex w-full items-center justify-between rounded-[14px] px-3 py-2.5 text-left transition ${
                    isKeyboardActive
                      ? 'bg-[#1c1f25] text-white ring-1 ring-[#c8882d]/45'
                      : 'text-white/85 hover:bg-[#181b20]'
                  }`}
                >
                  <span className="truncate text-[13px]">
                    {option}
                  </span>

                  {isSelectedValue && (
                    <span className="ml-3 text-[11px] text-[#d58a24]">
                      Selected
                    </span>
                  )}
                </button>
              );
            })
          ) : (
            <div className="rounded-[14px] px-3 py-2.5 text-[13px] text-white/50">
              No matching sizes. Keep typing to use a custom value.
            </div>
          )}
        </div>
      </div>
    )}
  </div>
</div>

        <div className="sm:col-span-2">
  <label className="mb-1 block text-[10px] uppercase tracking-[0.12em] text-[#c8821f]">
    Origin
  </label>

  <div className="relative">
    <input
      ref={newCigarOriginRef}
      type="text"
      value={draftForm.origin}
      onChange={(event) => {
        updateDraftField({ origin: event.target.value });
        setIsOriginDropdownOpen(true);
        setNewOriginActiveIndex(0);
      }}
      onFocus={() => {
        setIsOriginDropdownOpen(true);
        setNewOriginActiveIndex(0);
      }}
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          setIsOriginDropdownOpen(false);
          setNewOriginActiveIndex(0);
          return;
        }

        if (event.key === 'ArrowDown') {
          event.preventDefault();

          if (!isOriginDropdownOpen) {
            setIsOriginDropdownOpen(true);
            setNewOriginActiveIndex(0);
            return;
          }

          if (filteredOriginOptions.length > 0) {
            setNewOriginActiveIndex((current) =>
              Math.min(current + 1, filteredOriginOptions.length - 1)
            );
          }
          return;
        }

        if (event.key === 'ArrowUp') {
          event.preventDefault();

          if (!isOriginDropdownOpen) {
            setIsOriginDropdownOpen(true);
            setNewOriginActiveIndex(0);
            return;
          }

          if (filteredOriginOptions.length > 0) {
            setNewOriginActiveIndex((current) => Math.max(current - 1, 0));
          }
          return;
        }

        if (event.key === 'Enter' && isOriginDropdownOpen && filteredOriginOptions.length > 0) {
          event.preventDefault();

          const selectedOption = filteredOriginOptions[newOriginActiveIndex];
          if (selectedOption) {
            updateDraftField({ origin: selectedOption });
            setIsOriginDropdownOpen(false);
            setNewOriginActiveIndex(0);
            newCigarNotesRef.current?.focus();
          }
          return;
        }

        handleNewCigarEnterKey(event, newCigarNotesRef.current);
      }}
      className="w-full rounded-[18px] border border-[#6b4217] bg-[#101114] px-4 py-2.5 pr-10 text-[14px] text-white outline-none shadow-[0_0_0_1px_rgba(200,136,45,0.08),0_10px_30px_rgba(0,0,0,0.35)] transition placeholder:text-white/25 focus:border-[#c8882d]/60 focus:ring-1 focus:ring-[#c8882d]/20"
      placeholder="Choose or type origin"
      autoComplete="off"
      aria-haspopup="listbox"
      aria-expanded={isOriginDropdownOpen}
    />

    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        const next = !isOriginDropdownOpen;
        setIsOriginDropdownOpen(next);

        if (next) {
          setNewOriginActiveIndex(0);
          focusElement(newCigarOriginRef.current);
          moveCaretToEnd(newCigarOriginRef.current);
        }
      }}
      className="absolute inset-y-0 right-0 flex w-10 items-center justify-center"
      aria-label="Toggle origin options"
      tabIndex={-1}
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-[12px] border border-[#3a2a0f] bg-[#17191d] text-[13px] text-[#d58a24]">
        {isOriginDropdownOpen ? '⌃' : '⌄'}
      </span>
    </button>

    {isOriginDropdownOpen && (
      <div
        className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 overflow-hidden rounded-[18px] border border-[#6b4217] bg-[#101114] shadow-[0_18px_40px_rgba(0,0,0,0.45)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="max-h-64 overflow-y-auto p-2">
          {filteredOriginOptions.length > 0 ? (
            filteredOriginOptions.map((option, index) => {
              const isSelectedValue = draftForm.origin === option;
              const isKeyboardActive = newOriginActiveIndex === index;

              return (
                <button
                  key={option}
                  type="button"
                  onMouseEnter={() => setNewOriginActiveIndex(index)}
                  onClick={() => {
                    updateDraftField({ origin: option });
                    setIsOriginDropdownOpen(false);
                    setNewOriginActiveIndex(0);
                    newCigarNotesRef.current?.focus();
                  }}
                  className={`flex w-full items-center justify-between rounded-[14px] px-3 py-2.5 text-left transition ${
                    isKeyboardActive
                      ? 'bg-[#1c1f25] text-white ring-1 ring-[#c8882d]/45'
                      : 'text-white/85 hover:bg-[#181b20]'
                  }`}
                >
                  <span className="truncate text-[13px]">
                    {option}
                  </span>

                  {isSelectedValue && (
                    <span className="ml-3 text-[11px] text-[#d58a24]">
                      Selected
                    </span>
                  )}
                </button>
              );
            })
          ) : (
            <div className="rounded-[14px] px-3 py-2.5 text-[13px] text-white/50">
              No matching origins. Keep typing to use a custom value.
            </div>
          )}
        </div>
      </div>
    )}
  </div>
</div>

        <div className="sm:col-span-2">
  <label className="mb-1 block text-[10px] uppercase tracking-[0.12em] text-[#c8821f]">
    Notes
  </label>
  <textarea
    ref={newCigarNotesRef}
    value={draftForm.notes}
    onChange={(event) => updateDraftField({ notes: event.target.value })}
    onKeyDown={(event) => handleNewCigarEnterKey(event)}
    rows={4}
    className="w-full resize-none rounded-[14px] border border-[#2d210d] bg-[#111215] px-3 py-2 text-[14px] text-white outline-none transition placeholder:text-white/25 focus:border-[#c8882d]/60"
    placeholder="Flavor notes, box date, pairing ideas..."
  />
</div>
      </div>

    </div>

    <div className="grid grid-cols-2 gap-2.5">
  <button
    type="button"
    onClick={cancelCreatingNewCigar}
    className="rounded-full border border-[#3a2a0f] bg-[#121316] py-2.5 text-[14px] text-white/75 transition hover:bg-[#17191d] hover:text-white"
  >
    Cancel
  </button>

  <button
    type="button"
    onClick={saveNewCigar}
    className="rounded-full bg-[#c8882d] py-2.5 text-[14px] text-white transition hover:brightness-110"
  >
    Save Cigar
  </button>
</div>
  </div>
) : selectedCigar ? (
  <div className="mx-auto flex w-full max-w-[620px] flex-col gap-3">
                <div className="rounded-[20px] bg-[#16181c] px-4 py-4">
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={triggerImagePicker}
                      className="flex h-[96px] w-[96px] shrink-0 items-center justify-center overflow-hidden rounded-[16px] bg-white transition hover:brightness-95"
                      aria-label={draftForm.image ? 'Change cigar image' : 'Add cigar image'}
                      title={draftForm.image ? 'Click to change image' : 'Click to add image'}
                    >
                      {draftForm.image ? (
                        <img
                          src={draftForm.image}
                          alt={draftForm.name || 'New cigar'}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center px-3 text-center text-[11px] font-medium uppercase tracking-[0.08em] text-[#8a5a20]">
                          {isUploadingImage ? 'Uploading...' : 'Add Image'}
                        </div>
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="text-[20px] text-white">
                        {draftForm.name.trim() || 'New Cigar'}
                      </div>

                      <div className="mt-1 text-[13px] text-white/60">
                        {draftForm.brand.trim() || 'Brand'}
                      </div>

                      <div className="mt-1 text-[13px] text-[#d58a24]">
                        in {draftForm.humidor || selectedHumidor}
                      </div>

                      <div className="mt-3 border-t border-[#6b4217]/60 pt-3">
                        <input
  ref={imageInputRef}
  type="file"
  accept="image/*"
  capture="environment"
  onChange={handleSelectedImageChange}
  className="hidden"
/>
                      </div>
                    </div>
                  </div>
                </div>

    <div className="rounded-[20px] border border-[#3a2a0f] bg-[linear-gradient(180deg,#111214_0%,#0c0c0d_100%)] px-4 py-4 sm:px-5">
                  <div className="mb-4">
                    <div className="text-[10px] uppercase tracking-[0.14em] text-[#c8821f]">
                      Cigar Record
                    </div>
                    <h2 className="mt-1 text-[20px] text-white">Overview & Details</h2>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className="mb-1 block text-[10px] uppercase tracking-[0.12em] text-[#c8821f]">
                        Name
                      </label>
                      <input
                        type="text"
                        value={draftForm.name}
                        onChange={(event) =>
                          updateDraftField({ name: event.target.value })
                        }
                        onBlur={saveDraftToSelectedCigar}
                        className="w-full rounded-[14px] border border-[#2d210d] bg-[#111215] px-3 py-2.5 text-[14px] text-white outline-none transition placeholder:text-white/25 focus:border-[#c8882d]/60"
                        placeholder="VSG Sorcerer"
                      />
                    </div>

                    <div>
  <label className="mb-1 block text-[10px] uppercase tracking-[0.12em] text-[#c8821f]">
    Brand
  </label>

  <div className="relative">
    <input
      ref={editCigarBrandRef}
      type="text"
      value={draftForm.brand}
      onChange={(event) => {
        updateDraftField({ brand: event.target.value });
        setEditBrandFilterQuery(event.target.value);
        setIsEditBrandDropdownOpen(true);
        setEditBrandActiveIndex(0);
      }}
      onFocus={() => {
        setEditBrandFilterQuery('');
        setIsEditBrandDropdownOpen(true);
        setEditBrandActiveIndex(0);
      }}
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          setIsEditBrandDropdownOpen(false);
          setEditBrandFilterQuery('');
          setEditBrandActiveIndex(0);
          return;
        }

        if (event.key === 'ArrowDown') {
          event.preventDefault();

          if (!isEditBrandDropdownOpen) {
            setEditBrandFilterQuery('');
            setIsEditBrandDropdownOpen(true);
            setEditBrandActiveIndex(0);
            return;
          }

          if (filteredEditBrandOptions.length > 0) {
            setEditBrandActiveIndex((current) =>
              Math.min(current + 1, filteredEditBrandOptions.length - 1)
            );
          }
          return;
        }

        if (event.key === 'ArrowUp') {
          event.preventDefault();

          if (!isEditBrandDropdownOpen) {
            setEditBrandFilterQuery('');
            setIsEditBrandDropdownOpen(true);
            setEditBrandActiveIndex(0);
            return;
          }

          if (filteredEditBrandOptions.length > 0) {
            setEditBrandActiveIndex((current) => Math.max(current - 1, 0));
          }
          return;
        }

        if (event.key === 'Enter' && isEditBrandDropdownOpen && filteredEditBrandOptions.length > 0) {
          event.preventDefault();

          const selectedOption = filteredEditBrandOptions[editBrandActiveIndex];
          if (selectedOption) {
            updateAndSaveSelectedCigarField({ brand: selectedOption });
            setIsEditBrandDropdownOpen(false);
            setEditBrandFilterQuery('');
            setEditBrandActiveIndex(0);
          }
          return;
        }
      }}
      className="w-full rounded-[18px] border border-[#6b4217] bg-[#101114] px-4 py-2.5 pr-10 text-[14px] text-white outline-none shadow-[0_0_0_1px_rgba(200,136,45,0.08),0_10px_30px_rgba(0,0,0,0.35)] transition placeholder:text-white/25 focus:border-[#c8882d]/60 focus:ring-1 focus:ring-[#c8882d]/20"
      placeholder="Choose or type brand"
      autoComplete="off"
      aria-haspopup="listbox"
      aria-expanded={isEditBrandDropdownOpen}
    />

    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        const next = !isEditBrandDropdownOpen;
        setIsEditBrandDropdownOpen(next);

        if (next) {
          setEditBrandFilterQuery('');
          setEditBrandActiveIndex(0);
          focusElement(editCigarBrandRef.current);
          moveCaretToEnd(editCigarBrandRef.current);
        }
      }}
      className="absolute inset-y-0 right-0 flex w-10 items-center justify-center"
      aria-label="Toggle brand options"
      tabIndex={-1}
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-[12px] border border-[#3a2a0f] bg-[#17191d] text-[13px] text-[#d58a24]">
        {isEditBrandDropdownOpen ? '⌃' : '⌄'}
      </span>
    </button>

    {isEditBrandDropdownOpen && (
      <div
        className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 overflow-hidden rounded-[18px] border border-[#6b4217] bg-[#101114] shadow-[0_18px_40px_rgba(0,0,0,0.45)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="max-h-64 overflow-y-auto p-2">
          {filteredEditBrandOptions.length > 0 ? (
            filteredEditBrandOptions.map((option, index) => {
              const isSelectedValue = draftForm.brand === option;
              const isKeyboardActive = editBrandActiveIndex === index;

              return (
                <button
                  key={option}
                  type="button"
                  onMouseEnter={() => setEditBrandActiveIndex(index)}
                  onClick={() => {
                    updateAndSaveSelectedCigarField({ brand: option });
                    setIsEditBrandDropdownOpen(false);
                    setEditBrandFilterQuery('');
                    setEditBrandActiveIndex(0);
                  }}
                  className={`flex w-full items-center justify-between rounded-[14px] px-3 py-2.5 text-left transition ${
                    isKeyboardActive
                      ? 'bg-[#1c1f25] text-white ring-1 ring-[#c8882d]/45'
                      : 'text-white/85 hover:bg-[#181b20]'
                  }`}
                >
                  <span className="truncate text-[13px]">
                    {option}
                  </span>

                  {isSelectedValue && (
                    <span className="ml-3 text-[11px] text-[#d58a24]">
                      Selected
                    </span>
                  )}
                </button>
              );
            })
          ) : (
            <div className="rounded-[14px] px-3 py-2.5 text-[13px] text-white/50">
              No matching brands. Keep typing to use a custom value.
            </div>
          )}
        </div>
      </div>
    )}
  </div>
</div>

                    <div>
  <label className="mb-1 block text-[10px] uppercase tracking-[0.12em] text-[#c8821f]">
    Strength
  </label>

  <div className="relative">
    <input
      ref={editCigarStrengthRef}
      type="text"
      value={draftForm.strength}
      onChange={(event) => {
        updateDraftField({ strength: event.target.value });
        setEditStrengthFilterQuery(event.target.value);
        setIsEditStrengthDropdownOpen(true);
        setEditStrengthActiveIndex(0);
      }}
      onFocus={() => {
        setEditStrengthFilterQuery('');
        setIsEditStrengthDropdownOpen(true);
        setEditStrengthActiveIndex(0);
      }}
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          setIsEditStrengthDropdownOpen(false);
          setEditStrengthFilterQuery('');
          setEditStrengthActiveIndex(0);
          return;
        }

        if (event.key === 'ArrowDown') {
          event.preventDefault();

          if (!isEditStrengthDropdownOpen) {
            setEditStrengthFilterQuery('');
            setIsEditStrengthDropdownOpen(true);
            setEditStrengthActiveIndex(0);
            return;
          }

          if (filteredEditStrengthOptions.length > 0) {
            setEditStrengthActiveIndex((current) =>
              Math.min(current + 1, filteredEditStrengthOptions.length - 1)
            );
          }
          return;
        }

        if (event.key === 'ArrowUp') {
          event.preventDefault();

          if (!isEditStrengthDropdownOpen) {
            setEditStrengthFilterQuery('');
            setIsEditStrengthDropdownOpen(true);
            setEditStrengthActiveIndex(0);
            return;
          }

          if (filteredEditStrengthOptions.length > 0) {
            setEditStrengthActiveIndex((current) => Math.max(current - 1, 0));
          }
          return;
        }

        if (event.key === 'Enter' && isEditStrengthDropdownOpen && filteredEditStrengthOptions.length > 0) {
          event.preventDefault();

          const selectedOption = filteredEditStrengthOptions[editStrengthActiveIndex];
          if (selectedOption) {
            updateAndSaveSelectedCigarField({ strength: selectedOption });
            setIsEditStrengthDropdownOpen(false);
            setEditStrengthFilterQuery('');
            setEditStrengthActiveIndex(0);
          }
          return;
        }
      }}
      className="w-full rounded-[18px] border border-[#6b4217] bg-[#101114] px-4 py-2.5 pr-10 text-[14px] text-white outline-none shadow-[0_0_0_1px_rgba(200,136,45,0.08),0_10px_30px_rgba(0,0,0,0.35)] transition placeholder:text-white/25 focus:border-[#c8882d]/60 focus:ring-1 focus:ring-[#c8882d]/20"
      placeholder="Choose or type strength"
      autoComplete="off"
      aria-haspopup="listbox"
      aria-expanded={isEditStrengthDropdownOpen}
    />

    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        const next = !isEditStrengthDropdownOpen;
        setIsEditStrengthDropdownOpen(next);

        if (next) {
          setEditStrengthFilterQuery('');
          setEditStrengthActiveIndex(0);
          focusElement(editCigarStrengthRef.current);
          moveCaretToEnd(editCigarStrengthRef.current);
        }
      }}
      className="absolute inset-y-0 right-0 flex w-10 items-center justify-center"
      aria-label="Toggle strength options"
      tabIndex={-1}
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-[12px] border border-[#3a2a0f] bg-[#17191d] text-[13px] text-[#d58a24]">
        {isEditStrengthDropdownOpen ? '⌃' : '⌄'}
      </span>
    </button>

    {isEditStrengthDropdownOpen && (
      <div
        className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 overflow-hidden rounded-[18px] border border-[#6b4217] bg-[#101114] shadow-[0_18px_40px_rgba(0,0,0,0.45)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="max-h-64 overflow-y-auto p-2">
          {filteredEditStrengthOptions.length > 0 ? (
            filteredEditStrengthOptions.map((option, index) => {
              const isSelectedValue = draftForm.strength === option;
              const isKeyboardActive = editStrengthActiveIndex === index;

              return (
                <button
                  key={option}
                  type="button"
                  onMouseEnter={() => setEditStrengthActiveIndex(index)}
                  onClick={() => {
                    updateAndSaveSelectedCigarField({ strength: option });
                    setIsEditStrengthDropdownOpen(false);
                    setEditStrengthFilterQuery('');
                    setEditStrengthActiveIndex(0);
                  }}
                  className={`flex w-full items-center justify-between rounded-[14px] px-3 py-2.5 text-left transition ${
                    isKeyboardActive
                      ? 'bg-[#1c1f25] text-white ring-1 ring-[#c8882d]/45'
                      : 'text-white/85 hover:bg-[#181b20]'
                  }`}
                >
                  <span className="truncate text-[13px]">
                    {option}
                  </span>

                  {isSelectedValue && (
                    <span className="ml-3 text-[11px] text-[#d58a24]">
                      Selected
                    </span>
                  )}
                </button>
              );
            })
          ) : (
            <div className="rounded-[14px] px-3 py-2.5 text-[13px] text-white/50">
              No matching strengths. Keep typing to use a custom value.
            </div>
          )}
        </div>
      </div>
    )}
  </div>
</div>

                    <div>
  <label className="mb-1 block text-[10px] uppercase tracking-[0.12em] text-[#c8821f]">
    Wrapper
  </label>

  <div className="relative">
    <input
      ref={editCigarWrapperRef}
      type="text"
      value={draftForm.wrapper}
      onChange={(event) => {
        updateDraftField({ wrapper: event.target.value });
        setEditWrapperFilterQuery(event.target.value);
        setIsEditWrapperDropdownOpen(true);
        setEditWrapperActiveIndex(0);
      }}
      onFocus={() => {
        setEditWrapperFilterQuery('');
        setIsEditWrapperDropdownOpen(true);
        setEditWrapperActiveIndex(0);
      }}
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          setIsEditWrapperDropdownOpen(false);
          setEditWrapperFilterQuery('');
          setEditWrapperActiveIndex(0);
          return;
        }

        if (event.key === 'ArrowDown') {
          event.preventDefault();

          if (!isEditWrapperDropdownOpen) {
            setEditWrapperFilterQuery('');
            setIsEditWrapperDropdownOpen(true);
            setEditWrapperActiveIndex(0);
            return;
          }

          if (filteredEditWrapperOptions.length > 0) {
            setEditWrapperActiveIndex((current) =>
              Math.min(current + 1, filteredEditWrapperOptions.length - 1)
            );
          }
          return;
        }

        if (event.key === 'ArrowUp') {
          event.preventDefault();

          if (!isEditWrapperDropdownOpen) {
            setEditWrapperFilterQuery('');
            setIsEditWrapperDropdownOpen(true);
            setEditWrapperActiveIndex(0);
            return;
          }

          if (filteredEditWrapperOptions.length > 0) {
            setEditWrapperActiveIndex((current) => Math.max(current - 1, 0));
          }
          return;
        }

        if (event.key === 'Enter' && isEditWrapperDropdownOpen && filteredEditWrapperOptions.length > 0) {
          event.preventDefault();

          const selectedOption = filteredEditWrapperOptions[editWrapperActiveIndex];
          if (selectedOption) {
            updateAndSaveSelectedCigarField({ wrapper: selectedOption });
            setIsEditWrapperDropdownOpen(false);
            setEditWrapperFilterQuery('');
            setEditWrapperActiveIndex(0);
          }
          return;
        }
      }}
      className="w-full rounded-[18px] border border-[#6b4217] bg-[#101114] px-4 py-2.5 pr-10 text-[14px] text-white outline-none shadow-[0_0_0_1px_rgba(200,136,45,0.08),0_10px_30px_rgba(0,0,0,0.35)] transition placeholder:text-white/25 focus:border-[#c8882d]/60 focus:ring-1 focus:ring-[#c8882d]/20"
      placeholder="Choose or type wrapper"
      autoComplete="off"
      aria-haspopup="listbox"
      aria-expanded={isEditWrapperDropdownOpen}
    />

    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        const next = !isEditWrapperDropdownOpen;
        setIsEditWrapperDropdownOpen(next);

        if (next) {
          setEditWrapperFilterQuery('');
          setEditWrapperActiveIndex(0);
          focusElement(editCigarWrapperRef.current);
          moveCaretToEnd(editCigarWrapperRef.current);
        }
      }}
      className="absolute inset-y-0 right-0 flex w-10 items-center justify-center"
      aria-label="Toggle wrapper options"
      tabIndex={-1}
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-[12px] border border-[#3a2a0f] bg-[#17191d] text-[13px] text-[#d58a24]">
        {isEditWrapperDropdownOpen ? '⌃' : '⌄'}
      </span>
    </button>

    {isEditWrapperDropdownOpen && (
      <div
        className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 overflow-hidden rounded-[18px] border border-[#6b4217] bg-[#101114] shadow-[0_18px_40px_rgba(0,0,0,0.45)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="max-h-64 overflow-y-auto p-2">
          {filteredEditWrapperOptions.length > 0 ? (
            filteredEditWrapperOptions.map((option, index) => {
              const isSelectedValue = draftForm.wrapper === option;
              const isKeyboardActive = editWrapperActiveIndex === index;

              return (
                <button
                  key={option}
                  type="button"
                  onMouseEnter={() => setEditWrapperActiveIndex(index)}
                  onClick={() => {
                    updateAndSaveSelectedCigarField({ wrapper: option });
                    setIsEditWrapperDropdownOpen(false);
                    setEditWrapperFilterQuery('');
                    setEditWrapperActiveIndex(0);
                  }}
                  className={`flex w-full items-center justify-between rounded-[14px] px-3 py-2.5 text-left transition ${
                    isKeyboardActive
                      ? 'bg-[#1c1f25] text-white ring-1 ring-[#c8882d]/45'
                      : 'text-white/85 hover:bg-[#181b20]'
                  }`}
                >
                  <span className="truncate text-[13px]">
                    {option}
                  </span>

                  {isSelectedValue && (
                    <span className="ml-3 text-[11px] text-[#d58a24]">
                      Selected
                    </span>
                  )}
                </button>
              );
            })
          ) : (
            <div className="rounded-[14px] px-3 py-2.5 text-[13px] text-white/50">
              No matching wrappers. Keep typing to use a custom value.
            </div>
          )}
        </div>
      </div>
    )}
  </div>
</div>

                    <div>
  <label className="mb-1 block text-[10px] uppercase tracking-[0.12em] text-[#c8821f]">
    Size
  </label>

  <div className="relative">
    <input
      ref={editCigarSizeRef}
      type="text"
      value={draftForm.size}
      onChange={(event) => {
        updateDraftField({ size: event.target.value });
        setEditSizeFilterQuery(event.target.value);
        setIsEditSizeDropdownOpen(true);
        setEditSizeActiveIndex(0);
      }}
      onFocus={() => {
        setEditSizeFilterQuery('');
        setIsEditSizeDropdownOpen(true);
        setEditSizeActiveIndex(0);
      }}
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          setIsEditSizeDropdownOpen(false);
          setEditSizeFilterQuery('');
          setEditSizeActiveIndex(0);
          return;
        }

        if (event.key === 'ArrowDown') {
          event.preventDefault();

          if (!isEditSizeDropdownOpen) {
            setEditSizeFilterQuery('');
            setIsEditSizeDropdownOpen(true);
            setEditSizeActiveIndex(0);
            return;
          }

          if (filteredEditSizeOptions.length > 0) {
            setEditSizeActiveIndex((current) =>
              Math.min(current + 1, filteredEditSizeOptions.length - 1)
            );
          }
          return;
        }

        if (event.key === 'ArrowUp') {
          event.preventDefault();

          if (!isEditSizeDropdownOpen) {
            setEditSizeFilterQuery('');
            setIsEditSizeDropdownOpen(true);
            setEditSizeActiveIndex(0);
            return;
          }

          if (filteredEditSizeOptions.length > 0) {
            setEditSizeActiveIndex((current) => Math.max(current - 1, 0));
          }
          return;
        }

        if (event.key === 'Enter' && isEditSizeDropdownOpen && filteredEditSizeOptions.length > 0) {
          event.preventDefault();

          const selectedOption = filteredEditSizeOptions[editSizeActiveIndex];
          if (selectedOption) {
            updateAndSaveSelectedCigarField({ size: selectedOption });
            setIsEditSizeDropdownOpen(false);
            setEditSizeFilterQuery('');
            setEditSizeActiveIndex(0);
          }
          return;
        }
      }}
      className="w-full rounded-[18px] border border-[#6b4217] bg-[#101114] px-4 py-2.5 pr-10 text-[14px] text-white outline-none shadow-[0_0_0_1px_rgba(200,136,45,0.08),0_10px_30px_rgba(0,0,0,0.35)] transition placeholder:text-white/25 focus:border-[#c8882d]/60 focus:ring-1 focus:ring-[#c8882d]/20"
      placeholder="Choose or type size"
      autoComplete="off"
      aria-haspopup="listbox"
      aria-expanded={isEditSizeDropdownOpen}
    />

    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        const next = !isEditSizeDropdownOpen;
        setIsEditSizeDropdownOpen(next);

        if (next) {
          setEditSizeFilterQuery('');
          setEditSizeActiveIndex(0);
          focusElement(editCigarSizeRef.current);
          moveCaretToEnd(editCigarSizeRef.current);
        }
      }}
      className="absolute inset-y-0 right-0 flex w-10 items-center justify-center"
      aria-label="Toggle size options"
      tabIndex={-1}
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-[12px] border border-[#3a2a0f] bg-[#17191d] text-[13px] text-[#d58a24]">
        {isEditSizeDropdownOpen ? '⌃' : '⌄'}
      </span>
    </button>

    {isEditSizeDropdownOpen && (
      <div
        className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 overflow-hidden rounded-[18px] border border-[#6b4217] bg-[#101114] shadow-[0_18px_40px_rgba(0,0,0,0.45)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="max-h-64 overflow-y-auto p-2">
          {filteredEditSizeOptions.length > 0 ? (
            filteredEditSizeOptions.map((option, index) => {
              const isSelectedValue = draftForm.size === option;
              const isKeyboardActive = editSizeActiveIndex === index;

              return (
                <button
                  key={option}
                  type="button"
                  onMouseEnter={() => setEditSizeActiveIndex(index)}
                  onClick={() => {
                    updateAndSaveSelectedCigarField({ size: option });
                    setIsEditSizeDropdownOpen(false);
                    setEditSizeFilterQuery('');
                    setEditSizeActiveIndex(0);
                  }}
                  className={`flex w-full items-center justify-between rounded-[14px] px-3 py-2.5 text-left transition ${
                    isKeyboardActive
                      ? 'bg-[#1c1f25] text-white ring-1 ring-[#c8882d]/45'
                      : 'text-white/85 hover:bg-[#181b20]'
                  }`}
                >
                  <span className="truncate text-[13px]">
                    {option}
                  </span>

                  {isSelectedValue && (
                    <span className="ml-3 text-[11px] text-[#d58a24]">
                      Selected
                    </span>
                  )}
                </button>
              );
            })
          ) : (
            <div className="rounded-[14px] px-3 py-2.5 text-[13px] text-white/50">
              No matching sizes. Keep typing to use a custom value.
            </div>
          )}
        </div>
      </div>
    )}
  </div>
</div>

                    <div className="sm:col-span-2">
  <label className="mb-1 block text-[10px] uppercase tracking-[0.12em] text-[#c8821f]">
    Origin
  </label>

  <div className="relative">
    <input
      ref={editCigarOriginRef}
      type="text"
      value={draftForm.origin}
      onChange={(event) => {
        updateDraftField({ origin: event.target.value });
        setEditOriginFilterQuery(event.target.value);
        setIsEditOriginDropdownOpen(true);
        setEditOriginActiveIndex(0);
      }}
      onFocus={() => {
        setEditOriginFilterQuery('');
        setIsEditOriginDropdownOpen(true);
        setEditOriginActiveIndex(0);
      }}
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          setIsEditOriginDropdownOpen(false);
          setEditOriginFilterQuery('');
          setEditOriginActiveIndex(0);
          return;
        }

        if (event.key === 'ArrowDown') {
          event.preventDefault();

          if (!isEditOriginDropdownOpen) {
            setEditOriginFilterQuery('');
            setIsEditOriginDropdownOpen(true);
            setEditOriginActiveIndex(0);
            return;
          }

          if (filteredEditOriginOptions.length > 0) {
            setEditOriginActiveIndex((current) =>
              Math.min(current + 1, filteredEditOriginOptions.length - 1)
            );
          }
          return;
        }

        if (event.key === 'ArrowUp') {
          event.preventDefault();

          if (!isEditOriginDropdownOpen) {
            setEditOriginFilterQuery('');
            setIsEditOriginDropdownOpen(true);
            setEditOriginActiveIndex(0);
            return;
          }

          if (filteredEditOriginOptions.length > 0) {
            setEditOriginActiveIndex((current) => Math.max(current - 1, 0));
          }
          return;
        }

        if (event.key === 'Enter' && isEditOriginDropdownOpen && filteredEditOriginOptions.length > 0) {
          event.preventDefault();

          const selectedOption = filteredEditOriginOptions[editOriginActiveIndex];
          if (selectedOption) {
            updateAndSaveSelectedCigarField({ origin: selectedOption });
            setIsEditOriginDropdownOpen(false);
            setEditOriginFilterQuery('');
            setEditOriginActiveIndex(0);
          }
          return;
        }
      }}
      className="w-full rounded-[18px] border border-[#6b4217] bg-[#101114] px-4 py-2.5 pr-10 text-[14px] text-white outline-none shadow-[0_0_0_1px_rgba(200,136,45,0.08),0_10px_30px_rgba(0,0,0,0.35)] transition placeholder:text-white/25 focus:border-[#c8882d]/60 focus:ring-1 focus:ring-[#c8882d]/20"
      placeholder="Choose or type origin"
      autoComplete="off"
      aria-haspopup="listbox"
      aria-expanded={isEditOriginDropdownOpen}
    />

    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        const next = !isEditOriginDropdownOpen;
        setIsEditOriginDropdownOpen(next);

        if (next) {
          setEditOriginFilterQuery('');
          setEditOriginActiveIndex(0);
          focusElement(editCigarOriginRef.current);
          moveCaretToEnd(editCigarOriginRef.current);
        }
      }}
      className="absolute inset-y-0 right-0 flex w-10 items-center justify-center"
      aria-label="Toggle origin options"
      tabIndex={-1}
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-[12px] border border-[#3a2a0f] bg-[#17191d] text-[13px] text-[#d58a24]">
        {isEditOriginDropdownOpen ? '⌃' : '⌄'}
      </span>
    </button>

    {isEditOriginDropdownOpen && (
      <div
        className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 overflow-hidden rounded-[18px] border border-[#6b4217] bg-[#101114] shadow-[0_18px_40px_rgba(0,0,0,0.45)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="max-h-64 overflow-y-auto p-2">
          {filteredEditOriginOptions.length > 0 ? (
            filteredEditOriginOptions.map((option, index) => {
              const isSelectedValue = draftForm.origin === option;
              const isKeyboardActive = editOriginActiveIndex === index;

              return (
                <button
                  key={option}
                  type="button"
                  onMouseEnter={() => setEditOriginActiveIndex(index)}
                  onClick={() => {
                    updateAndSaveSelectedCigarField({ origin: option });
                    setIsEditOriginDropdownOpen(false);
                    setEditOriginFilterQuery('');
                    setEditOriginActiveIndex(0);
                  }}
                  className={`flex w-full items-center justify-between rounded-[14px] px-3 py-2.5 text-left transition ${
                    isKeyboardActive
                      ? 'bg-[#1c1f25] text-white ring-1 ring-[#c8882d]/45'
                      : 'text-white/85 hover:bg-[#181b20]'
                  }`}
                >
                  <span className="truncate text-[13px]">
                    {option}
                  </span>

                  {isSelectedValue && (
                    <span className="ml-3 text-[11px] text-[#d58a24]">
                      Selected
                    </span>
                  )}
                </button>
              );
            })
          ) : (
            <div className="rounded-[14px] px-3 py-2.5 text-[13px] text-white/50">
              No matching origins. Keep typing to use a custom value.
            </div>
          )}
        </div>
      </div>
    )}
  </div>
</div>

                    <div className="sm:col-span-2">
                      <label className="mb-1 block text-[10px] uppercase tracking-[0.12em] text-[#c8821f]">
                        Notes
                      </label>
                      <textarea
                        value={draftForm.notes}
                        onChange={(event) =>
                          updateDraftField({ notes: event.target.value })
                        }
                        onBlur={saveDraftToSelectedCigar}
                        rows={5}
                        className="w-full resize-none rounded-[14px] border border-[#2d210d] bg-[#111215] px-3 py-2.5 text-[14px] text-white outline-none transition placeholder:text-white/25 focus:border-[#c8882d]/60"
                        placeholder="Flavor notes, box date, pairing ideas..."
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-[20px] bg-[#16181c] px-4 py-3">
                  <div className="text-[10px] uppercase text-[#c8821f]">
                    Cigars on Hand
                  </div>

                  <div className="mt-3 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => updateQty(selectedCigar.id, -1)}
                      className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#111215] text-[18px] transition hover:bg-[#17191d]"
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>

                    <div className="text-center">
  <div className="text-[11px] text-white/60">Qty</div>
  <div
    className={`text-[18px] ${
      selectedCigar.qty === 0 ? 'text-red-400' : 'text-[#d58a24]'
    }`}
  >
    {selectedCigar.qty === 0 ? 'Out of Stock' : selectedCigar.qty}
  </div>
</div>

                    <button
  type="button"
  onClick={() => updateQty(selectedCigar.id, 1)}
  className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#c8882d] text-[18px] text-white transition hover:brightness-110"
  aria-label="Increase quantity"
>
  +
</button>
                  </div>
                </div>

                <div className="rounded-[20px] bg-[#16181c] px-4 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-[10px] uppercase text-[#c8821f]">
                      Smoke History
                    </div>

                    <Link
                      href="/smoke-log"
                      className="text-[12px] text-[#d58a24] transition hover:text-[#f0d78a]"
                    >
                      Log Smoke
                    </Link>
                  </div>

                  {selectedCigarSmokeHistory.length > 0 ? (
                    <div className="mt-3 space-y-3">
                      {selectedCigarSmokeHistory.map((entry) => {
                        const isExpanded = expandedSmokeLogId === entry.id;
                        const isEditing = editingSmokeLogId === entry.id;

                        return (
                          <div
                            key={entry.id}
                            className="rounded-[16px] border border-[#2d210d] bg-[#111215] px-4 py-3"
                          >
                            <div
                              role="button"
                              tabIndex={0}
                              onClick={() => toggleSmokeHistoryEntry(entry.id)}
                              onKeyDown={(event) => {
                                if (event.key === 'Enter' || event.key === ' ') {
                                  event.preventDefault();
                                  toggleSmokeHistoryEntry(entry.id);
                                }
                              }}
                              className="cursor-pointer"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <div className="text-[13px] text-white">
                                    {formatLogDate(entry.loggedAt)}
                                  </div>
                                  <div className="mt-1 text-[11px] text-white/45">
                                    {entry.brand}
                                  </div>
                                </div>

                                <div className="flex shrink-0 items-center gap-2">
                                  <div className="rounded-full bg-[#1b1d22] px-3 py-1 text-[12px] text-[#d58a24]">
                                    Rating {entry.rating}/5
                                  </div>
                                  <div className="text-[14px] text-white/40">
                                    {isExpanded ? '⌃' : '⌄'}
                                  </div>
                                </div>
                              </div>

                              {!isExpanded && (
                                <>
                                  {entry.pairing && (
                                    <div className="mt-3 text-[12px] text-white/75">
                                      <span className="text-[#c8821f]">Pairing:</span>{' '}
                                      {entry.pairing}
                                    </div>
                                  )}

                                  {entry.notes && (
                                    <div className="mt-2 line-clamp-2 text-[12px] leading-relaxed text-white/65">
                                      {entry.notes}
                                    </div>
                                  )}
                                </>
                              )}
                            </div>

                            {isExpanded && !isEditing && (
                              <div className="mt-4 border-t border-white/5 pt-4">
                                {entry.pairing && (
                                  <div className="text-[12px] text-white/75">
                                    <span className="text-[#c8821f]">Pairing:</span>{' '}
                                    {entry.pairing}
                                  </div>
                                )}

                                {entry.notes ? (
                                  <div className="mt-2 text-[12px] leading-relaxed text-white/65">
                                    {entry.notes}
                                  </div>
                                ) : (
                                  <div className="mt-2 text-[12px] text-white/40">
                                    No notes for this session.
                                  </div>
                                )}

                                <div className="mt-4 flex gap-2">
                                  <button
                                    type="button"
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      startEditingSmokeLog(entry);
                                    }}
                                    className="rounded-full bg-[#1b1d22] px-4 py-2 text-[12px] text-[#d58a24] transition hover:bg-[#23262d]"
                                  >
                                    Edit
                                  </button>

                                  <button
                                    type="button"
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      deleteSmokeLog(entry.id);
                                    }}
                                    className="rounded-full bg-[#1b1d22] px-4 py-2 text-[12px] text-red-400 transition hover:bg-[#23262d]"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            )}

                            {isExpanded && isEditing && (
                              <div className="mt-4 border-t border-white/5 pt-4">
                                <div className="text-[10px] uppercase tracking-[0.12em] text-[#c8821f]">
                                  Edit Entry
                                </div>

                                <div className="mt-3">
                                  <div className="text-[11px] text-white/50">Rating</div>
                                  <div className="mt-2 flex flex-wrap gap-2">
                                    {[1, 2, 3, 4, 5].map((value) => (
                                      <button
                                        key={value}
                                        type="button"
                                        onClick={() =>
                                          setSmokeDraft((current) => ({
                                            ...current,
                                            rating: value,
                                          }))
                                        }
                                        className={`flex h-9 w-9 items-center justify-center rounded-full border text-[14px] transition ${
                                          smokeDraft.rating === value
                                            ? 'border-[#d89a43] bg-[#d89a43] text-white'
                                            : 'border-white/10 bg-[#16181c] text-white/80 hover:border-[#d89a43]/40'
                                        }`}
                                      >
                                        {value}
                                      </button>
                                    ))}
                                  </div>
                                </div>

                                <div className="mt-4">
                                  <label className="mb-1 block text-[11px] text-white/50">
                                    Pairing
                                  </label>
                                  <input
                                    type="text"
                                    value={smokeDraft.pairing}
                                    onChange={(event) =>
                                      setSmokeDraft((current) => ({
                                        ...current,
                                        pairing: event.target.value,
                                      }))
                                    }
                                    className="w-full rounded-[12px] border border-[#2d210d] bg-[#0d0f12] px-3 py-2.5 text-[13px] text-white outline-none placeholder:text-white/25 focus:border-[#c8882d]/60"
                                    placeholder="Add pairing"
                                  />
                                </div>

                                <div className="mt-4">
                                  <label className="mb-1 block text-[11px] text-white/50">
                                    Notes
                                  </label>
                                  <textarea
                                    value={smokeDraft.notes}
                                    onChange={(event) =>
                                      setSmokeDraft((current) => ({
                                        ...current,
                                        notes: event.target.value,
                                      }))
                                    }
                                    rows={4}
                                    className="w-full resize-none rounded-[12px] border border-[#2d210d] bg-[#0d0f12] px-3 py-2.5 text-[13px] text-white outline-none placeholder:text-white/25 focus:border-[#c8882d]/60"
                                    placeholder="Update notes"
                                  />
                                </div>

                                <div className="mt-4 flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => saveSmokeLogEdit(entry.id)}
                                    className="rounded-full bg-[#c8882d] px-4 py-2 text-[12px] text-white transition hover:brightness-110"
                                  >
                                    Save
                                  </button>

                                  <button
                                    type="button"
                                    onClick={cancelEditingSmokeLog}
                                    className="rounded-full bg-[#1b1d22] px-4 py-2 text-[12px] text-white/80 transition hover:bg-[#23262d]"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="mt-3 text-center">
                      <div className="text-[15px]">No smokes logged yet</div>

                      <div className="mt-1 text-[12px] text-white/50">
                        Logged sessions for this cigar will appear here.
                      </div>
                    </div>
                  )}
                </div>

                {isDeleteConfirmOpen && (
  <div className="rounded-[20px] border border-[#6b4217] bg-[linear-gradient(180deg,#1a120b_0%,#100d09_100%)] px-4 py-4">
    <div className="text-[10px] uppercase tracking-[0.14em] text-[#f0b36a]">
      Remove from Inventory
    </div>

    <div className="mt-2 text-[16px] text-white">
      Remove <span className="text-[#f0d78a]">{selectedCigar.name}</span> from this humidor?
    </div>

    <div className="mt-2 rounded-[14px] border border-[#3a2a0f] bg-[#111215] px-3 py-3 text-[12px] leading-relaxed text-white/65">
      This only removes the cigar from your current inventory. Your Notebook smoke history, ratings, pairings, and notes will remain saved.
    </div>

    <div className="mt-3 text-[12px] leading-relaxed text-[#f0b36a]/85">
      This helps the app remember cigars you did not like so you do not accidentally reorder them later.
    </div>

    <div className="mt-4 flex gap-3">
      <button
        type="button"
        onClick={closeDeleteConfirm}
        className="flex-1 rounded-full border border-white/10 bg-[#121316] py-2.5 text-[14px] text-white/75 transition hover:bg-[#17191d] hover:text-white"
      >
        Cancel
      </button>

      <button
        type="button"
        onClick={confirmRemoveSelectedCigar}
        className="flex-1 rounded-full bg-[#c8882d] py-2.5 text-[14px] text-white transition hover:brightness-110"
      >
        Remove
      </button>
    </div>
  </div>
)}

<button
  type="button"
  onClick={openDeleteConfirm}
  disabled={deleteDisabled}
  className="rounded-full border border-[#6b4217] bg-[#1a120b] py-3 text-[15px] text-[#f0b36a] transition hover:bg-[#22170d] disabled:cursor-not-allowed disabled:opacity-50"
>
  Remove from Inventory
</button>

              </div>
            ) : (
              <div className="mx-auto flex w-full max-w-[620px] flex-col gap-3">
                <div className="rounded-[20px] border border-[#3a2a0f] bg-[linear-gradient(180deg,#111214_0%,#0c0c0d_100%)] px-5 py-8 text-center">
                  <div className="text-[10px] uppercase tracking-[0.14em] text-[#c8821f]">
                    {selectedHumidor}
                  </div>
                  <h2 className="mt-2 text-[22px] text-white">No cigars in this humidor</h2>
                  <div className="mt-2 text-[13px] text-white/55">
                    Select New Cigar to start building this humidor.
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}