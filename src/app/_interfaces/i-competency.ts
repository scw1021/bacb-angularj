import { IListObject } from './i-list-object';
import { IResponsibleRelationship } from './i-responsible-relationship';

export interface ICompetency extends IResponsibleRelationship {
  // Relationship: IResponsibleRelationship;
  Skills: IListObject[];
}
