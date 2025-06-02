// Game initialization
const player = document.querySelector('.player');
const gameContainer = document.querySelector('.game-container');
const zones = document.querySelectorAll('.zone');
const modals = document.querySelectorAll('.modal');
const closeButtons = document.querySelectorAll('.close');
const hud = document.querySelector('.hud');

// Initialize with default position
let playerPos = { x: 0, y: 20 };
let keys = {};
let currentHoveredZone = null;

// Function to set initial player position
function setInitialPlayerPosition() {
    const hudRect = hud.getBoundingClientRect();
    const playerHeight = 40; // Player height from CSS
    playerPos.x = hudRect.right + 80; // Position player 80px to the right of HUD
    playerPos.y = hudRect.top + (hudRect.height - playerHeight) / 2; // Center vertically with HUD
    player.style.left = playerPos.x + 'px';
    player.style.top = playerPos.y + 'px';
}

// Initialize player position
player.style.left = playerPos.x + 'px';
player.style.top = playerPos.y + 'px';

// Create stars
function createStars() {
    const starsContainer = document.querySelector('.stars');
    for (let i = 0; i < 100; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.width = Math.random() * 3 + 1 + 'px';
        star.style.height = star.style.width;
        star.style.animationDelay = Math.random() * 2 + 's';
        starsContainer.appendChild(star);
    }
}

// Player movement
function movePlayer() {
    // Check if any modal is open
    const isAnyModalOpen = Array.from(modals).some(modal =>
        modal.style.display === 'flex'
    );

    // Don't move player if a modal is open
    if (isAnyModalOpen) return;

    const speed = 5;
    const bounds = {
        left: 0,
        top: 0,
        right: window.innerWidth - 40,
        bottom: window.innerHeight - 40
    };

    if (keys['ArrowUp'] || keys['KeyW']) {
        playerPos.y = Math.max(bounds.top, playerPos.y - speed);
    }
    if (keys['ArrowDown'] || keys['KeyS']) {
        playerPos.y = Math.min(bounds.bottom, playerPos.y + speed);
    }
    if (keys['ArrowLeft'] || keys['KeyA']) {
        playerPos.x = Math.max(bounds.left, playerPos.x - speed);
    }
    if (keys['ArrowRight'] || keys['KeyD']) {
        playerPos.x = Math.min(bounds.right, playerPos.x + speed);
    }

    player.style.left = playerPos.x + 'px';
    player.style.top = playerPos.y + 'px';
}

// Game loop - this was missing!
function gameLoop() {
    movePlayer();
    requestAnimationFrame(gameLoop);
}

// Create particles
function createParticle(x, y) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = x + 'px';
    particle.style.top = y + 'px';

    const angle = Math.random() * Math.PI * 2;
    const velocity = Math.random() * 3 + 1;
    const life = 60;

    gameContainer.appendChild(particle);

    let frame = 0;
    const animate = () => {
        frame++;
        const progress = frame / life;

        particle.style.left = (x + Math.cos(angle) * velocity * frame) + 'px';
        particle.style.top = (y + Math.sin(angle) * velocity * frame) + 'px';
        particle.style.opacity = 1 - progress;

        if (frame < life) {
            requestAnimationFrame(animate);
        } else {
            particle.remove();
        }
    };

    animate();
}

// Event listeners
document.addEventListener('keydown', (e) => {
    keys[e.code] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.code] = false;
});

// Function to check if player is near a zone
function getActiveZone() {
    const playerRect = player.getBoundingClientRect();
    const playerCenter = {
        x: playerRect.left + playerRect.width / 2,
        y: playerRect.top + playerRect.height / 2
    };

    for (const zone of zones) {
        const zoneRect = zone.getBoundingClientRect();
        const distance = Math.sqrt(
            Math.pow((playerCenter.x - (zoneRect.left + zoneRect.width / 2)), 2) +
            Math.pow((playerCenter.y - (zoneRect.top + zoneRect.height / 2)), 2)
        );

        // If player is within 100 pixels of zone center
        if (distance < 100) {
            return zone;
        }
    }
    return null;
}

// Function to open modal
function openModal(zone) {
    if (!zone) return;

    const modalId = zone.getAttribute('data-modal');
    const modal = document.getElementById(modalId);
    modal.style.display = 'flex';

    // Create particles
    const rect = zone.getBoundingClientRect();
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            createParticle(
                rect.left + Math.random() * rect.width,
                rect.top + Math.random() * rect.height
            );
        }, i * 100);
    }
}

// Make zones interactive
zones.forEach(zone => {
    // Click event
    zone.addEventListener('click', () => {
        openModal(zone);
    });
});

// Global keyboard event listener
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault(); // Prevent scrolling on space

        // Check if any modal is currently displayed
        const isAnyModalOpen = Array.from(modals).some(modal =>
            modal.style.display === 'flex'
        );

        // Only proceed if no modal is open
        if (!isAnyModalOpen) {
            const activeZone = getActiveZone();
            if (activeZone) {
                openModal(activeZone);
            }
        }
    }
});

// Modal close functionality
closeButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        e.target.closest('.modal').style.display = 'none';
    });
});

// Close modal on outside click
modals.forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
});

// Close modal with Escape key - this was incomplete!
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        modals.forEach(modal => {
            modal.style.display = 'none';
        });
    }
});

// Initialize everything when page loads
document.addEventListener('DOMContentLoaded', () => {
    createStars();
    setInitialPlayerPosition();
    gameLoop(); // Start the game loop
});

// Handle window resize
window.addEventListener('resize', () => {
    const bounds = {
        left: 0,
        top: 0,
        right: window.innerWidth - 40,
        bottom: window.innerHeight - 40
    };

    // Keep player within new bounds
    playerPos.x = Math.min(bounds.right, Math.max(bounds.left, playerPos.x));
    playerPos.y = Math.min(bounds.bottom, Math.max(bounds.top, playerPos.y));

    player.style.left = playerPos.x + 'px';
    player.style.top = playerPos.y + 'px';
});