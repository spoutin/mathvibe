<script lang="ts">
  import type { MathStep } from '../types.ts';

  let {
    step,
    isCurrent = false,
  }: {
    step: MathStep;
    isCurrent?: boolean;
  } = $props();
</script>

<div
  class="transition-all duration-300 rounded-2xl p-4 sm:p-5 border-2 {step.isFinal
    ? 'bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100/60 border-emerald-400 shadow-emerald-900/10 shadow-lg'
    : isCurrent
    ? 'bg-white border-indigo-400 shadow-indigo-900/10 shadow-md ring-2 ring-indigo-300/40'
    : 'bg-white/80 border-slate-200 shadow-sm opacity-90'}"
>
  <!-- Step Header -->
  <div class="flex items-center justify-between mb-3">
    <div class="flex items-center gap-2">
      {#if step.isFinal}
        <span class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black tracking-wide bg-emerald-500 text-white shadow-sm">
          <span>🎉</span> FINAL RESULT
        </span>
      {:else}
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-black tracking-wider bg-indigo-100 text-indigo-700 border border-indigo-200">
          STEP {step.stepNumber}
        </span>
      {/if}
      <h4 class="font-extrabold text-sm sm:text-base {step.isFinal ? 'text-emerald-950' : 'text-slate-800'}">
        {step.title}
      </h4>
    </div>
    {#if isCurrent && !step.isFinal}
      <span class="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md flex items-center gap-1 animate-pulse">
        <span>⚡</span> Active
      </span>
    {/if}
  </div>

  <!-- Expression Box -->
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
</div>
