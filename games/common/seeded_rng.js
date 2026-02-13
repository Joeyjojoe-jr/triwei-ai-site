(() => {
  function hashString(input) {
    const str = String(input || "");
    let h = 2166136261;
    for (let i = 0; i < str.length; i += 1) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function normalizeSeed(input) {
    if (typeof input === "number" && Number.isFinite(input)) {
      return (Math.floor(input) >>> 0);
    }
    if (typeof input === "string") {
      const trimmed = input.trim();
      if (trimmed.length === 0) return 1;
      if (/^[+-]?\d+$/.test(trimmed)) {
        const parsed = Number.parseInt(trimmed, 10);
        if (Number.isFinite(parsed)) return (parsed >>> 0);
      }
      if (/^0x[0-9a-f]+$/i.test(trimmed)) {
        const parsedHex = Number.parseInt(trimmed, 16);
        if (Number.isFinite(parsedHex)) return (parsedHex >>> 0);
      }
      return hashString(trimmed);
    }
    return 1;
  }

  function mulberry32(seed) {
    let state = seed >>> 0;
    return function next() {
      state = (state + 0x6d2b79f5) >>> 0;
      let t = Math.imul(state ^ (state >>> 15), 1 | state);
      t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
      return (((t ^ (t >>> 14)) >>> 0) / 4294967296);
    };
  }

  function create(seedInput) {
    let seed = normalizeSeed(seedInput);
    let nextFloat = mulberry32(seed);

    function reseed(nextSeedInput) {
      seed = normalizeSeed(nextSeedInput);
      nextFloat = mulberry32(seed);
    }

    return {
      next() {
        return nextFloat();
      },
      nextInt(min, maxExclusive) {
        const lo = Number(min);
        const hi = Number(maxExclusive);
        if (!Number.isFinite(lo) || !Number.isFinite(hi) || hi <= lo) return lo;
        return lo + Math.floor(nextFloat() * (hi - lo));
      },
      pick(values) {
        if (!Array.isArray(values) || values.length === 0) return undefined;
        return values[this.nextInt(0, values.length)];
      },
      getSeed() {
        return seed >>> 0;
      },
      reset() {
        nextFloat = mulberry32(seed);
      },
      setSeed(nextSeedInput) {
        reseed(nextSeedInput);
      }
    };
  }

  window.TWSeededRng = {
    create,
    normalizeSeed,
    toSeedString(seedInput) {
      return String(normalizeSeed(seedInput));
    }
  };
})();
