/**
 * Integration Services Index
 * Exports all integration-related services and types
 */

// Base Services
export { BaseAPIService, SimpleRateLimiter } from './BaseAPIService';
export type { RateLimiter, RequestOptions } from './BaseAPIService';

export { BaseVisualService, VisualComponentFactory, DefaultContentVisualMapping } from './BaseVisualService';
export type { 
  VisualConfig, 
  ExportOptions, 
  VisualElement, 
  ContentVisualMapping 
} from './BaseVisualService';

export { APICoordinatorService } from './APICoordinatorService';
export type {
  WorksheetSection,
  WorksheetRequest,
  GeneratedContent,
  RenderedVisual,
  GeneratedWorksheet
} from './APICoordinatorService';

// Service factory for easy initialization
import { APICoordinatorService } from './APICoordinatorService';
import { SimpleRateLimiter } from './BaseAPIService';

export class IntegrationServiceFactory {
  static createCoordinator(): APICoordinatorService {
    return new APICoordinatorService();
  }

  static createRateLimiter(maxRequests = 30, windowMs = 60000): SimpleRateLimiter {
    return new SimpleRateLimiter(maxRequests, windowMs);
  }
}