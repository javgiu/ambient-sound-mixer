import type { Sound } from "./soundData";

export class UI {
    soundCardsContainer: HTMLElement;
    masterVolumeSlider: HTMLInputElement;
    masterVolumeValue: HTMLElement;
    playPauseButton: HTMLElement;
    resetButton: HTMLButtonElement;
    modal: HTMLElement;
    customPresetsContainer: HTMLElement;
    timerDisplay: HTMLElement;
    timerSelect: HTMLSelectElement;
    themeToggle: HTMLElement;
    showModalButton: HTMLButtonElement;
    nameInput: HTMLInputElement;
    cancelSaveButton: HTMLButtonElement;
    confirmSaveButton: HTMLButtonElement;

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
        this.showModalButton = null;
        this.nameInput = null;
        this.cancelSaveButton = null;
        this.confirmSaveButton = null;
    }

    init() {
        this.soundCardsContainer = document.querySelector(".grid");
        this.masterVolumeSlider = document.getElementById(
            "master-volume",
        ) as HTMLInputElement;
        this.masterVolumeValue = document.getElementById("master-volume-value");
        this.playPauseButton = document.getElementById("play-pause-all");
        this.resetButton = document.getElementById(
            "reset-all",
        ) as HTMLButtonElement;
        this.modal = document.getElementById("save-preset-modal");
        this.customPresetsContainer = document.getElementById("custom-presets");
        this.timerDisplay = document.getElementById("timer-display");
        this.timerSelect = document.getElementById(
            "timer-select",
        ) as HTMLSelectElement;
        this.themeToggle = document.getElementById("theme-toggle");
        this.showModalButton = document.getElementById(
            "save-preset",
        ) as HTMLButtonElement;
        this.nameInput = document.getElementById(
            "preset-name",
        ) as HTMLInputElement;
        this.cancelSaveButton = document.getElementById(
            "cancel-save",
        ) as HTMLButtonElement;
        this.confirmSaveButton = document.getElementById(
            "confirm-save",
        ) as HTMLButtonElement;
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

    // Create custom preset button
    createCustomPresetButton(name: string, presetId: string) {
        const button = document.createElement("button");

        button.className =
            "custom-preset-btn bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-all duration-300 relative group";

        button.dataset.preset = presetId;
        button.innerHTML = `
            <i class="fas fa-star mr-2 text-yellow-400"></i> 
            ${name}
            <button type="button" class="delete-preset flex items-center justify-center absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer" data-preset="${presetId}"> 
                <i class="fas fa-times text-xs text-white mr-px"></i>
            </button>
            
        `;
        return button;
    }

    // Render all sound cards
    renderSoundCards(sounds: readonly Sound[]) {
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

    // Reset all UI elements to default state
    reset() {
        // Reset sliders to 0
        const sliders = document.querySelectorAll(".sound-card .volume-slider");
        sliders.forEach((slider: HTMLInputElement) => {
            slider.value = "0";
            const soundId = slider.dataset.sound;
            // Reset play buttons state
            this.updateSoundPlayButton(soundId, "play");

            // Reset sliders display
            this.updateVolumeDisplay(soundId, 0);

            // Remove playing class from cards
            const card = slider.closest(".sound-card");
            card.classList.remove("playing");
        });

        // Reset play pause main button
        this.updateMainPlayButton("play");

        // Reset master volume to 100%
        this.updateVolumeDisplay("master", 100);

        this.setActivePreset();

        this.resetTimerDropdown();
    }

    // Show save preset modal
    showModal() {
        this.modal.classList.remove("hidden");
        this.modal.classList.add("flex");
        document.getElementById("preset-name").focus();
    }

    // Hide save preset modal
    hideModal() {
        this.modal.classList.remove("flex");
        this.modal.classList.add("hidden");
        const input = document.getElementById(
            "preset-name",
        ) as HTMLInputElement;
        input.value = "";
    }

    // Add custom preset to UI
    addCustomPreset(name: string, presetId: string) {
        const presetButton = this.createCustomPresetButton(name, presetId);
        this.customPresetsContainer.appendChild(presetButton);
    }

    // Highlight active preset
    setActivePreset(presetKey?: string) {
        // Remove active class from all buttons
        const activePresetButton = document.querySelector(".preset-active");

        activePresetButton?.classList.remove("preset-active");

        // Add active class to selected presets
        const nextActivePreset = document.querySelector(
            `[data-preset='${presetKey}']`,
        );
        nextActivePreset?.classList.add("preset-active");
    }

    // Remove custom preset from UI
    removeCustomPreset(presetId: string) {
        const button = document.querySelector(
            `.custom-preset-btn[data-preset="${presetId}"]`,
        );
        if (button) {
            button.remove();
        }
    }

    // Reset timer dropdown
    resetTimerDropdown() {
        if (this.timerSelect) {
            this.timerSelect.value = "0";
        }
    }

    // Clear and hide timer display
    clearTimerDisplay() {
        if (this.timerDisplay) {
            this.timerDisplay.textContent = "";
            this.timerDisplay.classList.add("hidden");
        }
    }

    // Update timer display
    updateTimerDisplay(minutes: number, seconds: number) {
        if (this.timerDisplay) {
            if (minutes >= 0 || seconds >= 0) {
                const formattedTime = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
                this.timerDisplay.textContent = formattedTime;
                this.timerDisplay.classList.remove("hidden");
            } else {
                this.timerDisplay.classList.add("hidden");
            }
        }
    }

    // Toggle Theme
    toggleTheme() {
        const body = document.body;
        if (body.classList.contains("light-theme")) {
            body.classList.remove("light-theme");
            this.themeToggle.innerHTML = `<i class="fas fa-sun text-yellow-300"></i>`;
        } else {
            body.classList.add("light-theme");
            this.themeToggle.innerHTML = `<i class="fas fa-moon text-yellow-300"></i>`;
        }
    }
}
