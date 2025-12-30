import apiClient from "./apiClient";

export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  role: "ADMIN" | "BARBER" | "CLIENT";
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "ADMIN" | "BARBER";
  status: "active" | "inactive";
}

export const usersService = {
  // ... manter métodos existentes (getClients, createClient, etc) ...

  getMe: async () => {
    const { data } = await apiClient.get<UserProfile>("/auth/me");
    return data;
  },

  updateProfile: async (
    id: string,
    data: { name: string; phone: string; email: string },
  ) => {
    const { data: response } = await apiClient.patch<UserProfile>(
      `/users/${id}`,
      data,
    );
    return response;
  },

  changePassword: async (
    id: string,
    data: { currentPassword: string; newPassword: string },
  ) => {
    await apiClient.patch(`/users/${id}/change-password`, data);
  },

  // --- MÉTODOS EXISTENTES ---
  async getStaff(search = ""): Promise<StaffMember[]> {
    const params: any = { role: "BARBER", limit: 100 };
    if (search) params.search = search;
    const res = await apiClient.get("/users", { params });
    let users: StaffMember[] = [];
    if (res.data && Array.isArray(res.data.users)) users = res.data.users;
    else if (Array.isArray(res.data)) users = res.data;
    else users = res.data?.data || [];
    return users.filter((u) => u.role === "BARBER" || u.role === "ADMIN");
  },

  async createStaff(data: {
    name: string;
    email: string;
    phone: string;
    role: "ADMIN" | "BARBER";
  }): Promise<StaffMember> {
    try {
      const res = await apiClient.post("/users", { ...data });
      return res.data;
    } catch (error: any) {
      throw new Error(error?.message || "Erro ao criar membro da equipe");
    }
  },

  async updateStaff(
    id: string,
    data: {
      name?: string;
      email?: string;
      phone?: string;
      role?: "ADMIN" | "BARBER";
      status?: "active" | "inactive";
    },
  ): Promise<StaffMember> {
    try {
      const res = await apiClient.patch(`/users/${id}`, data);
      return res.data;
    } catch (error: any) {
      throw new Error(error?.message || "Erro ao atualizar membro da equipe");
    }
  },

  async deleteStaff(id: string): Promise<void> {
    try {
      await apiClient.delete(`/users/${id}`);
    } catch (error: any) {
      throw new Error(error?.message || "Erro ao excluir membro da equipe");
    }
  },

  async getClients(search = ""): Promise<Client[]> {
    const params: any = { role: "CLIENT", limit: 100 };
    if (search) params.search = search;
    const res = await apiClient.get("/users", { params });
    if (res.data && Array.isArray(res.data.users)) return res.data.users;
    if (Array.isArray(res.data)) return res.data;
    return res.data?.data || [];
  },

  async createClient(data: { name: string; phone: string }): Promise<Client> {
    try {
      const res = await apiClient.post("/users", { ...data, role: "CLIENT" });
      return res.data;
    } catch (error: any) {
      throw new Error(error?.message || "Erro ao criar cliente");
    }
  },

  async updateClient(
    id: string,
    data: { name: string; phone: string },
  ): Promise<Client> {
    try {
      const res = await apiClient.patch(`/users/${id}`, data);
      return res.data;
    } catch (error: any) {
      throw new Error(error?.message || "Erro ao atualizar cliente");
    }
  },

  async deleteClient(id: string): Promise<void> {
    await apiClient.delete(`/users/${id}`);
  },
};
