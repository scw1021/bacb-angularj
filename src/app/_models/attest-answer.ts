import { AttestQuestion } from './attest-question';
import { IAttestAnswer } from '../_interfaces/i-attest-answer';

export class AttestAnswer {
    public Id: string = '';
    public AppId: string = '';
    public QuestionId: string = '';
    public Answer: boolean | null = null;
    public DocId: string = '';

    public constructor(Param1?: IAttestAnswer) {
        if (Param1) {
            this.Id = Param1.Id;
            this.QuestionId = Param1.QuestionId;
            this.AppId = Param1.AppId;
            this.Answer = Param1.Answer == 'T' ? true : false;
            this.DocId = Param1.DocId;
        }

    }

    public Erase() : void {
        this.Id = '';
        this.QuestionId = '';
        this.AppId = '';
        this.Answer = null;
        this.DocId = '';
    }

    public Export() : IAttestAnswer {
        return {'Id' : this.Id,
                'QuestionId' : this.QuestionId,
                'AppId' : this.AppId,
                'Answer' : this.Answer ? 'T' : 'F',
                'DocId' : this.DocId}
    }
}
