import { Sport } from "./sport.types";

export type League = {
  _id?: string;
  name?: string;
  slug?: string;
  logo?: string;
  sport?: Sport;
};
