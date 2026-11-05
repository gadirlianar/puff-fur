// =============================================================================
// MINIMALIST ULTRA-GLASSMORPHIC FLOATING DOCK UI FOR MOCHI-PUFF
// =============================================================================
// Features:
// 1. Dynamic Island / Linear-style glass dock with 4 tabs: Style, Atmosphere, Care, Photo
// 2. Ultra-compact floating pill collapse state
// 3. LocalStorage persistence for name, custom colors, presets, and affection
// 4. Procedural audio integration, joyful acrobatics, and polaroid photo booth
// 5. Full backwards compatibility with Three.js rendering, WebGPU/WebGL toggle, and AR modes

import { ENVIRONMENT_PRESETS, sanitizeEnvId } from './environments.js';
import { isAudioMuted, toggleAudioMute } from './audioSynth.js';

const HEX_COLOR_REGEX = /^#[0-9a-fA-F]{6}$/;

export function clampNumber(val, min, max, fallback) {
  const num = Number(val);
  if (!Number.isFinite(num)) return fallback;
  return Math.max(min, Math.min(max, num));
}

export function sanitizeHexColor(val, fallback) {
  if (typeof val === 'string' && HEX_COLOR_REGEX.test(val.trim())) {
    return val.trim();
  }
  return fallback;
}

export const FUR_PRESETS = [
  {
    name: 'Sakura Mochi',
    baseColor: '#5e2bff',
    tipColor: '#ff9ec7',
    furLength: 0.31,
    furDensity: 0.75,
    roughness: 0.77,
    specular: 0.24,
    clumping: 0.35,
    curliness: 0.23
  },
  {
    name: 'Golden Fluff',
    baseColor: '#7c3f14',
    tipColor: '#fde68a',
    furLength: 0.38,
    furDensity: 0.92,
    roughness: 0.77,
    specular: 0.24,
    clumping: 0.64,
    curliness: 0.58
  },
  {
    name: 'Midnight Velvet',
    baseColor: '#131638',
    tipColor: '#67e8f9',
    furLength: 0.29,
    furDensity: 0.95,
    roughness: 0.77,
    specular: 0.24,
    clumping: 0.44,
    curliness: 0.15
  },
  {
    name: 'Matcha Puff',
    baseColor: '#1e4631',
    tipColor: '#bbf7d0',
    furLength: 0.36,
    furDensity: 0.86,
    roughness: 0.77,
    specular: 0.24,
    clumping: 0.62,
    curliness: 0.72
  }
];

export function saveCreatureProfile(data) {
  try {
    if (data.name) localStorage.setItem('mochi_name', data.name.trim());
    if (data.preset) localStorage.setItem('mochi_preset', data.preset);
    if (data.baseColor) localStorage.setItem('mochi_base_color', data.baseColor);
    if (data.tipColor) localStorage.setItem('mochi_tip_color', data.tipColor);
    if (data.furLength !== undefined) localStorage.setItem('mochi_fur_length', String(data.furLength));
    if (data.furDensity !== undefined) localStorage.setItem('mochi_fur_density', String(data.furDensity));
    if (data.curliness !== undefined) localStorage.setItem('mochi_curliness', String(data.curliness));
    if (data.clumping !== undefined) localStorage.setItem('mochi_clumping', String(data.clumping));
  } catch (e) {}
}

export function loadCreatureProfile() {
  const profile = { name: 'Mochi-Puff' };
  try {
    const name = localStorage.getItem('mochi_name');
    if (name) profile.name = name.trim();
    const preset = localStorage.getItem('mochi_preset');
    if (preset) profile.preset = preset;
    const baseColor = localStorage.getItem('mochi_base_color');
    if (baseColor && HEX_COLOR_REGEX.test(baseColor)) profile.baseColor = baseColor;
    const tipColor = localStorage.getItem('mochi_tip_color');
    if (tipColor && HEX_COLOR_REGEX.test(tipColor)) profile.tipColor = tipColor;
    const furLength = localStorage.getItem('mochi_fur_length');
    if (furLength !== null && !isNaN(parseFloat(furLength))) profile.furLength = parseFloat(furLength);
    const furDensity = localStorage.getItem('mochi_fur_density');
    if (furDensity !== null && !isNaN(parseFloat(furDensity))) profile.furDensity = parseFloat(furDensity);
    const curliness = localStorage.getItem('mochi_curliness');
    if (curliness !== null && !isNaN(parseFloat(curliness))) profile.curliness = parseFloat(curliness);
    const clumping = localStorage.getItem('mochi_clumping');
    if (clumping !== null && !isNaN(parseFloat(clumping))) profile.clumping = parseFloat(clumping);
  } catch (e) {}
  return profile;
}

export function createMinimalUI(container, state, onChange) {
  // Load saved creature profile if present
  const savedProfile = loadCreatureProfile();
  let creatureName = savedProfile.name || 'Mochi-Puff';
  if (savedProfile.preset) state.preset = savedProfile.preset;
  if (savedProfile.baseColor) state.baseColor = savedProfile.baseColor;
  if (savedProfile.tipColor) state.tipColor = savedProfile.tipColor;
  if (savedProfile.furLength !== undefined) state.furLength = savedProfile.furLength;
  if (savedProfile.furDensity !== undefined) state.furDensity = savedProfile.furDensity;
  if (savedProfile.curliness !== undefined) state.curliness = savedProfile.curliness;
  if (savedProfile.clumping !== undefined) state.clumping = savedProfile.clumping;

  // =========================================================================
  // 1. TOP SCENE SELECTION PILL BAR (STREAMLINED & SYNCHRONIZED)
  // =========================================================================
  let sceneNav = document.getElementById('scene-nav');
  if (!sceneNav) {
    sceneNav = document.createElement('nav');
    sceneNav.id = 'scene-nav';
    sceneNav.className = 'scene-nav-bar';
    sceneNav.setAttribute('aria-label', 'Scene Selection');
    document.body.appendChild(sceneNav);
  }
  sceneNav.replaceChildren();

  const sceneButtons = {};
  const atmosphereEnvButtons = {};

  for (const env of ENVIRONMENT_PRESETS) {
    const pill = document.createElement('button');
    pill.type = 'button';
    pill.className = 'scene-pill';
    pill.setAttribute('data-env', env.id);
    pill.setAttribute('aria-label', `${env.name} · ${env.subtitle}`);
    const isCurrent = (state.environment || 'studio') === env.id;
    if (isCurrent) {
      pill.classList.add('active');
      pill.setAttribute('aria-selected', 'true');
    } else {
      pill.setAttribute('aria-selected', 'false');
    }

    const dot = document.createElement('span');
    dot.className = 'scene-pill-dot';

    const label = document.createElement('span');
    label.className = 'scene-pill-label';
    label.textContent = env.name;

    pill.appendChild(dot);
    pill.appendChild(label);

    pill.addEventListener('click', () => {
      const safeEnv = sanitizeEnvId(env.id, 'studio');
      state.environment = safeEnv;
      updateEnvSelectionUI(safeEnv);
      onChange('environment', safeEnv);
    });

    sceneButtons[env.id] = pill;
    sceneNav.appendChild(pill);
  }

  // Quick 1-Click GPU Fur Toggle in top bar
  const navDivider = document.createElement('span');
  navDivider.className = 'scene-nav-divider';
  navDivider.setAttribute('aria-hidden', 'true');
  sceneNav.appendChild(navDivider);

  const topGpuFurPill = document.createElement('button');
  topGpuFurPill.type = 'button';
  topGpuFurPill.className = 'scene-pill gpu-fur-pill';
  topGpuFurPill.setAttribute('aria-label', 'Toggle GPU Fur simulation mode');

  const topGpuDot = document.createElement('span');
  topGpuDot.className = 'scene-pill-dot';

  const topGpuLabel = document.createElement('span');
  topGpuLabel.className = 'scene-pill-label';
  topGpuLabel.textContent = 'GPU Fur';

  topGpuFurPill.appendChild(topGpuDot);
  topGpuFurPill.appendChild(topGpuLabel);
  sceneNav.appendChild(topGpuFurPill);

  // =========================================================================
  // 2. ULTRA-MINIMALIST GLASS DOCK CONTAINER (#ui-root)
  // =========================================================================
  container.replaceChildren();
  container.className = 'minimal-dock';

  // Mobile Bottom Sheet Backdrop & Controls Button
  let mobileBackdrop = document.getElementById('mobile-sheet-backdrop');
  if (!mobileBackdrop) {
    mobileBackdrop = document.createElement('div');
    mobileBackdrop.id = 'mobile-sheet-backdrop';
    mobileBackdrop.className = 'mobile-sheet-backdrop';
    mobileBackdrop.setAttribute('aria-hidden', 'true');
    document.body.appendChild(mobileBackdrop);
  }

  let mobileTrigger = document.getElementById('mobile-controls-btn');
  if (!mobileTrigger) {
    mobileTrigger = document.createElement('button');
    mobileTrigger.id = 'mobile-controls-btn';
    mobileTrigger.type = 'button';
    mobileTrigger.className = 'mobile-controls-btn';
    mobileTrigger.setAttribute('aria-label', 'Open Mochi-Puff Controls');
    mobileTrigger.innerHTML = `
      <span class="mobile-controls-btn-dot"></span>
      <span>Controls</span>
      <span class="mobile-controls-btn-sep">·</span>
      <span class="mobile-controls-btn-scene" id="mobile-btn-scene">Studio</span>
    `;
    document.body.appendChild(mobileTrigger);
  }
  const mobileBtnScene = document.getElementById('mobile-btn-scene');

  function openMobileSheet() {
    container.classList.add('mobile-sheet-open');
    mobileBackdrop.classList.add('active');
    document.body.classList.add('mobile-sheet-active');
  }

  function closeMobileSheet() {
    container.classList.remove('mobile-sheet-open');
    mobileBackdrop.classList.remove('active');
    document.body.classList.remove('mobile-sheet-active');
  }

  mobileTrigger.onclick = openMobileSheet;
  mobileBackdrop.onclick = closeMobileSheet;

  // --- Drag Handle for Mobile Sheet ---
  const mobileHandleWrap = document.createElement('div');
  mobileHandleWrap.className = 'mobile-sheet-handle-wrap';
  const mobileHandle = document.createElement('div');
  mobileHandle.className = 'mobile-sheet-handle';
  mobileHandleWrap.appendChild(mobileHandle);
  mobileHandleWrap.addEventListener('click', closeMobileSheet);
  container.appendChild(mobileHandleWrap);

  // --- Collapsed State Pill (Apple Dynamic Island aesthetic) ---
  const collapsedPill = document.createElement('div');
  collapsedPill.className = 'dock-collapsed-pill';
  collapsedPill.setAttribute('role', 'button');
  collapsedPill.setAttribute('tabindex', '0');
  collapsedPill.setAttribute('aria-label', 'Expand controls');

  const pillAvatar = document.createElement('span');
  pillAvatar.className = 'dock-pill-avatar';
  pillAvatar.textContent = '✨';

  const pillName = document.createElement('span');
  pillName.className = 'dock-pill-name';
  pillName.textContent = creatureName;

  const pillBadge = document.createElement('span');
  pillBadge.className = 'dock-pill-badge';
  pillBadge.textContent = '💖 Lv.1';

  const pillExpandBtn = document.createElement('span');
  pillExpandBtn.className = 'dock-pill-expand';
  pillExpandBtn.textContent = '▾';

  collapsedPill.appendChild(pillAvatar);
  collapsedPill.appendChild(pillName);
  collapsedPill.appendChild(pillBadge);
  collapsedPill.appendChild(pillExpandBtn);
  container.appendChild(collapsedPill);

  // --- Expanded Dock View ---
  const expandedView = document.createElement('div');
  expandedView.className = 'dock-expanded-view';

  // 1. Dock Header
  const dockHeader = document.createElement('div');
  dockHeader.className = 'dock-header';

  const titleGroup = document.createElement('div');
  titleGroup.className = 'dock-title-group';

  const dockIcon = document.createElement('span');
  dockIcon.className = 'dock-icon';
  dockIcon.textContent = '✨';

  const dockTextWrap = document.createElement('div');
  dockTextWrap.className = 'dock-title-text';

  const dockNameDisplay = document.createElement('span');
  dockNameDisplay.className = 'dock-name-display';
  dockNameDisplay.textContent = creatureName;

  const dockSubtitle = document.createElement('span');
  dockSubtitle.className = 'dock-subtitle';
  dockSubtitle.textContent = '3D GPU Companion';

  dockTextWrap.appendChild(dockNameDisplay);
  dockTextWrap.appendChild(dockSubtitle);
  titleGroup.appendChild(dockIcon);
  titleGroup.appendChild(dockTextWrap);

  const headerActions = document.createElement('div');
  headerActions.className = 'dock-header-actions';

  const soundBtn = document.createElement('button');
  soundBtn.type = 'button';
  soundBtn.className = 'dock-action-icon-btn';
  soundBtn.setAttribute('title', isAudioMuted() ? 'Sound: Muted (Click to Unmute)' : 'Sound: ON (Click to Mute)');
  soundBtn.setAttribute('aria-label', 'Toggle audio sound');
  soundBtn.textContent = isAudioMuted() ? '🔇' : '🔊';

  soundBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const muted = toggleAudioMute();
    soundBtn.textContent = muted ? '🔇' : '🔊';
    soundBtn.setAttribute('title', muted ? 'Sound: Muted (Click to Unmute)' : 'Sound: ON (Click to Mute)');
    if (careSoundToggleBtn) {
      careSoundToggleBtn.textContent = muted ? '🔇 Sound: Muted' : '🔊 Sound: Active';
      careSoundToggleBtn.classList.toggle('active', !muted);
    }
  });

  const collapseBtn = document.createElement('button');
  collapseBtn.type = 'button';
  collapseBtn.className = 'dock-action-icon-btn dock-collapse-btn';
  collapseBtn.setAttribute('title', 'Minimize dock to compact pill');
  collapseBtn.setAttribute('aria-label', 'Minimize dock');
  collapseBtn.textContent = '−';

  collapseBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    setDockCollapsed(true);
  });

  collapsedPill.addEventListener('click', () => {
    setDockCollapsed(false);
  });

  headerActions.appendChild(soundBtn);
  headerActions.appendChild(collapseBtn);
  dockHeader.appendChild(titleGroup);
  dockHeader.appendChild(headerActions);
  expandedView.appendChild(dockHeader);

  function setDockCollapsed(collapsed) {
    container.classList.toggle('collapsed', collapsed);
    try {
      localStorage.setItem('mochi_dock_collapsed', String(collapsed));
    } catch (e) {}
  }

  // Restore collapsed preference
  try {
    if (localStorage.getItem('mochi_dock_collapsed') === 'true') {
      container.classList.add('collapsed');
    }
  } catch (e) {}

  // 2. Segmented Dock Tab Bar
  const tabBar = document.createElement('nav');
  tabBar.className = 'dock-tab-bar';
  tabBar.setAttribute('role', 'tablist');

  const tabDefs = [
    { id: 'style', icon: '🎨', label: 'Style' },
    { id: 'atmosphere', icon: '💡', label: 'Mood' },
    { id: 'care', icon: '✨', label: 'Care' },
    { id: 'snapshot', icon: '📸', label: 'Photo' }
  ];

  const tabButtons = {};
  const tabPanels = {};

  const panelsWrap = document.createElement('div');
  panelsWrap.className = 'dock-panels-wrap';

  let activeTabId = 'style';

  function switchTab(targetId) {
    activeTabId = targetId;
    tabDefs.forEach((def) => {
      const isSel = def.id === targetId;
      if (tabButtons[def.id]) {
        tabButtons[def.id].classList.toggle('active', isSel);
        tabButtons[def.id].setAttribute('aria-selected', String(isSel));
      }
      if (tabPanels[def.id]) {
        tabPanels[def.id].classList.toggle('active', isSel);
      }
    });
  }

  tabDefs.forEach((def, index) => {
    const tabBtn = document.createElement('button');
    tabBtn.type = 'button';
    tabBtn.className = `dock-tab ${index === 0 ? 'active' : ''}`;
    tabBtn.setAttribute('role', 'tab');
    tabBtn.setAttribute('data-tab', def.id);
    tabBtn.setAttribute('aria-selected', index === 0 ? 'true' : 'false');

    const tabIcon = document.createElement('span');
    tabIcon.className = 'dock-tab-icon';
    tabIcon.textContent = def.icon;

    const tabLabel = document.createElement('span');
    tabLabel.className = 'dock-tab-label';
    tabLabel.textContent = def.label;

    tabBtn.appendChild(tabIcon);
    tabBtn.appendChild(tabLabel);

    tabBtn.addEventListener('click', () => {
      switchTab(def.id);
    });

    tabButtons[def.id] = tabBtn;
    tabBar.appendChild(tabBtn);

    const panel = document.createElement('div');
    panel.className = `dock-panel ${index === 0 ? 'active' : ''}`;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('data-panel', def.id);
    tabPanels[def.id] = panel;
    panelsWrap.appendChild(panel);
  });

  expandedView.appendChild(tabBar);
  expandedView.appendChild(panelsWrap);
  container.appendChild(expandedView);

  // References for live synchronization
  const sliderRefs = {};
  const colorRefs = {};

  function createSliderControl(parent, labelText, key, min, max, step, formatFn) {
    const row = document.createElement('div');
    row.className = 'dock-control-row';

    const labelRow = document.createElement('div');
    labelRow.className = 'dock-label-row';

    const label = document.createElement('span');
    label.className = 'dock-control-label';
    label.textContent = labelText;

    const valSpan = document.createElement('span');
    valSpan.className = 'dock-control-value';
    const initVal = state[key] !== undefined ? state[key] : min;
    valSpan.textContent = formatFn(initVal);

    labelRow.appendChild(label);
    labelRow.appendChild(valSpan);

    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = String(min);
    slider.max = String(max);
    slider.step = String(step);
    slider.value = String(initVal);
    slider.className = 'dock-range-slider';
    slider.setAttribute('aria-label', labelText);

    slider.addEventListener('input', (e) => {
      const v = clampNumber(e.target.value, min, max, initVal);
      state[key] = v;
      valSpan.textContent = formatFn(v);
      onChange(key, v);
      saveCreatureProfile(state);
    });

    row.appendChild(labelRow);
    row.appendChild(slider);
    parent.appendChild(row);

    sliderRefs[key] = { input: slider, valSpan, formatFn };
  }

  // =========================================================================
  // TAB 1: 🎨 STYLE (PRESETS, FUR FLUFF, CURLINESS, COLORS)
  // =========================================================================
  const stylePanel = tabPanels['style'];

  // 1. Preset Cards Grid
  const presetTitle = document.createElement('div');
  presetTitle.className = 'dock-subhead';
  presetTitle.textContent = 'Curated Looks';
  stylePanel.appendChild(presetTitle);

  const presetGrid = document.createElement('div');
  presetGrid.className = 'preset-cards-grid';

  const presetCardElements = {};

  function updatePresetCardsUI() {
    Object.keys(presetCardElements).forEach((name) => {
      const isSel = state.preset === name;
      presetCardElements[name].classList.toggle('active', isSel);
      presetCardElements[name].setAttribute('aria-pressed', String(isSel));
    });
  }

  FUR_PRESETS.forEach((preset) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = `preset-card ${state.preset === preset.name ? 'active' : ''}`;
    card.setAttribute('aria-label', `Apply preset ${preset.name}`);
    card.setAttribute('aria-pressed', String(state.preset === preset.name));

    const cardDot = document.createElement('span');
    cardDot.className = 'preset-card-circle';
    cardDot.style.background = `linear-gradient(135deg, ${preset.tipColor} 0%, ${preset.baseColor} 100%)`;

    const cardName = document.createElement('span');
    cardName.className = 'preset-card-title';
    cardName.textContent = preset.name;

    card.appendChild(cardDot);
    card.appendChild(cardName);

    card.addEventListener('click', () => {
      Object.assign(state, preset);
      state.preset = preset.name;
      updatePresetCardsUI();
      syncAllUI();
      ['furLength', 'furDensity', 'clumping', 'curliness', 'roughness', 'specular', 'baseColor', 'tipColor'].forEach((k) => {
        onChange(k, state[k]);
      });
      saveCreatureProfile(state);
    });

    presetCardElements[preset.name] = card;
    presetGrid.appendChild(card);
  });
  stylePanel.appendChild(presetGrid);

  // 2. Fur Touch & Groom Sliders
  const groomingTitle = document.createElement('div');
  groomingTitle.className = 'dock-subhead';
  groomingTitle.textContent = 'Fur Grooming & Physics';
  stylePanel.appendChild(groomingTitle);

  createSliderControl(stylePanel, 'Fur Length', 'furLength', 0.12, 0.58, 0.01, (v) => `${(v * 100).toFixed(0)}%`);
  createSliderControl(stylePanel, 'Fluff Density', 'furDensity', 0.35, 1.0, 0.01, (v) => `${(v * 100).toFixed(0)}%`);
  createSliderControl(stylePanel, 'Wave & Curl', 'curliness', 0.0, 1.0, 0.01, (v) => `${(v * 100).toFixed(0)}%`);
  createSliderControl(stylePanel, 'Tuft Clumping', 'clumping', 0.0, 1.0, 0.01, (v) => `${(v * 100).toFixed(0)}%`);

  // 3. Fur Dual-Color Palette
  const colorTitle = document.createElement('div');
  colorTitle.className = 'dock-subhead';
  colorTitle.textContent = 'Coat Color Palette';
  stylePanel.appendChild(colorTitle);

  const colorsRow = document.createElement('div');
  colorsRow.className = 'dock-dual-color-row';

  function createColorPickerCell(parent, labelText, key) {
    const cell = document.createElement('label');
    cell.className = 'dock-color-picker-cell';

    const swatch = document.createElement('span');
    swatch.className = 'dock-color-swatch';
    swatch.style.background = state[key] || '#ffffff';

    const label = document.createElement('span');
    label.className = 'dock-color-label';
    label.textContent = labelText;

    const colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.value = state[key] || '#ffffff';
    colorInput.className = 'dock-native-color-input';
    colorInput.setAttribute('aria-label', labelText);

    colorInput.addEventListener('input', (e) => {
      const hex = sanitizeHexColor(e.target.value, state[key]);
      state[key] = hex;
      swatch.style.background = hex;
      onChange(key, hex);
      saveCreatureProfile(state);
    });

    colorRefs[key] = colorInput;
    cell.appendChild(swatch);
    cell.appendChild(label);
    cell.appendChild(colorInput);
    parent.appendChild(cell);
  }

  createColorPickerCell(colorsRow, 'Undercoat (Root)', 'baseColor');
  createColorPickerCell(colorsRow, 'Surface (Tip)', 'tipColor');
  stylePanel.appendChild(colorsRow);

  // =========================================================================
  // TAB 2: 💡 ATMOSPHERE (ENVIRONMENTS, LIGHTING, WIND, AR CAMERA)
  // =========================================================================
  const atmospherePanel = tabPanels['atmosphere'];

  const envTitle = document.createElement('div');
  envTitle.className = 'dock-subhead';
  envTitle.textContent = '3D Environment';
  atmospherePanel.appendChild(envTitle);

  const envGrid = document.createElement('div');
  envGrid.className = 'preset-cards-grid';

  ENVIRONMENT_PRESETS.forEach((env) => {
    const envCard = document.createElement('button');
    envCard.type = 'button';
    envCard.className = 'preset-card';
    envCard.setAttribute('data-env', env.id);
    const isCur = (state.environment || 'studio') === env.id;
    if (isCur) envCard.classList.add('active');

    const envDot = document.createElement('span');
    envDot.className = 'preset-card-circle';
    envDot.style.background = env.id === 'studio' ? '#a855f7' : (env.id === 'meadow' ? '#22c55e' : (env.id === 'highrise' ? '#f59e0b' : '#38bdf8'));

    const envName = document.createElement('span');
    envName.className = 'preset-card-title';
    envName.textContent = env.name;

    envCard.appendChild(envDot);
    envCard.appendChild(envName);

    envCard.addEventListener('click', () => {
      const safeEnv = sanitizeEnvId(env.id, 'studio');
      state.environment = safeEnv;
      updateEnvSelectionUI(safeEnv);
      onChange('environment', safeEnv);
    });

    atmosphereEnvButtons[env.id] = envCard;
    envGrid.appendChild(envCard);
  });
  atmospherePanel.appendChild(envGrid);

  // Lighting & Wind
  const lightTitle = document.createElement('div');
  lightTitle.className = 'dock-subhead';
  lightTitle.textContent = 'Atmospheric Lighting & Breeze';
  atmospherePanel.appendChild(lightTitle);

  createSliderControl(atmospherePanel, 'Key Light Orbit', 'lightAngle', -180, 180, 1, (v) => `${Math.round(v)}°`);
  createSliderControl(atmospherePanel, 'Light Warmth & Lux', 'lightIntensity', 0.4, 2.6, 0.05, (v) => `${v.toFixed(2)}x`);
  createSliderControl(atmospherePanel, 'Wind Breeze Speed', 'windStrength', 0.0, 2.4, 0.05, (v) => `${v.toFixed(2)}x`);

  // WebGPU Fur Engine Toggle Row
  const engineRow = document.createElement('div');
  engineRow.className = 'dock-subhead-row';

  const engineLabel = document.createElement('span');
  engineLabel.className = 'dock-subhead';
  engineLabel.textContent = 'Rendering Engine';

  const engineModeBtn = document.createElement('button');
  engineModeBtn.type = 'button';
  engineModeBtn.className = 'dock-toggle-pill-btn';
  engineModeBtn.textContent = state.gpuFurEnabled ? '✨ 64-Shell WebGPU Fur' : '⚡ Analytical WebGL';
  engineModeBtn.classList.toggle('active', Boolean(state.gpuFurEnabled));

  engineModeBtn.addEventListener('click', () => {
    const next = !state.gpuFurEnabled;
    state.gpuFurEnabled = next;
    engineModeBtn.classList.toggle('active', next);
    engineModeBtn.textContent = next ? '✨ 64-Shell WebGPU Fur' : '⚡ Analytical WebGL';
    updateGPUFurModeUI(next);
    onChange('toggleGPUFur', next);
  });

  engineRow.appendChild(engineLabel);
  engineRow.appendChild(engineModeBtn);
  atmospherePanel.appendChild(engineRow);

  // 60 FPS Record Mode Toggle Row
  const perfRow = document.createElement('div');
  perfRow.className = 'dock-subhead-row';
  perfRow.style.marginTop = '6px';

  const perfLabel = document.createElement('span');
  perfLabel.className = 'dock-subhead';
  perfLabel.textContent = 'Frame Lock';

  let recordModeActive = false;
  const recordBtn = document.createElement('button');
  recordBtn.type = 'button';
  recordBtn.className = 'dock-toggle-pill-btn';
  recordBtn.textContent = '⏺ 60 FPS Lock: OFF';
  recordBtn.onclick = () => {
    recordModeActive = !recordModeActive;
    recordBtn.textContent = recordModeActive ? '⏺ 60 FPS Lock: ON' : '⏺ 60 FPS Lock: OFF';
    recordBtn.classList.toggle('active', recordModeActive);
    onChange('toggleRecordMode', recordModeActive);
  };
  perfRow.appendChild(perfLabel);
  perfRow.appendChild(recordBtn);
  atmospherePanel.appendChild(perfRow);

  // AR Section (Visible in AR Mode)
  const arSection = document.createElement('div');
  arSection.className = 'dock-ar-section';
  arSection.style.display = (state.environment === 'ar') ? 'block' : 'none';

  const arTitle = document.createElement('div');
  arTitle.className = 'dock-subhead';
  arTitle.textContent = 'AR Camera & World Tracking';
  arSection.appendChild(arTitle);

  const arStatusCard = document.createElement('div');
  arStatusCard.className = 'dock-status-card';

  const arStatusDot = document.createElement('span');
  arStatusDot.className = 'dock-status-dot';

  const arStatusText = document.createElement('span');
  arStatusText.className = 'dock-status-text';
  arStatusText.textContent = 'AR Camera Ready';

  const arPlaneBadge = document.createElement('span');
  arPlaneBadge.className = 'dock-status-badge';
  arPlaneBadge.textContent = '0 pts';

  arStatusCard.appendChild(arStatusDot);
  arStatusCard.appendChild(arStatusText);
  arStatusCard.appendChild(arPlaneBadge);
  arSection.appendChild(arStatusCard);

  const arActionsGrid = document.createElement('div');
  arActionsGrid.className = 'dock-grid-2col';

  const mirrorBtn = document.createElement('button');
  mirrorBtn.type = 'button';
  mirrorBtn.className = 'dock-action-btn';
  mirrorBtn.textContent = 'Mirror: OFF';
  mirrorBtn.onclick = () => onChange('arToggleMirror', true);

  const flipCamBtn = document.createElement('button');
  flipCamBtn.type = 'button';
  flipCamBtn.className = 'dock-action-btn';
  flipCamBtn.textContent = '🔄 Flip Camera';
  flipCamBtn.onclick = () => onChange('arFlipCamera', true);

  let tapPlaceActive = true;
  const tapPlaceBtn = document.createElement('button');
  tapPlaceBtn.type = 'button';
  tapPlaceBtn.className = 'dock-action-btn active';
  tapPlaceBtn.textContent = 'Tap to Place: ON';
  tapPlaceBtn.onclick = () => {
    tapPlaceActive = !tapPlaceActive;
    tapPlaceBtn.textContent = tapPlaceActive ? 'Tap to Place: ON' : 'Tap to Place: OFF';
    tapPlaceBtn.classList.toggle('active', tapPlaceActive);
    onChange('arToggleTapPlace', tapPlaceActive);
  };

  let lightEstActive = true;
  const lightEstBtn = document.createElement('button');
  lightEstBtn.type = 'button';
  lightEstBtn.className = 'dock-action-btn active';
  lightEstBtn.textContent = 'Light Est: ON';
  lightEstBtn.onclick = () => {
    lightEstActive = !lightEstActive;
    lightEstBtn.textContent = lightEstActive ? 'Light Est: ON' : 'Light Est: OFF';
    lightEstBtn.classList.toggle('active', lightEstActive);
    onChange('arToggleLightEst', lightEstActive);
  };

  const resetPosBtn = document.createElement('button');
  resetPosBtn.type = 'button';
  resetPosBtn.className = 'dock-action-btn';
  resetPosBtn.textContent = '📍 Reset Position';
  resetPosBtn.onclick = () => onChange('arResetPosition', true);

  arActionsGrid.appendChild(mirrorBtn);
  arActionsGrid.appendChild(flipCamBtn);
  arActionsGrid.appendChild(tapPlaceBtn);
  arActionsGrid.appendChild(lightEstBtn);
  arActionsGrid.appendChild(resetPosBtn);
  arSection.appendChild(arActionsGrid);
  atmospherePanel.appendChild(arSection);

  // =========================================================================
  // TAB 3: ✨ PLAY & CARE (NAME, LOVE METER, JOY BACKFLIP, SOUND)
  // =========================================================================
  const carePanel = tabPanels['care'];

  // 1. Creature Name Input with instant persistence
  const careNameWrap = document.createElement('div');
  careNameWrap.className = 'dock-name-edit-wrap';

  const careNameLabel = document.createElement('div');
  careNameLabel.className = 'dock-subhead';
  careNameLabel.textContent = "Your Creature's Name";

  const careNameInput = document.createElement('input');
  careNameInput.type = 'text';
  careNameInput.maxLength = 24;
  careNameInput.value = creatureName;
  careNameInput.className = 'dock-name-input';
  careNameInput.placeholder = 'Give your Mochi a name...';

  careNameInput.addEventListener('input', (e) => {
    const newName = e.target.value.trim() || 'Mochi-Puff';
    creatureName = newName;
    pillName.textContent = newName;
    dockNameDisplay.textContent = newName;
    updatePolaroidLabel(newName);
    saveCreatureProfile({ name: newName });
    onChange('creatureName', newName);
  });

  careNameWrap.appendChild(careNameLabel);
  careNameWrap.appendChild(careNameInput);
  carePanel.appendChild(careNameWrap);

  // 2. Love & Affection Meter
  const loveTitle = document.createElement('div');
  loveTitle.className = 'dock-subhead';
  loveTitle.textContent = 'Affection & Bond Level';
  carePanel.appendChild(loveTitle);

  const loveCard = document.createElement('div');
  loveCard.className = 'dock-love-card';

  const loveHeader = document.createElement('div');
  loveHeader.className = 'dock-love-header';

  const loveLevelTitle = document.createElement('span');
  loveLevelTitle.className = 'dock-love-level';
  loveLevelTitle.textContent = 'Level 1: New Friend';

  const loveHeartsCount = document.createElement('span');
  loveHeartsCount.className = 'dock-love-hearts';
  loveHeartsCount.textContent = '💖 0 Hearts';

  loveHeader.appendChild(loveLevelTitle);
  loveHeader.appendChild(loveHeartsCount);

  const loveTrack = document.createElement('div');
  loveTrack.className = 'dock-love-track';

  const loveFill = document.createElement('div');
  loveFill.className = 'dock-love-fill';
  loveFill.style.width = '15%';

  loveTrack.appendChild(loveFill);

  const loveSubRow = document.createElement('div');
  loveSubRow.className = 'dock-love-subrow';

  const loveStreakBadge = document.createElement('span');
  loveStreakBadge.className = 'dock-streak-badge';
  loveStreakBadge.textContent = '🔥 Day 1 Streak';

  const loveHint = document.createElement('span');
  loveHint.className = 'dock-love-hint';
  loveHint.textContent = 'Pet Mochi or boop to share love and level up!';

  loveSubRow.appendChild(loveStreakBadge);
  loveSubRow.appendChild(loveHint);

  loveCard.appendChild(loveHeader);
  loveCard.appendChild(loveTrack);
  loveCard.appendChild(loveSubRow);
  carePanel.appendChild(loveCard);

  // 3. Acrobatics & Joy Flip Trigger
  const acrobaticsTitle = document.createElement('div');
  acrobaticsTitle.className = 'dock-subhead';
  acrobaticsTitle.textContent = 'Tricks & Acrobatics';
  carePanel.appendChild(acrobaticsTitle);

  const flipBtn = document.createElement('button');
  flipBtn.type = 'button';
  flipBtn.className = 'dock-hero-btn';
  flipBtn.innerHTML = '<span>🤸</span><span>Do a Joyful Backflip!</span>';

  flipBtn.addEventListener('click', () => {
    flipBtn.classList.add('bouncing');
    setTimeout(() => flipBtn.classList.remove('bouncing'), 650);
    onChange('doJoyFlip', true);
  });
  carePanel.appendChild(flipBtn);

  // 4. Audio Sound FX Toggle Row
  const audioRow = document.createElement('div');
  audioRow.className = 'dock-subhead-row';
  audioRow.style.marginTop = '14px';

  const audioTitle = document.createElement('span');
  audioTitle.className = 'dock-subhead';
  audioTitle.textContent = 'Procedural Sound';

  let careSoundToggleBtn = document.createElement('button');
  careSoundToggleBtn.type = 'button';
  careSoundToggleBtn.className = 'dock-toggle-pill-btn';
  careSoundToggleBtn.textContent = isAudioMuted() ? '🔇 Sound: Muted' : '🔊 Sound: Active';
  careSoundToggleBtn.classList.toggle('active', !isAudioMuted());

  careSoundToggleBtn.addEventListener('click', () => {
    const muted = toggleAudioMute();
    careSoundToggleBtn.textContent = muted ? '🔇 Sound: Muted' : '🔊 Sound: Active';
    careSoundToggleBtn.classList.toggle('active', !muted);
    soundBtn.textContent = muted ? '🔇' : '🔊';
  });

  audioRow.appendChild(audioTitle);
  audioRow.appendChild(careSoundToggleBtn);
  carePanel.appendChild(audioRow);

  // 5. Secret Playground Link (Grass Painter)
  const grassLinkRow = document.createElement('div');
  grassLinkRow.className = 'dock-grass-link-wrap';
  grassLinkRow.innerHTML = `
    <a href="./grass.html" class="dock-grass-link">
      <span>🌱 GPU Grass Painter Playground</span>
      <span>↗</span>
    </a>
  `;
  carePanel.appendChild(grassLinkRow);

  // =========================================================================
  // TAB 4: 📸 SNAPSHOT (PHOTO BOOTH & POLAROID CARD)
  // =========================================================================
  const photoPanel = tabPanels['snapshot'];

  const photoCard = document.createElement('div');
  photoCard.className = 'dock-photo-booth-card';

  photoCard.innerHTML = `
    <div class="photo-booth-preview">
      <div class="photo-polaroid-frame">
        <div class="photo-inner-screen">
          <span class="photo-lens-icon">📷</span>
        </div>
        <div class="photo-polaroid-label">✦ ${creatureName} ✦</div>
      </div>
    </div>
    <div class="photo-booth-desc">
      Capture a vintage polaroid card of your unique creature, complete with signature watermark, and auto-download high-res PNG.
    </div>
  `;

  const photoPolaroidLabel = photoCard.querySelector('.photo-polaroid-label');

  function updatePolaroidLabel(name) {
    if (photoPolaroidLabel) {
      photoPolaroidLabel.textContent = `✦ ${name} ✦`;
    }
  }

  const snapBtn = document.createElement('button');
  snapBtn.type = 'button';
  snapBtn.className = 'dock-hero-btn snap-btn';
  snapBtn.innerHTML = '<span>📸</span><span>Capture Polaroid Photo</span>';

  snapBtn.addEventListener('click', () => {
    snapBtn.disabled = true;
    snapBtn.classList.add('bouncing');
    onChange('takeSnapshot', creatureName);
    setTimeout(() => {
      snapBtn.disabled = false;
      snapBtn.classList.remove('bouncing');
    }, 1200);
  });

  photoCard.appendChild(snapBtn);
  photoPanel.appendChild(photoCard);

  // =========================================================================
  // HELPERS & SYNC METHODS
  // =========================================================================
  function updateGPUFurModeUI(enabled) {
    topGpuFurPill.classList.toggle('active', enabled);
    topGpuFurPill.setAttribute('aria-pressed', String(enabled));
    engineModeBtn.classList.toggle('active', enabled);
    engineModeBtn.textContent = enabled ? '✨ 64-Shell WebGPU Fur' : '⚡ Analytical WebGL';
  }

  topGpuFurPill.addEventListener('click', () => {
    const next = !state.gpuFurEnabled;
    updateGPUFurModeUI(next);
    onChange('toggleGPUFur', next);
  });

  updateGPUFurModeUI(Boolean(state.gpuFurEnabled));

  function updateEnvSelectionUI(activeId) {
    const safeId = sanitizeEnvId(activeId, 'studio');
    Object.keys(sceneButtons).forEach((id) => {
      const isSel = id === safeId;
      sceneButtons[id].classList.toggle('active', isSel);
      sceneButtons[id].setAttribute('aria-selected', String(isSel));
    });
    Object.keys(atmosphereEnvButtons).forEach((id) => {
      const isSel = id === safeId;
      atmosphereEnvButtons[id].classList.toggle('active', isSel);
    });
    const matchedPreset = ENVIRONMENT_PRESETS.find((e) => e.id === safeId);
    if (matchedPreset && mobileBtnScene) {
      mobileBtnScene.textContent = matchedPreset.name;
    }
    if (arSection) {
      arSection.style.display = safeId === 'ar' ? 'block' : 'none';
    }
  }

  function syncAllUI() {
    updatePresetCardsUI();
    Object.keys(sliderRefs).forEach((k) => {
      if (sliderRefs[k] && state[k] !== undefined) {
        sliderRefs[k].input.value = String(state[k]);
        sliderRefs[k].valSpan.textContent = sliderRefs[k].formatFn(state[k]);
      }
    });
    Object.keys(colorRefs).forEach((k) => {
      if (colorRefs[k] && state[k]) {
        colorRefs[k].value = state[k];
        if (colorRefs[k].previousElementSibling) {
          colorRefs[k].previousElementSibling.previousElementSibling.style.background = state[k];
        }
      }
    });
    updateEnvSelectionUI(state.environment || 'studio');
    updateGPUFurModeUI(Boolean(state.gpuFurEnabled));
  }

  return {
    syncUI() {
      syncAllUI();
    },
    setGPUFurEnabled(enabled) {
      updateGPUFurModeUI(Boolean(enabled));
    },
    setActiveEnvironment(envId) {
      const safeEnv = sanitizeEnvId(envId, 'studio');
      state.environment = safeEnv;
      updateEnvSelectionUI(safeEnv);
    },
    setARStatus(statusText, isLive) {
      arStatusText.textContent = String(statusText || '');
      arStatusDot.classList.toggle('live', Boolean(isLive));
    },
    setARPlaneStatus(surfaceType, planeY, confidence, featureCount) {
      const confPct = Math.round((confidence || 0.9) * 100);
      arStatusText.textContent = `${surfaceType} (${confPct}% conf)`;
      arPlaneBadge.textContent = `${featureCount || 0} pts`;
    },
    setARLightStatus(lightInfo) {
      if (!lightInfo) return;
      ['lightAngle', 'lightIntensity', 'rimIntensity'].forEach((k) => {
        if (sliderRefs[k] && state[k] !== undefined) {
          sliderRefs[k].input.value = String(state[k]);
          sliderRefs[k].valSpan.textContent = sliderRefs[k].formatFn(state[k]);
        }
      });
    },
    setLightEstActive(isActive) {
      lightEstActive = Boolean(isActive);
      lightEstBtn.textContent = lightEstActive ? 'Light Est: ON' : 'Light Est: OFF';
      lightEstBtn.classList.toggle('active', lightEstActive);
    },
    setSurfaceTrackedStatus(isLocked, confidence) {
      if (isLocked) {
        arStatusDot.style.background = '#4ade80';
        arPlaneBadge.textContent = `${confidence}% lock`;
      } else {
        arStatusDot.style.background = '#38bdf8';
      }
    },
    setTapPlaceActive(isActive) {
      tapPlaceActive = Boolean(isActive);
      tapPlaceBtn.textContent = tapPlaceActive ? 'Tap to Place: ON' : 'Tap to Place: OFF';
      tapPlaceBtn.classList.toggle('active', tapPlaceActive);
    },
    setMirrorLabel(isMirrored) {
      mirrorBtn.textContent = isMirrored ? 'Mirror: ON' : 'Mirror: OFF';
    },
    updateAffection(level, currentLove, maxLove, levelTitle, totalHearts, streakDays = 1) {
      const pct = Math.min(100, Math.max(0, (currentLove / Math.max(1, maxLove)) * 100));
      loveLevelTitle.textContent = `Level ${level}: ${levelTitle}`;
      loveHeartsCount.textContent = `💖 ${totalHearts} Hearts`;
      loveFill.style.width = `${pct}%`;
      pillBadge.textContent = `💖 Lv.${level} (${Math.round(pct)}%)`;
      if (loveStreakBadge) {
        loveStreakBadge.textContent = `🔥 Day ${streakDays} Streak`;
      }
    },
    getCreatureName() {
      return creatureName;
    },
    setCreatureName(name) {
      creatureName = name;
      careNameInput.value = name;
      pillName.textContent = name;
      dockNameDisplay.textContent = name;
      updatePolaroidLabel(name);
    }
  };
}
