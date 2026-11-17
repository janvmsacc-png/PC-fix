document.addEventListener('DOMContentLoaded', () => {
  // === 3D MOTHERBOARD ANIMATION FOR TUTORIAL CARDS ===
  const canvases = document.querySelectorAll('.assembly-canvas');
  if (!canvases.length) return;

  canvases.forEach(canvas => {
    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f4ff);

    const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    camera.position.set(0, 0, 3.5);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.autoRotate = false;
    controls.autoRotateSpeed = 0.5;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(2, 3, 4);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Colors from theme
    const accentColor = 0x4f46e5;
    const tealColor = 0x0d9488;
    const neutralColor = 0x64748b;

    // Motherboard base
    const boardGeo = new THREE.BoxGeometry(2.2, 0.08, 1.6);
    const boardMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.3, roughness: 0.4 });
    const board = new THREE.Mesh(boardGeo, boardMat);
    board.position.y = -0.1;
    board.receiveShadow = true;
    scene.add(board);

    // CPU
    const cpuGeo = new THREE.BoxGeometry(0.5, 0.12, 0.5);
    const cpuMat = new THREE.MeshStandardMaterial({ color: neutralColor, metalness: 0.6, roughness: 0.2 });
    const cpu = new THREE.Mesh(cpuGeo, cpuMat);
    cpu.position.set(0, 0.05, 0);
    cpu.castShadow = true;
    scene.add(cpu);

    // RAM sticks
    const ramGeo = new THREE.BoxGeometry(0.15, 0.1, 0.7);
    const ramMat1 = new THREE.MeshStandardMaterial({ color: accentColor, metalness: 0.4, roughness: 0.3 });
    const ramMat2 = new THREE.MeshStandardMaterial({ color: tealColor, metalness: 0.4, roughness: 0.3 });

    const ram1 = new THREE.Mesh(ramGeo, ramMat1);
    ram1.position.set(-0.7, 0.05, 0);
    ram1.castShadow = true;
    scene.add(ram1);

    const ram2 = new THREE.Mesh(ramGeo, ramMat2);
    ram2.position.set(0.7, 0.05, 0);
    ram2.castShadow = true;
    scene.add(ram2);

    // Heat sink / chip
    const chipGeo = new THREE.BoxGeometry(0.35, 0.15, 0.35);
    const chipMat = new THREE.MeshStandardMaterial({ color: 0xf97316, metalness: 0.5, roughness: 0.25 });
    const chip = new THREE.Mesh(chipGeo, chipMat);
    chip.position.set(0.4, 0.06, -0.45);
    chip.castShadow = true;
    scene.add(chip);

    // Small capacitor dots
    const capGeo = new THREE.SphereGeometry(0.04, 12, 12);
    const capMat = new THREE.MeshStandardMaterial({ color: 0xfcd34d });
    const capPositions = [
      [-0.6, 0.08, 0.5], [0.6, 0.08, 0.5],
      [-0.4, 0.08, -0.5], [0.3, 0.08, -0.5],
      [0, 0.08, 0.55]
    ];
    capPositions.forEach(([x, y, z]) => {
      const cap = new THREE.Mesh(capGeo, capMat);
      cap.position.set(x, y, z);
      cap.castShadow = true;
      scene.add(cap);
    });

    // Floating particles
    const particleCount = 40;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 3;
      positions[i + 1] = (Math.random() - 0.5) * 2;
      positions[i + 2] = (Math.random() - 0.5) * 3;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: accentColor,
      size: 0.025,
      transparent: true,
      opacity: 0.6
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Hover state
    let hovered = false;
    canvas.addEventListener('mouseenter', () => { hovered = true; });
    canvas.addEventListener('mouseleave', () => { hovered = false; });

    // Animation loop
    const baseRotY = board.rotation.y;
    function animate() {
      requestAnimationFrame(animate);

      const time = performance.now() * 0.001;
      const t = hovered ? 1 : 0;
      const ease = 0.05;

      // Gentle floating & rotation on hover
      board.rotation.y += ((baseRotY + Math.sin(time * 0.5) * 0.15 * t) - board.rotation.y) * ease;
      board.rotation.x += (Math.sin(time * 0.7) * 0.08 * t - board.rotation.x) * ease;
      board.position.y += ((-0.1 + Math.sin(time * 1.2) * 0.1 * t) - board.position.y) * ease;

      // CPU pulse
      cpu.scale.setScalar(1 + Math.sin(time * 3) * 0.05 * t);

      // Particles swirl
      const pos = particles.geometry.attributes.position.array;
      for (let i = 0; i < pos.length; i += 3) {
        pos[i + 1] += Math.sin(time + i) * 0.003 * t;
        if (pos[i + 1] > 1) pos[i + 1] = -1;
      }
      particles.geometry.attributes.position.needsUpdate = true;

      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    // Responsive resize
    const resizeObserver = new ResizeObserver(() => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    resizeObserver.observe(canvas);
  });

  // === TROUBLESHOOTER LOGIC ===
  const symptomView = document.getElementById('symptomView');
  const safetyView = document.getElementById('safetyView');
  const stepView = document.getElementById('stepView');
  const resultView = document.getElementById('resultView');
  const toolStatus = document.getElementById('toolStatus');
  const progressBar = document.querySelector('.diagnostic-progress span');
  const restartBtn = document.getElementById('restartTool');
  const safetyConfirm = document.getElementById('safetyConfirm');
  const beginBtn = document.getElementById('beginGuide');
  const safetyStop = document.getElementById('safetyStop');
  const safetyBack = document.getElementById('safetyBack');
  const fixedBtn = document.getElementById('fixedButton');
  const nextBtn = document.getElementById('nextStepButton');

  let currentStep = 0;

  // Update progress bar
  function setProgress(percent) {
    progressBar.style.width = percent + '%';
  }

  // Show only one view at a time
  function showView(viewId) {
    [symptomView, safetyView, stepView, resultView].forEach(v => {
      if (v) v.classList.add('hidden');
    });
    const target = document.getElementById(viewId);
    if (target) target.classList.remove('hidden');
  }

  // Symptom selection
  document.querySelectorAll('.symptom-option').forEach(btn => {
    btn.addEventListener('click', () => {
      currentStep = 1;
      setProgress(33);
      toolStatus.textContent = 'Safety Check';
      showView('safetyView');
    });
  });

  // Enable begin button only when checkbox is checked
  if (safetyConfirm) {
    safetyConfirm.addEventListener('change', () => {
      beginBtn.disabled = !safetyConfirm.checked;
    });
  }

  // Passed safety → start guide
  if (beginBtn) {
    beginBtn.addEventListener('click', () => {
      currentStep = 2;
      setProgress(66);
      toolStatus.textContent = 'Step 1 of 1';
      showView('stepView');
    });
  }

  // Unsafe / stop
  if (safetyStop) {
    safetyStop.addEventListener('click', () => {
      alert('⚠️ Please stop and contact a professional technician immediately.');
    });
  }

  // Go back to symptoms
  if (safetyBack) {
    safetyBack.addEventListener('click', () => {
      currentStep = 0;
      setProgress(0);
      toolStatus.textContent = 'Select a symptom';
      showView('symptomView');
      if (safetyConfirm) safetyConfirm.checked = false;
    });
  }

  // Issue resolved
  if (fixedBtn) {
    fixedBtn.addEventListener('click', () => {
      currentStep = 3;
      setProgress(100);
      toolStatus.textContent = 'All Done!';
      showView('resultView');
      if (resultView) {
        resultView.innerHTML = `
          <div style="text-align:center; padding:2rem;">
            <div style="font-size:3rem; margin-bottom:1rem;">✅</div>
            <h3 style="color:#10b981; margin-bottom:0.5rem;">Great!</h3>
            <p style="color:#64748b;">Your issue appears to be resolved. If you encounter problems again, come back and start a new check.</p>
            <button onclick="location.reload()" class="btn btn-primary" style="margin-top:1.5rem;">Start New Check</button>
          </div>
        `;
      }
    });
  }

  // Need more help
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      currentStep = 3;
      setProgress(100);
      toolStatus.textContent = 'Recommendation';
      showView('resultView');
      if (resultView) {
        resultView.innerHTML = `
          <div style="text-align:center; padding:2rem;">
            <div style="font-size:3rem; margin-bottom:1rem;">🔧</div>
            <h3 style="color:#4f46e5; margin-bottom:0.5rem;">Professional Help Needed</h3>
            <p style="color:#64748b;">Based on your responses, we recommend having a certified technician look at your device.</p>
            <a href="/book?service=repair" class="btn btn-primary" style="display:inline-block; margin-top:1.5rem;">Book a Repair Service</a>
            <button onclick="location.reload()" class="btn btn-secondary" style="margin-top:1rem;">Start Over</button>
          </div>
        `;
      }
    });
  }

  // Restart entire process
  if (restartBtn) {
    restartBtn.addEventListener('click', () => {
      location.reload();
    });
  }
});