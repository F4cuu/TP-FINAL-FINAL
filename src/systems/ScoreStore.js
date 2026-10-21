const ScoreStore = {
  key: 'pablito.records',

  load: function () {
    try {
      const raw = localStorage.getItem(this.key);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  },

  get: function () {
    const data = this.load();
    return {
      maxCoins: data.maxCoins || 0,
      maxWave: data.maxWave || 0,
      maxTime: data.maxTime || 0,
      maxKills: data.maxKills || 0
    };
  },

  save: function (stats) {
    const current = this.get();
    const merged = {
      maxCoins: Math.max(current.maxCoins, stats.coins || 0),
      maxWave: Math.max(current.maxWave, stats.wave || 0),
      maxTime: Math.max(current.maxTime, stats.time || 0),
      maxKills: Math.max(current.maxKills, stats.kills || 0)
    };
    try {
      localStorage.setItem(this.key, JSON.stringify(merged));
    } catch (e) {
      return merged;
    }
    return merged;
  },

  reset: function () {
    try {
      localStorage.removeItem(this.key);
    } catch (e) {
      return;
    }
  }
};
