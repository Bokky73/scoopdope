import { Injectable } from '@nestjs/common';
import { LearningPathRequest, LearningPathResponse } from './learning-path.types';
import { getRecommendations } from './learning-path.logic';

@Injectable()
export class LearningPathService {
  getRecommendations(request: LearningPathRequest): LearningPathResponse {
    return getRecommendations(request);
  }
}
