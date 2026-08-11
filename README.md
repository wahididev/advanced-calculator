# Advanced Calculator — More functions

This update adds a number of advanced math features and UX improvements:

- Degree/Radian toggle: switch between degree and radian trig modes (Deg/Rad button).
- Additional functions added to scientific panel: asin, acos, atan, asinh, acosh, atanh, sinh, cosh, tanh, log2, log10, exp, abs, floor, ceil, round, factorial (n!), 1/x, nCr, nPr.
- nCr and nPr implemented as helper functions in the math.js evaluation scope to ensure availability.
- Trig functions are wrapped when degree mode is enabled by providing custom scope functions to math.js.

How to use
- Toggle scientific functions with "Show scientific".
- Toggle degree/radian with the "Deg" button. Default is Deg for easier calculator usage.
- Use nCr(n,k) and nPr(n,k) for combinations/permutations; they will work even if math.js doesn't provide those helpers natively.

Security note
- math.js evaluates expressions; the evaluator uses math.js when available and a strict fallback otherwise. Because the app runs client-side, untrusted server-side execution isn't a concern here, but avoid pasting untrusted code into the input.
