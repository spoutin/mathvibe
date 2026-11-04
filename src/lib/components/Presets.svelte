<script lang="ts">
  import { GRADE_9_PRESETS } from '../presets-data.ts';

  let { onSelect }: { onSelect: (formula: string) => void } = $props();

  let activeCategory = $state<'all' | 'equations' | 'simplifying' | 'fractions' | 'calculator'>('all');

  const categories = [
    { id: 'all', label: 'All Presets', icon: '✨' },
    { id: 'equations', label: 'Linear Equations', icon: '🎯' },
    { id: 'simplifying', label: 'Simplifying', icon: '🧩' },
    { id: 'fractions', label: 'Fractions', icon: '🍰' },
    { id: 'calculator', label: 'BEDMAS Calc', icon: '🧮' },
  ] as const;

  const filteredPresets = $derived(
    activeCategory === 'all'
      ? GRADE_9_PRESETS
      : GRADE_9_PRESETS.filter((p) => p.category === activeCategory)
  );
</script>

<div class="bg-white border-2 border-slate-200/80 rounded-2xl p-4 shadow-sm">
  <div class="flex items-center justify-between mb-3">
    <div class="flex items-center gap-2">
      <span class="text-xl">📚</span>
      <h3 class="font-extrabold text-slate-800 text-sm tracking-tight">Grade 9 Practice Library</h3>
    </div>
    <span class="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
      Click to load
    </span>
  </div>

  <!-- Category Pills -->
  <div class="flex flex-wrap gap-1.5 mb-3">
    {#each categories as cat}
      <button
        type="button"
        onclick={() => (activeCategory = cat.id)}
        class="text-xs font-bold px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 border {activeCategory === cat.id
          ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm'
          : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'}"
      >
        <span>{cat.icon}</span>
        <span>{cat.label}</span>
      </button>
    {/each}
  </div>

  <!-- Preset Problem Grid -->
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
    {#each filteredPresets as preset}
      <button
        type="button"
        onclick={() => onSelect(preset.formula)}
        class="text-left p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-indigo-50/70 hover:border-indigo-300 transition-all group flex flex-col justify-between"
      >
        <div class="flex items-center justify-between gap-2 mb-1">
          <span class="font-mono font-bold text-sm text-slate-900 group-hover:text-indigo-600">
            {preset.label}
          </span>
          <span class="text-xs text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity font-bold">
            Load ↵
          </span>
        </div>
        <p class="text-xs text-slate-600 line-clamp-1">
          {preset.description}
        </p>
      </button>
    {/each}
  </div>
</div>
