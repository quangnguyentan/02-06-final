import { Sport } from "./sport.types";

export type Team = {
  _id?: string;
  name?: string;
  slug?: string;
  logo?: string;
  sport?: Sport;
};
