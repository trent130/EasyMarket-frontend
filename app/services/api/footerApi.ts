import apiClient from '../api-client';

export interface FooterLink {
  id: number;
  title: string;
  url: string;
  category: 'quick_links' | 'categories';
}

export interface ContactInfo {
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  phone: string;
  email: string;
}

export interface FooterData {
  quickLinks: FooterLink[];
  categories: FooterLink[];
  contactInfo: ContactInfo;
}

export const footerApi = {
  getFooterData: async (): Promise<FooterData> => {
    const response = await apiClient.get<FooterData>('/api/footer');
    return response.data;
  }
};

export type FooterApi = typeof footerApi; 