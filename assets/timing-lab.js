(() => {
  const fetch = (pc, opcode) => [
    {cycle: 'M1 · Opcode Fetch', t: 'T1', address: pc, data: 'Z', m1: 'early-fall', mreq: 'fall', iorq: 1, rd: 'fall', wr: 1, rfsh: 1, event: `เริ่มอ่าน Opcode ที่ ${pc}`, direction: 'Memory → Z80 (ข้อมูลยังไม่พร้อม)', timeline: [`ต้น T1: /M1 เริ่มจาก 1 แล้วลงเป็น 0 เพื่อบอกว่า cycle นี้คือ Opcode Fetch; พร้อมกันนั้น Z80 วาง PC=${pc} บน A15–A0`, 'หลังขาลงของ CLK ใน T1: /MREQ และ /RD ลงต่ำ เพื่อให้ Memory decode address และเปิด output buffer', 'ปลาย T1: Address ต้องคงที่ แต่ D7–D0 ยังอาจเป็น High-Z หรือยังไม่เสถียร จึงยังไม่อ่าน Opcode']},
    {cycle: 'M1 · Opcode Fetch', t: 'T2', address: pc, data: opcode, m1: 0, mreq: 0, iorq: 1, rd: 0, wr: 1, rfsh: 1, event: `Memory วาง Opcode ${opcode} บน Data bus`, direction: `Memory → Z80 · ${opcode}`, timeline: ['ต้น T2: /MREQ และ /RD คงระดับต่ำ ทำให้ output buffer ของ Memory ยังเปิดอยู่', `กลาง T2: Memory ขับ Opcode ${opcode} ลง D7–D0; เส้นข้อมูลต้องเริ่มเสถียรก่อน CPU รับค่า`, 'ปลาย T2: Z80 ตรวจ /WAIT; ตัวอย่างนี้ /WAIT=1 จึงไม่แทรก Tw และเดินหน้าเข้า T3']},
    {cycle: 'M1 · Opcode Fetch', t: 'T3', address: 'REFRESH', data: opcode, m1: 'rise', mreq: 'notch', iorq: 1, rd: 'rise', wr: 1, rfsh: 'fall', event: 'รับ Opcode แล้วเริ่ม Refresh', direction: 'Z80 รับ Opcode ที่ปลายช่วงอ่าน', timeline: [`ต้น T3: Z80 รับ ${opcode} จาก D7–D0 แล้ว /RD, /M1 และช่วงอ่านของ /MREQ เริ่มกลับสูง`, 'กลาง T3: A15–A0 เปลี่ยนเป็น Refresh address; /RFSH ลงต่ำ และ /MREQ สร้างพัลส์ต่ำรอบที่สองสำหรับ DRAM refresh', 'ปลาย T3: Instruction decoder เริ่มถอดรหัส Opcode ขณะวงจร Refresh ยังทำงาน']},
    {cycle: 'M1 · Opcode Fetch', t: 'T4', address: 'REFRESH', data: 'Z', m1: 1, mreq: 'rise', iorq: 1, rd: 1, wr: 1, rfsh: 'rise', event: 'จบ Refresh และจบ M1', direction: 'Data bus กลับ High-Z', timeline: ['ต้น T4: Refresh address ยังอยู่บน Address bus และ Data bus ถูกปล่อยเป็น High-Z', 'กลาง T4: /MREQ และ /RFSH กลับสูง ปิดรอบ Refresh', 'ปลาย T4: M1 ครบ 4T; CPU พร้อม execute หรือเริ่ม Machine cycle ถัดไปตามคำสั่ง']}
  ];

  const memoryRead = (cycle, address, value, purpose) => [
    {cycle, t: 'T1', address, data: 'Z', m1: 1, mreq: 'fall', iorq: 1, rd: 'fall', wr: 1, rfsh: 1, event: `เริ่ม Memory Read ที่ ${address}`, direction: 'Memory → Z80 (รอข้อมูล)', timeline: [`ต้น T1: Z80 วางตำแหน่ง ${address} บน A15–A0; /M1=1 เพราะไม่ใช่ Opcode Fetch`, 'หลังขาลงของ CLK ใน T1: /MREQ และ /RD ลงต่ำ เพื่อเลือก Memory และเปิด output buffer', 'ปลาย T1: Memory กำลัง decode address; D7–D0 ยังไม่ควรถูก CPU นำไปใช้']},
    {cycle, t: 'T2', address, data: value, m1: 1, mreq: 0, iorq: 1, rd: 0, wr: 1, rfsh: 1, event: `${purpose}: Memory ส่ง ${value}`, direction: `Memory → Z80 · ${value}`, timeline: ['ต้น T2: Address, /MREQ และ /RD คงที่ ทำให้ชิปที่ถูกเลือกเป็นผู้ขับ Data bus', `กลาง T2: Memory วาง ${value} บน D7–D0; ต้องรอ access time จนข้อมูลเสถียร`, 'ปลาย T2: Z80 ตรวจ /WAIT; ถ้า /WAIT=0 จะเพิ่ม Tw แต่ตัวอย่างนี้พร้อมเข้าสู่ T3']},
    {cycle, t: 'T3', address, data: value, m1: 1, mreq: 'rise', iorq: 1, rd: 'rise', wr: 1, rfsh: 1, event: `Z80 รับ ${value} แล้วปิดรอบอ่าน`, direction: `Z80 รับ ${value} แล้วปล่อยบัส`, timeline: [`ต้น T3: Z80 sample ค่า ${value} จาก D7–D0 และนำไปเก็บตามคำสั่ง`, 'กลาง T3: /RD และ /MREQ เริ่มกลับสูง จึงปิด output buffer ของ Memory', 'ปลาย T3: Address สิ้นสุดความหมายและ Data bus กลับ High-Z; Memory Read ครบ 3T']}
  ];

  const memoryWrite = (address, value) => [
    {cycle: 'M2 · Memory Write', t: 'T1', address, data: value, m1: 1, mreq: 'fall', iorq: 1, rd: 1, wr: 1, rfsh: 1, event: `ตั้ง Address และ Data ก่อนเขียน`, direction: `Z80 → RAM · ${value}`, timeline: [`ต้น T1: Z80 วาง ${address} บน A15–A0 และเริ่มวาง ${value} บน D7–D0`, 'หลังขาลงของ CLK ใน T1: /MREQ ลงต่ำเพื่อเลือก RAM แต่ /WR ยังสูง จึงยังไม่เขียน', 'ปลาย T1: ให้เวลา Address และ Data เสถียรก่อนเปิดสัญญาณเขียน ป้องกันเขียนผิดตำแหน่งหรือผิดค่า']},
    {cycle: 'M2 · Memory Write', t: 'T2', address, data: value, m1: 1, mreq: 0, iorq: 1, rd: 1, wr: 'fall', rfsh: 1, event: `/WR ลงต่ำ—RAM อยู่ในช่วงรับข้อมูล`, direction: `Z80 → RAM · ${value}`, timeline: [`ต้น T2: ${address} และ ${value} คงที่ ขณะที่ /MREQ=0 เลือก RAM อยู่`, 'หลังช่วงเริ่ม T2: /WR ลงต่ำ จึงเกิด write window; RAM เห็นทั้งตำแหน่งและข้อมูลที่ถูกต้องพร้อมกัน', 'ปลาย T2: Z80 ยังคง Address และ Data ไว้ ห้ามเปลี่ยนค่าระหว่างที่ /WR ยัง active']},
    {cycle: 'M2 · Memory Write', t: 'T3', address, data: value, m1: 1, mreq: 'rise', iorq: 1, rd: 1, wr: 'rise', rfsh: 1, event: 'RAM ล็อกข้อมูลและจบรอบเขียน', direction: 'จบการเขียน แล้ว Data bus กลับ High-Z', timeline: [`ต้น T3: ${value} ยังคงเสถียรให้ครบ hold time ขณะ /WR ยังต่ำ`, 'กลาง T3: /WR และ /MREQ กลับสูง; RAM ล็อกค่าที่เขียนเมื่อ write window สิ้นสุด', 'ปลาย T3: Z80 ปล่อย Address และ Data bus กลับ High-Z; Memory Write ครบ 3T']}
  ];

  const ioCycle = (kind, address, value) => {
    const isRead = kind === 'read';
    const cycle = `M3 · I/O ${isRead ? 'Read' : 'Write'}`;
    const base = {cycle, address, m1: 1, mreq: 1, rfsh: 1};
    return [
      {...base, t: 'T1', data: isRead ? 'Z' : value, busData: isRead ? 'Z' : value, iorq: 1, rd: 1, wr: 1, event: `ประกาศ Port address ${address}`, direction: isRead ? 'อุปกรณ์ยังไม่ขับบัส' : `Z80 → Output · ${value}`, timeline: [`ต้น T1: Z80 วาง Port address ${address} บน A15–A0`, isRead ? 'กลาง T1: D7–D0 ยังเป็น High-Z เพราะอุปกรณ์ยังไม่ถูก enable' : `กลาง T1: Z80 วาง ${value} บน D7–D0 เตรียมส่งไป Output latch`, 'ปลาย T1: /IORQ, /RD และ /WR ยังสูง—address decoder เห็น Port แล้วแต่ยังไม่เริ่มถ่ายข้อมูล']},
      {...base, t: 'T2', data: value, busData: isRead ? '…' : value, iorq: 'fall', rd: isRead ? 'fall' : 1, wr: isRead ? 1 : 'fall', event: `เริ่ม I/O ${isRead ? 'Read' : 'Write'}`, direction: isRead ? `Input → Z80 · ${value}` : `Z80 → Output · ${value}`, timeline: [`ต้น T2: Port address ยังต้องคงที่`, `กลาง T2: /IORQ และ /${isRead ? 'RD' : 'WR'} ลงต่ำ; วงจร decode รวมสัญญาณทั้งคู่เพื่อสร้าง I/O Select`, isRead ? `ปลาย T2: Input buffer เริ่มตอบสนอง แต่ค่า ${value} ยังไม่จำเป็นต้องเสถียร` : `ปลาย T2: Output latch เห็น ${value} บน D7–D0 แต่ยังรักษาค่าไว้ตลอดช่วง active`]},
      {...base, t: 'Tw', data: value, busData: isRead ? '…' : value, iorq: 0, rd: isRead ? 0 : 1, wr: isRead ? 1 : 0, event: 'คงสัญญาณไว้ตลอด Wait state', direction: isRead ? `Input → Z80 · ${value}` : `Z80 → Output · ${value}`, timeline: ['ต้น Tw: Z80 แทรก Wait state 1T อัตโนมัติสำหรับ I/O', isRead ? 'กลาง Tw: /IORQ และ /RD ยังคงต่ำ; Address คงที่ ขณะที่อุปกรณ์กำลังทำให้ข้อมูลบน D7–D0 เสถียร' : 'กลาง Tw: /IORQ และ /WR ยังคงต่ำ; Address และ Data จาก Z80 ต้องไม่เปลี่ยน', isRead ? `ปลาย Tw: อุปกรณ์มีเวลาเพิ่มเพื่อทำให้ ${value} เสถียรก่อน CPU รับค่า` : `ปลาย Tw: Latch มีเวลาเห็น ${value} ครบตาม setup time ก่อนจบรอบเขียน`]},
      {...base, t: 'T3', data: value, busData: value, iorq: 'rise', rd: isRead ? 'rise' : 1, wr: isRead ? 1 : 'rise', event: `${isRead ? 'Z80 รับข้อมูล' : 'Latch ล็อกข้อมูล'} แล้วจบ I/O`, direction: isRead ? `Z80 รับ ${value}` : `Output latch เก็บ ${value}`, timeline: [isRead ? `ต้น T3: Input buffer ทำให้ ${value} เสถียรและ Z80 sample ค่านี้` : `ต้น T3: ${value} ยังต้องคงที่จนพ้น hold time ของ Latch`, `กลาง T3: /IORQ และ /${isRead ? 'RD' : 'WR'} กลับสูง ทำให้ I/O Select หายไป`, isRead ? 'ปลาย T3: Input buffer กลับ High-Z และ CPU เก็บค่าลง A' : `ปลาย T3: Output latch เก็บ ${value}; Z80 ปล่อย Data bus` ]}
    ];
  };

  const instructions = {
    memRead: {
      label: '1 · LD A,(HL)', code: '7EH', total: '7T = M1(4T) + Memory Read(3T)',
      states: [...fetch('2000H', '7EH'), ...memoryRead('M2 · Memory Read', '1120H', '5AH', 'อ่าน operand จาก (HL)')]
    },
    memWrite: {
      label: '2 · LD (HL),A', code: '77H', total: '7T = M1(4T) + Memory Write(3T)',
      states: [...fetch('2001H', '77H'), ...memoryWrite('1120H', '5AH')]
    },
    ioRead: {
      label: '3 · IN A,(84H)', code: 'DBH 84H', total: '11T = M1(4T) + Memory Read(3T) + I/O Read(4T)',
      states: [...fetch('2002H', 'DBH'), ...memoryRead('M2 · Operand Read', '2003H', '84H', 'อ่านหมายเลข Port'), ...ioCycle('read', '5A84H', 'C3H')]
    },
    ioWrite: {
      label: '4 · OUT (07H),A', code: 'D3H 07H', total: '11T = M1(4T) + Memory Read(3T) + I/O Write(4T)',
      states: [...fetch('2004H', 'D3H'), ...memoryRead('M2 · Operand Read', '2005H', '07H', 'อ่านหมายเลข Port'), ...ioCycle('write', 'C307H', 'C3H')]
    }
  };

  document.querySelectorAll('[data-timing-lab]').forEach((lab) => {
    const grid = lab.querySelector('[data-timing-grid]');
    const scroller = lab.querySelector('.timing-scroll');
    const slider = lab.querySelector('[data-time-input]');
    const previousButton = lab.querySelector('[data-prev]');
    const nextButton = lab.querySelector('[data-next]');
    const fields = Object.fromEntries([...lab.querySelectorAll('[data-timing-field]')].map((n) => [n.dataset.timingField, n]));
    let selected = 'memRead';
    const phaseLabels = ['ต้นช่วง', 'กลางช่วง', 'ปลายช่วง'];
    const phasePositions = [0.18, 0.5, 0.82];

    const make = (className, text = '') => {
      const node = document.createElement('div');
      node.className = className;
      node.textContent = text;
      return node;
    };
    const signalSvg = (token) => {
      const paths = {
        1: 'M0 10H70', 0: 'M0 30H70',
        'early-fall': 'M0 10H13V30H70',
        fall: 'M0 10H35V30H70', rise: 'M0 30H35V10H70',
        notch: 'M0 30H15V10H48V30H70'
      };
      return `<svg viewBox="0 0 70 40" aria-hidden="true"><path d="${paths[token]}" fill="none" stroke="#17222b" stroke-width="2"/></svg>`;
    };

    const addRow = (label, states, getter, type, currentStateIndex) => {
      grid.append(make('timing-label', label));
      states.forEach((state, index) => {
        const value = getter(state);
        const cell = make(`timing-cell ${type || ''}${index === currentStateIndex ? ' is-current-state' : ''}`);
        cell.dataset.col = index;
        if (type === 'signal') cell.innerHTML = signalSvg(value);
        else if (type === 'clock') cell.innerHTML = '<svg class="clock-svg" viewBox="0 0 70 40" aria-hidden="true"><path d="M0 30V10H35V30H70" fill="none" stroke="#17222b" stroke-width="2"/></svg>';
        else {
          cell.textContent = value;
          if (value === 'Z') cell.classList.add('z');
        }
        grid.append(cell);
      });
    };

    const addBusRow = (label, states, getter, isData = false) => {
      const unit = 70;
      const height = 44;
      const values = states.map(getter);
      grid.append(make('timing-label', label));
      const track = make('timing-bus-track');
      track.style.gridColumn = `span ${states.length}`;
      const groups = [];
      let start = 0;
      while (start < values.length) {
        let end = start + 1;
        while (end < values.length && values[end] === values[start]) end++;
        groups.push({value: values[start], start, end});
        start = end;
      }
      const parts = [];
      if (isData) parts.push(`<path d="M0 22H${states.length * unit}" class="bus-z-line"/>`);
      groups.forEach((group, groupIndex) => {
        const previous = groups[groupIndex - 1]?.value;
        const next = groups[groupIndex + 1]?.value;
        const insetStart = isData && previous === 'Z' ? 0.42 : 0;
        const insetEnd = isData && next === 'Z' ? 0.15 : 0;
        const x1 = (group.start + insetStart) * unit;
        const x2 = (group.end - insetEnd) * unit;
        if (group.value === 'Z') {
          if (!isData) parts.push(`<path d="M${x1} 22H${x2}" class="bus-z-line"/>`);
          return;
        }
        const bevel = Math.min(9, (x2 - x1) / 4);
        const shape = `M${x1} 22L${x1 + bevel} 9H${x2 - bevel}L${x2} 22L${x2 - bevel} 35H${x1 + bevel}Z`;
        parts.push(`<path d="${shape}" class="bus-valid-shape"/>`);
        parts.push(`<text x="${(x1 + x2) / 2}" y="27" text-anchor="middle">${group.value}</text>`);
      });
      track.innerHTML = `<svg class="bus-track-svg" viewBox="0 0 ${states.length * unit} ${height}" preserveAspectRatio="none" aria-hidden="true">${parts.join('')}</svg>`;
      grid.append(track);
    };

    const render = (followCurrent = false) => {
      const instruction = instructions[selected];
      const states = instruction.states;
      const moments = states.flatMap((state, stateIndex) => state.timeline.map((text, phaseIndex) => ({state, stateIndex, phaseIndex, text})));
      slider.max = moments.length - 1;
      if (Number(slider.value) >= moments.length) slider.value = 0;
      const momentIndex = Number(slider.value);
      const moment = moments[momentIndex];
      const currentStateIndex = moment.stateIndex;
      const current = moment.state;
      grid.style.setProperty('--timing-cols', states.length);
      grid.replaceChildren();

      grid.append(make('timing-label', 'Machine cycle'));
      let start = 0;
      while (start < states.length) {
        let end = start + 1;
        while (end < states.length && states[end].cycle === states[start].cycle) end++;
        const band = make('machine-band', states[start].cycle);
        band.style.gridColumn = `span ${end - start}`;
        grid.append(band);
        start = end;
      }
      addRow('T-state', states, (s) => s.t, 'state', currentStateIndex);
      addRow('CLK', states, () => '', 'clock', currentStateIndex);
      addBusRow('A15–A0', states, (s) => s.address);
      addBusRow('D7–D0', states, (s) => s.busData ?? s.data, true);
      ['/M1', '/MREQ', '/IORQ', '/RD', '/WR', '/RFSH'].forEach((label) => {
        const key = label.slice(1).toLowerCase();
        addRow(label, states, (s) => s[key], 'signal', currentStateIndex);
      });

      const stateCell = grid.querySelector(`.timing-cell.state[data-col="${currentStateIndex}"]`);
      if (stateCell) {
        const cursor = make('timing-cursor');
        cursor.setAttribute('aria-hidden', 'true');
        cursor.style.left = `${stateCell.offsetLeft + (stateCell.offsetWidth * phasePositions[moment.phaseIndex])}px`;
        grid.append(cursor);
      }

      fields.instruction.textContent = instruction.label;
      fields.code.textContent = instruction.code;
      fields.total.textContent = instruction.total;
      fields.position.textContent = `${current.cycle} · ${current.t} · ${phaseLabels[moment.phaseIndex]}`;
      fields.phase.textContent = phaseLabels[moment.phaseIndex];
      fields.summary.textContent = current.event;
      fields.event.textContent = moment.text;
      fields.direction.textContent = current.direction;
      fields.previous.textContent = momentIndex ? moments[momentIndex - 1].text : 'เริ่มต้น Instruction cycle';
      fields.next.textContent = momentIndex < moments.length - 1 ? moments[momentIndex + 1].text : 'จบ Instruction cycle';
      fields.step.textContent = `${momentIndex + 1}/${moments.length}`;
      previousButton.disabled = momentIndex === 0;
      nextButton.disabled = momentIndex === moments.length - 1;
      const active = ['/M1', '/MREQ', '/IORQ', '/RD', '/WR', '/RFSH'].filter((label) => {
        const token = current[label.slice(1).toLowerCase()];
        if (token === 0) return true;
        if (token === 'early-fall') return true;
        if (token === 'fall') return moment.phaseIndex > 0;
        if (token === 'rise') return moment.phaseIndex === 0;
        if (token === 'notch') return moment.phaseIndex !== 1;
        return false;
      });
      fields.signals.innerHTML = active.length ? active.map((x) => `<span class="active">${x} active</span>`).join('') : '<span>ไม่มี control active</span>';

      if (followCurrent && scroller && scroller.scrollWidth > scroller.clientWidth) {
        const currentCell = grid.querySelector(`.timing-cell[data-col="${currentStateIndex}"]`);
        const labelWidth = grid.querySelector('.timing-label')?.offsetWidth || 0;
        if (currentCell) {
          const visibleWidth = scroller.clientWidth - labelWidth;
          const target = currentCell.offsetLeft - labelWidth - (visibleWidth - currentCell.offsetWidth) / 2;
          scroller.scrollTo({left: Math.max(0, target), behavior: 'auto'});
        }
      }
    };

    lab.querySelectorAll('[data-instruction]').forEach((button) => {
      button.addEventListener('click', () => {
        selected = button.dataset.instruction;
        lab.querySelectorAll('[data-instruction]').forEach((b) => b.classList.toggle('is-active', b === button));
        slider.value = 0;
        render();
      });
    });
    slider.addEventListener('input', () => render(true));
    previousButton.addEventListener('click', () => {
      slider.value = Math.max(0, Number(slider.value) - 1);
      render(true);
    });
    nextButton.addEventListener('click', () => {
      slider.value = Math.min(Number(slider.max), Number(slider.value) + 1);
      render(true);
    });
    render();
  });
})();
