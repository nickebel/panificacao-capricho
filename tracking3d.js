(function () {
  'use strict';
  const hero = document.querySelector('.hero');
  const stage = hero && hero.querySelector('.hero-depth-stage');
  if (!hero || !stage) return;
  const cards = Array.from(stage.querySelectorAll('[data-depth]'));
  const controls = hero.querySelector('.hero-tracking-controls');
  const buttons = Array.from(hero.querySelectorAll('[data-tracking-mode]'));
  const status = hero.querySelector('#tracking-status');
  const video = document.getElementById('tracking-video');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = window.matchMedia('(max-width: 740px)');
  const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
  const messages = {
    pt: {
      mouse: 'Mova o mouse ou arraste o dedo para explorar a profundidade.',
      cameraLoading: 'Preparando a câmera e a visão 3D…',
      cameraReady: 'Visão 3D ativa pela câmera. O vídeo é processado neste dispositivo.',
      noFace: 'Posicione o rosto à frente da câmera e mova a cabeça devagar.',
      cameraError: 'Não foi possível ativar a câmera. Mouse e toque continuam disponíveis.',
      noCamera: 'Este navegador não oferece câmera compatível. Use mouse ou toque.',
      reduced: 'A opção de movimento reduzido do dispositivo está ativa.',
      controls: 'Controles da perspectiva 3D'
    },
    en: {
      mouse: 'Move the mouse or drag your finger to explore the depth.',
      cameraLoading: 'Preparing the camera and 3D view…',
      cameraReady: 'Camera-based 3D view is active. Video is processed on this device.',
      noFace: 'Face the camera and move your head slowly.',
      cameraError: 'Could not activate the camera. Mouse and touch remain available.',
      noCamera: 'This browser has no compatible camera. Use mouse or touch.',
      reduced: 'Your device’s reduced-motion setting is enabled.',
      controls: '3D perspective controls'
    }
  };
  let lang = document.documentElement.lang === 'en' ? 'en' : 'pt';
  let mode = 'mouse';
  let cameraRequest = 0;
  let stream = null;
  let landmarker = null;
  let visionFileset = null;
  let raf = 0;
  let lastInferenceAt = 0;
  let lastVideoTime = -1;
  let faceWasFound = false;
  let lastFaceNoticeAt = 0;
  let target = { x: 0, y: 0, zoom: 0 };
  let current = { x: 0, y: 0, zoom: 0 };

  function setStatus(key) {
    if (status) status.textContent = messages[lang][key] || messages[lang].mouse;
  }
  function setMode(next) {
    mode = next;
    hero.dataset.trackingMode = next;
    buttons.forEach(function (button) {
      const active = button.getAttribute('data-tracking-mode') === next;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }
  function setTarget(x, y, zoom) {
    target.x = clamp(x, -1, 1);
    target.y = clamp(y, -1, 1);
    target.zoom = clamp(zoom || 0, -0.5, 0.5);
  }
  function normalizePointer(event) {
    if (mode !== 'mouse' || reduceMotion.matches) return;
    const rect = hero.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const nx = clamp(((event.clientX - rect.left) / rect.width) * 2 - 1, -1, 1);
    const ny = clamp(((event.clientY - rect.top) / rect.height) * 2 - 1, -1, 1);
    setTarget(nx, ny, 0);
  }
  function pointerLeave() {
    if (mode === 'mouse') setTarget(0, 0, 0);
  }
  function stopCamera(invalidate) {
    if (invalidate !== false) cameraRequest += 1;
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    if (stream) {
      stream.getTracks().forEach(function (track) { track.stop(); });
      stream = null;
    }
    if (video) video.srcObject = null;
    if (landmarker && typeof landmarker.close === 'function') {
      try { landmarker.close(); } catch (_) {}
    }
    landmarker = null;
    lastVideoTime = -1;
  }
  function useMouse(announce) {
    stopCamera();
    setMode('mouse');
    setTarget(0, 0, 0);
    current = { x: 0, y: 0, zoom: 0 };
    if (announce !== false) setStatus(reduceMotion.matches ? 'reduced' : 'mouse');
  }
  async function loadVision() {
    if (!visionFileset) {
      const vision = await import('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.1.0/vision_bundle.mjs');
      const fileset = await vision.FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.1.0/wasm'
      );
      visionFileset = { FaceLandmarker: vision.FaceLandmarker, fileset: fileset };
    }
    return visionFileset;
  }
  async function createLandmarker() {
    const vision = await loadVision();
    const options = {
      baseOptions: {
        modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
        delegate: 'GPU'
      },
      runningMode: 'VIDEO',
      numFaces: 1,
      minFaceDetectionConfidence: 0.45,
      minFacePresenceConfidence: 0.45,
      minTrackingConfidence: 0.45,
      outputFaceBlendshapes: false,
      outputFacialTransformationMatrixes: false
    };
    try {
      return await vision.FaceLandmarker.createFromOptions(vision.fileset, options);
    } catch (gpuError) {
      options.baseOptions.delegate = 'CPU';
      return vision.FaceLandmarker.createFromOptions(vision.fileset, options);
    }
  }
  function cameraFrame(now) {
    if (mode !== 'camera' || !landmarker || !video) return;
    if (video.readyState >= 2 && video.currentTime !== lastVideoTime && now - lastInferenceAt >= (mobile.matches ? 75 : 45)) {
      lastVideoTime = video.currentTime;
      lastInferenceAt = now;
      try {
        const result = landmarker.detectForVideo(video, now);
        const face = result.faceLandmarks && result.faceLandmarks[0];
        if (face && face[33] && face[263]) {
          const leftEye = face[33];
          const rightEye = face[263];
          const centerX = (leftEye.x + rightEye.x) / 2;
          const centerY = (leftEye.y + rightEye.y) / 2;
          const eyeSpan = Math.abs(rightEye.x - leftEye.x);
          setTarget((centerX - 0.5) * 2.3, (centerY - 0.43) * 2.0, clamp((eyeSpan / 0.17 - 1) * 0.45, -0.35, 0.45));
          if (!faceWasFound) setStatus('cameraReady');
          faceWasFound = true;
        } else {
          setTarget(0, 0, 0);
          if (faceWasFound || now - lastFaceNoticeAt > 3500) {
            setStatus('noFace');
            lastFaceNoticeAt = now;
          }
          faceWasFound = false;
        }
      } catch (error) {
        console.warn('[Capricho 3D] Face tracking paused:', error);
        useMouse(false);
        setStatus('cameraError');
        return;
      }
    }
    raf = requestAnimationFrame(cameraFrame);
  }
  async function useCamera() {
    if (reduceMotion.matches) {
      setStatus('reduced');
      return;
    }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !window.isSecureContext) {
      setStatus('noCamera');
      return;
    }
    const requestId = ++cameraRequest;
    setMode('camera');
    setTarget(0, 0, 0);
    setStatus('cameraLoading');
    faceWasFound = false;
    try {
      // Ask for camera permission directly from this click, before loading the model.
      const requestedStream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 24, max: 30 }
        }
      });
      if (requestId !== cameraRequest || mode !== 'camera') {
        requestedStream.getTracks().forEach(function (track) { track.stop(); });
        return;
      }
      stream = requestedStream;
      video.srcObject = stream;
      await video.play();
      if (requestId !== cameraRequest || mode !== 'camera') return;
      landmarker = await createLandmarker();
      if (requestId !== cameraRequest || mode !== 'camera') {
        stopCamera(false);
        return;
      }
      lastInferenceAt = 0;
      lastVideoTime = -1;
      setStatus('cameraReady');
      raf = requestAnimationFrame(cameraFrame);
    } catch (error) {
      if (requestId !== cameraRequest) return;
      console.warn('[Capricho 3D] Could not start camera tracking:', error);
      stopCamera(false);
      setMode('mouse');
      setTarget(0, 0, 0);
      setStatus('cameraError');
    }
  }
  function renderMotion() {
    const amount = reduceMotion.matches ? 1 : 1 - Math.exp(-1 / (mobile.matches ? 8 : 10));
    current.x += (target.x - current.x) * amount;
    current.y += (target.y - current.y) * amount;
    current.zoom += (target.zoom - current.zoom) * amount;
    if (!reduceMotion.matches) {
      cards.forEach(function (card) {
        const depth = Number(card.getAttribute('data-depth')) || 1;
        const rotation = Number(card.getAttribute('data-rotate')) || 0;
        const x = -current.x * depth * (mobile.matches ? 9 : 15);
        const y = -current.y * depth * (mobile.matches ? 7 : 10);
        const rotateX = current.y * depth * 2.2;
        const rotateY = -current.x * depth * 3.2;
        const rotateZ = rotation + current.x * depth * 1.1;
        const scale = 1 + current.zoom * depth * 0.035;
        card.style.transform = 'translate3d(' + x.toFixed(2) + 'px,' + y.toFixed(2) + 'px,' + (depth * 9).toFixed(2) + 'px) rotateX(' + rotateX.toFixed(2) + 'deg) rotateY(' + rotateY.toFixed(2) + 'deg) rotateZ(' + rotateZ.toFixed(2) + 'deg) scale(' + scale.toFixed(3) + ')';
      });
      hero.style.setProperty('--hero-bg-x', (-current.x * 7).toFixed(2) + 'px');
      hero.style.setProperty('--hero-bg-y', (-current.y * 5).toFixed(2) + 'px');
    }
    requestAnimationFrame(renderMotion);
  }
  buttons.forEach(function (button) {
    button.addEventListener('click', function () {
      const nextMode = button.getAttribute('data-tracking-mode');
      if (nextMode === 'camera') {
        if (mode === 'camera') useMouse();
        else useCamera();
      } else {
        useMouse();
      }
    });
  });
  hero.addEventListener('pointermove', normalizePointer, { passive: true });
  hero.addEventListener('pointerleave', pointerLeave, { passive: true });
  hero.addEventListener('pointercancel', pointerLeave, { passive: true });
  document.addEventListener('visibilitychange', function () {
    if (document.hidden && mode === 'camera') {
      useMouse(false);
      setStatus('mouse');
    }
  });
  window.addEventListener('pagehide', function () { stopCamera(); });
  if (controls) controls.setAttribute('aria-label', messages[lang].controls);
  if (reduceMotion.matches) setStatus('reduced');
  else setStatus('mouse');
  renderMotion();
  window.CaprichoTracking3D = {
    setLanguage: function (code) {
      lang = code === 'en' ? 'en' : 'pt';
      if (controls) controls.setAttribute('aria-label', messages[lang].controls);
      if (mode === 'camera') setStatus(faceWasFound ? 'cameraReady' : 'noFace');
      else setStatus(reduceMotion.matches ? 'reduced' : 'mouse');
    }
  };
})();