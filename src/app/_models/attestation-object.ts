import { Type } from '@angular/core';
import { AttestationComponent } from '../attestation/attestation.component';
import { AttestQuestion } from './attest-question';
import { IAttestQuestion } from '../_interfaces/i-attest-question';
import { AttestAnswer } from './attest-answer';
import { IAttestationObject } from '../_interfaces/i-attestation-object';

export class AttestationObject {
    public Question: AttestQuestion = new AttestQuestion();
    public Answer: AttestAnswer = new AttestAnswer();
    public Index: number;

    public constructor(Param1?: IAttestationObject){

        if (Param1 ) {
            this.Question = new AttestQuestion(Param1.Question);
            this.Answer = new AttestAnswer(Param1.Answer);
        }
    }

    public Erase() : void {
        this.Question.Erase();
        this.Answer.Erase();
        this.Index = 0;
    }

    public Export() : IAttestationObject {
        return {'Question' : this.Question.Export(),
                'Answer' : this.Answer.Export(),
                'Index' : this.Index};
    }
}
