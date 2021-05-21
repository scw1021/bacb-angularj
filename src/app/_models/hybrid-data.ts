import { IHybridData } from '../_interfaces';

export class HybridData {
    public E: number = 0
    public AB: number = 0;
    public CD: number = 0;
    public F: number = 0;
    public GHI: number = 0;
    public Discretionary: number = 0;

    public constructor(Param1?: IHybridData) {
        if (Param1) {
            this.E = Param1.E;
            this.AB = Param1.AB;
            this.CD = Param1.CD;
            this.F = Param1.F;
            this.GHI = Param1.GHI;
            this.Discretionary = Param1.Discretionary;
        }
    }

    public Erase(): void {
        this.E = 0;
        this.AB = 0;
        this.CD = 0;
        this.F = 0;
        this.GHI = 0;
        this.Discretionary = 0;
    }

    public Export() : IHybridData {
        return {'E' : this.E,
                'AB' : this.AB,
                'CD' : this.CD,
                'F' : this.F,
                'GHI' : this.GHI,
                'Discretionary' : this.Discretionary}
    }
}
