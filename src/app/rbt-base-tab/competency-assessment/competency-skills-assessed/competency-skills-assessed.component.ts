import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { AppData } from 'src/app/_models';
import { ICompetency } from 'src/app/_interfaces/i-competency';
import { IListObject } from 'src/app/_interfaces';
import { Observable } from 'rxjs';
import { RbtApplicationService } from 'src/app/_services/rbt-application.service';

@Component({
  selector: 'competency-skills-assessed',
  templateUrl: './competency-skills-assessed.component.html',
  styleUrls: ['./competency-skills-assessed.component.css']
})
export class CompetencySkillsAssessedComponent implements OnInit {

  @Input() protected InstAppData : AppData;

  public SkillList: Observable<IListObject[]> | null = null;
  public SkillListForm: FormGroup | null = null;

  @Output() public SelectedSkillsEmitter: EventEmitter<IListObject[]>;

  constructor(
    protected SkillFormBuilder: FormBuilder,
    private rbtService: RbtApplicationService,
  ) {
    this.SkillList = this.rbtService.CompetencySkillList$;
    this.SelectedSkillsEmitter = new EventEmitter<IListObject[]>();
  }

  ngOnInit() {
    this.SkillListForm = this.SkillFormBuilder.group({
      Skills: ['']
    });
    this.LoadForm();
  }

  public LoadForm(): void {
    this.rbtService.SkillsAssessedObservable$.subscribe( (skills: any) => {
      if ( skills ) {
        console.log('skills', skills)
        // this.SelectedSkillsEmitter.emit(skills);
        this.SkillListForm.get('Skills').setValue(skills);
      }
      else {
        this.SkillListForm.get('Skills').setValue('');
      }
    })
  }
  public CompareListObj(Param1: IListObject, Param2: IListObject) : boolean {
    return Param1 && Param2 ? Param1.Id === Param2.Id : false;
  }
  public OnCheck($event) {
    console.log('MatSelect:', $event.value);
    this.SelectedSkillsEmitter.emit($event.value);
    // We also now need to send new data to the section component
  }
}
