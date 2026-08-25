document.querySelectorAll('[data-memory-layout]').forEach((builder) => {
  const fields = {
    rom: {
      size: builder.querySelector('select[data-rom-size]'),
      start: builder.querySelector('input[data-rom-start]'),
      range: builder.querySelector('[data-rom-range]'),
      pins: builder.querySelector('[data-rom-pins]'),
      decode: builder.querySelector('[data-rom-decode]')
    },
    ram: {
      size: builder.querySelector('select[data-ram-size]'),
      start: builder.querySelector('input[data-ram-start]'),
      range: builder.querySelector('[data-ram-range]'),
      pins: builder.querySelector('[data-ram-pins]'),
      decode: builder.querySelector('[data-ram-decode]')
    }
  };
  const message = builder.querySelector('[data-layout-message]');

  const parseHex = (text) => {
    const cleaned = text.trim().toUpperCase().replace(/^0X/, '').replace(/H$/, '');
    return /^[0-9A-F]{1,4}$/.test(cleaned) ? parseInt(cleaned, 16) : NaN;
  };
  const hex4 = (value) => value.toString(16).toUpperCase().padStart(4, '0') + 'H';

  const analyse = (kind) => {
    const field = fields[kind];
    const sizeK = Number(field.size.value);
    const bytes = sizeK * 1024;
    const addressBits = Math.log2(bytes);
    const start = parseHex(field.start.value);
    const end = start + bytes - 1;
    const valid = Number.isInteger(addressBits) && !Number.isNaN(start) && end <= 0xffff;
    const aligned = valid && start % bytes === 0;
    const fixedCount = 16 - addressBits;
    const pattern = valid ? start.toString(2).padStart(16, '0').slice(0, fixedCount) : '';

    field.range.textContent = valid ? `${hex4(start)}–${hex4(end)}` : 'ไม่ถูกต้อง';
    field.pins.textContent = `A${addressBits - 1}–A0 (${addressBits} เส้น)`;
    field.decode.textContent = valid
      ? aligned ? `A15–A${addressBits} = ${pattern}` : 'ไม่ตรงขอบ — ต้องใช้ logic เพิ่ม'
      : 'ตรวจ Start/Size';
    if (valid) field.start.value = hex4(start);
    return {kind, start, end, valid, aligned};
  };

  const update = () => {
    const rom = analyse('rom');
    const ram = analyse('ram');
    const overlap = rom.valid && ram.valid && rom.start <= ram.end && ram.start <= rom.end;
    const problems = [];
    if (!rom.valid || !ram.valid) problems.push('Address เกิน FFFFH หรือรูปแบบไม่ถูกต้อง');
    if (rom.valid && !rom.aligned) problems.push('ROM เริ่มไม่ตรงขอบตามขนาด');
    if (ram.valid && !ram.aligned) problems.push('RAM เริ่มไม่ตรงขอบตามขนาด');
    if (overlap) problems.push('ช่วง ROM และ RAM ซ้อนกัน');

    message.className = `layout-message ${problems.length ? 'warn' : 'ok'}`;
    message.textContent = problems.length
      ? `ต้องออกแบบ logic เพิ่มหรือแก้ Memory map: ${problems.join(' · ')}`
      : 'วางได้ด้วยการต่อ Address ต่ำเข้าชิป และ decode บิตสูงตามผลด้านบน';
  };

  builder.querySelectorAll('select, input').forEach((control) => {
    control.addEventListener('change', update);
    control.addEventListener('input', update);
  });
  builder.querySelectorAll('[data-layout-preset]').forEach((button) => {
    button.addEventListener('click', () => {
      fields.rom.size.value = button.dataset.romSize;
      fields.rom.start.value = button.dataset.romStart;
      fields.ram.size.value = button.dataset.ramSize;
      fields.ram.start.value = button.dataset.ramStart;
      update();
    });
  });
  update();
});
