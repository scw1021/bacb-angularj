import { Institution } from './institution';
import { ListObject } from './list-object';
import { IDegree } from '../_interfaces/i-degree';

export class Degree {
    public Id: string = '';
    public Type: ListObject = new ListObject();
    public Major: string = '';
    public DateConferred: Date | null = null;
    public Institution: Institution = new Institution();

    public constructor(Param1?: IDegree) {
        if (Param1) {
            this.Id = Param1.Id;
            this.Type = new ListObject(Param1.Type);
            this.Major = Param1.Major;
            this.DateConferred = new Date(Param1.DateConferred);
            if (Param1.DateConferred) {
                let DateArray1 = Param1.DateConferred.split("/", 3);
                this.DateConferred = new Date(DateArray1[2] + "-" + DateArray1[0] + "-" + DateArray1[1])
            }
            this.Institution = new Institution(Param1.Institution);
        }
    }

    public Erase() {
        this.Id = '';
        this.Type.Erase();
        this.Major = '';
        this.DateConferred = null;
        this.Institution.Erase();
    }

    public Export() : IDegree {
        let DateConferredExport: string = this.DateConferred != null ? (1 + this.DateConferred.getMonth()) + '/' + this.DateConferred.getDate() + '/' + this.DateConferred.getFullYear() : '';
        return {'Id' : this.Id,
                'Type' : this.Type.Export(),
                'Major' : this.Major,
                'DateConferred' : DateConferredExport,
                'Institution' : this.Institution.Export()
        }
    }
}
