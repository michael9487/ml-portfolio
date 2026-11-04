export type Mode = "live" | "demo" | "off";

export type ProjectStats = {
  project_id: string;
  views: number;
  visitors: number;
  favorites: number;
  votes: number;
};

export type SiteStats = { views: number; visitors: number };

export type SessionUser = { id: string; name: string; picture?: string };

export type PublicState = {
  mode: Mode;
  stats: ProjectStats[];
  site: SiteStats;
  user: SessionUser | null;
  favorites: string[];
  votes: string[];
  myViews: string[];
};
