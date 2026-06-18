import "./style.css";
import { sounds, defaultPresets, type SoundId } from "./soundData";
import { SoundManager } from "./soundManager";
import { UI } from "./ui";
import { PresetManager } from "./presetManager";
import { Timer } from "./timer";

type CurrentStateConfig = Partial<Record<SoundId, number>>;

class AmbientMixer {
    soundManager: SoundManager;
    ui: UI;
    presetManager: PresetManager;
    timer: Timer;
    currentSoundState: CurrentStateConfig;
    isInitialized: boolean;
    masterVolume: number;

    constructor() {
        this.soundManager = new SoundManager();
        this.ui = new UI();
        this.presetManager = new PresetManager();
        this.timer = new Timer(
            () => this.onTimerComplete(),
            (minutes, seconds) => this.ui.updateTimerDisplay(minutes, seconds),
        );
        this.currentSoundState = {};
        this.isInitialized = false;
        this.masterVolume = 100;
    }

    init() {
        try {
            // Initialize UI
            this.ui.init();

            // Render sound cards
            this.ui.renderSoundCards(sounds);

            // Setup events
            this.setupEventListeners();

            // Load custom presets in UI
            this.loadCustomPresets();

            // Load all sounds
            this.loadAllSounds();

            // Update master volume display
            this.setMasterVolume(this.masterVolume);

            // Initialize sound states after loading sounds
            sounds.forEach((sound) => {
                this.currentSoundState[sound.id] = 0;
            });

            this.isInitialized = true;
        } catch (error) {
            console.error("Failed to initialize app: ", error);
        }
    }

    // Setup all event listeners
    setupEventListeners() {
        // Handle all clicks with event delegation
        document.addEventListener("click", async (e) => {
            const target = e.target as HTMLElement;

            // Check if a play button was clicked
            if (target.closest(".play-btn")) {
                const button = target.closest(".play-btn") as HTMLButtonElement;
                const soundId = button.dataset.sound;
                console.log(soundId);
                await this.toggleSound(soundId);
            }

            // Check if delete button was clicked
            if (target.closest(".delete-preset")) {
                e.stopPropagation();
                const button = target.closest(
                    ".delete-preset",
                ) as HTMLButtonElement;
                const presetKey = button.dataset.preset;
                this.deleteCustomPreset(presetKey);
                return;
            }

            // Check if a default preset button was clicked
            if (target.closest(".preset-btn")) {
                const button = target.closest(
                    ".preset-btn",
                ) as HTMLButtonElement;
                const presetKey = button.dataset.preset;
                this.loadPreset(presetKey);
            }

            // Check if a custom preset button was clicked
            if (target.closest(".custom-preset-btn")) {
                const button = target.closest(
                    ".custom-preset-btn",
                ) as HTMLButtonElement;
                const presetKey = button.dataset.preset;
                this.loadPreset(presetKey, true);
            }
        });

        // Handle play pause main button
        document.addEventListener("click", (e) => {
            const target = e.target as HTMLElement;
            if (target.closest("#play-pause-all")) {
                this.toggleAllSounds();
            }
        });

        // Handle individual sounds slider
        document.addEventListener("input", (e) => {
            const target = e.target as HTMLInputElement;
            if (target.id === "sound-card-volume") {
                const soundId = target.dataset.sound as SoundId;
                const volume = parseInt(target.value);
                this.setSoundVolume(soundId, volume);
            }
        });

        // Handle master volume slider
        if (this.ui.masterVolumeSlider) {
            this.ui.masterVolumeSlider.addEventListener("input", (e) => {
                const target = e.target as HTMLInputElement;
                const volume = parseInt(target.value);
                this.setMasterVolume(volume);
            });
        }

        // Handle reset button
        if (this.ui.resetButton) {
            this.ui.resetButton.addEventListener(
                "click",
                this.resetAll.bind(this),
            );
        }

        // Handle save preset to show modal
        if (this.ui.showModalButton) {
            this.ui.showModalButton.addEventListener("click", (e) => {
                this.showSavePresetModal();
            });
        }

        // HAndle cancel button in modal
        if (this.ui.cancelSaveButton) {
            this.ui.cancelSaveButton.addEventListener("click", (e) => {
                this.ui.hideModal();
            });
        }

        // Close modal if backdrop is clicked
        if (this.ui.modal) {
            this.ui.modal.addEventListener("click", (e) => {
                if (e.target === this.ui.modal) {
                    this.ui.hideModal();
                }
            });
        }

        // Handle confirm button in modal
        if (this.ui.confirmSaveButton) {
            this.ui.confirmSaveButton.addEventListener("click", (e) => {
                this.saveCurrentPreset();
            });
        }

        if (this.ui.timerSelect) {
            this.ui.timerSelect.addEventListener("change", (e) => {
                const target = e.target as HTMLSelectElement;
                const minutes = parseInt(target.value);
                if (minutes > 0) {
                    this.timer.start(minutes);
                    console.log(`Timer started for ${minutes} minutes`);
                } else {
                    this.timer.stop();
                }
            });
        }

        if (this.ui.themeToggle) {
            this.ui.themeToggle.addEventListener("click", (e) => {
                const target = e.target as HTMLElement;
                if (target.closest("#theme-toggle")) {
                    this.ui.toggleTheme();
                }
            });
        }
    }

    // Set master volume
    setMasterVolume(volume: number) {
        this.masterVolume = volume;

        // Update the display
        this.ui.updateVolumeDisplay("master", volume);

        // Apply master volume to all currently playing sounds
        this.applyMasterVolumeToAll();
    }

    // Apply master volume to all playing sounds
    applyMasterVolumeToAll() {
        for (const [soundId, audio] of this.soundManager.audioElements) {
            if (!audio.paused) {
                const audioVolume = this.ui.getInputValue(soundId); // between 0 and 1

                // Calculate effective volume (individual * master / 100)
                const effectiveVolume = (audioVolume * this.masterVolume) / 100; // between 0 and 100

                // Apply to the actual audio element
                this.soundManager.setVolume(soundId, effectiveVolume);
            }
        }
    }

    // Load all sound files
    loadAllSounds() {
        sounds.forEach((sound) => {
            const audioUrl = `/audio/${sound.file}` as `${string}.mp3`;
            const success = this.soundManager.loadSound(sound.id, audioUrl);

            if (!success) {
                console.warn(
                    `Could not load sound: ${sound.name}from ${audioUrl}`,
                );
            }
        });
    }

    // Toggle individual sound

    async toggleSound(soundId: string) {
        const audio = this.soundManager.audioElements.get(soundId);

        let volume = this.ui.getInputValue(soundId);

        if (audio.paused && volume === 0) {
            volume = 50;
            this.ui.updateVolumeDisplay(soundId, volume);
        }

        const effectiveVolume = (volume * this.masterVolume) / 100;

        if (!audio) {
            console.error(`Sound ${soundId} not found`);
            return false;
        }

        if (audio.paused) {
            // Sound is off, turn it on
            this.soundManager.setVolume(soundId, effectiveVolume);
            await this.soundManager.playSound(soundId);
            this.ui.updateSoundPlayButton(soundId, "pause");

            // Set current sound state
            this.currentSoundState[soundId] = volume;
        } else {
            // Sound is on, shut it off
            this.soundManager.pauseSound(soundId);
            this.ui.updateSoundPlayButton(soundId, "play");

            // Set current sound state to 0
            // Set current sound state
            this.currentSoundState[soundId] = 0;
        }

        // Update main play pause button
        this.updateMainPlayButtonState();
    }

    // Toggle all sounds
    toggleAllSounds() {
        if (this.soundManager.isPlaying) {
            this.soundManager.pauseAll();
            this.ui.updateMainPlayButton("play");
            sounds.forEach((sound) => {
                this.addToState(sound.id, 0);
                this.ui.updateSoundPlayButton(sound.id, "play");
            });
        } else {
            for (const [soundId, audio] of this.soundManager.audioElements) {
                // Use input value as volume, not the effective volume
                let volume = this.ui.getInputValue(soundId);

                if (audio.paused && volume === 0) {
                    volume = 50;
                    this.ui.updateVolumeDisplay(soundId, volume);
                }
                this.addToState(soundId, volume);

                // Apply effective volume
                const effectiveVolume = (volume * this.masterVolume) / 100;

                this.soundManager.setVolume(soundId, effectiveVolume);

                this.ui.updateSoundPlayButton(soundId, "pause");
            }
            this.soundManager.playAll();
            this.ui.updateMainPlayButton("pause");
        }
    }

    // Add sound key and volume to sound state
    addToState(soundId: string, volume: number) {
        this.currentSoundState[soundId] = volume;
    }

    // Set sound volume
    setSoundVolume(soundId: SoundId, volume: number) {
        // Set sound volume in state
        this.currentSoundState[soundId] = volume;

        // Apply effective volume
        const effectiveVolume = (volume * this.masterVolume) / 100;

        // Update sound volume in manager
        this.soundManager.setVolume(soundId, effectiveVolume);

        // Update visual display
        this.ui.updateVolumeDisplay(soundId, volume);
    }

    // Update main play button based on individual sounds
    updateMainPlayButtonState() {
        this.ui.updateMainPlayButton(
            this.soundManager.isPlaying ? "pause" : "play",
        );
    }

    // Reset all sounds and settings
    resetAll() {
        // Reset all sounds
        this.soundManager.resetAll();

        // Reset master volume
        this.masterVolume = 100;

        // Reset timer

        // Reset UI
        this.ui.reset();

        // Reset sounds state
        sounds.forEach((sound) => {
            this.currentSoundState[sound.id] = 0;
        });
    }

    // Load a preset config
    loadPreset(presetKey: string, custom: boolean = false) {
        let preset;

        if (custom) {
            preset = this.presetManager.loadPreset(presetKey);
        } else {
            preset = defaultPresets[presetKey];
        }

        if (!preset) {
            console.error(`Preset ${presetKey} not found`);
            return;
        }

        // First, stop all sounds
        this.soundManager.resetAll();

        // Reset all volumes to 0
        sounds.forEach((sound) => {
            this.setSoundVolume(sound.id, 0);
            this.ui.updateSoundPlayButton(sound.id, "play");
        });

        // Apply preset volumes
        for (const [soundId, volume] of Object.entries(preset.sounds) as [
            SoundId,
            number,
        ][]) {
            this.setSoundVolume(soundId, volume);
            this.toggleSound(soundId);
        }

        this.ui.setActivePreset(presetKey);
    }

    // Get audio using soundId
    getAudio(soundId: SoundId) {
        return this.soundManager.audioElements.get(soundId);
    }

    // Show save preset modal
    showSavePresetModal() {
        // Check if any sounds active
        if (!this.soundManager.isPlaying) {
            alert("No active sounds for preset");
            return;
        }

        this.ui.showModal();
    }

    // Save current preset
    saveCurrentPreset() {
        const name = this.ui.nameInput.value.trim();

        if (!name) {
            alert("Please enter a preset name");
            return;
        }

        if (this.presetManager.presetNameExists(name)) {
            alert(`A preset with the name name already exists`);
            return;
        }

        const presetId = this.presetManager.savePreset(
            name,
            this.currentSoundState,
        );

        // Add custom preset button to UI
        this.ui.addCustomPreset(name, presetId);

        this.ui.hideModal();

        console.log(
            `Preset "${name}" saved successfully with the ID: ${presetId}`,
        );
    }

    // Load custom preset buttons in UI
    loadCustomPresets() {
        const customPresets = this.presetManager.customPresets;
        for (const [presetId, preset] of Object.entries(customPresets)) {
            this.ui.addCustomPreset(preset.name, presetId);
        }
    }

    // Delete custom preset
    deleteCustomPreset(presetId: string) {
        if (this.presetManager.deletePreset(presetId)) {
            this.ui.removeCustomPreset(presetId);
            console.log(`Preset ${presetId} deleted`);
        }
    }

    // Timer complete callback
    onTimerComplete() {
        this.soundManager.pauseAll();
        this.ui.updateMainPlayButton("play");

        sounds.forEach((sound) => {
            this.ui.updateSoundPlayButton(sound.id, "play");
        });

        // Reset timer dropdown
        this.ui.resetTimerDropdown();

        // Clear and hide timer display
        this.ui.clearTimerDisplay();
    }
}

// Initialize app when DOM is ready

document.addEventListener("DOMContentLoaded", () => {
    const app = new AmbientMixer();
    app.init();
});
