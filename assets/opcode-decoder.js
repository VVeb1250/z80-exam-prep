(() => {
  const field = (size, label, tone) => ({ size, label, tone });
  const definitions = {
    '47': {
      mnemonic: 'LD B,A', pattern: '01 ddd sss',
      fields: [field(2, '01 · กลุ่ม LD r,r′', 'fixed'), field(3, 'ddd=000 · B ปลายทาง', 'dest'), field(3, 'sss=111 · A ต้นทาง', 'source')],
      reading: 'รูปแบบ 01 ddd sss: ddd=000 คือ B (ปลายทาง), sss=111 คือ A (ต้นทาง)',
      direction: ['B', 'รับค่าจาก ←', 'A'], next: 'คำสั่งนี้ครบใน Opcode 1 byte ไม่ต้องอ่าน Operand เพิ่ม'
    },
    '7E': {
      mnemonic: 'LD A,(HL)', pattern: '01 ddd sss',
      fields: [field(2, '01 · กลุ่ม LD r,r′', 'fixed'), field(3, 'ddd=111 · A ปลายทาง', 'dest'), field(3, 'sss=110 · Memory[HL]', 'source')],
      reading: 'ddd=111 คือ A ส่วน sss=110 เป็นรหัสพิเศษของ Memory ที่ Address ใน HL',
      direction: ['A', 'รับค่าจาก ←', 'Memory[HL]'], next: 'คำสั่งนี้ครบใน Opcode 1 byte; Address อยู่ใน HL อยู่แล้ว'
    },
    '3E': {
      mnemonic: 'LD A,n', pattern: '00 ddd 110',
      fields: [field(2, '00 · กลุ่มพื้นฐาน', 'fixed'), field(3, 'ddd=111 · A ปลายทาง', 'dest'), field(3, '110 · มีข้อมูล n ต่อท้าย', 'operand')],
      reading: 'รูปแบบ 00 ddd 110 คือ LD r,n; ddd=111 เลือก A และ n ต้องอ่านจาก byte ถัดไป',
      direction: ['A', 'รับค่าจาก ←', 'n (byte ถัดไป)'], next: 'ยาว 2 bytes: 3EH เป็น Opcode แล้ว byte ถัดไปเป็นข้อมูล 8-bit n'
    },
    '06': {
      mnemonic: 'LD B,n', pattern: '00 ddd 110',
      fields: [field(2, '00 · กลุ่มพื้นฐาน', 'fixed'), field(3, 'ddd=000 · B ปลายทาง', 'dest'), field(3, '110 · มีข้อมูล n ต่อท้าย', 'operand')],
      reading: 'รูปแบบ 00 ddd 110 คือ LD r,n; ddd=000 เลือก B',
      direction: ['B', 'รับค่าจาก ←', 'n (byte ถัดไป)'], next: 'ยาว 2 bytes: 06H เป็น Opcode แล้ว byte ถัดไปเป็นข้อมูล n'
    },
    '0E': {
      mnemonic: 'LD C,n', pattern: '00 ddd 110',
      fields: [field(2, '00 · กลุ่มพื้นฐาน', 'fixed'), field(3, 'ddd=001 · C ปลายทาง', 'dest'), field(3, '110 · มีข้อมูล n ต่อท้าย', 'operand')],
      reading: 'รูปแบบ 00 ddd 110 คือ LD r,n; ddd=001 เลือก C',
      direction: ['C', 'รับค่าจาก ←', 'n (byte ถัดไป)'], next: 'ยาว 2 bytes: 0EH เป็น Opcode แล้ว byte ถัดไปเป็นข้อมูล n'
    },
    '16': {
      mnemonic: 'LD D,n', pattern: '00 ddd 110',
      fields: [field(2, '00 · กลุ่มพื้นฐาน', 'fixed'), field(3, 'ddd=010 · D ปลายทาง', 'dest'), field(3, '110 · มีข้อมูล n ต่อท้าย', 'operand')],
      reading: 'รูปแบบ 00 ddd 110 คือ LD r,n; ddd=010 เลือก D',
      direction: ['D', 'รับค่าจาก ←', 'n (byte ถัดไป)'], next: 'ยาว 2 bytes: 16H เป็น Opcode แล้ว byte ถัดไปเป็นข้อมูล n'
    },
    '21': {
      mnemonic: 'LD HL,nn', pattern: '00 dd 0001',
      fields: [field(2, '00 · กลุ่มพื้นฐาน', 'fixed'), field(2, 'dd=10 · HL', 'dest'), field(4, '0001 · LD dd,nn', 'operand')],
      reading: 'รูปแบบ 00 dd 0001 คือ LD Register pair,nn; dd=10 เลือก HL',
      direction: ['HL', 'รับค่าจาก ←', 'nn (2 bytes ถัดไป)'], next: 'ยาว 3 bytes: 21H + low byte + high byte เช่น 21 00 21 = LD HL,2100H'
    },
    '11': {
      mnemonic: 'LD DE,nn', pattern: '00 dd 0001',
      fields: [field(2, '00 · กลุ่มพื้นฐาน', 'fixed'), field(2, 'dd=01 · DE', 'dest'), field(4, '0001 · LD dd,nn', 'operand')],
      reading: 'รูปแบบ 00 dd 0001 คือ LD Register pair,nn; dd=01 เลือก DE',
      direction: ['DE', 'รับค่าจาก ←', 'nn (2 bytes ถัดไป)'], next: 'ยาว 3 bytes: 11H + low byte + high byte'
    },
    '80': {
      mnemonic: 'ADD A,B', pattern: '10 aaa sss',
      fields: [field(2, '10 · กลุ่ม ALU', 'fixed'), field(3, 'aaa=000 · ADD', 'operation'), field(3, 'sss=000 · B ต้นทาง', 'source')],
      reading: 'กลุ่ม 10 เป็น ALU; aaa=000 เลือก ADD และ sss=000 เลือก B',
      direction: ['A', 'รับผล ←', 'A + B'], next: 'คำสั่งนี้ครบใน Opcode 1 byte'
    },
    '81': {
      mnemonic: 'ADD A,C', pattern: '10 aaa sss',
      fields: [field(2, '10 · กลุ่ม ALU', 'fixed'), field(3, 'aaa=000 · ADD', 'operation'), field(3, 'sss=001 · C ต้นทาง', 'source')],
      reading: 'กลุ่ม 10 เป็น ALU; aaa=000 เลือก ADD และ sss=001 เลือก C',
      direction: ['A', 'รับผล ←', 'A + C'], next: 'คำสั่งนี้ครบใน Opcode 1 byte'
    },
    '82': {
      mnemonic: 'ADD A,D', pattern: '10 aaa sss',
      fields: [field(2, '10 · กลุ่ม ALU', 'fixed'), field(3, 'aaa=000 · ADD', 'operation'), field(3, 'sss=010 · D ต้นทาง', 'source')],
      reading: 'กลุ่ม 10 เป็น ALU; aaa=000 เลือก ADD และ sss=010 เลือก D',
      direction: ['A', 'รับผล ←', 'A + D'], next: 'คำสั่งนี้ครบใน Opcode 1 byte'
    },
    'AF': {
      mnemonic: 'XOR A', pattern: '10 aaa sss',
      fields: [field(2, '10 · กลุ่ม ALU', 'fixed'), field(3, 'aaa=101 · XOR', 'operation'), field(3, 'sss=111 · A ต้นทาง', 'source')],
      reading: 'กลุ่ม 10 เป็น ALU; aaa=101 เลือก XOR และ sss=111 เลือก A',
      direction: ['A', 'รับผล ←', 'A XOR A = 00H'], next: 'คำสั่งนี้ครบใน Opcode 1 byte'
    },
    '3C': {
      mnemonic: 'INC A', pattern: '00 ddd 100',
      fields: [field(2, '00 · กลุ่มพื้นฐาน', 'fixed'), field(3, 'ddd=111 · A', 'dest'), field(3, '100 · INC r', 'operation')],
      reading: 'รูปแบบ 00 ddd 100 คือ INC r; ddd=111 เลือก A',
      direction: ['A', 'รับผล ←', 'A + 1'], next: 'คำสั่งนี้ครบใน Opcode 1 byte'
    },
    '13': {
      mnemonic: 'INC DE', pattern: '00 dd 0011',
      fields: [field(2, '00 · กลุ่มพื้นฐาน', 'fixed'), field(2, 'dd=01 · DE', 'dest'), field(4, '0011 · INC dd', 'operation')],
      reading: 'รูปแบบ 00 dd 0011 คือ INC Register pair; dd=01 เลือก DE',
      direction: ['DE', 'รับผล ←', 'DE + 1'], next: 'คำสั่งนี้ครบใน Opcode 1 byte'
    },
    '1A': {
      mnemonic: 'LD A,(DE)', pattern: '00011010 · รหัสเฉพาะ',
      fields: [field(8, '00011010 · LD A,(DE)', 'fixed')],
      reading: 'คำสั่งนี้ใช้รหัสเฉพาะ 1AH ไม่ได้แบ่งเป็น ddd/sss แบบ LD r,r′',
      direction: ['A', 'รับค่าจาก ←', 'Memory[DE]'], next: 'คำสั่งนี้ครบใน Opcode 1 byte; Address อยู่ใน DE'
    },
    '12': {
      mnemonic: 'LD (DE),A', pattern: '00010010 · รหัสเฉพาะ',
      fields: [field(8, '00010010 · LD (DE),A', 'fixed')],
      reading: 'คำสั่งนี้ใช้รหัสเฉพาะ 12H ไม่ได้แบ่งเป็น ddd/sss แบบ LD r,r′',
      direction: ['Memory[DE]', 'รับค่าจาก ←', 'A'], next: 'คำสั่งนี้ครบใน Opcode 1 byte; Address อยู่ใน DE'
    },
    '76': {
      mnemonic: 'HALT', pattern: '01110110 · รหัสเฉพาะ',
      fields: [field(8, '01110110 · HALT', 'fixed')],
      reading: '76H เป็นรหัสคงที่ของ HALT จึงไม่ต้องแยก Register ปลายทางหรือต้นทาง',
      direction: null, next: 'คำสั่งนี้ครบใน Opcode 1 byte'
    },
    'D3': {
      mnemonic: 'OUT (n),A', pattern: '11010011 · รหัสเฉพาะ',
      fields: [field(8, '11010011 · OUT (n),A', 'fixed')],
      reading: 'D3H บอกชนิดคำสั่ง OUT แต่หมายเลข Port n อยู่ใน byte ถัดไป',
      direction: ['Port n', 'รับค่าจาก ←', 'A'], next: 'ยาว 2 bytes: D3H เป็น Opcode แล้ว byte ถัดไปคือ Port เช่น 40H'
    },
    '18': {
      mnemonic: 'JR e', pattern: '00011000 · รหัสเฉพาะ',
      fields: [field(8, '00011000 · JR e', 'fixed')],
      reading: '18H บอกว่าเป็น JR แบบไม่มีเงื่อนไข ส่วนระยะ e อยู่ใน byte ถัดไป',
      direction: ['PC', 'กระโดดด้วย ←', 'signed displacement e'], next: 'ยาว 2 bytes: 18H + ระยะ signed 8-bit เช่น FBH = −5'
    },
    '32': {
      mnemonic: 'LD (nn),A', pattern: '00110010 · รหัสเฉพาะ',
      fields: [field(8, '00110010 · LD (nn),A', 'fixed')],
      reading: '32H บอกว่าเขียน A ไปยัง Memory Address แบบ 16-bit ซึ่งตามมาอีก 2 bytes',
      direction: ['Memory[nn]', 'รับค่าจาก ←', 'A'], next: 'ยาว 3 bytes: 32H + address low byte + high byte'
    }
  };

  const normalizeHex = (value) => value.trim().toUpperCase().replace(/^0X/, '').replace(/H$/, '');
  const binaryFromHex = (hexValue) => Number.parseInt(hexValue, 16).toString(2).padStart(8, '0');

  document.querySelectorAll('[data-opcode-decoder]').forEach((decoder) => {
    const input = decoder.querySelector('[data-decoder-input]');
    const bitCells = decoder.querySelector('[data-bit-cells]');
    const fieldStrip = decoder.querySelector('[data-field-strip]');
    const error = decoder.querySelector('[data-decoder-error]');
    const direction = decoder.querySelector('[data-decoder-direction]');
    const fields = Object.fromEntries([...decoder.querySelectorAll('[data-decoder-field]')].map((node) => [node.dataset.decoderField, node]));

    const render = (requestedValue) => {
      const hexValue = normalizeHex(requestedValue);
      const isValidByte = /^[0-9A-F]{2}$/.test(hexValue);
      if (error) error.hidden = isValidByte;
      if (!isValidByte) {
        if (error) error.textContent = 'กรอกเลขฐานสิบหกให้ครบ 2 หลัก เช่น 47, AF หรือ D3';
        return;
      }

      const definition = definitions[hexValue];
      const binary = binaryFromHex(hexValue);
      const visibleDefinition = definition || {
        mnemonic: 'ยังไม่อยู่ในชุดฝึก', pattern: '8-bit Opcode',
        fields: [field(8, `${binary} · เปิดตารางคำสั่งเพิ่ม`, 'fixed')],
        reading: 'เครื่องมือนี้ครอบคลุม Opcode ที่ใช้ในสามแลปก่อน หากเป็นรหัสอื่นต้องเปิด Opcode table ของ Z80 เพื่อดูรูปแบบเพิ่มเติม',
        direction: null, next: 'บิตครบ 8 บิตไม่ได้แปลว่าคำสั่งยาว 1 byte เสมอ ต้องตรวจว่ามี Operand หรือ Prefix ต่อท้ายหรือไม่'
      };

      fields.hex.textContent = `${hexValue}H`;
      fields.mnemonic.textContent = visibleDefinition.mnemonic;
      fields.pattern.textContent = visibleDefinition.pattern;
      fields.reading.textContent = visibleDefinition.reading;
      fields.next.textContent = visibleDefinition.next;
      bitCells.replaceChildren();
      fieldStrip.replaceChildren();

      let bitOffset = 0;
      visibleDefinition.fields.forEach((opcodeField) => {
        const groupBits = binary.slice(bitOffset, bitOffset + opcodeField.size);
        [...groupBits].forEach((bit) => {
          const cell = document.createElement('span');
          cell.className = `tone-${opcodeField.tone}`;
          cell.textContent = bit;
          bitCells.append(cell);
        });
        const label = document.createElement('span');
        label.className = `tone-${opcodeField.tone}`;
        label.style.gridColumn = `span ${opcodeField.size}`;
        label.textContent = opcodeField.label;
        fieldStrip.append(label);
        bitOffset += opcodeField.size;
      });

      direction.hidden = !visibleDefinition.direction;
      if (visibleDefinition.direction) {
        [...direction.children].forEach((node, index) => { node.textContent = visibleDefinition.direction[index]; });
      }
      decoder.querySelectorAll('[data-opcode]').forEach((button) => button.classList.toggle('is-active', button.dataset.opcode === hexValue));
      if (input) input.value = hexValue;
    };

    decoder.querySelectorAll('[data-opcode]').forEach((button) => button.addEventListener('click', () => render(button.dataset.opcode)));
    if (input) {
      input.addEventListener('input', () => {
        input.value = normalizeHex(input.value).slice(0, 2);
        if (input.value.length === 2) render(input.value);
        else if (error) {
          error.hidden = false;
          error.textContent = 'กรอกให้ครบ 2 หลัก';
        }
      });
    }
    decoder.addEventListener('opcodechange', (event) => render(event.detail.opcode));
    render(decoder.dataset.opcode || input?.value || '3E');
  });
})();
