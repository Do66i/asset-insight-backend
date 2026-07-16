import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    console.log('health check 💡')
    return 'Hello World!';
  }
}
