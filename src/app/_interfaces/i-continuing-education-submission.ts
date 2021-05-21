import { ICertification } from 'src/app/_interfaces';
import { IContinuingEducationCredit } from './i-continuing-education-credit';

export interface IContinuingEducationSubmission {
  CE: IContinuingEducationCredit,
  CycleId: string
}
