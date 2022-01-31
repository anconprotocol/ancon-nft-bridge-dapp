import { atom } from "recoil";

export const providerState = atom({
  key: "providerState",
  default: [] as any,
});