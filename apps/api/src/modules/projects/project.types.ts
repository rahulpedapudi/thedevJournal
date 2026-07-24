export type CreateProjectBody = {
  name: string;
  description?: string;
};

export type ProjectParams = {
  id: string;
};

export type PatchProjectBody = {
  name?: string;
  description?: string;
  status?: "active" | "archived";
};
