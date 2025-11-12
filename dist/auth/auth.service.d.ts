export declare class AuthService {
    validateToken(token?: string): boolean;
    private readonly validUsers;
    validateCredentials(username: string, password: string): boolean;
    createAuthToken(username: string): string;
    refreshToken(oldToken?: string): string | null;
}
