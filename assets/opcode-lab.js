(() => {
  const programs = {
    register: {
      name: 'Lab A · Register',
      rows: [
        {address:'2000H',asm:'LD A,01H',bytes:['3E','01'],next:'2002H',rule:'Opcode + 8-bit data',why:'3EH คือ LD A,n และ 01H คือข้อมูล n'},
        {address:'2002H',asm:'LD B,02H',bytes:['06','02'],next:'2004H',rule:'Opcode + 8-bit data',why:'06H คือ LD B,n แล้วตามด้วยข้อมูล 02H'},
        {address:'2004H',asm:'LD C,03H',bytes:['0E','03'],next:'2006H',rule:'Opcode + 8-bit data',why:'0EH คือ LD C,n แล้วตามด้วยข้อมูล 03H'},
        {address:'2006H',asm:'LD D,04H',bytes:['16','04'],next:'2008H',rule:'Opcode + 8-bit data',why:'16H คือ LD D,n แล้วตามด้วยข้อมูล 04H'},
        {address:'2008H',asm:'ADD A,B',bytes:['80'],next:'2009H',rule:'คำสั่ง 1 byte',why:'Register ต้นทางถูกเข้ารหัสอยู่ใน Opcode 80H แล้ว'},
        {address:'2009H',asm:'ADD A,C',bytes:['81'],next:'200AH',rule:'คำสั่ง 1 byte',why:'Opcode 81H ระบุ ADD A,C ครบใน byte เดียว'},
        {address:'200AH',asm:'ADD A,D',bytes:['82'],next:'200BH',rule:'คำสั่ง 1 byte',why:'Opcode 82H ระบุ ADD A,D ครบใน byte เดียว'},
        {address:'200BH',asm:'HALT',bytes:['76'],next:'200CH',rule:'คำสั่ง 1 byte',why:'HALT ไม่มี Operand จึงใช้เพียง Opcode 76H'}
      ]
    },
    memory: {
      name: 'Lab B · Memory',
      rows: [
        {address:'200AH',asm:'LD HL,2100H',bytes:['21','00','21'],next:'200DH',rule:'16-bit · Low byte ก่อน',why:'Opcode 21H ตามด้วย low=00H และ high=21H'},
        {address:'200DH',asm:'LD DE,2101H',bytes:['11','01','21'],next:'2010H',rule:'16-bit · Low byte ก่อน',why:'Opcode 11H ตามด้วย low=01H และ high=21H'},
        {address:'2010H',asm:'LD A,(HL)',bytes:['7E'],next:'2011H',rule:'Register indirect · 1 byte',why:'วงเล็บและ HL ถูกเข้ารหัสใน Opcode 7EH แล้ว'},
        {address:'2011H',asm:'LD B,A',bytes:['47'],next:'2012H',rule:'Register to register',why:'ต้นทาง A และปลายทาง B อยู่ใน Opcode 47H'},
        {address:'2012H',asm:'LD A,(DE)',bytes:['1A'],next:'2013H',rule:'Register indirect · 1 byte',why:'Opcode 1AH หมายถึงอ่าน Memory ที่ DE ชี้เข้า A'},
        {address:'2013H',asm:'ADD A,B',bytes:['80'],next:'2014H',rule:'คำสั่ง 1 byte',why:'Opcode 80H ระบุ ADD A,B'},
        {address:'2014H',asm:'INC DE',bytes:['13'],next:'2015H',rule:'คำสั่ง 1 byte',why:'Opcode 13H ระบุเพิ่ม Register pair DE'},
        {address:'2015H',asm:'LD (DE),A',bytes:['12'],next:'2016H',rule:'Register indirect · 1 byte',why:'Opcode 12H หมายถึงเขียน A ไป Memory ที่ DE ชี้'},
        {address:'2016H',asm:'HALT',bytes:['76'],next:'2017H',rule:'คำสั่ง 1 byte',why:'HALT ใช้ Opcode 76H'}
      ]
    },
    led: {
      name: 'Lab C · LED Loop',
      rows: [
        {address:'200AH',asm:'XOR A',bytes:['AF'],next:'200BH',rule:'คำสั่ง 1 byte',why:'Opcode AFH คือ XOR A ซึ่งทำให้ A XOR A = 00H'},
        {address:'200BH',asm:'OUT (40H),A',bytes:['D3','40'],next:'200DH',rule:'Opcode + Port 8-bit',why:'D3H คือ OUT (n),A และ 40H คือหมายเลข Port'},
        {address:'200DH',asm:'INC A',bytes:['3C'],next:'200EH',rule:'คำสั่ง 1 byte',why:'Opcode 3CH ระบุ INC A'},
        {address:'200EH',asm:'JR LOOP',bytes:['18','FB'],next:'2010H',rule:'Relative displacement',why:'18H คือ JR e; e=200BH−2010H=−5=FBH',relative:{target:'200BH',base:'2010H',delta:'−5',twos:'FBH'}},
        {address:'2010H',asm:'HALT',bytes:['76'],next:'2011H',rule:'คำสั่ง 1 byte',why:'มี Opcode 76H อยู่ใน Memory แต่การทำงานจริงไปไม่ถึง เพราะ JR LOOP วนกลับเสมอ'}
      ]
    }
  };

  const hex = (text) => parseInt(text, 16);
  const hex4 = (value) => value.toString(16).toUpperCase().padStart(4, '0') + 'H';

  document.querySelectorAll('[data-opcode-lab]').forEach((lab) => {
    const fields = Object.fromEntries([...lab.querySelectorAll('[data-op-field]')].map((node) => [node.dataset.opField, node]));
    const list = lab.querySelector('[data-op-list]');
    const tape = lab.querySelector('[data-byte-tape]');
    const byteChips = lab.querySelector('[data-op-bytes]');
    const relativePanel = lab.querySelector('[data-relative-panel]');
    const previous = lab.querySelector('[data-op-prev]');
    const next = lab.querySelector('[data-op-next]');
    let selected = 'register';
    let current = 0;

    const render = () => {
      const program = programs[selected];
      const row = program.rows[current];
      fields.programName.textContent = program.name;
      fields.step.textContent = `${current + 1}/${program.rows.length}`;
      ['address','asm','next','rule','why'].forEach((key) => { fields[key].textContent = row[key]; });
      fields.size.textContent = `${row.bytes.length} byte${row.bytes.length > 1 ? 's' : ''}`;
      previous.disabled = current === 0;
      next.disabled = current === program.rows.length - 1;
      byteChips.innerHTML = row.bytes.map((byte, index) => `<span><small>${index ? 'operand' : 'opcode'}</small><b>${byte}H</b></span>`).join('');
      relativePanel.hidden = !row.relative;
      if (row.relative) Object.entries(row.relative).forEach(([key, value]) => { fields[key].textContent = value; });

      list.replaceChildren();
      program.rows.forEach((item, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = index === current ? 'is-active' : '';
        button.innerHTML = `<span class="mono">${item.address}</span><code>${item.asm}</code><span class="mono">${item.bytes.join(' ')}</span>`;
        button.addEventListener('click', () => { current = index; render(); });
        list.append(button);
      });

      tape.replaceChildren();
      program.rows.forEach((item, rowIndex) => {
        const base = hex(item.address);
        item.bytes.forEach((byte, byteIndex) => {
          const button = document.createElement('button');
          button.type = 'button';
          button.className = rowIndex === current ? 'is-active' : '';
          button.innerHTML = `<small>${hex4(base + byteIndex)}</small><strong>${byte}</strong>`;
          button.addEventListener('click', () => { current = rowIndex; render(); });
          tape.append(button);
        });
      });
      lab.querySelectorAll('[data-op-program]').forEach((button) => button.classList.toggle('is-active', button.dataset.opProgram === selected));
    };

    lab.querySelectorAll('[data-op-program]').forEach((button) => button.addEventListener('click', () => { selected = button.dataset.opProgram; current = 0; render(); }));
    previous.addEventListener('click', () => { current = Math.max(0, current - 1); render(); });
    next.addEventListener('click', () => { current = Math.min(programs[selected].rows.length - 1, current + 1); render(); });
    render();
  });
})();
