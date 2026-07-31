/**
 * User Entity
 *
 * Core domain entity for the Auth bounded context.
 * Identity is the `id` field — two Users with the same id are the same User.
 *
 * Following Matt's deep module principle:
 * - Encapsulates business logic (canSignIn, getInitial)
 * - Not anemic — has behavior, not just data
 * - Pure domain — no framework dependencies
 */

export interface UserProps {
  id: string
  name: string
  email: string
  emailVerified?: boolean
  image?: string | null
  createdAt?: Date
  updatedAt?: Date
}

export class User {
  readonly id: string
  readonly name: string
  readonly email: string
  readonly emailVerified: boolean
  readonly image?: string | null
  readonly createdAt?: Date
  readonly updatedAt?: Date

  private constructor(props: UserProps) {
    this.id = props.id
    this.name = props.name
    this.email = props.email
    this.emailVerified = props.emailVerified ?? false
    this.image = props.image ?? null
    this.createdAt = props.createdAt
    this.updatedAt = props.updatedAt
  }

  /**
   * Create a new User with sensible defaults.
   * Only id, name, and email are required; createdAt and updatedAt default to now.
   */
  static create(
    props: Pick<UserProps, 'id' | 'name' | 'email'> &
      Partial<Omit<UserProps, 'id' | 'name' | 'email'>>,
  ): User {
    const now = new Date()
    return User.from({
      ...props,
      emailVerified: props.emailVerified ?? false,
      image: props.image ?? null,
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? now,
    })
  }

  /**
   * Reconstitute a User from persistence (no defaults applied).
   */
  static from(props: UserProps): User {
    return new User(props)
  }

  /**
   * Returns the first letter of the name (or email as fallback) in uppercase.
   * Used for avatar initials.
   */
  getInitial(): string {
    const source = this.name || this.email
    return source.charAt(0).toUpperCase()
  }

  /**
   * Whether this User is allowed to sign in.
   * Currently always true — may later check emailVerified or suspended status.
   */
  canSignIn(): boolean {
    return true
  }

  /**
   * Compares two Users by identity (id).
   */
  equals(other: User): boolean {
    return this.id === other.id
  }

  /**
   * Returns a plain serialized representation of this User.
   */
  toJSON(): UserProps {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      emailVerified: this.emailVerified,
      image: this.image,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    }
  }
}
