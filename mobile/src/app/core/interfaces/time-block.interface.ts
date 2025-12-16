import { BlockType } from '../enums';

/**
 * Time Block Interface
 *
 * Represents a blocked time period (lunch, break, vacation, etc.)
 */
export interface ITimeBlock {
  id: string;
  type: BlockType;
  reason?: string;
  startsAt: Date | string;
  endsAt: Date | string;
  isRecurring: boolean;
  recurringDays: number[];
  active: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

/**
 * Time Block Create DTO
 *
 * Data Transfer Object for creating a new time block
 */
export interface ITimeBlockCreate {
  type: BlockType;
  reason?: string;
  startsAt: Date | string;
  endsAt: Date | string;
  isRecurring?: boolean;
  recurringDays?: number[];
  active?: boolean;
}

/**
 * Time Block Update DTO
 *
 * Data Transfer Object for updating time block information
 */
export interface ITimeBlockUpdate {
  type?: BlockType;
  reason?: string;
  startsAt?: Date | string;
  endsAt?: Date | string;
  isRecurring?: boolean;
  recurringDays?: number[];
  active?: boolean;
}

/**
 * Time Block Query Parameters
 *
 * Query parameters for filtering time blocks
 */
export interface ITimeBlockQuery {
  type?: BlockType;
  active?: boolean;
  startDate?: Date | string;
  endDate?: Date | string;
  isRecurring?: boolean;
  page?: number;
  limit?: number;
}

/**
 * Block Type Labels
 *
 * Map of block types to human-readable labels
 */
export const BLOCK_TYPE_LABELS: Record<BlockType, string> = {
  [BlockType.LUNCH]: 'Almoço',
  [BlockType.BREAK]: 'Pausa',
  [BlockType.DAY_OFF]: 'Folga',
  [BlockType.VACATION]: 'Férias',
  [BlockType.CUSTOM]: 'Personalizado',
};
