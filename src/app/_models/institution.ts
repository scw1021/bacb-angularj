import { Address } from './address';
import { Department } from './department';
import { IDepartment } from '../_interfaces';
import { IInstitution } from '../_interfaces/i-institution';

export class Institution {
    public Id: string = '';
    public Name: string = '';
    public Website: string = '';
    public Address: Address = new Address();
    public Departments: Department[] = [];

    public constructor(Param1?: IInstitution) {
        if ( Param1 ) {
            this.Id = Param1.Id;
            this.Name = Param1.Name;
            this.Website = Param1.Website;
            this.Address = new Address(Param1.Address);
            for (let DepartmentIndex in Param1.Departments) {
                this.Departments.push(new Department(Param1.Departments[DepartmentIndex]));
            }
        }
    }

    public Erase() {
        this.Id = '';
        this.Name = '';
        this.Website = '';
        this.Address.Erase();
        this.Departments.splice(0, this.Departments.length);
    }

    public Export() : IInstitution {
        let DepartmentExport: IDepartment[] = [];
        for (let DepartmentIndex in this.Departments) {
            DepartmentExport.push(this.Departments[DepartmentIndex].Export());
        }
        return {'Id' : this.Id,
                'Name' : this.Name,
                'Website' : this.Website,
                'Address' : this.Address.Export(),
                'Departments' : DepartmentExport
        }
    }
}
