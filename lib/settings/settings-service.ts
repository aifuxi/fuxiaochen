import type { SettingsDto, UpdateSettingsInput } from "@/lib/settings/settings-dto";
import { toSettingsDto } from "@/lib/settings/settings-dto";
import type { SettingsRepository } from "@/lib/settings/settings-repository";

export type SettingsService = {
  getSettings: () => Promise<SettingsDto>;
  updateSettings: (input: UpdateSettingsInput) => Promise<SettingsDto>;
};

export function createSettingsService(repository: SettingsRepository): SettingsService {
  return {
    async getSettings() {
      const settings = (await repository.find()) ?? (await repository.createDefault());

      return toSettingsDto(settings);
    },
    async updateSettings(input) {
      const settings = await repository.update(input);

      return toSettingsDto(settings);
    },
  };
}
