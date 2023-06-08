// interfaces for tasks

// https://github.com/ibp-network/config/blob/main/members.json
export interface MemberDef {
  // id: string;
  name: string; // memberId
  website: string; // url
  logo: string; // url
  services_address: string; // ip address
  membership: string;
  current_level: string;
  level_timestamp: { [key: string]: string };
  active: string;
  endpoints?: Record<string, string>;
  region: string;
  latitude: string;
  longitude: string;
  payments?: Record<string, Record<string, string>>;
}
export interface MembersDef {
  members: { [key: string]: MemberDef };
}

// https://github.com/ibp-network/config/blob/main/services.json
export interface ServiceDef {
  service_type: string;
  level_required: string;
  endpoints: Record<string, string>;
  members: string[];
}
export interface ServicesDef {
  services: { [domain: string]: ServiceDef };
}
