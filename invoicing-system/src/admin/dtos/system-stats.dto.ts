export class SystemStatsResponse {
    totalUsers: number;
    totalInvoices: number;
    totalRevenue: number;
    overdueInvoices: number;
    recentUsers?: Array<{
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        role: string;
        createdAt: Date;
    }>;
    recentInvoices?: Array<{
        id: string;
        currency: string;
        state: string;
        createdAt?: Date;
        issueAt?: Date;
    }>;
}
