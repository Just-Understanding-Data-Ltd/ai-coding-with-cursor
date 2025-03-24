import type { Express } from 'express';
import type { Server } from 'http';

export type ServerInstance = {
  readonly app: Express;
  readonly server: Server;
};
