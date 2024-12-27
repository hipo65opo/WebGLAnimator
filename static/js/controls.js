document.addEventListener('DOMContentLoaded', () => {
    const controls = document.querySelector('.controls');
    const speedControl = document.getElementById('speedControl');
    const colorControl = document.getElementById('colorControl');
    let timeout;

    const showControls = () => {
        controls.classList.remove('hidden');
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            if (!controls.matches(':hover')) {
                controls.classList.add('hidden');
            }
        }, 3000);
    };

    document.addEventListener('mousemove', showControls);
    controls.addEventListener('mouseenter', () => clearTimeout(timeout));
    controls.addEventListener('mouseleave', () => {
        timeout = setTimeout(() => controls.classList.add('hidden'), 3000);
    });

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

    showControls();
});
