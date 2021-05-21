import { IListObject } from '../_interfaces/i-list-object';
import { IProfessionalData } from '../_interfaces';
import { ListObject } from './list-object';

export class ProfessionalDataRedacted {
    public PrimaryRole: ListObject = new ListObject();
    public SecondaryRole: ListObject = new ListObject();
    public PrimaryArea: ListObject = new ListObject();
    public SecondaryArea: ListObject = new ListObject();
    public PrimaryAreaOther: string = '';
    public SecondaryAreaOther: string = '';
    public TertiaryArea: ListObject [] = [];
    public ClientAges: ListObject [] = [];
    public SecondaryClientAges: ListObject [] = [];

    public constructor(Param1?: IProfessionalData) {
        if ( Param1 ) {
            this.PrimaryRole = new ListObject(Param1.PrimaryRole);
            this.SecondaryRole = new ListObject(Param1.SecondaryRole);
            this.PrimaryArea = new ListObject(Param1.PrimaryArea);
            this.SecondaryArea = new ListObject(Param1.SecondaryArea);
            this.PrimaryAreaOther = Param1.PrimaryAreaOther ? Param1.PrimaryAreaOther : '';
            this.SecondaryAreaOther = Param1.SecondaryAreaOther ? Param1.SecondaryAreaOther : '';
            this.TertiaryArea = [];
            if (Param1.TertiaryArea != null && Param1.TertiaryArea.length) {
                for (let objTertiary of Param1.TertiaryArea) {
                    this.TertiaryArea.push(new ListObject(objTertiary));
                }
            }
            this.ClientAges = [];
            if (Param1.ClientAges != null && Param1.ClientAges.length) {
                for (let objAges of Param1.ClientAges) {
                    this.ClientAges.push(new ListObject(objAges));
                }
            }
            this.SecondaryClientAges = [];
            if (Param1.SecondaryClientAges != null && Param1.SecondaryClientAges.length) {
                for (let objAges of Param1.SecondaryClientAges) {
                    this.SecondaryClientAges.push(new ListObject(objAges));
                }
            }
        }
        // console.warn(this, Param1);
    }

    public Erase() : void {
        this.PrimaryRole.Erase();
        this.SecondaryRole.Erase();
        this.PrimaryArea.Erase();
        this.SecondaryArea.Erase();
        if (this.TertiaryArea != null && this.TertiaryArea.length) {
            this.TertiaryArea.splice(0, this.TertiaryArea.length);
        }
        if (this.ClientAges != null && this.ClientAges.length) {
            this.ClientAges.splice(0, this.ClientAges.length);
        }
    }

    public Export() : IProfessionalData {
        let ExportTertiaryArea : IListObject [] = [];
        if (this.TertiaryArea != null && this.TertiaryArea.length) {
            for(let objTertiary of this.TertiaryArea) {
                ExportTertiaryArea.push(objTertiary.Export());
            }
        }
        let ExportClientAges : IListObject [] = [];
        if (this.ClientAges != null && this.ClientAges.length) {
            for(let objClientAge of this.ClientAges) {
                ExportClientAges.push(objClientAge.Export());
            }
        }
        return {'PrimaryRole' : this.PrimaryRole.Export(),
                'SecondaryRole' : this.SecondaryRole.Export(),
                'PrimaryArea' : this.PrimaryArea.Export(),
                'SecondaryArea' : this.SecondaryArea.Export(),
                'PrimaryAreaOther' : this.PrimaryAreaOther,
                'SecondaryAreaOther' : this.SecondaryAreaOther,
                'TertiaryArea' : ExportTertiaryArea,
                'ClientAges' : ExportClientAges
            }
    }
}
