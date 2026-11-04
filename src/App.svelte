<script lang="ts">
  import { solveGrade9Math } from './lib/math/engine.ts';
  import type { SolveResult } from './lib/types.ts';
  import Keypad from './lib/components/Keypad.svelte';
  import Presets from './lib/components/Presets.svelte';
  import StepPlayer from './lib/components/StepPlayer.svelte';
  import ScientificCalculatorModal from './lib/components/ScientificCalculatorModal.svelte';
  import VariableInputs from './lib/components/VariableInputs.svelte';

  let formula = $state('3x + 7 = 22');
  let result = $state<SolveResult | null>(null);
  let showKeypad = $state(false);
  let showScientificModal = $state(false);
  let inputRef = $state<HTMLInputElement | null>(null);
  let activeStepInput = $state('');
  let variableValues = $state<Record<string, string>>({});

  const detectedVariables = $derived.by(() => {
    const letters = formula.match(/[a-zA-Z]/g) || [];
    return Array.from(new Set(letters)).sort();
  });

  function executeSolve() {
    if (!formula.trim()) return;
    activeStepInput = '';
    result = solveGrade9Math(formula, variableValues);
  }

  function handleVariableChange(varName: string, val: string) {
    variableValues[varName] = val;
  }

  function handleClearVariables() {
    variableValues = {};
  }

  function handleKeypadInsert(char: string) {
    if (result && result.success) {
      activeStepInput += char;
    } else {
      formula += char;
      if (inputRef) inputRef.focus();
    }
  }

  function handleKeypadClear() {
    if (result && result.success) {
      activeStepInput = '';
    } else {
      formula = '';
      result = null;
      if (inputRef) inputRef.focus();
    }
  }

  function handleKeypadBackspace() {
    if (result && result.success) {
      if (activeStepInput.length > 0) {
        activeStepInput = activeStepInput.slice(0, -1);
      }
    } else {
      if (formula.length > 0) {
        formula = formula.slice(0, -1);
      }
      if (inputRef) inputRef.focus();
    }
  }

  function handlePresetSelect(presetFormula: string) {
    formula = presetFormula;
    activeStepInput = '';
    executeSolve();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleReset() {
    result = null;
    activeStepInput = '';
    if (inputRef) {
      inputRef.focus();
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      executeSolve();
    }
  }
</script>

<div class="min-h-screen bg-gradient-to-b from-amber-50/70 via-slate-50 to-indigo-50/40 text-slate-900 flex flex-col justify-between">
  <!-- Header Navbar -->
  <header class="border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-30">
    <div class="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
      <div class="flex items-center gap-2.5">
        <div class="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-xl text-white shadow-sm border-b-2 border-indigo-800">
          ⚡
        </div>
        <div>
          <h1 class="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 leading-tight flex items-center gap-1.5">
            Grade 9 Math Quest
            <span class="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-bold border border-indigo-200">
              Interactive Practice
            </span>
          </h1>
          <p class="text-xs text-slate-500 font-medium">Step-by-Step Solver &amp; Self-Validation</p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button
          type="button"
          onclick={() => (showScientificModal = true)}
          class="btn-3d px-3.5 py-2 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 hover:from-indigo-500 hover:to-purple-600 text-white font-black text-xs sm:text-sm rounded-xl border-b-2 border-indigo-950 shadow-md flex items-center gap-1.5 cursor-pointer active:translate-y-0.5"
          aria-label="Open Scientific Calculator"
          title="Open Scientific Calculator"
        >
          <span class="text-base leading-none">🧮</span>
          <span>Scientific Calc</span>
        </button>

        <span class="hidden md:inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-100/90 text-emerald-800 border border-emerald-300 shadow-sm">
          <span>✍️</span> Student Mode
        </span>
      </div>
    </div>
  </header>

  <!-- Main Content Container -->
  <main class="max-w-3xl w-full mx-auto px-4 py-6 sm:py-8 flex-1 space-y-6">
    <!-- Equation Input Bar -->
    <section class="bg-white border-2 border-slate-200 rounded-3xl p-4 sm:p-6 shadow-sm space-y-4">
      <div class="flex items-center justify-between">
        <label for="math-input" class="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
          <span>🎯</span> Enter Grade 9 Formula or Equation
        </label>
        <button
          type="button"
          onclick={() => (showKeypad = !showKeypad)}
          class="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg border border-indigo-200 cursor-pointer"
        >
          <span>⌨️</span>
          <span>{showKeypad ? 'Hide Keypad' : 'Math Keypad'}</span>
        </button>
      </div>

      <!-- Formula Input & Execute Button -->
      <div class="flex flex-col sm:flex-row gap-2.5">
        <div class="relative flex-1">
          <input
            id="math-input"
            bind:this={inputRef}
            type="text"
            bind:value={formula}
            onkeydown={handleKeyDown}
            placeholder="e.g. 3x + 7 = 22, 2(x - 3) = 14, or (12 - 4) * 3"
            class="w-full h-14 pl-4 pr-10 rounded-2xl bg-slate-50 border-2 border-slate-200 text-slate-900 font-mono font-bold text-lg sm:text-xl focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100 transition-all placeholder:text-slate-400 placeholder:font-normal placeholder:text-sm"
          />
          {#if formula}
            <button
              type="button"
              onclick={() => { formula = ''; if (inputRef) inputRef.focus(); }}
              class="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 font-bold text-sm p-1 rounded-full hover:bg-slate-200 transition"
              title="Clear"
            >
              ✕
            </button>
          {/if}
        </div>

        <button
          type="button"
          onclick={executeSolve}
          class="btn-3d h-14 px-7 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-base rounded-2xl border-b-4 border-indigo-900 shadow-md flex items-center justify-center gap-2 shrink-0 cursor-pointer"
        >
          <span>Start Practice</span>
          <span>🚀</span>
        </button>
      </div>

      <!-- Variable Assignment Chips (when variables detected in formula) -->
      {#if detectedVariables.length > 0}
        <VariableInputs
          variables={detectedVariables}
          values={variableValues}
          onChange={handleVariableChange}
          onClear={handleClearVariables}
        />
      {/if}

      <!-- Collapsible Keypad -->
      {#if showKeypad}
        <div class="pt-2">
          <Keypad
            onInsert={handleKeypadInsert}
            onClear={handleKeypadClear}
            onBackspace={handleKeypadBackspace}
          />
        </div>
      {/if}
    </section>

    <!-- Error State Display -->
    {#if result && !result.success}
      <div class="bg-rose-50 border-2 border-rose-300 rounded-2xl p-4 sm:p-5 shadow-sm text-rose-900 flex items-start gap-3">
        <span class="text-2xl leading-none">⚠️</span>
        <div>
          <h4 class="font-extrabold text-sm mb-1">Notice</h4>
          <p class="text-xs sm:text-sm font-medium leading-relaxed">{result.error}</p>
          <p class="text-xs text-rose-700 mt-2">
            💡 Tip: Try clicking one of the preset practice problems below to see working examples.
          </p>
        </div>
      </div>
    {/if}

    <!-- Active Step Player -->
    {#if result && result.success}
      <section class="space-y-4">
        {#key result}
          <StepPlayer
            {result}
            onReset={handleReset}
            externalInput={activeStepInput}
            onInputUpdate={(val) => (activeStepInput = val)}
          />
        {/key}
      </section>
    {:else if !result}
      <!-- Empty Welcome / Intro State -->
      <section class="bg-white/70 border-2 border-slate-200/90 rounded-3xl p-6 sm:p-8 text-center shadow-sm space-y-5">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-indigo-50 text-3xl border border-indigo-200 mb-1">
          ✍️
        </div>
        <div class="max-w-md mx-auto space-y-2">
          <h2 class="text-xl sm:text-2xl font-black text-slate-900">
            Practice Grade 9 Math Step by Step
          </h2>
          <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Test your skills by typing each intermediate step. The solver validates your answer in real time, alerts you if you skipped ahead, and offers hints when needed.
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-left">
          <div class="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-3.5">
            <span class="text-xl">✅</span>
            <h4 class="font-bold text-xs text-indigo-950 mt-1 mb-0.5">Real-Time Validation</h4>
            <p class="text-[11px] text-indigo-800">
              Type your next algebraic move and verify it immediately.
            </p>
          </div>

          <div class="bg-amber-50/70 border border-amber-200 rounded-2xl p-3.5">
            <span class="text-xl">⚡</span>
            <h4 class="font-bold text-xs text-amber-950 mt-1 mb-0.5">Skipped-Step Intelligence</h4>
            <p class="text-[11px] text-amber-800">
              Did mental math? It recognizes valid future steps and flags what was jumped.
            </p>
          </div>

          <div class="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-3.5">
            <span class="text-xl">💡</span>
            <h4 class="font-bold text-xs text-emerald-950 mt-1 mb-0.5">Scaffolding &amp; Hints</h4>
            <p class="text-[11px] text-emerald-800">
              Never get stuck with on-demand curriculum hints and step reveals.
            </p>
          </div>
        </div>
      </section>
    {/if}

    <!-- Grade 9 Preset Library -->
    <section>
      <Presets onSelect={handlePresetSelect} />
    </section>
  </main>

  <!-- Footer -->
  <footer class="border-t border-slate-200/80 bg-white/60 py-4 text-center text-xs text-slate-500 font-medium">
    <div class="max-w-3xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
      <span>Built with ⚡ Svelte 5 + Vite + Tailwind CSS</span>
      <span class="text-slate-400">High School Grade 9 Pedagogical Standards</span>
    </div>
  </footer>

  <!-- Scientific Calculator Modal -->
  {#if showScientificModal}
    <ScientificCalculatorModal
      onClose={() => (showScientificModal = false)}
      onInsert={(calcResult) => {
        if (result && result.success) {
          activeStepInput += calcResult;
        } else {
          formula += calcResult;
          if (inputRef) inputRef.focus();
        }
      }}
    />
  {/if}
</div>
