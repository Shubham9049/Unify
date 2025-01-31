import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ProfileState {
  profileImage: string | null;
}

const initialState: ProfileState = {
  profileImage: null,
};

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    setProfileImage: (state, action: PayloadAction<string | null>) => {
      state.profileImage = action.payload;
    },
  },
});

export const { setProfileImage } = profileSlice.actions;

export default profileSlice.reducer;
