document.addEventListener('DOMContentLoaded', () => {
    const speedControl = document.getElementById('speedControl');
    const colorControl = document.getElementById('colorControl');

    speedControl.addEventListener('input', (e) => {
        if (window.glAnimation) {
            window.glAnimation.setSpeed(parseFloat(e.target.value));
        }
    });

    colorControl.addEventListener('input', (e) => {
        if (window.glAnimation) {
            window.glAnimation.setColorIntensity(parseFloat(e.target.value));
        }
    });
});
