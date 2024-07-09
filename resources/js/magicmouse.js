let start = new Date().getTime();

const originPosition = { x: 0, y: 0 };

const last = {
    starTimestamp: start,
    starPosition: originPosition,
    mousePosition: originPosition
}

const config = {
    starAnimationDuration: 1500,
    minimumTimeBetweenStars: 250,
    minimumDistanceBetweenStars: 75,
    glowDuration: 75,
    maximumGlowPointSpacing: 10,
    colors: ["249 146 253", "252 254 255"],
    sizes: ["1.4rem", "1rem", "0.6rem"],
    animations: ["fall-1", "fall-2", "fall-3"]
}

let count = 0;

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
    selectRandom = items => items[rand(0, items.length - 1)];

const withUnit = (value, unit) => `${value}${unit}`,
    px = value => withUnit(value, "px"),
    ms = value => withUnit(value, "ms");

const calcDistance = (a, b) => {
    const diffX = b.x - a.x,
        diffY = b.y - a.y;

    return Math.sqrt(Math.pow(diffX, 2) + Math.pow(diffY, 2));
}

const calcElapsedTime = (start, end) => end - start;

const appendElement = element => document.body.appendChild(element),
    removeElement = (element, delay) => setTimeout(() => document.body.removeChild(element), delay);

const createStar = position => {
    const star = document.createElement("span"),
        color = selectRandom(config.colors);

    star.className = "star fa-star fas ";

    star.style.left = px(position.x);
    star.style.top = px(position.y);
    star.style.fontSize = selectRandom(config.sizes);
    star.style.color = `rgb(${color})`;
    star.style.textShadow = `0px 0px 1.5rem rgb(${color} / 0.5)`;
    star.style.animationName = config.animations[count++ % 3];
    star.style.starAnimationDuration = ms(config.starAnimationDuration);

    appendElement(star);

    removeElement(star, config.starAnimationDuration);
}

const createGlowPoint = position => {
    const glow = document.createElement("div");

    glow.className = "glow-point";

    glow.style.left = px(position.x);
    glow.style.top = px(position.y);

    appendElement(glow)

    removeElement(glow, config.glowDuration);
}

const determinePointQuantity = distance => Math.max(
    Math.floor(distance / config.maximumGlowPointSpacing),
    1
);

/* --

The following is an explanation for the "createGlow" function below:

I didn't cover this in my video, but I ran into an issue where moving the mouse really quickly caused gaps in the glow effect. Kind of like this:

*   *       *       *    *      *    🖱️

instead of:

*************************************🖱️

To solve this I sort of "backfilled" some additional glow points by evenly spacing them in between the current point and the last one. I found this approach to be more visually pleasing than one glow point spanning the whole gap.

The "quantity" of points is based on the config property "maximumGlowPointSpacing".

My best explanation for why this is happening is due to the mousemove event only firing every so often. I also don't think this fix was totally necessary, but it annoyed me that it was happening so I took on the challenge of trying to fix it.

-- */
const createGlow = (last, current) => {
    const distance = calcDistance(last, current),
        quantity = determinePointQuantity(distance);

    const dx = (current.x - last.x) / quantity,
        dy = (current.y - last.y) / quantity;

    Array.from(Array(quantity)).forEach((_, index) => {
        const x = last.x + dx * index,
            y = last.y + dy * index;

        createGlowPoint({ x, y });
    });
}

const updateLastStar = position => {
    last.starTimestamp = new Date().getTime();

    last.starPosition = position;
}

const updateLastMousePosition = position => last.mousePosition = position;

const adjustLastMousePosition = position => {
    if (last.mousePosition.x === 0 && last.mousePosition.y === 0) {
        last.mousePosition = position;
    }
};

let isPageActive = true;
let lastBroadcastPosition = null;

const handleOnMove = e => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const centerX = viewportWidth / 2;
    const centerY = viewportHeight / 2;

    const absolutePosition = { x: e.clientX, y: e.clientY };
    const relativePosition = { x: (e.clientX - centerX) / (viewportWidth / 2), y: (e.clientY - centerY) / (viewportHeight / 2) };

    adjustLastMousePosition(absolutePosition);

    const now = new Date().getTime(),
        hasMovedFarEnough = calcDistance(last.starPosition, absolutePosition) >= config.minimumDistanceBetweenStars,
        hasBeenLongEnough = calcElapsedTime(last.starTimestamp, now) > config.minimumTimeBetweenStars;

    if (hasMovedFarEnough || hasBeenLongEnough) {
        createStar(absolutePosition);
        updateLastStar(absolutePosition);
    }

    createGlow(last.mousePosition, absolutePosition);
    updateLastMousePosition(absolutePosition);

    if (isPageActive && (!lastBroadcastPosition || lastBroadcastPosition.x !== relativePosition.x || lastBroadcastPosition.y !== relativePosition.y)) {
        if (window.Livewire) {
            window.Livewire.find(document.querySelector('[wire\\:id]').getAttribute('wire:id')).moveMouse(relativePosition);
        }
        lastBroadcastPosition = relativePosition;
    }
}

window.onmousemove = e => handleOnMove(e);

window.ontouchmove = e => handleOnMove(e.touches[0]);

document.body.onmouseleave = () => updateLastMousePosition(originPosition);

document.addEventListener("visibilitychange", () => {
    isPageActive = !document.hidden;
    if (!isPageActive && window.Livewire) {
        // Notify the server that the user is inactive
        window.Livewire.find(document.querySelector('[wire\\:id]').getAttribute('wire:id')).setInactive();
    }
});

// Handle when the window loses focus
window.addEventListener("blur", () => {
    isPageActive = false;
    if (window.Livewire) {
        // Notify the server that the user is inactive
        window.Livewire.find(document.querySelector('[wire\\:id]').getAttribute('wire:id')).setInactive();
    }
});

// Handle when the window gains focus
window.addEventListener("focus", () => {
    isPageActive = true;
});
