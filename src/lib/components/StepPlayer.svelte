<script lang="ts">
  import type { SolveResult } from '../types.ts';
  import StepCard from './StepCard.svelte';
  import { fireCelebrationConfetti } from '../confetti.ts';

  let {
    result,
    onReset,
  }: {
    result: SolveResult;
    onReset: () => void;
  } = $props();

  let currentStepIndex = $state(1);

  const totalSteps = $derived(result.steps.length);
  const visibleSteps = $derived(result.steps.slice(0, currentStepIndex));
  const isCompleted = $derived(currentStepIndex >= totalSteps);
  const progressPercent = $derived(
    totalSteps > 0 ? Math.min(100, Math.round((currentStepIndex / totalSteps) * 100)) : 0
  );

  function nextStep() {
    if (currentStepIndex < totalSteps) {
      currentStepIndex++;
      if (currentStepIndex === totalSteps) {
        fireCelebrationConfetti();
      }
    }
  }

  function solveAll() {
    currentStepIndex = totalSteps;
    fireCelebrationConfetti();
  }

  function handleReset() {
    currentStepIndex = 1;
    onReset();
  }
</script>

<div class="space-y-4">
  <!-- Stepper Status Header Card -->
  <div class="bg-white border-2 border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
      <div>
        <div class="text-xs font-bold uppercase tracking-wider text-slate-500 mb-0.5">
          Solving Problem
        </div>
        <div class="text-xl sm:text-2xl font-black font-mono text-slate-900">
          {result.original}
        </div>
      </div>
      <div class="flex items-center gap-2 self-start sm:self-center">
        <span class="px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 font-extrabold text-xs rounded-full">
          Step {Math.min(currentStepIndex, totalSteps)} of {totalSteps}
        </span>
        {#if isCompleted}
          <span class="px-3 py-1 bg-emerald-500 text-white font-black text-xs rounded-full shadow-sm animate-bounce">
            Solved! ⭐
          </span>
        {/if}
      </div>
    </div>

    <!-- Progress Bar -->
    <div class="w-full bg-slate-100 rounded-full h-3 border border-slate-200 overflow-hidden mb-4">
      <div
        class="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-500 ease-out"
        style="width: {progressPercent}%;"
      ></div>
    </div>

    <!-- Controls Toolbar -->
    <div class="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onclick={nextStep}
        disabled={isCompleted}
        class="btn-3d flex-1 min-w-[130px] py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white font-extrabold text-sm rounded-xl border-b-4 border-indigo-800 shadow-sm flex items-center justify-center gap-1.5 active:translate-y-1 active:border-b-0 cursor-pointer disabled:cursor-not-allowed"
      >
        <span>Next Step</span>
        <span>▶</span>
      </button>

      <button
        type="button"
        onclick={solveAll}
        disabled={isCompleted}
        class="btn-3d py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white font-extrabold text-sm rounded-xl border-b-4 border-emerald-800 shadow-sm flex items-center justify-center gap-1.5 active:translate-y-1 active:border-b-0 cursor-pointer disabled:cursor-not-allowed"
      >
        <span>Solve All</span>
        <span>⏩</span>
      </button>

      <button
        type="button"
        onclick={handleReset}
        class="btn-3d py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl border-b-4 border-slate-300 shadow-sm flex items-center justify-center gap-1.5 active:translate-y-1 active:border-b-0 cursor-pointer"
      >
        <span>Reset</span>
        <span>🔄</span>
      </button>
    </div>
  </div>

  <!-- Revealed Steps Deck -->
  <div class="space-y-3">
    {#each visibleSteps as step, idx (step.stepNumber)}
      <StepCard
        {step}
        isCurrent={idx === visibleSteps.length - 1}
      />
    {/each}
  </div>

  <!-- Success Completion Card -->
  {#if isCompleted}
    <div class="bg-emerald-50 border-2 border-emerald-400 rounded-2xl p-5 text-center shadow-md">
      <div class="text-3xl mb-1">🎉 🌟 🏆</div>
      <h3 class="text-lg font-black text-emerald-950 mb-1">Problem Mastered!</h3>
      <p class="text-xs text-emerald-800 max-w-md mx-auto mb-3">
        Every transformation strictly followed Grade 9 math rules (BEDMAS, inverse operations, and like terms).
      </p>
      <button
        type="button"
        onclick={handleReset}
        class="btn-3d px-5 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl border-b-4 border-emerald-800 hover:bg-emerald-500 shadow-sm cursor-pointer"
      >
        Try Another Problem 🚀
      </button>
    </div>
  {/if}
</div>
