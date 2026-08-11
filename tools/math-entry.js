// tools/math-entry.js
// Entry file to bundle a minimal math.js runtime for the browser.
// It creates a math instance and attaches it to window.math
import { create, all } from 'mathjs';
const math = create(all);
if(typeof window !== 'undefined') window.math = math;
export default math;
