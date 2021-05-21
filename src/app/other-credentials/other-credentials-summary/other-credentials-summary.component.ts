import { AlertService, OtherCredentialsService } from "src/app/_services";
import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Observable, fromEvent } from 'rxjs';
import { debounceTime, map, startWith, tap } from 'rxjs/operators';

import { IConfirm } from "src/app/_interfaces/i-confirm";
import { IOtherCredential } from "src/app/_interfaces/i-other-credential";

@Component({
  selector: "other-credentials-summary",
  templateUrl: "./other-credentials-summary.component.html",
  styleUrls: ["./other-credentials-summary.component.css"]
})
export class OtherCredentialsSummaryComponent
  implements OnInit {

  @Input() public PageChangeEmission: number;
  @Input() public CanEdit: boolean = true;
  @Output() public PageChange: EventEmitter<number> = new EventEmitter<number>();

  public not_mobile = true;
  public isScreenSmall$: Observable<boolean> | null = null;
  public Credentials: Observable<IOtherCredential[]> = this.CredentialServ.OtherCredential$;
  public DisplayedColumns: string[] = ['Type','Title','Country','State','Number','Year','Actions'];
  public constructor(
    private CredentialServ: OtherCredentialsService,
    private alertService: AlertService,
  ) {  }
  public get Mobile(): boolean {
    return this.not_mobile;
  }
  ngOnInit() {
    // Checks if screen size is less than 1024 pixels
    const checkScreenSize = () => document.body.offsetWidth < 1024;

    // Create observable from window resize event throttled so only fires every 500ms
    const screenSizeChanged$ = fromEvent(window, "resize").pipe(
      debounceTime(500),
      tap( x => {
        this.not_mobile = checkScreenSize();
      }),
      map(checkScreenSize));
    // Start off with the initial value use the isScreenSmall$ | async in the
    // view to get both the original value and the new value after resize.
    this.isScreenSmall$ = screenSizeChanged$.pipe(startWith(checkScreenSize()));
    this.isScreenSmall$.subscribe();
  }
  public OnClickEdit() {
    this.PageChange.emit(this.PageChangeEmission);
  }
  public OnClickDelete(SelectedCredential: IOtherCredential) {
    this.CredentialServ.Delete(SelectedCredential.Id)
    .pipe()
    .subscribe(
      (CredentialNext : IConfirm) => {
        if (CredentialNext.Response) {
          this.alertService.success(CredentialNext.Message);
        }
        else {
          this.alertService.error(CredentialNext.Message);
        }
      },
      CredentialError => {
        this.alertService.error(CredentialError);
      },
      () => { // OnComplete
        this.CredentialServ.Read();
        this.CredentialServ.Check();
      }
    )
  }
}
