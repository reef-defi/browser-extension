(() => {
  const header = document.getElementsByClassName('header')[0];

  if (!header) return;

  const random = (min, max) => {
    return Math.random() * (max - min) + min;
  };

  const bubbles = document.createElement('div');

  bubbles.setAttribute('class', 'bubbles');

  for (let i = 1; i < 20; i++) {
    const bubble = document.createElement('div');

    bubble.setAttribute('class', 'bubbles__bubble');

    const style = `
      animation-delay: ${i * 0.5 - 0.1}s;
      left: ${random(25, 75)}%;
      transform: scale(${random(0.75, 1.25)});
      opacity: ${random(0.5, 1)};
    `;

    bubble.setAttribute('style', style);

    bubbles.appendChild(bubble);
  }

  header.appendChild(bubbles);
})();
