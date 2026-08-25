document.querySelectorAll('[data-address-sim]').forEach((sim) => {
  const input = sim.querySelector('[data-address-input]');
  const high = sim.querySelector('[data-sim-high]');
  const low = sim.querySelector('[data-sim-low]');
  const device = sim.querySelector('[data-sim-device]');
  const output = sim.querySelector('[data-sim-output]');
  const offset = sim.querySelector('[data-sim-offset]');
  const states = sim.querySelectorAll('[data-device-state]');

  const update = () => {
    const cleaned = input.value.trim().toUpperCase().replace(/^0X/, '').replace(/H$/, '');
    if (!/^[0-9A-F]{1,4}$/.test(cleaned)) {
      device.textContent = 'Address ไม่ถูกต้อง';
      output.textContent = '—';
      offset.textContent = '—';
      states.forEach((state) => state.classList.remove('is-selected'));
      return;
    }

    const value = parseInt(cleaned, 16);
    const block = value >>> 12;
    const inside = value & 0x0fff;
    const blockBits = block.toString(2).padStart(4, '0');
    const insideHex = inside.toString(16).toUpperCase().padStart(3, '0') + 'H';
    const selected = block === 0 ? 'rom' : block === 1 ? 'ram' : 'unused';
    const names = {rom: 'ROM', ram: 'RAM', unused: 'พื้นที่ว่าง'};

    input.value = value.toString(16).toUpperCase().padStart(4, '0') + 'H';
    high.textContent = blockBits;
    low.textContent = inside.toString(2).padStart(12, '0').replace(/(.{4})(?=.)/g, '$1 ');
    device.textContent = names[selected];
    output.textContent = `Y${block} = 0`;
    offset.textContent = insideHex;
    states.forEach((state) => state.classList.toggle('is-selected', state.dataset.deviceState === selected));
  };

  input.addEventListener('input', update);
  input.addEventListener('change', update);
  sim.querySelectorAll('[data-preset]').forEach((button) => {
    button.addEventListener('click', () => {
      input.value = button.dataset.preset;
      update();
    });
  });
  update();
});
