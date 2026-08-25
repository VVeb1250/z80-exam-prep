(() => {
  const examples = {
    ram: {
      address: '0123H', high: '0000', decoder: 'Y0=0', device: 'RAM', offset: '123H',
      control: '/MREQ=0, /RD=0',
      title: '0123H → RAM',
      trace: 'A15–A12=0000 ทำให้ Y0 active จึงกด /CE_RAM ต่ำ; A11–A0=123H เลือก byte 123H ภายใน RAM'
    },
    rom: {
      address: '1ABCH', high: '0001', decoder: 'Y1=0', device: 'ROM', offset: 'ABCH',
      control: '/MREQ=0, /RD=0',
      title: '1ABCH → ROM',
      trace: 'A15–A12=0001 ทำให้ Y1 active จึงกด /CE_ROM ต่ำ; A11–A0=ABCH เลือก byte ABCH ภายใน ROM'
    }
  };

  document.querySelectorAll('[data-q6-lab]').forEach((lab) => {
    const fields = Object.fromEntries([...lab.querySelectorAll('[data-q6-field]')].map((node) => [node.dataset.q6Field, node]));
    const scroller = lab.querySelector('.q6-schematic-wrap');

    const render = (choice, followDevice = false) => {
      const item = examples[choice];
      fields.address.textContent = item.address;
      fields.high.textContent = item.high;
      fields.offset.textContent = item.offset;
      fields.decoder.textContent = item.decoder;
      fields.device.textContent = item.device;
      fields.offsetCard.textContent = item.offset;
      fields.control.textContent = item.control;
      fields.traceTitle.textContent = item.title;
      fields.trace.textContent = item.trace;
      lab.querySelectorAll('[data-q6-choice]').forEach((button) => button.classList.toggle('is-active', button.dataset.q6Choice === choice));
      lab.querySelectorAll('[data-q6-device]').forEach((node) => node.classList.toggle('is-active', node.dataset.q6Device === choice));
      lab.querySelectorAll('[data-q6-select]').forEach((node) => node.classList.toggle('is-active', node.dataset.q6Select === choice));
      if (followDevice && scroller.scrollWidth > scroller.clientWidth) {
        const device = lab.querySelector(`[data-q6-device="${choice}"]`);
        const deviceRect = device.getBoundingClientRect();
        const scrollerRect = scroller.getBoundingClientRect();
        const target = scroller.scrollLeft + deviceRect.left - scrollerRect.left - (scroller.clientWidth - deviceRect.width) / 2;
        scroller.scrollTo({left: Math.max(0, target), behavior: 'smooth'});
      }
    };

    lab.querySelectorAll('[data-q6-choice]').forEach((button) => button.addEventListener('click', () => render(button.dataset.q6Choice, true)));
    render('ram');
  });
})();
