const pinDescriptions = {
  CLK: 'Clock input — กำหนดจังหวะ T-state ของ CPU',
  '+5V': 'Power — ขาไฟเลี้ยง +5 โวลต์ของชิป',
  GND: 'Ground — จุดอ้างอิงศักย์ไฟฟ้า 0 โวลต์',
  '/INT': 'Interrupt Request — ดึงต่ำเพื่อขอ interrupt แบบ maskable',
  '/NMI': 'Non-maskable Interrupt — ทำงานที่ขอบขาลงและปิดกั้นไม่ได้',
  '/HALT': 'HALT status — เป็น 0 เมื่อ CPU อยู่ในสถานะ HALT',
  '/MREQ': 'Memory Request — เป็น 0 เมื่อ A15–A0 มี Memory address ที่ใช้ได้',
  '/IORQ': 'I/O Request — เป็น 0 เมื่อทำ I/O หรือ Interrupt Acknowledge',
  '/RFSH': 'Refresh — เป็น 0 ระหว่างวงจร refresh หน่วยความจำ DRAM',
  '/M1': 'Machine Cycle One — เป็น 0 ในรอบแรก เช่น Opcode Fetch',
  '/RESET': 'Reset — ดึงต่ำเพื่อเริ่ม CPU ใหม่ โดย PC กลับไป 0000H',
  '/BUSRQ': 'Bus Request — อุปกรณ์ภายนอกดึงต่ำเพื่อขอครองบัส',
  '/WAIT': 'Wait — ดึงต่ำเพื่อให้ CPU เพิ่ม Wait state รออุปกรณ์ช้า',
  '/BUSACK': 'Bus Acknowledge — CPU ดึงต่ำตอบรับว่าได้ปล่อยบัสแล้ว',
  '/WR': 'Write — เป็น 0 เมื่อ CPU เขียนข้อมูลออกทาง D7–D0',
  '/RD': 'Read — เป็น 0 เมื่อ CPU ขอให้อุปกรณ์ส่งข้อมูลขึ้น Data bus'
};

document.querySelectorAll('.pinout').forEach((pinout) => {
  const detail = pinout.closest('.card').querySelector('[data-pin-detail]');
  const detailSignal = detail.querySelector('[data-pin-signal]');
  const detailText = detail.querySelector('[data-pin-text]');

  pinout.querySelectorAll('.pin').forEach((pin) => {
    const signal = pin.querySelector('span:last-child').textContent.trim();
    let description = pinDescriptions[signal];

    if (/^A\d+$/.test(signal)) {
      const bit = signal.slice(1);
      description = `Address bit ${bit} — เอาต์พุตหนึ่งเส้นของ A15–A0; ทั้งกลุ่มใช้ชี้ตำแหน่ง Memory 0000H–FFFFH`;
    } else if (/^D\d+$/.test(signal)) {
      const bit = signal.slice(1);
      description = `Data bit ${bit} — สายสองทิศทางหนึ่งเส้นของ D7–D0; ทั้งกลุ่มขนข้อมูลครั้งละ 1 byte`;
    }

    pin.tabIndex = 0;
    pin.setAttribute('role', 'button');
    pin.setAttribute('aria-label', `${signal}: ${description}`);
    pin.title = description;

    const select = () => {
      pinout.querySelectorAll('.pin').forEach((item) => item.classList.remove('is-selected'));
      pin.classList.add('is-selected');
      detailSignal.textContent = signal;
      detailText.textContent = description;
    };

    pin.addEventListener('click', select);
    pin.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        select();
      }
    });
  });
});
