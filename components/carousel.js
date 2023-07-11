const html = `
    <style>
    ::slotted(*) img {
        display: none;
    }

    .slide-img {
        border-radius: 10px;
        height: 30vw;
        animation: fade 1s;
    }

    #carousel {
        transition: .2s ease-in-out transform;
        position: relative;
    }

    #carousel:not(:hover) {
        transform: scale(.98);
    }

    .slide {
        display: none;
    }
    
    .controls {
        position: absolute;
        top: 50%;
        height: 13%;
        width: 5%;

        margin: 0 .5vw;
        font-size: 2.5vw;
    }

    #tracker > *, #tracker {
        color: white;
    }

    #tracker-num {
        font-weight: bold;
    }

    #tracker {
        position: absolute;
        top: 1vw;
        left: 1vw;
        margin: 0;

        padding: 5px;
        font-size: 1.2vw;
    }

    .controls, #tracker, .slide-caption, .bullet {
        transition: all .15s ease-in-out;
        background-color: rgba(0, 0, 0, .3);
        border-radius: 6px;
        border: none;
        color: white;
        /* if a filter was applied to the slide, certan UI elements would not display.
           ordinarily, this wouldn't be a problem, but opera sometimes applies filters with
           CSS injection behind the scenes, breaking things. anyway, this fixes it :) */
        z-index: 100;
    }

    .controls:hover, #tracker:hover,
    .slide-caption:hover, .bullet:hover,
    .bullet-selected {
        transform: scale(1.05);
        background-color: rgba(0, 0, 0, .5);
    }

    .slide-caption {
        padding: 5px;
        position: absolute;
        bottom: 0;
        left: 1vw;
        font-style: italic;
    }

    #bullets {
        position: absolute;
        top: 1vw;
        right: 1vw;

        display: flex;
        flex-direction: row;
        gap: 10px;
    }

    .bullet {
        display: block;
        height: 15px;
        width: 15px;
        border-radius: 40%;
    }
    
    @media not (min-width: 750px) {
        .slide-caption {
            display: none;
        }
    }

    @media not (min-width: 500px) {
        #bullets {
            display: none;
        }

    }
    </style>

    <div id="carousel">
        <p id="tracker"><span id="tracker-num"></span> / <span id="tracker-denom"></span></p>
        <button class="controls" id="prev" style="left: 0">&#10094;</button>
        <button class="controls" id="next" style="right: 0">&#10095;</button>
        <slot></slot>
        <div id="slides"></div>
        <div id="bullets"></div>
    </div>
`;


// the `%` doesn't do wraparound on negative numbers.
// see: <https://stackoverflow.com/a/17323608>
function mod(a, b) {
    return ((a % b) + b) % b;
}

class Carousel extends HTMLElement {
    curIdx = 0;
    curElm;
    curBullet;

    constructor() {
        super();

        this.attachShadow({ mode: "open" });
        this.shadowRoot.innerHTML = html;
    }

    get slides() {
        return this.shadowRoot.querySelectorAll(".slide");
    }

    connectedCallback() {
        setTimeout(() => {
            const slot = this.shadowRoot.querySelector("slot");
            const contents = slot.assignedElements({ flatten: true });
            const slidesContainer = this.shadowRoot.querySelector("#slides");
            contents.map(c => c.cloneNode(true)).forEach(el => slidesContainer.appendChild(el));

            const bulletsContainer = this.shadowRoot.querySelector("#bullets");
            for (let idx = 0; idx < this.slides.length; idx++) {
                const bullet = document.createElement("span");
                bullet.onclick = () => this.bulletHandler(bullet, idx);
                bullet.classList.add("bullet");
                bulletsContainer.appendChild(bullet);
            }

            const bullets = this.shadowRoot.querySelectorAll(".bullet");
            this.curElm = this.slides[this.curIdx];
            this.curBullet = bullets[this.curIdx];
            this.display();

            const trackerDenom = this.shadowRoot.querySelector("#tracker-denom");
            trackerDenom.innerText = this.slides.length;

            const prev = this.shadowRoot.querySelector("#prev");
            prev.onclick = () => this.display(this.curIdx = mod((this.curIdx - 1), this.slides.length));
            const next = this.shadowRoot.querySelector("#next");
            next.onclick = () => this.display(this.curIdx = mod((this.curIdx + 1), this.slides.length));
        });
    }

    display() {
        this.curElm.style.display = "none";
        this.curElm = this.slides[this.curIdx];
        this.curElm.style.display = "block";

        const tracker = this.shadowRoot.querySelector("#tracker-num");
        tracker.innerText = this.curIdx + 1;

        const bullets = this.shadowRoot.querySelectorAll(".bullet");
        this.curBullet.classList.remove("bullet-selected");
        this.curBullet = bullets[this.curIdx];
        this.curBullet.classList.add("bullet-selected");
    }

    bulletHandler(bullet, idx) {
        this.curBullet.classList.remove("bullet-selected");
        this.curBullet = bullet;
        this.curBullet.classList.add("bullet-selected");
        this.display(this.curIdx = idx);
    }
}

const slidehtml = `
`;

class Slide extends HTMLElement {
    constructor() {
        this.attachShadow({ mode: "open" });
        this.shadowRoot.innerHTML = slidehtml;
    }
}

customElements.define("hex-carousel", Carousel);
