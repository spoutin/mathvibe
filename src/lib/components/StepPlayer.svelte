<script lang="ts">
  import type { SolveResult } from '../types.ts';
  import StepCard from './StepCard.svelte';
  import { validateStepMultiPath } from '../math/validator.ts';
  import { fireCelebrationConfetti } from '../confetti.ts';

  let {
    result,
    onReset,
    externalInput = '',
    onInputUpdate,
  }: {
    result: SolveResult;
    onReset: () => void;
    externalInput?: string;
    onInputUpdate?: (val: string) => void;
  } = $props();

  let activeSteps = $state<MathStep[]>([]);
  let activeStrategyLabel = $state('');
  let currentStepIndex = $state(0);
  let studentInput = $state('');
  let showHint = $state(false);
  let feedbackMessage = $state<{ type: 'success' | 'error' | 'skipped'; text: string } | null>(null);
  let stepStatuses = $state<('solved' | 'revealed' | 'skipped' | 'pending')[]>([]);
  let skippedNotices = $state<Record<number, string>>({});

  $effect(() => {
    if (result) {
      activeSteps = result.steps;
      activeStrategyLabel = result.strategyLabel || '';
      currentStepIndex = 0;
      studentInput = '';
      showHint = false;
      feedbackMessage = null;
      stepStatuses = new Array(result.steps.length).fill('pending');
      skippedNotices = {};
    }
  });

  // Sync external input (e.g. from keypad)
  $effect(() => {
    if (externalInput !== undefined && externalInput !== studentInput) {
      studentInput = externalInput;
    }
  });

  const totalSteps = $derived(activeSteps.length);
  const isCompleted = $derived(currentStepIndex >= totalSteps);
  // Show all steps up to currentStepIndex (inclusive)
  const visibleSteps = $derived(
    activeSteps.slice(0, Math.min(totalSteps, currentStepIndex + 1))
  );
  const progressPercent = $derived(
    totalSteps > 0 ? Math.min(100, Math.round((currentStepIndex / totalSteps) * 100)) : 0
  );

  function handleInputChange(val: string) {
    studentInput = val;
    feedbackMessage = null;
    onInputUpdate?.(val);
  }

  function submitCurrentStep() {
    if (!studentInput.trim()) return;

    const validation = validateStepMultiPath(
      studentInput,
      currentStepIndex,
      activeSteps,
      result.paths
    );

    // If student selected an alternative valid path on step 1
    if (validation.switchedPath) {
      activeSteps = validation.switchedPath.steps;
      activeStrategyLabel = validation.switchedPath.strategyLabel;
      stepStatuses = new Array(activeSteps.length).fill('pending');
      stepStatuses[0] = 'solved';
      feedbackMessage = {
        type: 'success',
        text: validation.message,
      };
      studentInput = '';
      onInputUpdate?.('');
      showHint = false;
      currentStepIndex = 1;

      if (currentStepIndex >= activeSteps.length) {
        fireCelebrationConfetti();
      }
      return;
    }

    if (validation.status === 'correct') {
      stepStatuses[currentStepIndex] = 'solved';
      feedbackMessage = null;
      studentInput = '';
      onInputUpdate?.('');
      showHint = false;
      currentStepIndex++;

      if (currentStepIndex >= totalSteps) {
        fireCelebrationConfetti();
      }
    } else if (validation.status === 'skipped' && validation.matchedStepIndex !== undefined) {
      // Mark skipped intermediate steps
      const targetIdx = validation.matchedStepIndex;
      for (let j = currentStepIndex; j < targetIdx; j++) {
        stepStatuses[j] = 'skipped';
      }

      if (validation.skippedSteps && validation.skippedSteps.length > 0) {
        const skippedSummary = validation.skippedSteps.map((s) => s.expression).join(' ➔ ');
        skippedNotices[targetIdx] = skippedSummary;
      }

      stepStatuses[targetIdx] = 'solved';
      feedbackMessage = null;
      studentInput = '';
      onInputUpdate?.('');
      showHint = false;
      currentStepIndex = targetIdx + 1;

      if (currentStepIndex >= totalSteps) {
        fireCelebrationConfetti();
      }
    } else {
      feedbackMessage = {
        type: 'error',
        text: validation.message,
      };
    }
  }

  function revealCurrentStep() {
    stepStatuses[currentStepIndex] = 'revealed';
    feedbackMessage = null;
    studentInput = '';
    onInputUpdate?.('');
    showHint = false;
    currentStepIndex++;

    if (currentStepIndex >= totalSteps) {
      fireCelebrationConfetti();
    }
  }

  function solveAllRemaining() {
    for (let j = currentStepIndex; j < totalSteps; j++) {
      stepStatuses[j] = 'revealed';
    }
    currentStepIndex = totalSteps;
    studentInput = '';
    onInputUpdate?.('');
    feedbackMessage = null;
    fireCelebrationConfetti();
  }

  function handleResetAll() {
    activeSteps = result.steps;
    activeStrategyLabel = result.strategyLabel || '';
    currentStepIndex = 0;
    studentInput = '';
    onInputUpdate?.('');
    showHint = false;
    feedbackMessage = null;
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
      <div class="flex flex-wrap items-center gap-2 self-start sm:self-center">
        {#if activeStrategyLabel}
          <span class="px-2.5 py-1 bg-purple-50 border border-purple-200 text-purple-700 font-extrabold text-xs rounded-full flex items-center gap-1 shadow-sm">
            <span>🧭</span>
            <span>{activeStrategyLabel}</span>
          </span>
        {/if}
        <span class="px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 font-extrabold text-xs rounded-full">
          Step {Math.min(currentStepIndex + 1, totalSteps)} of {totalSteps}
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
    <div class="flex flex-wrap items-center justify-between gap-2">
      <div class="flex items-center gap-2">
        <span class="text-xs font-bold text-slate-600">
          ✍️ Student Practice Mode
        </span>
      </div>

      <div class="flex items-center gap-2">
        <button
          type="button"
          onclick={solveAllRemaining}
          disabled={isCompleted}
          class="btn-3d py-2 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 font-bold text-xs rounded-xl border-b-2 border-slate-300 shadow-sm flex items-center gap-1 active:translate-y-0.5 cursor-pointer disabled:cursor-not-allowed"
        >
          <span>Solve All</span>
          <span>⏩</span>
        </button>

        <button
          type="button"
          onclick={handleResetAll}
          class="btn-3d py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border-b-2 border-slate-300 shadow-sm flex items-center gap-1 active:translate-y-0.5 cursor-pointer"
        >
          <span>Reset</span>
          <span>🔄</span>
        </button>
      </div>
    </div>
  </div>

  <!-- Revealed / Active Steps Deck -->
  <div class="space-y-3">
    {#each visibleSteps as step, idx (step.stepNumber)}
      <StepCard
        {step}
        isCurrent={idx === currentStepIndex}
        isWaitingForInput={idx === currentStepIndex && !isCompleted}
        userInput={studentInput}
        onUserInputChange={handleInputChange}
        onSubmitStep={submitCurrentStep}
        onRevealStep={revealCurrentStep}
        onToggleHint={() => (showHint = !showHint)}
        {showHint}
        {feedbackMessage}
        skippedNotice={skippedNotices[idx] || null}
        status={stepStatuses[idx] || 'pending'}
      />
    {/each}
  </div>

  <!-- Success Completion Card -->
  {#if isCompleted}
    <div class="bg-emerald-50 border-2 border-emerald-400 rounded-2xl p-5 text-center shadow-md animate-fadeIn">
      <div class="text-3xl mb-1">🎉 🌟 🏆</div>
      <h3 class="text-lg font-black text-emerald-950 mb-1">Problem Mastered!</h3>
      <p class="text-xs text-emerald-800 max-w-md mx-auto mb-3">
        Every step was checked and solved following Grade 9 curriculum rules.
      </p>
      <button
        type="button"
        onclick={handleResetAll}
        class="btn-3d px-5 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl border-b-4 border-emerald-800 hover:bg-emerald-500 shadow-sm cursor-pointer"
      >
        Try Another Problem 🚀
      </button>
    </div>
  {/if}
</div>
