import { ApiProperty } from '@nestjs/swagger';

/**
 * Access Token Information
 * Represents the structure of JWT access token data returned to clients
 */
export class AccessToken {
  @ApiProperty({
    description: 'The JWT access token string',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  token: string;

  @ApiProperty({
    description: 'Token type (always Bearer for JWT)',
    example: 'Bearer',
    default: 'Bearer',
  })
  tokenType: string;

  @ApiProperty({
    description: 'Token expiration time in seconds from issuance',
    example: 3600,
  })
  expiresIn: number;

  @ApiProperty({
    description: 'ISO 8601 timestamp when the token expires',
    example: '2026-01-02T12:00:00.000Z',
  })
  expiresAt: string;

  constructor(token: string, expiresIn: number) {
    this.token = token;
    this.tokenType = 'Bearer';
    this.expiresIn = expiresIn;
    this.expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();
  }
}
