import { Injectable } from '@nestjs/common';

type HandlerFunction = (identifier: string) => Promise<void>;

@Injectable()
export class HandlerService {
  private readonly handlers: Record<string, HandlerFunction>;

  constructor() {
    this.handlers = {
      processGymHandler: this.handleProcessGymHandler.bind(this),
    };
  }

  // Add specific return type
  async process(identifier: string): Promise<void> {
    console.log(identifier);

    if (!identifier) {
      throw new Error('No handler specified');
    }

    const handlerFunction = this.handlers[identifier];
    if (!handlerFunction) {
      throw new Error(`Unknown handler type: ${identifier}`);
    }

    // Remove unnecessary try-catch as errors will propagate naturally
    await handlerFunction(identifier);
  }

  private async handleProcessGymHandler(identifier: string): Promise<void> {
    //   const commentResponseService = new CommentResponseService();
    //   const result = await commentResponseService.processReplies();
    console.log(`Job processing result: ${identifier}`);
  }
}
