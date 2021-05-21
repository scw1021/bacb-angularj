import { IAttestQuestion } from './i-attest-question';
import { IAttestAnswer } from './i-attest-answer';

export interface IAttestationObject {
    Question: IAttestQuestion;
    Answer: IAttestAnswer;
    Index: number;
}
