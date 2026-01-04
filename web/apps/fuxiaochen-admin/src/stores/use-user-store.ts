import type { UserResp } from "fuxiaochen-types";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface UserStore {
	userInfo: UserResp | null;
	setUserInfo: (userInfo: UserResp | null) => void;
	clearUserInfo: () => void;
}

const useUserStore = create<UserStore>()(
	devtools(
		persist(
			(set) => ({
				userInfo: null,
				setUserInfo: (userInfo) => set({ userInfo }),
				clearUserInfo: () => set({ userInfo: null }),
			}),
			{ name: "fgo:userStore" }
		)
	)
);

export default useUserStore;
