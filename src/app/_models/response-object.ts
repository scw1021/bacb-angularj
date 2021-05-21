import { IResponseObject } from '../_interfaces';

export class ResponseObject<ObjectType> {
    public _ObjArray: any [] = [];

    public constructor(Param1?: IResponseObject<ObjectType>) {
        if ( Param1 ) {
            for (let stKey in Param1){
                if (Param1[stKey] instanceof Array) {
                    this._ObjArray = Param1[stKey];
                }
            }
        }
        else {
            this._ObjArray = [];
        }
    }

    public get length() : number {
        return this._ObjArray.length;
    }

    public get Array() : ObjectType [] {
        return <ObjectType []> this._ObjArray;
    }

    public Erase() : void {
        this._ObjArray.splice(0, this._ObjArray.length);
    }

    public Export() : IResponseObject<any> {
        let ExportArray : any [];
        for (let ObjElement of this.Array) {
            if (typeof ObjElement['Export'] === 'function') {
              ExportArray.push(ObjElement['Export']);
            }
            else {
              ExportArray.push(ObjElement);
            }
        }
        return {'Array' : this._ObjArray}
    }
}
