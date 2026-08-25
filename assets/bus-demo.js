document.querySelectorAll('[data-bus-demo]').forEach((demo) => {
  const caption = demo.parentElement.querySelector('[data-demo-caption]');
  const next = demo.parentElement.querySelector('[data-demo-next]');
  const play = demo.parentElement.querySelector('[data-demo-play]');
  const phases = [
    'พร้อมเริ่ม — ตัวอย่างนี้จะอ่านข้อมูลจาก Memory ตำแหน่ง 1234H',
    '1/5 วางตำแหน่ง: Z80 ขับ A15–A0 = 1234H',
    '2/5 ระบุพื้นที่: /MREQ ลงเป็น 0 จึงเป็นรายการของ Memory',
    '3/5 ระบุทิศทาง: /RD ลงเป็น 0 จึงเป็นการอ่าน',
    '4/5 เลือกชิป: Decoder ตรวจบิตสูงแล้วกด /CE ของชิปเป้าหมาย',
    '5/5 ขนข้อมูล: ชิปส่งหนึ่งไบต์กลับเข้า Z80 ทาง D7–D0'
  ];
  let phase = 0;
  let timer;

  const show = (value) => {
    phase = value;
    demo.dataset.phase = String(phase);
    caption.textContent = phases[phase];
    next.textContent = phase === 5 ? 'เริ่มใหม่' : 'ขั้นถัดไป';
  };

  next.addEventListener('click', () => {
    clearInterval(timer);
    show(phase === 5 ? 0 : phase + 1);
  });

  play.addEventListener('click', () => {
    clearInterval(timer);
    show(1);
    timer = setInterval(() => {
      if (phase === 5) {
        clearInterval(timer);
        return;
      }
      show(phase + 1);
    }, 1250);
  });

  show(0);
});
