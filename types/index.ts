import { NextApiRequest, NextPage } from 'next/types';
import { Session } from 'next-auth';
import type { Logger } from 'pino';
import { ReactElement, ReactNode } from 'react';

export enum RouteNames {
  HOME = '/agents',
  SIGN_IN = '/signin',
  SIGN_UP = '/signup',
  AGENTS = '/agents',
  AGENT = '/agents/[agentId]',
  DATASTORES = '/datastores',
  DATASTORE = '/datastores/[datastoreId]',
  DATASOURCE = '/datastores/[datastoreId]/[datasourceId]',
  LOGS = '/logs',
  CHAT = '/chat',
  MAINTENANCE = '/maintenance',
  SETTINGS = '/settings',
  BILLING = '/settings/billing',
  PROFILE = '/settings/profile',
  APPS = '/apps',
  CHAT_SITE = '/products/crisp-plugin',
  SLACK_BOT = '/products/slack-bot',
}

export enum PromptTypesLabels {
  customer_support = 'Customer support',
  raw = 'Raw',
}

export type AppNextApiRequest = NextApiRequest & {
  session: Session;
  requestId?: string;
  logger: Logger;
};

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

export enum AppStatus {
  OK = 'OK',
  WARNING = 'WARNING',
  KO = 'KO',
}

export enum MetadataFields {
  datastore_id = 'datastore_id',
  datasource_id = 'datasource_id',
  tags = 'tags',
  text = 'text',
  chunk_hash = 'chunk_hash',
  datasource_hash = 'datasource_hash',
  chunk_offset = 'chunk_offset',
  custom_id = 'custom_id',
  page_number = 'page_number',
  total_pages = 'total_pages',
}

export enum TaskQueue {
  load_datasource = 'load-datasource',
}

export enum SSE_EVENT {
  answer = 'answer',
  endpoint_response = 'endpoint_response',
  step = 'step',
}

export enum ChainType {
  qa = 'qa',
}
