vantaAnimationAdd = function(el) {
  // Se già esiste un'animazione, la distrugge
  if (vantaEffect) {
    vantaEffect.destroy();
    vantaEffect = null;
  }

  // Crea la nuova animazione
  vantaEffect = VANTA.BIRDS({
    el: el, // elemento passato da fuori
    mouseControls: true,
    touchControls: true,
    gyroControls: false,
    minHeight: 200.00,
    minWidth: 200.00,
    scale: 1.00,
    scaleMobile: 1.00,
    backgroundColor: 0xebebeb,
    color1: 0xaf8686,
    color2: 0x5475f,
    colorMode: "lerp",
    birdSize: 0.50,
    wingSpan: 18.00,
    speedLimit: 2.00,
    separation: 32.00,
    alignment: 49.00,
    cohesion: 92.00
  });
}

vantaAnimationRemove = function() {
  if (vantaEffect) {
    vantaEffect.destroy();
    vantaEffect = null;
  }
}