<script lang="ts">
  import type { MathStep } from '../types.ts';

  let {
    step,
    isCurrent = false,
    isWaitingForInput = false,
    userInput = '',
    onUserInputChange,
    onSubmitStep,
    onRevealStep,
    onToggleHint,
    showHint = false,
    feedbackMessage = null,
    skippedNotice = null,
    status = 'pending',
  }: {
    step: MathStep;
    isCurrent?: boolean;
    isWaitingForInput?: boolean;
    userInput?: string;
    onUserInputChange?: (val: string) => void;
    onSubmitStep?: () => void;
    onRevealStep?: () => void;
    onToggleHint?: () => void;
    showHint?: boolean;
    feedbackMessage?: { type: 'success' | 'error' | 'skipped'; text: string } | null;
    skippedNotice?: string | null;
    status?: 'solved' | 'revealed' | 'skipped' | 'pending';
  } = $props();

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' && onSubmitStep) {
      onSubmitStep();
    }
  }
</script>

<div
  class="transition-all duration-300 rounded-2xl p-4 sm:p-5 border-2 {step.isFinal && !isWaitingForInput
    ? 'bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100/60 border-emerald-400 shadow-emerald-900/10 shadow-lg'
    : isWaitingForInput
    ? 'bg-white border-indigo-500 shadow-indigo-900/15 shadow-xl ring-4 ring-indigo-100'
    : isCurrent
    ? 'bg-white border-indigo-400 shadow-indigo-900/10 shadow-md ring-2 ring-indigo-300/40'
    : 'bg-white/80 border-slate-200 shadow-sm opacity-90'}"
>
  <!-- Step Header -->
  <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
    <div class="flex items-center gap-2">
      {#if step.isFinal && !isWaitingForInput}
        <span class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black tracking-wide bg-emerald-500 text-white shadow-sm">
          <span>🎉</span> FINAL RESULT
        </span>
      {:else}
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black tracking-wider {isWaitingForInput ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-700'} border border-indigo-200">
          STEP {step.stepNumber}
        </span>
      {/if}
      <h4 class="font-extrabold text-sm sm:text-base {step.isFinal && !isWaitingForInput ? 'text-emerald-950' : 'text-slate-800'}">
        {step.title}
      </h4>
    </div>

    <div class="flex items-center gap-1.5">
      {#if status === 'solved'}
        <span class="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
          <span>✅</span> Solved
        </span>
      {:else if status === 'revealed'}
        <span class="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full flex items-center gap-1">
          <span>👁️</span> Revealed
        </span>
      {:else if status === 'skipped'}
        <span class="text-xs font-bold text-amber-800 bg-amber-100/90 border border-amber-300 px-2 py-0.5 rounded-full flex items-center gap-1">
          <span>⚡</span> Skipped
        </span>
      {:else if isWaitingForInput}
        <span class="text-xs font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
          <span>✍️</span> Your Turn
        </span>
      {/if}
    </div>
  </div>

  <!-- Skipped Step Notice (if student jumped ahead) -->
  {#if skippedNotice}
    <div class="mb-3 p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-start gap-2">
      <span class="text-base leading-none">⚡</span>
      <div>
        <strong class="font-bold">Step Skipped via Mental Math:</strong>
        <div class="mt-0.5 text-amber-800">{skippedNotice}</div>
      </div>
    </div>
  {/if}

  {#if isWaitingForInput}
    <!-- Interactive Student Input Mode for this Step -->
    <div class="space-y-3 my-2">
      <div class="text-xs text-slate-600 font-medium">
        What should the equation or expression look like in this step?
      </div>

      <div class="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={userInput}
          oninput={(e) => onUserInputChange?.((e.target as HTMLInputElement).value)}
          onkeydown={handleKeyDown}
          placeholder="Type your next step here..."
          class="flex-1 h-12 px-4 rounded-xl bg-slate-50 border-2 border-indigo-300 font-mono font-bold text-base text-slate-900 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition"
        />

        <button
          type="button"
          onclick={onSubmitStep}
          class="btn-3d h-12 px-5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-sm rounded-xl border-b-4 border-indigo-900 shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>Check Step</span>
          <span>✅</span>
        </button>
      </div>

      <!-- Scaffolding Actions: Hint & Reveal -->
      <div class="flex items-center justify-between pt-1">
        <button
          type="button"
          onclick={onToggleHint}
          class="text-xs font-bold text-amber-700 hover:text-amber-800 transition flex items-center gap-1 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-lg cursor-pointer"
        >
          <span>💡</span>
          <span>{showHint ? 'Hide Hint' : 'Need a Hint?'}</span>
        </button>

        <button
          type="button"
          onclick={onRevealStep}
          class="text-xs font-bold text-slate-500 hover:text-slate-800 transition flex items-center gap-1 hover:bg-slate-100 px-2.5 py-1.5 rounded-lg cursor-pointer"
        >
          <span>👁️ Reveal Step</span>
        </button>
      </div>

      <!-- Hint Box -->
      {#if showHint}
        <div class="p-3 bg-amber-50/90 border border-amber-200 rounded-xl text-xs text-amber-950 animate-fadeIn">
          <div class="font-bold flex items-center gap-1 text-amber-800 mb-0.5">
            <span>💡 Pedagogical Hint:</span>
          </div>
          <p class="font-medium leading-relaxed">{step.rule}</p>
        </div>
      {/if}

      <!-- Error / Feedback Notice -->
      {#if feedbackMessage}
        <div class="p-3 rounded-xl text-xs flex items-center gap-2 {feedbackMessage.type === 'error'
          ? 'bg-rose-50 border border-rose-200 text-rose-800'
          : 'bg-emerald-50 border border-emerald-200 text-emerald-800'}">
          <span>{feedbackMessage.type === 'error' ? '❌' : '✅'}</span>
          <span class="font-semibold">{feedbackMessage.text}</span>
        </div>
      {/if}
    </div>
  {:else}
    <!-- Confirmed Math Display -->
    <div
      class="rounded-xl p-3.5 mb-3 font-mono font-bold text-base sm:text-lg border {step.isFinal
        ? 'bg-white text-emerald-800 border-emerald-300 shadow-inner text-center text-xl sm:text-2xl'
        : 'bg-slate-50 text-slate-900 border-slate-200 shadow-inner'}"
    >
      {step.expression}
    </div>

    <!-- Action explanation -->
    <p class="text-xs sm:text-sm text-slate-700 mb-2 font-medium leading-relaxed">
      {step.action}
    </p>

    <!-- Grade 9 Curriculum Rule Badge -->
    <div
      class="flex items-start gap-2 text-xs rounded-xl p-2.5 {step.isFinal
        ? 'bg-emerald-100/70 border border-emerald-300 text-emerald-900'
        : 'bg-amber-50/80 border border-amber-200 text-amber-900'}"
    >
      <span class="text-base leading-none">💡</span>
      <span class="font-semibold leading-normal">
        {step.rule}
      </span>
    </div>
  {/if}
</div>
