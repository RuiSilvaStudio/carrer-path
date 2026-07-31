export interface CareerRoleReference {
  id: string;
  title: string;
  escoTitle: string;
  escoUri: string;
  iscoCode: string;
  confidence: 'confirmed' | 'broad';
  description: string;
  skillThemes: string[];
  source: {
    name: string;
    recordVersion: string;
    classificationVersion: string;
    updated: string;
    url: string;
  };
  limits: string;
}

export const CAREER_ROLE_REFERENCES: CareerRoleReference[] = [
  {
    id: 'operations-manager',
    title: 'Operations manager',
    escoTitle: 'operations manager',
    escoUri: 'http://data.europa.eu/esco/occupation/c6bd511a-d966-4df9-a48e-4f800354f268',
    iscoCode: '1321',
    confidence: 'confirmed',
    description: 'Plans, oversees and coordinates daily operations for the production of goods and provision of services; also formulates company policies and plans human and material resources.',
    skillThemes: ['manage logistics', 'set daily priorities', 'liaise with managers', 'follow company standards'],
    source: { name: 'European Commission ESCO', recordVersion: 'v1.2.0 API record', classificationVersion: 'v1.2.1 downloadable classification', updated: '2025-12-10', url: 'https://ec.europa.eu/esco/api/resource/occupation?uri=http%3A%2F%2Fdata.europa.eu%2Fesco%2Foccupation%2Fc6bd511a-d966-4df9-a48e-4f800354f268&language=en&selectedVersion=v1.2.0' },
    limits: 'This is an occupational reference, not a job specification, hiring claim, or statement about a particular employer in Portugal.',
  },
  {
    id: 'contact-centre-manager',
    title: 'Contact centre manager',
    escoTitle: 'contact centre manager',
    escoUri: 'http://data.europa.eu/esco/occupation/f5166c6b-3467-4fc4-9343-d12e870d9def',
    iscoCode: '1439',
    confidence: 'confirmed',
    description: 'Manages contact-centre service delivery. It is a scoped operational reference for examining service improvement, not a general customer-experience title.',
    skillThemes: ['service delivery', 'customer communication', 'team coordination', 'service improvement'],
    source: { name: 'European Commission ESCO', recordVersion: 'v1.2.0 API record', classificationVersion: 'v1.2.1 downloadable classification', updated: '2025-12-10', url: 'https://ec.europa.eu/esco/api/resource/occupation?uri=http%3A%2F%2Fdata.europa.eu%2Fesco%2Foccupation%2Ff5166c6b-3467-4fc4-9343-d12e870d9def&language=en&selectedVersion=v1.2.0' },
    limits: 'This is a contact-centre service-management reference, not a general customer-experience role. It does not establish transformation scope or local demand.',
  },
  {
    id: 'human-resources-manager',
    title: 'Human resources manager',
    escoTitle: 'human resources manager',
    escoUri: 'http://data.europa.eu/esco/occupation/f605bcd2-90b6-45a0-a558-d05016d68a77',
    iscoCode: '1212',
    confidence: 'confirmed',
    description: 'Plans, designs and implements people-related processes including recruitment, development, skills assessment, evaluation, promotion and employee well-being.',
    skillThemes: ['human resource management', 'manage development programmes', 'labour legislation', 'human-resources processes'],
    source: { name: 'European Commission ESCO', recordVersion: 'v1.2.0 API record', classificationVersion: 'v1.2.1 downloadable classification', updated: '2025-12-10', url: 'https://ec.europa.eu/esco/api/resource/occupation?uri=http%3A%2F%2Fdata.europa.eu%2Fesco%2Foccupation%2Ff605bcd2-90b6-45a0-a558-d05016d68a77&language=en&selectedVersion=v1.2.0' },
    limits: 'This is an adjacent reference for people and capability transformation. It does not establish organisation-design scope, qualifications, or hiring requirements.',
  },
];

export function matchReference(title: string): CareerRoleReference | undefined {
  const normalised = title.toLowerCase().trim();
  return CAREER_ROLE_REFERENCES.find((reference) => normalised === reference.title || normalised.includes(reference.title) || reference.title.includes(normalised));
}
