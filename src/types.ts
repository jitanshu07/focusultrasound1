export interface Appointment {
  id: string;
  patientName: string;
  phone: string;
  date: string;
  test: string;
  price?: string;
  paymentMode?: string;
  status: string;
  notes?: string;
  lastSmsSentAt?: string;
  createdAt: any;
}

export interface ServicePriceInfo {
  name: string;
  price: string;
  numeric: number;
  badge: string;
  description: string;
  features: string[];
}

export const SERVICE_PRICING: Record<string, ServicePriceInfo> = {
  'Ultrasound': {
    name: 'Ultrasound Scan',
    price: '$120',
    numeric: 120,
    badge: 'Imaging',
    description: 'High-resolution diagnostic sonography (abdominal, pelvic, obstetric, or vascular)',
    features: ['Real-time 2D/3D Imaging', 'Certified Sonologist Consultation', 'Immediate Digital Report']
  },
  'Laboratory Test': {
    name: 'Laboratory Test (Blood Test)',
    price: '$45',
    numeric: 45,
    badge: 'Pathology',
    description: 'Comprehensive hematology, biochemistry, and clinical pathology blood profile',
    features: ['Complete Blood Count (CBC)', 'Biochemistry Profile', 'Fast Digital Lab Delivery']
  },
  'Laboratory Test (Blood Test)': {
    name: 'Laboratory Test (Blood Test)',
    price: '$45',
    numeric: 45,
    badge: 'Pathology',
    description: 'Comprehensive hematology, biochemistry, and clinical pathology blood profile',
    features: ['Complete Blood Count (CBC)', 'Biochemistry Profile', 'Fast Digital Lab Delivery']
  }
};

export function getServicePrice(serviceName?: string): string {
  if (!serviceName) return '$0';
  const clean = serviceName.trim();
  if (SERVICE_PRICING[clean]) {
    return SERVICE_PRICING[clean].price;
  }
  if (clean.toLowerCase().includes('ultrasound')) {
    return '$120';
  }
  if (clean.toLowerCase().includes('lab') || clean.toLowerCase().includes('blood')) {
    return '$45';
  }
  return '$60';
}

export function getServiceInfo(serviceName?: string): ServicePriceInfo | null {
  if (!serviceName) return null;
  const clean = serviceName.trim();
  if (SERVICE_PRICING[clean]) {
    return SERVICE_PRICING[clean];
  }
  if (clean.toLowerCase().includes('ultrasound')) {
    return SERVICE_PRICING['Ultrasound'];
  }
  if (clean.toLowerCase().includes('lab') || clean.toLowerCase().includes('blood')) {
    return SERVICE_PRICING['Laboratory Test (Blood Test)'];
  }
  return null;
}
