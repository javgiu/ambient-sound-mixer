import type { Sound } from "./soundData";

export class UI {
    soundCardsContainer: HTMLElement;
    masterVolumeSlider: HTMLElement;
    masterVolumeValue: HTMLElement;
    playPauseButton: HTMLElement;
    resetButton: HTMLElement;
    modal: HTMLElement;
    customPresetsContainer: HTMLElement;
    timerDisplay: HTMLElement;
    timerSelect: HTMLElement;
    themeToggle: HTMLElement;

    constructor() {
        this.soundCardsContainer = null;
        this.masterVolumeSlider = null;
        this.masterVolumeValue = null;
        this.playPauseButton = null;
        this.resetButton = null;
        this.modal = null;
        this.customPresetsContainer = null;
        this.timerDisplay = null;
        this.timerSelect = null;
        this.themeToggle = null;
    }

    init() {
        this.soundCardsContainer = document.querySelector(".grid");
        this.masterVolumeSlider = document.getElementById("master-volume");
        this.masterVolumeValue = document.getElementById("master-volume-value");
        this.playPauseButton = document.getElementById("play-pause-all");
        this.resetButton = document.getElementById("reset-all");
        this.modal = document.getElementById("save-preset-modal");
        this.customPresetsContainer = document.getElementById("custom-presets");
        this.timerDisplay = document.getElementById("timer-display");
        this.timerSelect = document.getElementById("timer-select");
        this.themeToggle = document.getElementById("theme-toggle");
    }

    createSoundCard(sound: Sound) {
        const card = document.createElement("div");
        card.className =
            "sound-card bg-white/10 backdrop-blur-md rounded-2xl p-6 relative overflow-hidden transition-all duration-300";
        card.dataset.sound = sound.id;
        card.innerHTML = `
            <div class="flex flex-col h-full">
                <!-- Sound Icon and Name -->
                <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center space-x-3">
                        <div class="sound-icon-wrapper w-12 h-12 rounded-full bg-linear-to-br ${sound.color} flex items-center justify-center">
                            <i class="fas ${sound.icon} text-white text-xl"></i>
                        </div>
                        <div>
                            <h3 class="font-semibold text-lg">${sound.name}</h3>
                            <p class="text-xs opacity-70">${sound.description}</p>
                        </div>
                    </div>
                    <button type="button" class="play-btn cursor-pointer w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 flex items-center justify-center" data-sound="${sound.id}">
                        <i class="fas fa-play text-sm"></i>
                    </button>
                </div>

                <!-- Volume Control -->
                <div class="flex-1 flex flex-col justify-center ">
                    <div class="flex items-center space-x-3">
                        <i class="fas fa-volume-low opacity-50"></i>
                        <span class="volume-value text-sm ml-auto w-8 text-right">0</span>
                    </div>

                    <!-- Volume Bar Visualization -->
                    <div class="volume-bar mt-3">
                        <input type="range" class="volume-slider flex-1" min="0" max="100" value="0" data-sound="${sound.id}" id="sound-card-volume">
                    </div>
                </div>
            </div>
        `;

        return card;
    }

    // Render all sound cards
    renderSoundCards(sounds: Sound[]) {
        this.soundCardsContainer.innerHTML = "";
        sounds.forEach((sound) => {
            const card = this.createSoundCard(sound);
            this.soundCardsContainer.appendChild(card);
        });
    }

    // Update play/pause button for individual sound
    updateSoundPlayButton(soundId: string, icon: "pause" | "play") {
        const card = document.querySelector(`[data-sound="${soundId}"]`);

        if (card) {
            const playBtn = card.querySelector(".play-btn");
            playBtn.innerHTML = "";

            if (icon === "pause") {
                playBtn.innerHTML = "<i class='fas fa-pause text-sm'></i>";
                card.classList.add("playing");
            } else {
                playBtn.innerHTML = "<i class='fas fa-play text-sm'></i>";
                card.classList.remove("playing");
            }
        }
    }

    getInputValue(soundId: string) {
        const card = document.querySelector(`[data-sound="${soundId}"]`);

        if (card) {
            const input = card.querySelector(
                ".volume-slider",
            ) as HTMLInputElement;
            return parseInt(input.value);
        }
    }

    // Update volume display for a sound
    updateVolumeDisplay(soundId: string, volume: number) {
        const card = document.querySelector(`[data-sound="${soundId}"]`);

        if (card) {
            const volumeValue = card.querySelector(".volume-value");

            if (volumeValue) {
                if (soundId === "master") {
                    volumeValue.textContent = `${volume}%`;
                } else {
                    volumeValue.textContent = `${volume}`;
                }
            }

            // Update slider position
            const slider = card.querySelector(
                ".volume-slider",
            ) as HTMLInputElement;
            if (slider) {
                slider.value = `${volume}`;
                slider.style.backgroundSize = `${volume}% 100%`;
            }
        }
    }

    updateMainPlayButton(icon: "play" | "pause") {
        this.playPauseButton.innerHTML = `
            <i class="fas fa-${icon} mr-2"></i>
            <span>${icon.charAt(0).toUpperCase() + icon.slice(1)} All</span>
        `;
    }
}
