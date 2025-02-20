import { Context } from 'aws-lambda';

export const handler = async (
  event: CustomEvent,
  _context: Context,
): Promise<void> => {
  console.log('Handler Lambda started at:', new Date().toISOString());
};