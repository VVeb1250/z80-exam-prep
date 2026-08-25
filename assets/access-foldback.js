document.querySelectorAll('[data-fold-lab]').forEach((lab) => {
  const modeInput = lab.querySelector('[data-mode-input]');
  const blockInput = lab.querySelector('[data-block-input]');
  const circuit = lab.querySelector('[data-lab-circuit]');
  const cells = [...lab.querySelectorAll('[data-block-cell]')];
  const fields = Object.fromEntries(
    [...lab.querySelectorAll('[data-lab-field]')].map((node) => [node.dataset.labField, node])
  );
  const romWire = lab.querySelector('[data-select-rom]');
  const ramWire = lab.querySelector('[data-select-ram]');
  const romChip = lab.querySelector('[data-chip="rom"]');
  const ramChip = lab.querySelector('[data-chip="ram"]');

  const update = () => {
    const partial = Number(modeInput.value) === 1;
    const block = Number(blockInput.value);
    const highBits = block.toString(2).padStart(4, '0');
    const address = `${block.toString(16).toUpperCase()}123H`;
    const device = partial ? (block % 2 === 0 ? 'ROM' : 'RAM')
      : block === 0 ? 'ROM' : block === 1 ? 'RAM' : 'ไม่มีชิปตอบ';

    circuit.classList.toggle('is-partial', partial);
    fields.mode.textContent = partial ? 'Partial decoding' : 'Full decoding';
    fields.block.textContent = `${block.toString(16).toUpperCase()}xxxH`;
    fields.address.textContent = address;
    fields.highBits.textContent = highBits;
    fields.decoderTitle.textContent = partial ? '2-way select logic' : '74x154';
    fields.decoderDetail.textContent = partial ? 'ใช้ A12 + /MREQ' : 'ใช้ A15–A12 + /MREQ';
    fields.romOut.textContent = partial ? '/CE_ROM' : 'Y0';
    fields.ramOut.textContent = partial ? '/CE_RAM' : 'Y1';
    fields.device.textContent = device;
    fields.offset.textContent = device === 'ไม่มีชิปตอบ' ? '—' : '123H';
    fields.copy.textContent = partial ? `สำเนาที่ ${Math.floor(block / 2) + 1}/8` : 'มีเพียงตำแหน่งเดียว';
    fields.fold.textContent = partial ? 'เกิด Foldback 8 ชุด' : 'ไม่เกิด Foldback';

    romWire.classList.toggle('is-active', device === 'ROM');
    ramWire.classList.toggle('is-active', device === 'RAM');
    romChip.classList.toggle('is-selected', device === 'ROM');
    ramChip.classList.toggle('is-selected', device === 'RAM');

    cells.forEach((cell, index) => {
      cell.classList.remove('rom', 'ram', 'active');
      const mapped = partial ? (index % 2 === 0 ? 'rom' : 'ram')
        : index === 0 ? 'rom' : index === 1 ? 'ram' : '';
      if (mapped) cell.classList.add(mapped);
      cell.classList.toggle('active', index === block);
      cell.querySelector('small').textContent = mapped ? mapped.toUpperCase() : 'ว่าง';
    });
  };

  modeInput.addEventListener('input', update);
  blockInput.addEventListener('input', update);
  update();
});
