import "./style.css";
import { sounds, defaultPresets } from "./soundData";
import { SoundManager } from "./soundManager";
import { UI } from "./ui";

class AmbientMixer {
    soundManager: SoundManager;
    ui: UI;
    presetManager: null;
    timer: null;
    currentSoundState: null;
    isInitialized: boolean;
    masterVolume: number;

    constructor() {
        this.soundManager = new SoundManager();
        this.ui = new UI();
        this.presetManager = null;
        this.timer = null;
        this.currentSoundState = null;
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

            // Load all sounds
            this.loadAllSounds();

            // Update master volume display
            this.setMasterVolume(this.masterVolume);

            this.isInitialized = true;
        } catch (error) {
            console.error("Failed to initialize app: ", error);
        }
    }

    // Setup all event listeners
    setupEventListeners() {
        // Handle all clicks with event delegation
        document.addEventListener("click", (e) => {
            const target = e.target as HTMLElement;
            // Check if a play button was clicked
            if (target.closest(".play-btn")) {
                const button = target.closest(".play-btn") as HTMLButtonElement;
                const soundId = button.dataset.sound;
                console.log(soundId);
                this.toggleSound(soundId);
            }
        });

        document.addEventListener("click", (e) => {
            const target = e.target as HTMLElement;
            if (target.closest("#play-pause-all")) {
                this.toggleAllSounds();
            }
        });

        document.addEventListener("input", (e) => {
            const target = e.target as HTMLInputElement;
            if (target.id === "sound-card-volume") {
                const soundId = target.dataset.sound;
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
                console.dir(audio);
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

        // Convert volume from decimal to integer
        let volume = audio.volume * 100;

        if (audio.paused && volume === 0) {
            volume = 50;
            this.ui.updateVolumeDisplay(soundId, volume);
        }

        if (!audio) {
            console.error(`Sound ${soundId} not found`);
            return false;
        }

        if (audio.paused) {
            // Sound is off, turn it on
            this.soundManager.setVolume(soundId, volume);
            await this.soundManager.playSound(soundId);
            this.ui.updateSoundPlayButton(soundId, "pause");
        } else {
            // Sound is on, shut it off
            this.soundManager.pauseSound(soundId);
            this.ui.updateSoundPlayButton(soundId, "play");
        }
    }

    // Toggle all sounds
    toggleAllSounds() {
        if (this.soundManager.isPlaying) {
            this.soundManager.pauseAll();
            this.ui.updateMainPlayButton("play");
            sounds.forEach((sound) => {
                this.ui.updateSoundPlayButton(sound.id, "play");
            });
        } else {
            this.soundManager.playAll();
            this.ui.updateMainPlayButton("pause");
            for (const [soundId, audio] of this.soundManager.audioElements) {
                this.ui.updateSoundPlayButton(soundId, "pause");

                let volume = audio.volume * 100;

                if (audio.paused && volume === 0) {
                    volume = 50;
                    this.ui.updateVolumeDisplay(soundId, volume);
                }
                this.ui.updateVolumeDisplay(soundId, volume);
            }
        }
    }

    // Set sound volume
    setSoundVolume(soundId: string, volume: number) {
        // Update sound volume in manager
        this.soundManager.setVolume(
            soundId,
            (volume * this.masterVolume) / 100,
        );

        // Update visual display
        this.ui.updateVolumeDisplay(soundId, volume);
    }

    // Update main play button based on individual sounds
    updateMainPlayButtonState() {
        this.ui.updateMainPlayButton(
            this.soundManager.isPlaying ? "pause" : "play",
        );
    }
}

// Initialize app when DOM is ready

document.addEventListener("DOMContentLoaded", () => {
    const app = new AmbientMixer();
    app.init();
});
