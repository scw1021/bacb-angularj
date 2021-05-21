import { ListObject } from './list-object';
import { IEntityStatus } from '../_interfaces/i-entity-status';

export class EntityStatus {
    public Id: string = '';
    public InternalId?: string = '';
    public RecordTypeName: ListObject = new ListObject();
    public InternalName: string = '';
    public ExternalName: string = '';

    public constructor(Param1?: IEntityStatus) {
        if (Param1) {
            this.Id = Param1.Id;
            this.InternalId = Param1.InternalId;
            this.RecordTypeName = new ListObject(Param1.RecordTypeName);
            this.InternalName = Param1.InternalName;
            this.ExternalName = Param1.ExternalName;
        }
    }

    public Erase(): void {
        this.Id = '';
        this.InternalId = '';
        this.RecordTypeName.Erase();
        this.InternalName = '';
        this.ExternalName = '';
    }

    public Export(): IEntityStatus {
        return {'Id': this.Id,
                'RecordTypeName': this.RecordTypeName.Export(),
                "InternalId": this.InternalId,
                'InternalName': this.InternalName,
                'ExternalName': this.ExternalName
            }
    }
}
