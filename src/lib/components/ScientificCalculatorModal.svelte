<script lang="ts">
  import { evaluateScientific } from '../math/scientific.ts';

  let {
    onClose,
    onInsert,
  }: {
    onClose: () => void;
    onInsert?: (value: string) => void;
  } = $props();

  let expression = $state('');
  let resultDisplay = $state('0');
  let angleMode = $state<'deg' | 'rad'>('deg');
  let isInverse = $state(false);
  let lastAns = $state(0);
  let copyFeedback = $state(false);

  function append(str: string) {
    expression += str;
    livePreview();
  }

  function appendFunc(fn: string) {
    expression += `${fn}(`;
  }

  function handleClear() {
    expression = '';
    resultDisplay = '0';
  }

  function handleBackspace() {
    if (expression.length > 0) {
      expression = expression.slice(0, -1);
      livePreview();
    }
  }

  function livePreview() {
    if (!expression.trim()) {
      resultDisplay = '0';
      return;
    }
    const res = evaluateScientific(expression, angleMode, lastAns);
    if (res.success) {
      resultDisplay = res.display;
    }
  }

  function evaluate() {
    if (!expression.trim()) return;
    const res = evaluateScientific(expression, angleMode, lastAns);
    if (res.success) {
      resultDisplay = res.display;
      lastAns = res.result;
    } else {
      resultDisplay = res.error || 'Error';
    }
  }

  function toggleAngleMode() {
    angleMode = angleMode === 'deg' ? 'rad' : 'deg';
    if (expression) livePreview();
  }

  const isDisplayValid = $derived(
    resultDisplay !== 'Error' &&
    !resultDisplay.toLowerCase().includes('error') &&
    !resultDisplay.toLowerCase().includes('undefined') &&
    resultDisplay !== 'NaN' &&
    resultDisplay !== 'Infinity'
  );

  function copyToClipboard() {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(resultDisplay).then(() => {
        copyFeedback = true;
        setTimeout(() => {
          copyFeedback = false;
        }, 1500);
      }).catch(() => {});
    }
  }

  function handleInsert() {
    if (onInsert && isDisplayValid) {
      onInsert(resultDisplay);
      onClose();
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      evaluate();
    } else if (e.key === 'Backspace') {
      handleBackspace();
    } else if (/^[0-9]$/.test(e.key) || e.key === '.') {
      append(e.key);
    } else if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/' || e.key === '^' || e.key === '(' || e.key === ')' || e.key === '%' || e.key === '!') {
      append(e.key);
    }
  }
</script>

<svelte:window onkeydown={handleKeyDown} />

<!-- Modal Backdrop Overlay -->
<div
  class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn"
>
  <!-- Background Dismiss Button -->
  <button
    type="button"
    class="fixed inset-0 w-full h-full cursor-default -z-10 bg-transparent border-0"
    onclick={onClose}
    aria-label="Close modal"
    tabindex="-1"
  ></button>

  <!-- Modal Content Container -->
  <div
    class="bg-white border-2 border-slate-300 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto relative z-10"
    role="dialog"
    aria-modal="true"
    aria-label="Scientific Calculator"
    tabindex="-1"
  >
    <!-- Modal Header -->
    <div class="px-5 py-3.5 bg-slate-100/90 border-b border-slate-200 flex items-center justify-between">
      <div class="flex items-center gap-2.5">
        <span class="text-xl">🧮</span>
        <div>
          <h3 class="font-black text-sm text-slate-800 tracking-tight">Scientific Calculator</h3>
          <p class="text-[11px] text-slate-500 font-medium">Ad-hoc High School Calculations</p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button
          type="button"
          onclick={toggleAngleMode}
          class="btn-3d px-2.5 py-1 text-xs font-black rounded-lg border border-slate-300 {angleMode === 'deg'
            ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm'
            : 'bg-white text-slate-700'}"
        >
          {angleMode.toUpperCase()}
        </button>

        <button
          type="button"
          onclick={onClose}
          class="w-8 h-8 rounded-full bg-slate-200 hover:bg-rose-100 hover:text-rose-600 font-black text-sm text-slate-600 flex items-center justify-center transition"
          aria-label="Close Calculator"
        >
          ✕
        </button>
      </div>
    </div>

    <!-- Screen Display Area -->
    <div class="p-4 bg-slate-900 text-white font-mono flex flex-col justify-end min-h-[96px] text-right border-b border-slate-800 shadow-inner">
      <div class="text-xs text-slate-400 overflow-x-auto whitespace-nowrap min-h-[1.25rem]">
        {expression || ' '}
      </div>
      <div class="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight overflow-x-auto whitespace-nowrap">
        {resultDisplay}
      </div>
    </div>

    <!-- Keypad Matrix -->
    <div class="p-3 sm:p-4 bg-slate-50/70 grid grid-cols-6 gap-1.5 text-xs font-bold">
      <!-- Row 1: Trig Functions -->
      <button
        type="button"
        onclick={() => (isInverse = !isInverse)}
        class="btn-3d h-10 rounded-xl {isInverse ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'} border border-slate-300 active:translate-y-0.5"
      >
        INV
      </button>

      <button
        type="button"
        onclick={() => appendFunc(isInverse ? 'asin' : 'sin')}
        class="btn-3d h-10 rounded-xl bg-purple-100 text-purple-900 border border-purple-200 hover:bg-purple-200 active:translate-y-0.5"
      >
        {isInverse ? 'sin⁻¹' : 'sin'}
      </button>

      <button
        type="button"
        onclick={() => appendFunc(isInverse ? 'acos' : 'cos')}
        class="btn-3d h-10 rounded-xl bg-purple-100 text-purple-900 border border-purple-200 hover:bg-purple-200 active:translate-y-0.5"
      >
        {isInverse ? 'cos⁻¹' : 'cos'}
      </button>

      <button
        type="button"
        onclick={() => appendFunc(isInverse ? 'atan' : 'tan')}
        class="btn-3d h-10 rounded-xl bg-purple-100 text-purple-900 border border-purple-200 hover:bg-purple-200 active:translate-y-0.5"
      >
        {isInverse ? 'tan⁻¹' : 'tan'}
      </button>

      <button
        type="button"
        onclick={() => append('pi')}
        class="btn-3d h-10 rounded-xl bg-slate-200 text-slate-800 border border-slate-300 hover:bg-slate-300 active:translate-y-0.5"
      >
        π
      </button>

      <button
        type="button"
        onclick={() => append('e')}
        class="btn-3d h-10 rounded-xl bg-slate-200 text-slate-800 border border-slate-300 hover:bg-slate-300 active:translate-y-0.5"
      >
        e
      </button>

      <!-- Row 2: Logs & Roots -->
      <button
        type="button"
        onclick={() => appendFunc('ln')}
        class="btn-3d h-10 rounded-xl bg-purple-100 text-purple-900 border border-purple-200 hover:bg-purple-200 active:translate-y-0.5"
      >
        ln
      </button>

      <button
        type="button"
        onclick={() => appendFunc('log')}
        class="btn-3d h-10 rounded-xl bg-purple-100 text-purple-900 border border-purple-200 hover:bg-purple-200 active:translate-y-0.5"
      >
        log
      </button>

      <button
        type="button"
        onclick={() => appendFunc('sqrt')}
        class="btn-3d h-10 rounded-xl bg-purple-100 text-purple-900 border border-purple-200 hover:bg-purple-200 active:translate-y-0.5"
      >
        √
      </button>

      <button
        type="button"
        onclick={() => appendFunc('cbrt')}
        class="btn-3d h-10 rounded-xl bg-purple-100 text-purple-900 border border-purple-200 hover:bg-purple-200 active:translate-y-0.5"
      >
        ∛
      </button>

      <button
        type="button"
        onclick={() => append('^2')}
        class="btn-3d h-10 rounded-xl bg-purple-100 text-purple-900 border border-purple-200 hover:bg-purple-200 active:translate-y-0.5"
      >
        x²
      </button>

      <button
        type="button"
        onclick={() => append('^')}
        class="btn-3d h-10 rounded-xl bg-purple-100 text-purple-900 border border-purple-200 hover:bg-purple-200 active:translate-y-0.5"
      >
        xʸ
      </button>

      <!-- Row 3: Math Utils & Parentheses -->
      <button
        type="button"
        onclick={() => append('(')}
        class="btn-3d h-10 rounded-xl bg-slate-200 text-slate-800 border border-slate-300 hover:bg-slate-300 active:translate-y-0.5"
      >
        (
      </button>

      <button
        type="button"
        onclick={() => append(')')}
        class="btn-3d h-10 rounded-xl bg-slate-200 text-slate-800 border border-slate-300 hover:bg-slate-300 active:translate-y-0.5"
      >
        )
      </button>

      <button
        type="button"
        onclick={() => append('!')}
        class="btn-3d h-10 rounded-xl bg-purple-100 text-purple-900 border border-purple-200 hover:bg-purple-200 active:translate-y-0.5"
      >
        n!
      </button>

      <button
        type="button"
        onclick={() => appendFunc('abs')}
        class="btn-3d h-10 rounded-xl bg-purple-100 text-purple-900 border border-purple-200 hover:bg-purple-200 active:translate-y-0.5"
      >
        |x|
      </button>

      <button
        type="button"
        onclick={handleBackspace}
        class="btn-3d h-10 rounded-xl bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200 active:translate-y-0.5"
      >
        ⌫
      </button>

      <button
        type="button"
        onclick={handleClear}
        class="btn-3d h-10 rounded-xl bg-rose-100 text-rose-800 border border-rose-300 hover:bg-rose-200 active:translate-y-0.5"
      >
        AC
      </button>

      <!-- Row 4: Digits 7, 8, 9 & Ops -->
      <button
        type="button"
        onclick={() => append('7')}
        class="btn-3d h-11 rounded-xl bg-white text-slate-900 border border-slate-300 text-base shadow-sm active:translate-y-0.5"
      >
        7
      </button>
      <button
        type="button"
        onclick={() => append('8')}
        class="btn-3d h-11 rounded-xl bg-white text-slate-900 border border-slate-300 text-base shadow-sm active:translate-y-0.5"
      >
        8
      </button>
      <button
        type="button"
        onclick={() => append('9')}
        class="btn-3d h-11 rounded-xl bg-white text-slate-900 border border-slate-300 text-base shadow-sm active:translate-y-0.5"
      >
        9
      </button>
      <button
        type="button"
        onclick={() => append('%')}
        class="btn-3d h-11 rounded-xl bg-sky-100 text-sky-900 border border-sky-300 text-base active:translate-y-0.5"
      >
        %
      </button>
      <button
        type="button"
        onclick={() => append('/')}
        class="btn-3d h-11 rounded-xl bg-sky-100 text-sky-900 border border-sky-300 text-base active:translate-y-0.5"
      >
        ÷
      </button>
      <button
        type="button"
        onclick={() => append('*')}
        class="btn-3d h-11 rounded-xl bg-sky-100 text-sky-900 border border-sky-300 text-base active:translate-y-0.5"
      >
        ×
      </button>

      <!-- Row 5: Digits 4, 5, 6 & Ops -->
      <button
        type="button"
        onclick={() => append('4')}
        class="btn-3d h-11 rounded-xl bg-white text-slate-900 border border-slate-300 text-base shadow-sm active:translate-y-0.5"
      >
        4
      </button>
      <button
        type="button"
        onclick={() => append('5')}
        class="btn-3d h-11 rounded-xl bg-white text-slate-900 border border-slate-300 text-base shadow-sm active:translate-y-0.5"
      >
        5
      </button>
      <button
        type="button"
        onclick={() => append('6')}
        class="btn-3d h-11 rounded-xl bg-white text-slate-900 border border-slate-300 text-base shadow-sm active:translate-y-0.5"
      >
        6
      </button>
      <button
        type="button"
        onclick={() => append('Ans')}
        class="btn-3d h-11 rounded-xl bg-slate-200 text-slate-800 border border-slate-300 active:translate-y-0.5"
      >
        Ans
      </button>
      <button
        type="button"
        onclick={() => append('-')}
        class="btn-3d h-11 rounded-xl bg-sky-100 text-sky-900 border border-sky-300 text-base active:translate-y-0.5"
      >
        −
      </button>
      <button
        type="button"
        onclick={() => append('+')}
        class="btn-3d h-11 rounded-xl bg-sky-100 text-sky-900 border border-sky-300 text-base active:translate-y-0.5"
      >
        +
      </button>

      <!-- Row 6: Digits 1, 2, 3, 0, ., = -->
      <button
        type="button"
        onclick={() => append('1')}
        class="btn-3d h-11 rounded-xl bg-white text-slate-900 border border-slate-300 text-base shadow-sm active:translate-y-0.5"
      >
        1
      </button>
      <button
        type="button"
        onclick={() => append('2')}
        class="btn-3d h-11 rounded-xl bg-white text-slate-900 border border-slate-300 text-base shadow-sm active:translate-y-0.5"
      >
        2
      </button>
      <button
        type="button"
        onclick={() => append('3')}
        class="btn-3d h-11 rounded-xl bg-white text-slate-900 border border-slate-300 text-base shadow-sm active:translate-y-0.5"
      >
        3
      </button>
      <button
        type="button"
        onclick={() => append('0')}
        class="btn-3d h-11 rounded-xl bg-white text-slate-900 border border-slate-300 text-base shadow-sm active:translate-y-0.5"
      >
        0
      </button>
      <button
        type="button"
        onclick={() => append('.')}
        class="btn-3d h-11 rounded-xl bg-white text-slate-900 border border-slate-300 text-base shadow-sm active:translate-y-0.5"
      >
        .
      </button>
      <button
        type="button"
        onclick={evaluate}
        class="btn-3d h-11 rounded-xl bg-emerald-600 text-white font-black border-b-4 border-emerald-800 text-lg shadow-md active:translate-y-0.5 active:border-b-0"
      >
        =
      </button>
    </div>

    <!-- Modal Footer Actions -->
    <div class="px-5 py-3.5 bg-slate-100 border-t border-slate-200 flex items-center justify-between gap-2">
      <button
        type="button"
        onclick={copyToClipboard}
        class="btn-3d px-3.5 py-2 bg-white text-slate-700 font-bold text-xs rounded-xl border border-slate-300 shadow-sm flex items-center gap-1.5 active:translate-y-0.5"
      >
        <span>{copyFeedback ? 'Copied! ✓' : 'Copy 📋'}</span>
      </button>

      <button
        type="button"
        onclick={handleInsert}
        disabled={!isDisplayValid}
        class="btn-3d px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white font-extrabold text-xs rounded-xl border-b-4 border-indigo-900 shadow-sm flex items-center gap-1.5 active:translate-y-0.5 cursor-pointer disabled:cursor-not-allowed"
      >
        <span>Insert into Step</span>
        <span>↵</span>
      </button>
    </div>
  </div>
</div>
