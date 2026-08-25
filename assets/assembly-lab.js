(() => {
  const blank = {a: '?', b: '?', c: '?', d: '?', hl: '—', de: '—', m0: '05H', m1: '03H', m2: '?', out: '—'};
  const mergeState = (values) => ({...blank, ...values});
  const programs = {
    register: {
      org: 'ORG 2000H',
      lines: [
        {asm: 'LD A,01H', comment: 'A ← 1', role: 'Load ค่าคงที่', effect: 'A ← 01H', why: 'เลขไม่มีวงเล็บคือข้อมูลจริง จึงใส่ 01H ลง A โดยตรง', before: 'A=?', after: 'A=01H', state: mergeState({a:'01H'})},
        {asm: 'LD B,02H', comment: 'B ← 2', role: 'Load ค่าคงที่', effect: 'B ← 02H', why: 'เตรียม Operand ตัวที่สองไว้ใน B', before: 'B=?', after: 'B=02H', state: mergeState({a:'01H',b:'02H'})},
        {asm: 'LD C,03H', comment: 'C ← 3', role: 'Load ค่าคงที่', effect: 'C ← 03H', why: 'เตรียม Operand ตัวที่สามไว้ใน C', before: 'C=?', after: 'C=03H', state: mergeState({a:'01H',b:'02H',c:'03H'})},
        {asm: 'LD D,04H', comment: 'D ← 4', role: 'Load ค่าคงที่', effect: 'D ← 04H', why: 'เตรียม Operand ตัวที่สี่ไว้ใน D', before: 'D=?', after: 'D=04H', state: mergeState({a:'01H',b:'02H',c:'03H',d:'04H'})},
        {asm: 'ADD A,B', comment: 'A ← A+B', role: 'บวกครั้งที่ 1', effect: 'A ← 01H+02H', why: 'ADD ของ Z80 เก็บผลกลับใน Accumulator A', before: 'A=01H, B=02H', after: 'A=03H', state: mergeState({a:'03H',b:'02H',c:'03H',d:'04H'})},
        {asm: 'ADD A,C', comment: 'A ← A+C', role: 'บวกครั้งที่ 2', effect: 'A ← 03H+03H', why: 'A ถือผลสะสมจากคำสั่งก่อนหน้า', before: 'A=03H, C=03H', after: 'A=06H', state: mergeState({a:'06H',b:'02H',c:'03H',d:'04H'})},
        {asm: 'ADD A,D', comment: 'A ← A+D', role: 'บวกครั้งที่ 3', effect: 'A ← 06H+04H', why: 'ผลสุดท้าย 1+2+3+4 จึงอยู่ใน A', before: 'A=06H, D=04H', after: 'A=0AH', state: mergeState({a:'0AH',b:'02H',c:'03H',d:'04H'})},
        {asm: 'HALT', comment: 'หยุด CPU', role: 'หยุด', effect: 'CPU → HALT', why: 'โปรแกรมคำนวณเสร็จและไม่มีงานต่อ', before: 'A=0AH', after: 'หยุด โดย A=0AH', state: mergeState({a:'0AH',b:'02H',c:'03H',d:'04H'})}
      ]
    },
    memory: {
      org: 'ORG 200AH',
      lines: [
        {asm:'LD HL,2100H',comment:'HL ชี้ข้อมูลแรก',role:'ตั้ง Pointer',effect:'HL ← 2100H',why:'ใช้ HL เป็น Address ของข้อมูลตัวแรก',before:'HL=?',after:'HL=2100H',state:mergeState({hl:'2100H'})},
        {asm:'LD DE,2101H',comment:'DE ชี้ข้อมูลที่สอง',role:'ตั้ง Pointer',effect:'DE ← 2101H',why:'DE ชี้ข้อมูลตัวที่สอง และจะเลื่อนไปช่องผลลัพธ์ภายหลัง',before:'DE=?',after:'DE=2101H',state:mergeState({hl:'2100H',de:'2101H'})},
        {asm:'LD A,(HL)',comment:'A ← [2100H]',role:'อ่าน Memory',effect:'A ← Memory[HL]',why:'วงเล็บหมายถึงอ่าน Memory ณ Address ที่ HL ชี้',before:'[2100H]=05H',after:'A=05H',state:mergeState({a:'05H',hl:'2100H',de:'2101H'})},
        {asm:'LD B,A',comment:'พักค่าแรกใน B',role:'สำรองข้อมูล',effect:'B ← A',why:'ต้องใช้ A อ่านค่าตัวที่สอง จึงพักค่าตัวแรกไว้ใน B',before:'A=05H, B=?',after:'B=05H',state:mergeState({a:'05H',b:'05H',hl:'2100H',de:'2101H'})},
        {asm:'LD A,(DE)',comment:'A ← [2101H]',role:'อ่าน Memory',effect:'A ← Memory[DE]',why:'DE=2101H จึงอ่านค่าตัวที่สองเข้า A',before:'[2101H]=03H',after:'A=03H',state:mergeState({a:'03H',b:'05H',hl:'2100H',de:'2101H'})},
        {asm:'ADD A,B',comment:'บวกสองค่า',role:'คำนวณ',effect:'A ← 03H+05H',why:'A ถือค่าตัวที่สอง และ B ถือค่าตัวแรก',before:'A=03H, B=05H',after:'A=08H',state:mergeState({a:'08H',b:'05H',hl:'2100H',de:'2101H'})},
        {asm:'INC DE',comment:'DE ชี้ช่องผลลัพธ์',role:'เลื่อน Pointer',effect:'DE ← DE+1',why:'ขยับจากข้อมูลตัวที่สอง 2101H ไปช่องเก็บผล 2102H',before:'DE=2101H',after:'DE=2102H',state:mergeState({a:'08H',b:'05H',hl:'2100H',de:'2102H'})},
        {asm:'LD (DE),A',comment:'[2102H] ← ผลรวม',role:'เขียน Memory',effect:'Memory[DE] ← A',why:'ปลายทางอยู่ซ้าย จึงเก็บผล 08H ลงตำแหน่งที่ DE ชี้',before:'[2102H]=?',after:'[2102H]=08H',state:mergeState({a:'08H',b:'05H',hl:'2100H',de:'2102H',m2:'08H'})},
        {asm:'HALT',comment:'หยุด CPU',role:'หยุด',effect:'CPU → HALT',why:'อ่าน บวก และเก็บผลเสร็จแล้ว',before:'[2102H]=08H',after:'หยุด',state:mergeState({a:'08H',b:'05H',hl:'2100H',de:'2102H',m2:'08H'})}
      ]
    },
    led: {
      org: 'ORG 200AH',
      lines: [
        {asm:'XOR A',comment:'A ← 00H',role:'ล้าง Accumulator',effect:'A ← A XOR A = 00H',why:'ค่าทุกบิต XOR กับตัวเองได้ศูนย์ จึงล้าง A โดยไม่ต้องมี Operand เพิ่ม',before:'A ไม่ทราบค่า',after:'A=00H',state:mergeState({a:'00H'})},
        {label:'LOOP:',asm:'OUT (40H),A',comment:'LED ← A',role:'ส่งออก LED',effect:'Output[40H] ← A',why:'พอร์ต 40H ต่อกับ LED จึงแสดงรูปบิตของค่าใน A',before:'A=00H',after:'LED=00H',state:mergeState({a:'00H',out:'00H'})},
        {asm:'INC A',comment:'A ← A+1',role:'สร้างค่าถัดไป',effect:'A ← A+1',why:'เพิ่มค่าเพื่อให้รูป LED รอบถัดไปเปลี่ยนจาก 00H เป็น 01H, 02H…',before:'A=00H',after:'A=01H',state:mergeState({a:'01H',out:'00H'})},
        {asm:'JR LOOP',comment:'วนกลับแบบ Relative',role:'วนซ้ำ',effect:'PC ← Address ของ LOOP',why:'JR ไม่มีเงื่อนไข จึงย้อนกลับไป OUT และทำซ้ำตลอด',before:'PC อยู่หลัง JR',after:'PC ไป LOOP',state:mergeState({a:'01H',out:'00H'})},
        {asm:'HALT',comment:'ไปไม่ถึง',role:'Unreachable',effect:'คำสั่งนี้ไม่ถูก Execute',why:'JR LOOP อยู่ก่อนหน้าและกระโดดกลับทุกครั้ง จึงไม่มีทางไหลลงมาถึง HALT',before:'—',after:'ยังคงวน LOOP',state:mergeState({a:'01H',out:'00H'})}
      ]
    }
  };

  document.querySelectorAll('[data-assembly-lab]').forEach((lab) => {
    const fields = Object.fromEntries([...lab.querySelectorAll('[data-asm-field]')].map((node) => [node.dataset.asmField, node]));
    const codeList = lab.querySelector('[data-asm-code-list]');
    const previous = lab.querySelector('[data-asm-prev]');
    const next = lab.querySelector('[data-asm-next]');
    let selected = 'register';
    let current = 0;

    const render = () => {
      const program = programs[selected];
      const line = program.lines[current];
      fields.org.textContent = program.org;
      fields.step.textContent = `${current + 1}/${program.lines.length}`;
      ['role','effect','why','before','instruction','after'].forEach((key) => { fields[key].textContent = key === 'instruction' ? line.asm : line[key]; });
      previous.disabled = current === 0;
      next.disabled = current === program.lines.length - 1;
      codeList.replaceChildren();
      program.lines.forEach((item, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = index === current ? 'is-active' : '';
        button.innerHTML = `<span>${item.label || ''}</span><code>${item.asm}</code><small>; ${item.comment}</small>`;
        button.addEventListener('click', () => { current = index; render(); });
        codeList.append(button);
      });
      lab.querySelectorAll('[data-state]').forEach((node) => {
        const value = line.state[node.dataset.state];
        node.textContent = value;
        node.parentElement.classList.toggle('is-current', value !== blank[node.dataset.state]);
      });
      lab.querySelectorAll('[data-asm-program]').forEach((button) => button.classList.toggle('is-active', button.dataset.asmProgram === selected));
    };

    lab.querySelectorAll('[data-asm-program]').forEach((button) => button.addEventListener('click', () => { selected = button.dataset.asmProgram; current = 0; render(); }));
    previous.addEventListener('click', () => { current = Math.max(0, current - 1); render(); });
    next.addEventListener('click', () => { current = Math.min(programs[selected].lines.length - 1, current + 1); render(); });
    render();
  });
})();
