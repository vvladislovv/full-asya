export type Configuration = {
    timeLimit: number,
    questionCount: number,
    scoringMethod: string
}
export type Test = {
    id: string,
    type: string,
    name: string,
    description: string,
    instruction: string,
    difficulty: string,
    configuration: Configuration,
    isActive: boolean,
    orderIndex: number,
    createdAt?: Date,
    updatedAt?: Date
}