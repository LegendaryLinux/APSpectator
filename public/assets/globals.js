const ARCHIPELAGO_PROTOCOL_VERSION = {
  major: 0,
  minor: 2,
  build: 4,
  class: 'Version',
};

const permissionMap = {
  0: 'Disabled',
  1: 'Enabled',
  2: 'Goal',
  6: 'Auto',
  7: 'Enabled + Auto',
};

// Tracks if automatic scrolling is currently paused
let autoScrollPaused = false;
