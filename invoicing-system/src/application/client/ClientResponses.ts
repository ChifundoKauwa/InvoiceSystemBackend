/**
 * APPLICATION LAYER: Client Response DTOs
 */

export class ClientDto {
    constructor(
        public readonly id: string,
        public readonly name: string,
        public readonly email: string,
        public readonly phone: string | undefined,
        public readonly address: string | undefined,
        public readonly taxId: string | undefined,
        public readonly status: string,
        public readonly createdAt?: Date
    ) {}
}
