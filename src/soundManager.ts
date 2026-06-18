import { sounds } from "./soundData";

export class SoundManager {
    audioElements: Map<string, HTMLAudioElement>;
    isPlaying: boolean;
    soundsPlaying: number;
    allSoundsPlaying: boolean;

    constructor() {
        this.audioElements = new Map();
        this.isPlaying = false;
        this.soundsPlaying = 0;
        this.allSoundsPlaying = false;
    }

    // Load sound file
    loadSound(soundId: string, filePath: `${string}.mp3`) {
        try {
            const audio = new Audio();
            audio.src = filePath;
            audio.loop = true;
            audio.preload = "metadata";
            audio.volume = 0;

            // Add sound to audio elements map
            this.audioElements.set(soundId, audio);
            return true;
        } catch (error) {
            console.error(`Failed to load sound ${soundId}`, error);
            return false;
        }
    }

    // Play an specific sound
    async playSound(soundId: string) {
        const audio = this.audioElements.get(soundId);

        if (audio) {
            try {
                await audio.play();
                console.log(`Playing: ${soundId}`);
                this.soundsPlaying++;
                this.updateState();
                console.log(this.isPlaying);
                return true;
            } catch (error) {
                console.error(`Failed to play ${soundId}`, error);
                return false;
            }
        }
    }
    // Pause an specific sound
    pauseSound(soundId: string) {
        const audio = this.audioElements.get(soundId);

        if (audio && !audio.paused) {
            audio.pause();
            console.log(`Paused: ${soundId}`);
        }
        this.soundsPlaying--;
        this.updateState();
    }

    // Set volume for an specific sound (0-100)
    setVolume(soundId: string, volume: number) {
        const audio = this.audioElements.get(soundId);

        if (!audio) {
            console.error(`Sound ${soundId} is not found`);
            return false;
        }

        // Convert 0-100, to 0-1

        audio.volume = volume / 100;
        return true;
    }

    // Play all sounds
    async playAll() {
        for (const audio of this.audioElements.values()) {
            if (audio.paused) {
                try {
                    // The volume is hardcoded here
                    if (audio.volume === 0) audio.volume = 50 / 100;
                    await audio.play();
                    this.soundsPlaying++;
                } catch (error) {
                    console.log(error);
                }
            }
        }
        this.updateState();
    }

    // Pause all sounds
    pauseAll() {
        for (const audio of this.audioElements.values()) {
            if (!audio.paused) {
                audio.pause();
                this.soundsPlaying--;
            }
        }
        this.updateState();
    }

    // Reset all sounds
    resetAll() {
        for (const audio of this.audioElements.values()) {
            if (!audio.paused) {
                audio.pause();
                this.soundsPlaying--;
            }
            audio.currentTime = 0; // Reset to beggining
        }
        this.updateState();
    }

    updateState() {
        this.isPlaying = this.soundsPlaying > 0;
        this.allSoundsPlaying = this.soundsPlaying === this.audioElements.size;
    }
}
