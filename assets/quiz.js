document.querySelectorAll('[data-quiz]').forEach((quiz) => {
  const answer = quiz.dataset.answer;
  const feedback = quiz.querySelector('.feedback');
  quiz.querySelectorAll('.choice').forEach((button) => {
    button.addEventListener('click', () => {
      quiz.querySelectorAll('.choice').forEach((b) => {
        b.disabled = true;
        b.classList.toggle('correct', b.dataset.choice === answer);
      });
      const ok = button.dataset.choice === answer;
      if (!ok) button.classList.add('wrong');
      feedback.textContent = ok
        ? `ถูกต้อง — ${quiz.dataset.explain}`
        : `ยังไม่ใช่ — ${quiz.dataset.explain}`;
    });
  });
});
