import { promises as fs } from "fs";

export function isNodeJsErrnoException(error: unknown): error is NodeJS.ErrnoException {
    return error instanceof Error && 'code' in error;
}

export async function readSecretOrEnvVar(secretName: string, envVarName: string): Promise<string> {
    if (process.env.NODE_ENV === 'production') {
        const secretPath = `/run/secrets/${secretName}`;

        try {
            const data = await fs.readFile(secretPath, 'utf-8');
            return data.trim();
        } catch (err: unknown) {
            if (isNodeJsErrnoException(err) && err.code === 'ENOENT') {
                console.error(`Secret file not found at ${secretPath}. Ensure the secret is correctly configured in Docker Swarm.`);
                throw new Error(`Missing secret: ${secretName}`);
            } else if (err instanceof Error) {
                console.error(`Error reading secret file at ${secretPath}:`, err);
                throw err;
            } else {
                console.error(`Unknown error reading secret file at ${secretPath}:`, err);
                throw new Error('Unknown error reading secret file');
            }
        }
    } else {
        const value = process.env[envVarName];
        if (!value) {
            console.error(`Environment variable ${envVarName} is not set in development mode.`);
            throw new Error(`Missing environment variable: ${envVarName}`);
        }
        return value;
    }
}