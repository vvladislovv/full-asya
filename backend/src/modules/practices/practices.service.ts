import { Injectable } from '@nestjs/common';

@Injectable()
export class PracticesService {
  async getPractices(): Promise<any[]> {
    return [
      {
        id: 'memory-exercises',
        name: 'Memory Exercises',
        description: 'Daily exercises to improve memory and cognitive function',
        exercises: [
          {
            id: 'word-recall',
            name: 'Word Recall',
            description: 'Remember and recall a list of words',
            duration: 5,
            difficulty: 'easy',
          },
          {
            id: 'number-sequence',
            name: 'Number Sequence',
            description: 'Remember and repeat number sequences',
            duration: 3,
            difficulty: 'medium',
          },
        ],
      },
      {
        id: 'attention-exercises',
        name: 'Attention Exercises',
        description: 'Exercises to improve focus and attention',
        exercises: [
          {
            id: 'spot-difference',
            name: 'Spot the Difference',
            description: 'Find differences between similar images',
            duration: 4,
            difficulty: 'medium',
          },
          {
            id: 'concentration-grid',
            name: 'Concentration Grid',
            description: 'Find numbers in a grid in order',
            duration: 6,
            difficulty: 'hard',
          },
        ],
      },
      {
        id: 'problem-solving',
        name: 'Problem Solving',
        description: 'Logic and reasoning exercises',
        exercises: [
          {
            id: 'puzzle-solving',
            name: 'Puzzle Solving',
            description: 'Solve various logic puzzles',
            duration: 8,
            difficulty: 'hard',
          },
          {
            id: 'pattern-recognition',
            name: 'Pattern Recognition',
            description: 'Identify patterns in sequences',
            duration: 5,
            difficulty: 'medium',
          },
        ],
      },
    ];
  }

  async getPracticeById(id: string): Promise<any> {
    const practices = await this.getPractices();
    return practices.find(practice => practice.id === id);
  }

  async getExerciseById(practiceId: string, exerciseId: string): Promise<any> {
    const practice = await this.getPracticeById(practiceId);
    if (!practice) return null;
    
    return practice.exercises.find(exercise => exercise.id === exerciseId);
  }

  async getDailyRecommendations(userId: string): Promise<any[]> {
    // Mock implementation - in real app would be based on user's test results
    return [
      {
        id: 'word-recall',
        practiceId: 'memory-exercises',
        name: 'Word Recall',
        description: 'Daily memory exercise',
        estimatedDuration: 5,
        priority: 'high',
      },
      {
        id: 'spot-difference',
        practiceId: 'attention-exercises',
        name: 'Spot the Difference',
        description: 'Focus improvement exercise',
        estimatedDuration: 4,
        priority: 'medium',
      },
    ];
  }

  async trackProgress(userId: string, exerciseId: string, score: number): Promise<void> {
    // Mock implementation - would save to database
    console.log(`User ${userId} completed exercise ${exerciseId} with score ${score}`);
  }
} 