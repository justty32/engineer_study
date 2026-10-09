(function (root, factory) {
  "use strict";
  var api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.IoTBusCalc = api;
}(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  function rcTimeConstantNs(resistanceKOhm, capacitancePf) {
    return Number(resistanceKOhm) * Number(capacitancePf);
  }
  function i2cRiseTimeNs(resistanceKOhm, capacitancePf) {
    return 0.8473 * rcTimeConstantNs(resistanceKOhm, capacitancePf);
  }
  function reflectionCoefficient(characteristicOhm, loadOhm) {
    var z0 = Number(characteristicOhm), zl = Number(loadOhm);
    return (zl - z0) / (zl + z0);
  }
  return {
    rcTimeConstantNs: rcTimeConstantNs,
    i2cRiseTimeNs: i2cRiseTimeNs,
    reflectionCoefficient: reflectionCoefficient
  };
}));
