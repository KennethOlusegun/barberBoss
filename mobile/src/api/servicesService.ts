import api from "./apiClient";

export interface ServiceItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  priceType: "fixed" | "range";
  durationMin: number;
  category?: string;
  color?: string;
  active?: boolean;
}

export const servicesService = {
  getAll: async () => {
    const { data } = await api.get<{ data: ServiceItem[] }>("/services");
    return data.data;
  },
  getById: async (id: string) => {
    const { data } = await api.get<ServiceItem>(`/services/${id}`);
    return data;
  },
  create: async (payload: Omit<ServiceItem, "id">) => {
    const { data } = await api.post<ServiceItem>("/services", payload);
    return data;
  },
  update: async (id: string, payload: Partial<ServiceItem>) => {
    const { data } = await api.patch<ServiceItem>(`/services/${id}`, payload);
    return data;
  },
  delete: async (id: string) => {
    await api.delete(`/services/${id}`);
  },
};
