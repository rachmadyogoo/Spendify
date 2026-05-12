import api from './api';

export interface Challenge {
  id: number;
  title: string;
  savings_pct: number;
  difficulty: 'Easy' | 'Medium' | 'Hardcore';
  is_completed: boolean;
}

export const getChallenges = async (month?: string, year?: string): Promise<Challenge[]> => {
  const response = await api.get('/challenges', {
    params: { month, year }
  });
  return response.data.data.challenges;
};

export const generateChallenges = async (month: string, year: string): Promise<Challenge[]> => {
  const response = await api.post('/challenges/generate', { month, year });
  return response.data.data.challenges;
};

export const toggleChallenge = async (id: number): Promise<Challenge> => {
  const response = await api.patch(`/challenges/${id}`);
  return response.data.data.challenge;
};
