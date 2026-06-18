import type { PresetsObject, SoundConfig } from "./soundData";

export class PresetManager {
    customPresets: PresetsObject;

    constructor() {
        this.customPresets = this.loadCustomPresets();
    }

    // Load presets from localStorage
    loadCustomPresets() {
        const stored = localStorage.getItem("ambient-mixer-presets");
        return stored ? JSON.parse(stored) : {};
    }

    // Load custom preset by ID
    loadPreset(presetId: string) {
        return this.customPresets[presetId] || null;
    }

    // Save custom presets to localStorage
    saveCustomPresets() {
        localStorage.setItem(
            "ambient-mixer-presets",
            JSON.stringify(this.customPresets),
        );
    }

    // Save current mix as preset
    savePreset(name: string, soundStates: SoundConfig) {
        const presetId = `custom-${Date.now()}`;
        const preset = {
            name,
            sounds: {},
        };

        for (const [soundId, volume] of Object.entries(soundStates)) {
            if (volume > 0) {
                preset.sounds[soundId] = volume;
            }
        }

        this.customPresets[presetId] = preset;
        this.saveCustomPresets();

        return presetId;
    }

    // Check if preset name already exists
    presetNameExists(name: string) {
        return Object.values(this.customPresets).some((preset) => {
            preset.name === name;
        });
    }

    // Delete custom preset
    deletePreset(presetId) {
        if (this.customPresets[presetId]) {
            delete this.customPresets[presetId];
            this.saveCustomPresets();
            return true;
        }
        return false;
    }
}
