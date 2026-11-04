<script lang="ts">
  let {
    variables,
    values,
    onChange,
    onClear,
  }: {
    variables: string[];
    values: Record<string, string>;
    onChange: (varName: string, val: string) => void;
    onClear: () => void;
  } = $props();

  const hasAnyValues = $derived(
    Object.values(values).some((v) => v !== undefined && v !== null && v.trim() !== '')
  );
</script>

{#if variables.length > 0}
  <div class="bg-indigo-50/70 border border-indigo-200/90 rounded-2xl p-3.5 sm:p-4 space-y-2.5 animate-fadeIn">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-1.5">
        <span class="text-base leading-none">🔢</span>
        <h4 class="font-extrabold text-xs text-indigo-950 uppercase tracking-wider">
          Assign Variable Values <span class="text-indigo-600 font-semibold normal-case">(Optional for Evaluation)</span>
        </h4>
      </div>

      {#if hasAnyValues}
        <button
          type="button"
          onclick={onClear}
          class="text-[11px] font-bold text-indigo-700 hover:text-indigo-900 bg-white hover:bg-indigo-100 border border-indigo-200 px-2 py-0.5 rounded-lg transition active:translate-y-0.5"
        >
          Reset Values ✕
        </button>
      {/if}
    </div>

    <div class="flex flex-wrap items-center gap-2">
      {#each variables as varName}
        <div class="inline-flex items-center bg-white border-2 border-indigo-200 rounded-xl px-2.5 py-1.5 shadow-sm focus-within:border-indigo-600 focus-within:ring-2 focus-within:ring-indigo-100 transition">
          <span class="font-mono font-black text-sm text-indigo-700 mr-1.5 select-none">
            {varName} =
          </span>
          <input
            type="text"
            value={values[varName] || ''}
            oninput={(e) => onChange(varName, (e.target as HTMLInputElement).value)}
            placeholder="e.g. 5 or -2"
            class="w-20 sm:w-24 text-sm font-mono font-bold text-slate-800 bg-transparent focus:outline-none placeholder:text-slate-400 placeholder:font-normal placeholder:text-xs"
          />
        </div>
      {/each}
    </div>

    <p class="text-[11px] text-indigo-700 font-medium">
      💡 Tip: Fill in numbers above to evaluate expressions (e.g. $x = 4, y = -2$). Leave empty to solve equations or factor polynomials!
    </p>
  </div>
{/if}
