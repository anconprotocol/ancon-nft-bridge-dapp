import { atom } from "recoil";

export const showState = atom({
  key: "showState",
  default: false,
});

export const showInfo = atom({
  key: "showInfo",
  default: "",
});

export const buttonState = atom({
  key: "buttonState",
  default: "",
});
