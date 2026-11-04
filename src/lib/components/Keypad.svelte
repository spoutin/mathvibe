<script lang="ts">
  let {
    onInsert,
    onClear,
    onBackspace,
  }: {
    onInsert: (char: string) => void;
    onClear: () => void;
    onBackspace: () => void;
  } = $props();

  const primaryKeys = [
    { label: 'x', value: 'x', color: 'bg-indigo-600 text-white border-indigo-800 shadow-indigo-900/30' },
    { label: '(', value: '(', color: 'bg-slate-100 text-slate-700 border-slate-300' },
    { label: ')', value: ')', color: 'bg-slate-100 text-slate-700 border-slate-300' },
    { label: '^', value: '^', color: 'bg-purple-100 text-purple-700 border-purple-300' },
    { label: '÷', value: '/', color: 'bg-sky-100 text-sky-700 border-sky-300' },

    { label: '7', value: '7', color: 'bg-white text-slate-800 border-slate-200' },
    { label: '8', value: '8', color: 'bg-white text-slate-800 border-slate-200' },
    { label: '9', value: '9', color: 'bg-white text-slate-800 border-slate-200' },
    { label: '×', value: '*', color: 'bg-sky-100 text-sky-700 border-sky-300' },
    { label: '−', value: '-', color: 'bg-sky-100 text-sky-700 border-sky-300' },

    { label: '4', value: '4', color: 'bg-white text-slate-800 border-slate-200' },
    { label: '5', value: '5', color: 'bg-white text-slate-800 border-slate-200' },
    { label: '6', value: '6', color: 'bg-white text-slate-800 border-slate-200' },
    { label: '+', value: '+', color: 'bg-sky-100 text-sky-700 border-sky-300' },
    { label: '=', value: '=', color: 'bg-emerald-600 text-white border-emerald-800 shadow-emerald-900/30' },

    { label: '1', value: '1', color: 'bg-white text-slate-800 border-slate-200' },
    { label: '2', value: '2', color: 'bg-white text-slate-800 border-slate-200' },
    { label: '3', value: '3', color: 'bg-white text-slate-800 border-slate-200' },
    { label: '0', value: '0', color: 'bg-white text-slate-800 border-slate-200' },
    { label: '.', value: '.', color: 'bg-white text-slate-800 border-slate-200' },
  ];
</script>

<div class="bg-slate-50 border-2 border-slate-200 rounded-2xl p-3 shadow-inner">
  <div class="flex items-center justify-between mb-2 px-1">
    <span class="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
      <span>⌨️</span> Math Keypad
    </span>
    <div class="flex gap-1.5">
      <button
        type="button"
        onclick={onBackspace}
        class="btn-3d px-3 py-1 bg-amber-100 hover:bg-amber-200 text-amber-800 text-xs font-bold rounded-lg border-b-2 border-amber-300 shadow-sm active:translate-y-0.5 active:shadow-none"
      >
        ⌫ Delete
      </button>
      <button
        type="button"
        onclick={onClear}
        class="btn-3d px-3 py-1 bg-rose-100 hover:bg-rose-200 text-rose-700 text-xs font-bold rounded-lg border-b-2 border-rose-300 shadow-sm active:translate-y-0.5 active:shadow-none"
      >
        Clear
      </button>
    </div>
  </div>

  <div class="grid grid-cols-5 gap-1.5">
    {#each primaryKeys as key}
      <button
        type="button"
        onclick={() => onInsert(key.value)}
        class="btn-3d {key.color} h-11 rounded-xl font-bold font-mono text-base border-b-4 flex items-center justify-center transition hover:brightness-105 active:translate-y-1 active:border-b-0"
      >
        {key.label}
      </button>
    {/each}
  </div>
</div>
