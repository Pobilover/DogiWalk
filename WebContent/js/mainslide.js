const navDots = Array.from(document.querySelectorAll('.nav-dot'));
const inputs = Array.from(document.querySelectorAll('.slides input'));
let currentIndex = inputs.findIndex(input => input.checked);

inputs.forEach(input => {
  input.addEventListener('change', () => {
    const id = input.id;
    const currentDot = navDots.find(dot => dot.getAttribute('for') === id);
    navDots.forEach(dot => {
      if (dot === currentDot) {
        dot.classList.add('current');
        currentIndex = inputs.findIndex(input => input.checked);
      } else {
        dot.classList.remove('current');
      }
    });
  });
});


function nextSlide() {
  currentIndex = (currentIndex + 1) % inputs.length;
  inputs[currentIndex].checked = true;
  navDots.forEach(dot => dot.classList.remove('current'));
  navDots[currentIndex].classList.add('current');
}

setInterval(nextSlide, 10000);