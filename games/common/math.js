/*
 * Shared mathematical helpers for the TriWei AI/ML games.
 *
 * These functions are placed in the global `MLab` namespace so that
 * individual labs can reuse them without duplicating code.  The
 * helper functions are intentionally lightweight and avoid any
 * dependencies.  To use them in a page, include this script via:
 * <script src="/games/common/math.js"></script> before your lab’s
 * inline script.
 */

(function(global){
  'use strict';
  // Numerically stable sigmoid function. Computes σ(z) = 1/(1+e^{-z})
  // while avoiding overflow/underflow for large |z| by switching
  // branches based on the sign of z.
  function stableSigmoid(z){
    if(z >= 0){
      const ez = Math.exp(-z);
      return 1/(1 + ez);
    } else {
      const ez = Math.exp(z);
      return ez/(1 + ez);
    }
  }

  // Return the sign of a number as used in subgradient of L1
  // regularisation.  sign(0) returns 0.
  function sign(x){
    return x > 0 ? 1 : x < 0 ? -1 : 0;
  }

  // Clip an array of gradient values by a threshold.  If any
  // component has absolute value greater than thresh, scale all
  // components by thresh/maxAbs.  This helps avoid exploding
  // gradients when users pick very large learning rates.
  function clipGradients(arr, thresh){
    let maxAbs=0;
    for(const v of arr) maxAbs = Math.max(maxAbs, Math.abs(v));
    if(maxAbs > thresh && maxAbs > 0){
      const scale = thresh / maxAbs;
      return arr.map(v => v * scale);
    }
    return arr;
  }

  // Simple central difference numerical derivative for scalar
  // functions.  Given a function f and a point x, returns an
  // approximation of f'(x) via (f(x+h)-f(x-h))/(2h).  h should be
  // small (e.g. 1e-4).  If f throws or returns NaN, this will
  // propagate.  This helper is useful for quick gradient checks in
  // one dimension and is left here for completeness.
  function centralDifference(f, x, h){
    const fp = f(x + h);
    const fm = f(x - h);
    return (fp - fm)/(2*h);
  }

  // Expose helpers on a global namespace.  If the namespace already
  // exists, extend it.
  global.MLab = global.MLab || {};
  global.MLab.stableSigmoid = stableSigmoid;
  global.MLab.sign = sign;
  global.MLab.clipGradients = clipGradients;
  global.MLab.centralDifference = centralDifference;
})(typeof window !== 'undefined' ? window : this);
