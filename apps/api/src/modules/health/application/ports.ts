import { DependencyCheck } from '../domain/health-report';

/** Porta: cada dependência externa (DB, e-mail, gateway) terá um checker na infraestrutura. */
export interface DependencyChecker {
  check(): Promise<DependencyCheck>;
}

export interface Clock {
  now(): Date;
}

export const DEPENDENCY_CHECKERS = Symbol('DEPENDENCY_CHECKERS');
export const CLOCK = Symbol('CLOCK');
