export interface SecurityMetrics {
  critical: number;
  high: number;
  medium: number;
  low: number;
  info: number;
  totalActive: number;
}

export interface ISecurityService {
  healthCheck(): Promise<{ status: "up" | "down"; latency: number }>;

  // No DefectDojo, Projetos são "Products"
  createProduct(
    name: string,
    description: string,
    productType: number
  ): Promise<any>;

  // Métricas de vulnerabilidades
  getProductMetrics(productId: string | number): Promise<SecurityMetrics>;

  // Gestão de Engajamentos (necessário para vincular scans de CI/CD)
  createEngagement(
    productId: number,
    name: string,
    leadId: number
  ): Promise<any>;

  // Gestão de Acesso
  createUser(
    username: string,
    firstName: string,
    lastName: string,
    email: string
  ): Promise<any>;

  addUsertoProduct(
    productId: number,
    userId: number,
    roleName: string
  ): Promise<void>;
}
