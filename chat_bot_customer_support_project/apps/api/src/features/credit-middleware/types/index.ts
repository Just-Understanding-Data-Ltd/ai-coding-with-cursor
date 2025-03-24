import { Request } from 'express'

export class InsufficientCreditsError extends Error {
  constructor() {
    super('Insufficient credits available')
    this.name = 'InsufficientCreditsError'
  }
}

export interface CreditReservation {
  readonly id: string
  readonly userId: string
  readonly serviceId: string
  readonly amount: number
  readonly status: 'reserved' | 'charged' | 'released'
  readonly createdAt: Date
  readonly updatedAt: Date
  readonly metadata: Record<string, unknown>
}

export interface CreditCost {
  readonly baseAmount: number
  readonly variableCostFactor?: number
  readonly metadata: {
    readonly description: string
    readonly operation: string
  }
}

export interface CreditCost {
  readonly baseAmount: number
  readonly variableCostFactor?: number
  readonly metadata: {
    readonly description: string
    readonly operation: string
  }
}

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    [key: string]: unknown
  }
}
